import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  HttpErrors,
  Request,
  Response,
  RestBindings,
  del,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Difficulty, Instruction} from '../models';
import {
  InstructionRepository,
  StepRepository,
  UserRepository,
} from '../repositories';
import {ImgurService, JWTService} from '../services';

export class UserInstructionController {
  constructor(
    @inject('services.jwt.service')
    public jwtService: JWTService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject('services.imgur')
    public imgurService: ImgurService,
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(InstructionRepository)
    protected instructionRepository: InstructionRepository,
    @repository(StepRepository) public stepRepository: StepRepository,
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
  async create(
    @requestBody({
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
            required: ['titleCz', 'titleEn', 'difficulty', 'private'],
          },
        },
      },
    })
    instruction: Omit<
      Instruction,
      'id' | 'userId' | 'date' | 'link' | 'deleteHash'
    >,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    await this.instructionRepository.create({
      ...instruction,
      userId: this.user.id,
    });
    return true;
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
  async patch(
    @param.path.number('instructionId') instructionId: number,
    @requestBody({
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
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const instructionOriginal = await this.instructionRepository.findById(
      instructionId,
    );
    if (!instructionOriginal) {
      throw new HttpErrors.NotFound('Instruction not found');
    }
    this.validateInstructionOwnership(instructionOriginal);
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
  async delete(
    @param.query.number('instructionId') instructionId: number,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    if (user.deleteHash) {
      await this.imgurService.deleteImage(user.deleteHash);
    }
    const instruction = await this.instructionRepository.findById(
      instructionId,
    );
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
    return true;
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
  async uploadPicture(
    @param.path.number('instructionId') instructionId: number,
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
    const instruction = await this.instructionRepository.findById(
      instructionId,
    );
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
    return true;
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
  async deleteImage(
    @param.path.number('instructionId') instructionId: number,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const instruction = await this.instructionRepository.findById(
      instructionId,
    );
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

  private validateInstructionOwnership(instruction: Instruction): void {
    if (Number(instruction.userId) !== Number(this.user.id)) {
      throw new HttpErrors.Forbidden(
        'You are not authorized to this instruction',
      );
    }
  }
}
