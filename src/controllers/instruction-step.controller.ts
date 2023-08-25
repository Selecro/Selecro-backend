import {authenticate} from '@loopback/authentication';
import {JWTService, UserRepository} from '@loopback/authentication-jwt';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {
  HttpErrors,
  del,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Instruction, Step} from '../models';
import {InstructionRepository, StepRepository} from '../repositories';

export class InstructionStepController {
  constructor(
    @inject('services.jwt.service')
    public jwtService: JWTService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(InstructionRepository) public instructionRepository: InstructionRepository,
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
          schema: getModelSchemaRef(Step, {
            title: 'Create Step',
            exclude: ['id', 'instructionId'],
          }),
        },
      },
    })
    step: Omit<Step, 'id' | 'instructionId'>,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const instruction = await this.instructionRepository.findById(instructionId);
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
              title: {type: 'string'},
              description: {type: 'string'},
              link: {type: 'string'},
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
    const instruction = await this.instructionRepository.findById(instructionId);
    if (!instruction) {
      throw new HttpErrors.NotFound('Instruction not found');
    }
    const stepOriginal = await this.stepRepository.findById(stepId);
    if (!stepOriginal) {
      throw new HttpErrors.NotFound('Instruction not found');
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
    const instruction = await this.instructionRepository.findById(instructionId);
    if (!instruction) {
      throw new HttpErrors.NotFound('Instruction not found');
    }
    const stepOriginal = await this.stepRepository.findById(stepId);
    if (!stepOriginal) {
      throw new HttpErrors.NotFound('Instruction not found');
    }
    this.validateInstructionOwnership(instruction);
    this.validateStepOwnership(stepOriginal, instruction);
    await this.stepRepository.deleteById(stepId);
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
