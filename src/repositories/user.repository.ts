import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {User, UserRelations, Instruction, Progress} from '../models';
import {InstructionRepository} from './instruction.repository';
import {ProgressRepository} from './progress.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly instructions: HasManyRepositoryFactory<
    Instruction,
    typeof User.prototype.id
  >;

  public readonly progresses: HasManyRepositoryFactory<
    Progress,
    typeof User.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('InstructionRepository')
    protected instructionRepositoryGetter: Getter<InstructionRepository>,
    @repository.getter('ProgressRepository')
    protected progressRepositoryGetter: Getter<ProgressRepository>,
  ) {
    super(User, dataSource);
    this.progresses = this.createHasManyRepositoryFactoryFor(
      'progresses',
      progressRepositoryGetter,
    );
    this.registerInclusionResolver(
      'progresses',
      this.progresses.inclusionResolver,
    );
    this.instructions = this.createHasManyRepositoryFactoryFor(
      'instructions',
      instructionRepositoryGetter,
    );
    this.registerInclusionResolver(
      'instructions',
      this.instructions.inclusionResolver,
    );
  }
}
