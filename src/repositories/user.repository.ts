import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {User, UserRelations, Instruction} from '../models';
import {InstructionRepository} from './instruction.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly instructions: HasManyRepositoryFactory<
    Instruction,
    typeof User.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('InstructionRepository')
    protected instructionRepositoryGetter: Getter<InstructionRepository>,
  ) {
    super(User, dataSource);
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
