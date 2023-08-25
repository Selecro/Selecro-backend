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
  UserRepository
} from '../repositories';
import {JWTService} from '../services';

export class UserInstructionController {
  constructor(
    @inject('services.jwt.service')
    public jwtService: JWTService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(InstructionRepository) protected instructionRepository: InstructionRepository,
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
          schema: getModelSchemaRef(Instruction, {
            title: 'NewInstructionInUser',
            exclude: ['id', 'userId', 'date'],
          }),
        },
      },
    })
    instruction: Omit<Instruction, 'id' | 'userId' | 'date'>,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    await this.instructionRepository.create({
      ...instruction,
      userId: user.id,
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
              title: {type: 'string'},
              difficulty: {$ref: '#/components/schemas/Difficulty'},
              link: {type: 'string'},
              private: {typr: 'boolean'}
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
    const instructionOriginal = await this.instructionRepository.findById(instructionId);
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
  async delete(@param.query.number('instructionId') instructionId: number): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const instruction = await this.instructionRepository.findById(instructionId);
    if (!instruction) {
      throw new HttpErrors.NotFound('Instruction not found');
    }
    this.validateInstructionOwnership(instruction);
    await this.instructionRepository.deleteById(instructionId);
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
