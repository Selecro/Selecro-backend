/*import {
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
import {
  Instruction,
  Step,
} from '../models';
import {InstructionRepository} from '../repositories';

export class InstructionStepController {
  constructor(
    @repository(InstructionRepository) protected instructionRepository: InstructionRepository,
  ) { }

  @get('/instructions/{id}/steps', {
    responses: {
      '200': {
        description: 'Array of Instruction has many Step',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Step)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Step>,
  ): Promise<Step[]> {
    return this.instructionRepository.steps(id).find(filter);
  }

  @post('/instructions/{id}/steps', {
    responses: {
      '200': {
        description: 'Instruction model instance',
        content: {'application/json': {schema: getModelSchemaRef(Step)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Instruction.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Step, {
            title: 'NewStepInInstruction',
            exclude: ['id'],
            optional: ['instructionId']
          }),
        },
      },
    }) step: Omit<Step, 'id'>,
  ): Promise<Step> {
    return this.instructionRepository.steps(id).create(step);
  }

  @patch('/instructions/{id}/steps', {
    responses: {
      '200': {
        description: 'Instruction.Step PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Step, {partial: true}),
        },
      },
    })
    step: Partial<Step>,
    @param.query.object('where', getWhereSchemaFor(Step)) where?: Where<Step>,
  ): Promise<Count> {
    return this.instructionRepository.steps(id).patch(step, where);
  }

  @del('/instructions/{id}/steps', {
    responses: {
      '200': {
        description: 'Instruction.Step DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Step)) where?: Where<Step>,
  ): Promise<Count> {
    return this.instructionRepository.steps(id).delete(where);
  }
}
*/
