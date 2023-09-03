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
  async create(
    @param.path.number('id') instructionId: number,
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
    step: Omit<Step, 'id' | 'instructionId'>,
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
    await this.stepRepository.create({
      ...step,
      instructionId: instructionId,
    });
    return true;
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
  async patch(
    @param.path.number('stepId') stepId: number,
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
    const instruction = await this.instructionRepository.findById(
      instructionId,
    );
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
  @del('/users/{id}/instructions/{instructionId}/steps/{stepId}', {
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
  async delete(
    @param.path.number('stepId') stepId: number,
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
  async uploadPicture(
    @param.path.number('stepId') stepId: number,
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
  async deleteImage(
    @param.path.number('stepId') stepId: number,
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
