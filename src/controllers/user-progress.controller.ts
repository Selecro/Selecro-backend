import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {
  HttpErrors,
  del,
  get,
  param,
  patch,
  post,
  requestBody
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {
  Progress, ProgressRelations
} from '../models';
import {InstructionRepository, ProgressRepository, UserRepository} from '../repositories';
import {JWTService} from '../services';

export class UserProgressController {
  constructor(
    @inject('services.jwt.service')
    public jwtService: JWTService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(InstructionRepository)
    protected instructionRepository: InstructionRepository,
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(UserRepository) protected progressRepository: ProgressRepository,
  ) { }

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
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              instructionId: {type: 'number'},
              stepId: {type: 'number'},
              descriptionId: {type: 'number'},
            },
            required: [
              'instructionId',
              'stepId',
              'descriptionId',
            ],
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
    this.progressRepository.create({
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
  async patch(
    @param.path.number('instructionId') instructionId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              stepId: {type: 'number'},
              descriptionId: {type: 'number'},
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
        userId: this.user.id
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
  async delete(
    @param.query.number('instructionId') instructionId: number,
  ): Promise<boolean> {
    const userOriginal = await this.userRepository.findById(this.user.id);
    if (!userOriginal) {
      throw new HttpErrors.NotFound('User not found');
    }
    const progress = await this.progressRepository.findOne({
      where: {
        instructionId: instructionId,
        userId: this.user.id
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
  @get('/users/{id}/progress/{instructionId}', {
    responses: {
      '200': {
        description: 'Progress model instance',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: {type: 'number'},
                instructionId: {type: 'number'},
                stepId: {type: 'number'},
                descriptionId: {type: 'number'},
                userId: {type: 'number'},
              },
            },
          },
        },
      },
    },
  })
  async find(
    @param.path.number('instructionId') instructionId: number,
  ): Promise<(Progress & ProgressRelations)> {
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

  private validateProgressOwnership(progress: Progress): void {
    if (Number(progress.userId) !== Number(this.user.id)) {
      throw new HttpErrors.Forbidden(
        'You are not authorized to this progress',
      );
    }
  }
}
