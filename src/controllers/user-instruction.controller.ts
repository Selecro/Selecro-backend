import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  del,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Instruction} from '../models';
import {
  InstructionRepository,
  StepRepository,
  UserRepository,
} from '../repositories';
import {JWTService} from '../services';

export class UserInstructionController {
  constructor(
    @inject('services.jwt.service')
    public jwtService: JWTService,
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(InstructionRepository)
    protected instructionRepository: InstructionRepository,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(StepRepository) protected stepRepository: StepRepository,
  ) {}

  @authenticate('jwt')
  @post('/users/{id}/instructions', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Instruction, {
              exclude: ['id', 'userId', 'date'],
            }),
          },
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Instruction, {
            title: 'NewInstructionInUser',
            exclude: ['id', 'userId', 'date'],
          }),
        },
      },
    })
    instruction: Omit<Instruction, 'id' | 'userId' | 'date'>,
  ): Promise<boolean> {
    try {
      await this.instructionRepository.create({
        ...instruction,
        userId: this.user.id,
      });
      return true;
    } catch (_err) {
      return false;
    }
  }

  @authenticate('jwt')
  @patch('/users/{id}/instructions', {
    responses: {
      '200': {
        description: 'Patch Instruction of User',
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Instruction, {
            partial: true,
            exclude: ['id', 'userId', 'date'],
          }),
        },
      },
    })
    instruction: Partial<Instruction>,
  ): Promise<boolean> {
    try {
      const instructionOriginal = await this.instructionRepository.findById(id);
      this.validateInstructionOwnership(instructionOriginal);
      await this.instructionRepository.updateById(id, instruction);
      return true;
    } catch (_err) {
      return false;
    }
  }

  @authenticate('jwt')
  @del('/users/{id}/instructions', {
    responses: {
      '200': {
        description: 'Delete Instruction of User',
      },
    },
  })
  async delete(@param.query.number('id') id: number): Promise<boolean> {
    try {
      const instruction = await this.instructionRepository.findById(id);
      this.validateInstructionOwnership(instruction);
      await this.instructionRepository.deleteById(id);
      return true;
    } catch (_err) {
      return false;
    }
  }

  private validateInstructionOwnership(instruction: Instruction): void {
    if (Number(instruction.userId) !== Number(this.user.id)) {
      throw new HttpErrors.Forbidden(
        'You are not authorized to delete this instruction',
      );
    }
  }
}
