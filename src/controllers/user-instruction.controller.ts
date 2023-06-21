import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Instruction, Step} from '../models';
import {
  InstructionRepository,
  StepRepository,
  UserRepository,
} from '../repositories';

export class UserInstructionController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(InstructionRepository)
    protected instructionRepository: InstructionRepository,
    @repository(StepRepository) protected stepRepository: StepRepository,
  ) {}

  @get('/users/{id}/instructions', {
    responses: {
      '200': {
        description: 'Array of User has many Instruction',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Instruction)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Instruction>,
  ): Promise<Instruction[]> {
    return this.userRepository.instructions(id).find(filter);
  }

  @post('/users/{id}/instructions', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Instruction)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Instruction, {
            title: 'NewInstructionInUser',
            exclude: ['id'],
          }),
        },
      },
    })
    instruction: Omit<Instruction, 'id'>,
  ): Promise<Instruction> {
    //return this.InstructionRepository.create(instruction);
    const id = 10; // Provide the appropriate user ID

    const user = await this.userRepository.findById(id);
    if (!user) {
      // Handle the case when the user does not exist
      throw new Error('User not found');
    }

    const createdInstruction = new Instruction(instruction);
    await this.instructionRepository.create(createdInstruction);

    return createdInstruction;
  }

  @patch('/users/{id}/instructions', {
    responses: {
      '200': {
        description: 'User.Instruction PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Instruction, {partial: true}),
        },
      },
    })
    instruction: Partial<Instruction>,
    @param.query.object('where', getWhereSchemaFor(Instruction))
    where?: Where<Instruction>,
  ): Promise<Count> {
    return this.userRepository.instructions(id).patch(instruction, where);
  }

  @del('/users/{id}/instructions', {
    responses: {
      '200': {
        description: 'User.Instruction DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Instruction))
    where?: Where<Instruction>,
  ): Promise<Count> {
    return this.userRepository.instructions(id).delete(where);
  }

  @post('/instructions/{id}/steps', {
    responses: {
      '200': {
        description: 'Instruction model instance',
        content: {'application/json': {schema: getModelSchemaRef(Step)}},
      },
    },
  })
  async create0(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Step, {
            title: 'NewStepInInstruction',
            exclude: ['id'],
          }),
        },
      },
    })
    step: Omit<Step, 'id'>,
  ): Promise<Step> {
    //return this.instructionRepository.steps(id).create(step);
    const id = 1; // Provide the appropriate user ID

    const instruction = await this.instructionRepository.findById(id);
    if (!instruction) {
      // Handle the case when the user does not exist
      throw new Error('Instruction not found');
    }

    const createdstep = new Step(step);
    await this.stepRepository.create(createdstep);
    return createdstep;
  }
}
