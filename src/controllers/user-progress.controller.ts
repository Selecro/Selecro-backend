import {authenticate} from '@loopback/authentication';
import {JWTService} from '@loopback/authentication-jwt';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {
  HttpErrors,
  del,
  get,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Progress, ProgressRelations} from '../models';
import {
  InstructionRepository,
  ProgressRepository,
  UserRepository,
} from '../repositories';

export class UserProgressController {
  constructor(
    @inject('services.jwt.service')
    public jwtService: JWTService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(InstructionRepository)
    protected instructionRepository: InstructionRepository,
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(UserRepository)
    protected progressRepository: ProgressRepository,
  ) {}

  @authenticate('jwt')
  @post('/users/{id}/progresses/{progressId}', {
    responses: {
      '200': {
        description: 'Create Progress of Instruction',
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
  async createProgress(
    @requestBody({
      description: 'Create Progress of Instruction',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              instructionId: {type: 'string'},
              stepId: {type: 'number'},
              descriptionId: {type: 'string'},
              time: {type: 'number'},
            },
            required: ['instructionId', 'stepId', 'descriptionId', 'time'],
          },
        },
      },
    })
    progress: Omit<Progress, 'id'>,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const existingProgress = await this.progressRepository.findOne({
      where: {
        instructionId: progress.instructionId,
        userId: this.user.id,
      },
    });
    if (existingProgress) {
      throw new HttpErrors.BadRequest(
        'Progress with this instructionId and userId already exists.',
      );
    }
    await this.progressRepository.create({
      ...progress,
      userId: this.user.id,
    });
    return true;
  }

  @authenticate('jwt')
  @patch('/users/{id}/progresses/{instructionId}', {
    responses: {
      '200': {
        description: 'Update Progressof Instruction',
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
  async patchProgress(
    @param.path.string('instructionId') instructionId: string,
    @requestBody({
      description: 'Update Progressof Instruction',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              stepId: {type: 'number'},
              descriptionId: {type: 'string'},
              time: {type: 'number'},
            },
          },
        },
      },
    })
    progress: Partial<Progress>,
  ): Promise<boolean> {
    const userOriginal = await this.userRepository.findById(this.user.id);
    if (!userOriginal) {
      throw new HttpErrors.NotFound('User not found');
    }
    const progressOriginal = await this.progressRepository.findOne({
      where: {
        instructionId: instructionId,
        userId: this.user.id,
      },
    });
    if (!progressOriginal) {
      throw new HttpErrors.NotFound('Progress not found');
    }
    this.validateProgressOwnership(progressOriginal);
    await this.instructionRepository.updateById(progressOriginal.id, progress);
    return true;
  }

  @authenticate('jwt')
  @del('/users/{id}/progresses/{instructionId}', {
    responses: {
      '200': {
        description: 'User.Progress DELETE success count',
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
  async deleteProgress(
    @param.path.string('instructionId') instructionId: string,
  ): Promise<boolean> {
    const userOriginal = await this.userRepository.findById(this.user.id);
    if (!userOriginal) {
      throw new HttpErrors.NotFound('User not found');
    }
    const progress = await this.progressRepository.findOne({
      where: {
        instructionId: instructionId,
        userId: this.user.id,
      },
    });
    if (!progress) {
      throw new HttpErrors.NotFound('Progress not found');
    }
    this.validateProgressOwnership(progress);
    await this.progressRepository.deleteById(progress.id);
    return true;
  }

  @authenticate('jwt')
  @get('/users/{id}/progresses/{instructionId}', {
    responses: {
      '200': {
        description: 'Progress model instance',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: {type: 'string'},
                instructionId: {type: 'string'},
                stepId: {type: 'number'},
                descriptionId: {type: 'string'},
                userId: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async getProgress(
    @param.path.string('instructionId') instructionId: string,
  ): Promise<Progress & ProgressRelations> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const progress = await this.progressRepository.findOne({
      where: {
        instructionId: instructionId,
        userId: this.user.id,
      },
    });
    if (!progress) {
      throw new HttpErrors.NotFound('Progress not found');
    }
    return progress;
  }

  @authenticate('jwt')
  @get('/users/{id}/progresses', {
    responses: {
      '200': {
        description: 'Progress model instance',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: {type: 'string'},
                instructionId: {type: 'string'},
                stepId: {type: 'number'},
                descriptionId: {type: 'string'},
                userId: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async getAllProgress(): Promise<Progress[]> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const progress = await this.progressRepository.find({
      where: {
        userId: this.user.id,
      },
    });
    if (!progress) {
      throw new HttpErrors.NotFound('Progress not found');
    }
    return progress;
  }

  private validateProgressOwnership(progress: Progress): void {
    if (progress.userId !== this.user.id) {
      throw new HttpErrors.Forbidden('You are not authorized to this progress');
    }
  }
}
