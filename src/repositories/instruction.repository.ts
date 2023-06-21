import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Instruction, InstructionRelations, Step} from '../models';
import {StepRepository} from './step.repository';

export class InstructionRepository extends DefaultCrudRepository<
  Instruction,
  typeof Instruction.prototype.id,
  InstructionRelations
> {
  public readonly steps: HasManyRepositoryFactory<
    Step,
    typeof Instruction.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('StepRepository')
    protected stepRepositoryGetter: Getter<StepRepository>,
  ) {
    super(Instruction, dataSource);
    this.steps = this.createHasManyRepositoryFactoryFor(
      'steps',
      stepRepositoryGetter,
    );
    this.registerInclusionResolver('steps', this.steps.inclusionResolver);
  }
}
