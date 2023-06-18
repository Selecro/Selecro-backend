/*import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Step,
  Instruction,
} from '../models';
import {StepRepository} from '../repositories';

export class StepInstructionController {
  constructor(
    @repository(StepRepository)
    public stepRepository: StepRepository,
  ) { }

  @get('/steps/{id}/instruction', {
    responses: {
      '200': {
        description: 'Instruction belonging to Step',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Instruction),
          },
        },
      },
    },
  })
  async getInstruction(
    @param.path.number('id') id: typeof Step.prototype.id,
  ): Promise<Instruction> {
    return this.stepRepository.instruction(id);
  }
}*/
