import {authenticate} from '@loopback/authentication';
import {JWTService, UserRepository} from '@loopback/authentication-jwt';
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
import {Instruction, Step} from '../models';
import {InstructionRepository, StepRepository} from '../repositories';
import {ImgurService} from '../services';

export class InstructionStepController {
  constructor(
    @inject('services.jwt.service')
    public jwtService: JWTService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject('services.imgur')
    public imgurService: ImgurService,
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(InstructionRepository)
    public instructionRepository: InstructionRepository,
    @repository(StepRepository) public stepRepository: StepRepository,
  ) { }

  @authenticate('jwt')
  @post('/users/{id}/instructions/{instructionId}/steps/{stepId}', {
    responses: {
      '200': {
        description: 'Create Step',
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
  async createStep(
    @param.path.number('instructionId') instructionId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
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
            },
            required: ['titleCz', 'titleEn', 'descriptionCz', 'descriptionEn'],
          },
        },
      },
    })
    step: Omit<Step, 'id' | 'link' | 'deleteHash' | 'instructionId'>,
  ): Promise<Step> {
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
    const newStep = await this.stepRepository.create({
      ...step,
      instructionId: instructionId,
    });
    return newStep;
  }

  @authenticate('jwt')
  @patch('/users/{id}/instructions/{instructionId}/steps/{stepId}', {
    responses: {
      '200': {
        description: 'Update Step',
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
  async patchStep(
    @param.path.number('instructionId') instructionId: number,
    @param.path.number('stepId') stepId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
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
            },
          },
        },
      },
    })
    step: Partial<Step>,
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
    const stepOriginal = await this.stepRepository.findById(stepId);
    if (!stepOriginal) {
      throw new HttpErrors.NotFound('Step not found');
    }
    this.validateInstructionOwnership(instruction);
    this.validateStepOwnership(stepOriginal, instruction);
    await this.stepRepository.updateById(stepId, step);
    return true;
  }

  @authenticate('jwt')
  @del('/users/{id}/instructions/{instructionId}/steps/${stepId}', {
    responses: {
      '200': {
        description: 'Delete Step',
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
  async deleteStep(
    @param.path.number('instructionId') instructionId: number,
    @param.path.number('stepId') stepId: number,
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
    const stepOriginal = await this.stepRepository.findById(stepId);
    if (!stepOriginal) {
      throw new HttpErrors.NotFound('Step not found');
    }
    this.validateInstructionOwnership(instruction);
    this.validateStepOwnership(stepOriginal, instruction);
    if (stepOriginal.deleteHash) {
      await this.imgurService.deleteImage(stepOriginal.deleteHash);
    }
    await this.stepRepository.deleteById(stepId);
    return true;
  }

  @authenticate('jwt')
  @get('/users/{id}/instructions/{instructionId}/instruction-steps', {
    responses: {
      '200': {
        description: 'Get steps instruction',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
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
                    instructionId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async getSteps(
    @param.path.number('instructionId') instructionId: number,
  ): Promise<Omit<Step, 'deleteHash'>[]> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const instruction =
      await this.instructionRepository.findById(instructionId);
    if (!instruction) {
      throw new HttpErrors.NotFound('Instruction not found');
    }
    const data = await this.stepRepository.find({
      fields: {
        deleteHash: false,
      },
    });
    return data;
  }

  @authenticate('jwt')
  @post('/users/{id}/instructions/{instructionId}/steps/{stepId}/picture', {
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
  async uploadStepsPicture(
    @param.path.number('instructionId') instructionId: number,
    @param.path.number('stepId') stepId: number,
    @requestBody({
      content: {
        'multipart/form-data': {
          'x-parser': 'stream',
          schema: {
            type: 'object',
            properties: {
              image: {type: 'string', format: 'binary'},
            },
            required: ['image'],
          },
        },
      },
    })
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
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
    const step = await this.stepRepository.findById(stepId);
    if (!step) {
      throw new HttpErrors.NotFound('Step not found');
    }
    this.validateInstructionOwnership(instruction);
    this.validateStepOwnership(step, instruction);
    if (step.deleteHash) {
      await this.imgurService.deleteImage(step.deleteHash);
    }
    const data = await this.imgurService.savePicture(request, response);
    await this.stepRepository.updateById(stepId, {
      link: data.link,
      deleteHash: data.deletehash,
    });
    return true;
  }

  @authenticate('jwt')
  @del('/users/{id}/instructions/{instructionId}/steps/{stepId}/picture', {
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
  async deleteStepPicture(
    @param.path.number('instructionId') instructionId: number,
    @param.path.number('stepId') stepId: number,
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
    const step = await this.stepRepository.findById(stepId);
    if (!step) {
      throw new HttpErrors.NotFound('Step not found');
    }
    this.validateInstructionOwnership(instruction);
    this.validateStepOwnership(step, instruction);
    if (!step.deleteHash) {
      throw new HttpErrors.NotFound('Step picture does not exist');
    }
    await this.imgurService.deleteImage(step.deleteHash);
    await this.stepRepository.updateById(stepId, {
      link: null,
      deleteHash: null,
    });
    return true;
  }

  @authenticate('jwt')
  @get('/premium-instructions/{instructionId}/detail', {
    responses: {
      '200': {
        description: 'Get premium instructions',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
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
                    instructionId: {type: 'number'},
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async getPremiumInstructionDetail(
    @param.path.number('instructionId') instructionId: number,
  ): Promise<Omit<Step, 'deleteHash'>[]> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const instruction =
      await this.instructionRepository.findById(instructionId);
    if (!instruction) {
      throw new HttpErrors.NotFound('Instruction not found');
    }
    if (!instruction.premiumUserIds) {
      throw new HttpErrors.Forbidden(
        'You are not authorized to this instruction',
      );
    }
    if (!instruction.premiumUserIds.includes(this.user.id)) {
      throw new HttpErrors.Forbidden(
        'You are not authorized to this instruction',
      );
    }
    const data = await this.stepRepository.find({
      where: {
        instructionId: instructionId,
      },
      fields: {
        deleteHash: false,
      },
    });
    return data;
  }

  private validateInstructionOwnership(instruction: Instruction): void {
    if (Number(instruction.userId) !== Number(this.user.id)) {
      throw new HttpErrors.Forbidden(
        'You are not authorized to this instruction',
      );
    }
  }

  private validateStepOwnership(step: Step, instruction: Instruction): void {
    if (Number(step.instructionId) !== Number(instruction.id)) {
      throw new HttpErrors.Forbidden(
        'You are not authorized to this instruction',
      );
    }
  }
}
