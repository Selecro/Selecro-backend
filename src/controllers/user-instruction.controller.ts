import {authenticate} from '@loopback/authentication';
import {JWTService} from '@loopback/authentication-jwt';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {
  HttpErrors,
  Request,
  Response,
  RestBindings,
  del,
  get,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import * as dotenv from 'dotenv';
import {Difficulty, Instruction, Progress, ProgressRelations} from '../models';
import {
  InstructionRepository,
  ProgressRepository,
  StepRepository,
  UserRepository,
} from '../repositories';
import {BcryptHasher, ImgurService} from '../services';
dotenv.config();

export class UserInstructionController {
  constructor(
    @inject('services.jwt.service')
    public jwtService: JWTService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject('services.hasher')
    public hasher: BcryptHasher,
    @inject('services.imgur')
    public imgurService: ImgurService,
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(InstructionRepository)
    protected instructionRepository: InstructionRepository,
    @repository(StepRepository) public stepRepository: StepRepository,
    @repository(UserRepository)
    protected progressRepository: ProgressRepository,
  ) { }

  @authenticate('jwt')
  @post('/users/{id}/instructions/{instructionId}', {
    responses: {
      '200': {
        description: 'Create Instruction',
        content: {
          'application/json': {
            schema: {
              type: 'boolean',
            },
          },
        },
      },
    },
  })
  async createInstruction(
    @requestBody({
      description: 'Create Instruction',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              titleCz: {type: 'string'},
              titleEn: {type: 'string'},
              difficulty: {enum: Object.values(Difficulty)},
              private: {type: 'boolean'},
              premium: {type: 'boolean'},
            },
            required: [
              'titleCz',
              'titleEn',
              'difficulty',
              'private',
              'premium',
            ],
          },
        },
      },
    })
    instruction: Omit<
      Instruction,
      'id' | 'userId' | 'date' | 'link' | 'deleteHash'
    >,
    @param.query.string('key') key: string | undefined,
  ): Promise<Instruction> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    if (instruction.premium) {
      if (!key) {
        throw new HttpErrors.Unauthorized('Key not providen');
      }
      const instructionKey = process.env.INSTRUCTION_KEY_PREMIUM ?? '';
      const keyMatch = await this.hasher.comparePassword(key, instructionKey);
      if (!keyMatch) {
        throw new HttpErrors.Unauthorized('Invalid password');
      }
    }
    const newInstruction = await this.instructionRepository.create({
      ...instruction,
      userId: this.user.id,
    });
    return newInstruction;
  }

  @authenticate('jwt')
  @patch('/users/{id}/instructions/{instructionId}', {
    responses: {
      '200': {
        description: 'Update Instruction',
        content: {
          'application/json': {
            schema: {
              type: 'boolean',
            },
          },
        },
      },
    },
  })
  async patchInstruction(
    @param.path.string('instructionId') instructionId: string,
    @requestBody({
      description: 'Update Instruction',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              titleCz: {type: 'string'},
              titleEn: {type: 'string'},
              difficulty: {enum: Object.values(Difficulty)},
              private: {type: 'boolean'},
            },
          },
        },
      },
    })
    instruction: Partial<Instruction>,
  ): Promise<boolean> {
    const userOriginal = await this.userRepository.findById(this.user.id);
    if (!userOriginal) {
      throw new HttpErrors.NotFound('User not found');
    }
    const instructionOriginal =
      await this.instructionRepository.findById(instructionId);
    if (!instructionOriginal) {
      throw new HttpErrors.NotFound('Instruction not found');
    }
    this.validateInstructionOwnership(instructionOriginal);
    if (instruction.private) {
      const users = await this.userRepository.find();
      for (const user of users) {
        user.favorites = user.favorites?.filter(
          favorite => favorite !== instructionId,
        );
        await this.userRepository.updateById(user.id, user);
      }
    }
    await this.instructionRepository.updateById(instructionId, instruction);
    return true;
  }

  @authenticate('jwt')
  @del('/users/{id}/instructions/{instructionId}', {
    responses: {
      '200': {
        description: 'Delete Instruction',
        content: {
          'application/json': {
            schema: {
              type: 'boolean',
            },
          },
        },
      },
    },
  })
  async deleteInstruction(
    @param.path.string('instructionId') instructionId: string,
  ): Promise<boolean> {
    const userOriginal = await this.userRepository.findById(this.user.id);
    if (!userOriginal) {
      throw new HttpErrors.NotFound('User not found');
    }
    if (userOriginal.deleteHash) {
      await this.imgurService.deleteImage(userOriginal.deleteHash);
    }
    const instruction =
      await this.instructionRepository.findById(instructionId);
    if (!instruction) {
      throw new HttpErrors.NotFound('Instruction not found');
    }
    this.validateInstructionOwnership(instruction);
    if (instruction.deleteHash) {
      await this.imgurService.deleteImage(instruction.deleteHash);
    }
    await this.instructionRepository.deleteById(instructionId);
    const stepHashes = await this.stepRepository.find({
      where: {
        and: [
          {
            deleteHash: {neq: ''},
            instructionId: instructionId,
          },
        ],
      },
      fields: {deleteHash: true},
    });
    const hashes = stepHashes.map(step => step.deleteHash);
    for (const hash in hashes) {
      await this.imgurService.deleteImage(hash);
    }
    await this.stepRepository.deleteAll({instructionId: instructionId});
    const users = await this.userRepository.find();
    for (const user of users) {
      user.favorites = user.favorites?.filter(
        favorite => favorite !== instructionId,
      );
      await this.userRepository.updateById(user.id, user);
    }
    return true;
  }

  @authenticate('jwt')
  @get('/users/{id}/user-instructions', {
    responses: {
      '200': {
        description: 'Get users instructions',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                instructions: {
                  type: 'object',
                  items: {
                    id: {type: 'string'},
                    titleCz: {type: 'string'},
                    titleEn: {type: 'string'},
                    difficulty: {enum: Object.values(Difficulty)},
                    link: {type: 'string'},
                    private: {type: 'boolean'},
                    premium: {type: 'boolean'},
                    date: {type: 'string'},
                    userId: {type: 'string'},
                    steps: {
                      type: 'object',
                      items: {
                        id: {type: 'number'},
                        titleCz: {type: 'string'},
                        titleEn: {type: 'string'},
                        descriptionCz: {
                          type: 'array',
                          items: {
                            type: 'string',
                          },
                        },
                        descriptionEn: {
                          type: 'array',
                          items: {
                            type: 'string',
                          },
                        },
                        link: {type: 'string'},
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async getUsersInstructions(): Promise<{
    instructions: Omit<Instruction, 'deleteHash' | 'premiumUserIds'>[];
    progress: (Progress & ProgressRelations)[];
  }> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const instructions = await this.instructionRepository.find({
      where: {
        userId: this.user.id,
      },
      include: [
        {
          relation: 'steps',
          scope: {
            fields: {
              deleteHash: false,
            },
          },
        },
      ],
      fields: {
        deleteHash: false,
        premiumUserIds: false,
      },
    });
    const progress = await this.progressRepository.find({
      where: {
        userId: this.user.id,
      },
    });
    return {instructions, progress};
  }

  @authenticate('jwt')
  @post('/users/{id}/instructions/{instructionId}/picture', {
    responses: {
      '200': {
        description: 'Upload picture',
        content: {
          'application/json': {
            schema: {
              type: 'boolean',
            },
          },
        },
      },
    },
  })
  async uploadInstructionPicture(
    @param.path.string('instructionId') instructionId: string,
    @requestBody({
      description: 'Upload picture',
      required: true,
      content: {
        'multipart/form-data': {
          'x-parser': 'stream',
          schema: {
            type: 'object',
            properties: {
              image: {type: 'string', format: 'binary'},
            },
          },
        },
      },
    })
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<string> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const instruction =
      await this.instructionRepository.findById(instructionId);
    if (!instruction) {
      throw new HttpErrors.NotFound('Instruction not found');
    }
    this.validateInstructionOwnership(instruction);
    if (instruction.deleteHash) {
      await this.imgurService.deleteImage(instruction.deleteHash);
    }
    const data = await this.imgurService.savePicture(request, response);
    await this.instructionRepository.updateById(instructionId, {
      link: data.link,
      deleteHash: data.deletehash,
    });
    return data.link;
  }

  @authenticate('jwt')
  @del('/users/{id}/instructions/{instructionId}/picture', {
    responses: {
      '200': {
        description: 'Delete picture',
        content: {
          'application/json': {
            schema: {
              type: 'boolean',
            },
          },
        },
      },
    },
  })
  async deleteInstructionPicture(
    @param.path.string('instructionId') instructionId: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const instruction =
      await this.instructionRepository.findById(instructionId);
    if (!instruction) {
      throw new HttpErrors.NotFound('Instruction not found');
    }
    this.validateInstructionOwnership(instruction);
    if (!instruction.deleteHash) {
      throw new HttpErrors.NotFound('Instruction picture does not exist');
    }
    await this.imgurService.deleteImage(instruction.deleteHash);
    await this.instructionRepository.updateById(instructionId, {
      link: null,
      deleteHash: null,
    });
    return true;
  }

  @authenticate('jwt')
  @patch('/users/{id}/instructions/{instructionId}', {
    responses: {
      '200': {
        description: 'Set premium Instruction',
        content: {
          'application/json': {
            schema: {
              type: 'boolean',
            },
          },
        },
      },
    },
  })
  async setPremiumInstruction(
    @param.path.string('instructionId') instructionId: string,
    @requestBody({
      description: 'Set premium Instruction',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              key: {type: 'string'},
              premium: {type: 'boolean'},
            },
            required: ['key', 'premium'],
          },
        },
      },
    })
    request: {
      key: string;
      premium: boolean;
    },
  ): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const instruction =
      await this.instructionRepository.findById(instructionId);
    if (!instruction) {
      throw new HttpErrors.NotFound('Instruction not found');
    }
    const instructionKey = process.env.INSTRUCTION_KEY_PREMIUM ?? '';
    const keyMatch = await this.hasher.comparePassword(
      request.key,
      instructionKey,
    );
    if (!keyMatch) {
      throw new HttpErrors.Unauthorized('Invalid password');
    }
    const userOriginal = await this.userRepository.findById(this.user.id);
    if (!userOriginal) {
      throw new HttpErrors.NotFound('User not found');
    }
    const instructionOriginal =
      await this.instructionRepository.findById(instructionId);
    if (!instructionOriginal) {
      throw new HttpErrors.NotFound('Instruction not found');
    }
    if (instructionOriginal.private) {
      throw new HttpErrors.NotFound('Private Instruction can not be premium');
    }
    await this.instructionRepository.updateById(instructionId, {
      premium: request.premium,
    });
    return true;
  }

  @authenticate('jwt')
  @patch('/authorizate-for-premium-instruction/{instructionId}/{userId}', {
    responses: {
      '200': {
        description: 'Authorize user for premium instructions',
        content: {
          'application/json': {
            schema: {
              type: 'boolean',
            },
          },
        },
      },
    },
  })
  async authorizeUserToPremiumInstruction(
    @param.path.string('instructionId') instructionId: string,
    @param.path.string('userId') userId: string,
    @requestBody({
      description: 'Authorize user for premium instructions',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              key: {type: 'string'},
            },
            required: ['key'],
          },
        },
      },
    })
    request: {
      key: string;
    },
  ): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const instructionKey =
      process.env.INSTRUCTION_KEY_PREMIUM_PERMISSIONS ?? '';
    const keyMatch = await this.hasher.comparePassword(
      request.key,
      instructionKey,
    );
    if (!keyMatch) {
      throw new HttpErrors.Unauthorized('Invalid password');
    }
    const instruction =
      await this.instructionRepository.findById(instructionId);
    instruction.premiumUserIds = instruction.premiumUserIds ?? [];
    if (instruction.premiumUserIds.includes(userId)) {
      instruction.premiumUserIds = instruction.premiumUserIds.filter(
        id => id !== userId,
      );
    } else {
      instruction.premiumUserIds.push(userId);
    }
    await this.instructionRepository.updateById(instructionId, instruction);
    return true;
  }

  @get('/public-instructions', {
    responses: {
      '200': {
        description: 'Get public instructions',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                instructions: {
                  type: 'object',
                  items: {
                    id: {type: 'string'},
                    titleCz: {type: 'string'},
                    titleEn: {type: 'string'},
                    difficulty: {enum: Object.values(Difficulty)},
                    link: {type: 'string'},
                    premium: {type: 'boolean'},
                    date: {type: 'string'},
                    userId: {type: 'string'},
                    steps: {
                      type: 'object',
                      items: {
                        id: {type: 'number'},
                        titleCz: {type: 'string'},
                        titleEn: {type: 'string'},
                        descriptionCz: {
                          type: 'array',
                          items: {
                            type: 'string',
                          },
                        },
                        descriptionEn: {
                          type: 'array',
                          items: {
                            type: 'string',
                          },
                        },
                        link: {type: 'string'},
                      },
                    },
                    username: {type: 'string'},
                    userLink: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async getPublicInstructions(
    @param.query.number('limit') limit: number = 10,
    @param.query.number('offset') offset: number = 0,
  ): Promise<
    {
      username: string;
      userLink: string;
      constructor: Function;
      toString(): string;
      toLocaleString(): string;
      valueOf(): Object;
      hasOwnProperty(v: PropertyKey): boolean;
      isPrototypeOf(v: Object): boolean;
      propertyIsEnumerable(v: PropertyKey): boolean;
    }[]
  > {
    const data = await this.instructionRepository.find({
      where: {
        private: false,
        premium: false,
      },
      include: [
        {
          relation: 'steps',
        },
      ],
      fields: {
        private: false,
        deleteHash: false,
        premiumUserIds: false,
      },
      limit,
      skip: offset,
    });
    const userIds = Array.from(
      new Set(data.map(instruction => instruction.userId)),
    );
    const userPromises = userIds.map(async userId => {
      const users = await this.userRepository.find({
        where: {
          id: userId,
        },
      });
      return users.map(user => ({
        userId: user.id,
        username: user.username,
        link: user.link,
      }));
    });
    const usernamesAndLinks = (await Promise.all(userPromises)).flat();
    const instructionsWithUserDetails = data.map(instruction => {
      const userDetails = usernamesAndLinks.find(
        userDetail => userDetail.userId === instruction.userId,
      );
      return {
        ...instruction.toJSON(),
        username: userDetails?.username ?? '',
        userLink: userDetails?.link ?? '',
      };
    });
    return instructionsWithUserDetails;
  }

  @get('/premium-instructions', {
    responses: {
      '200': {
        description: 'Get premium instructions',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                instructions: {
                  type: 'object',
                  items: {
                    id: {type: 'number'},
                    titleCz: {type: 'string'},
                    titleEn: {type: 'string'},
                    difficulty: {enum: Object.values(Difficulty)},
                    link: {type: 'string'},
                    premium: {type: 'boolean'},
                    date: {type: 'string'},
                    userId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async getPremiumInstructions(
    @param.query.number('limit') limit: number = 10,
    @param.query.number('offset') offset: number = 0,
  ): Promise<Omit<Instruction, 'deleteHash' | 'premiumUserIds'>[]> {
    const data = await this.instructionRepository.find({
      where: {
        private: false,
        premium: true,
      },
      fields: {
        private: false,
        deleteHash: false,
        premiumUserIds: false,
      },
      limit,
      skip: offset,
    });
    return data;
  }

  private validateInstructionOwnership(instruction: Instruction): void {
    if (instruction.userId !== this.user.id) {
      throw new HttpErrors.Forbidden(
        'You are not authorized to this instruction',
      );
    }
  }
}
