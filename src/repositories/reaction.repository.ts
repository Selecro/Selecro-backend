import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {Reaction, ReactionRelations} from '../models';

export class ReactionRepository extends DefaultCrudRepository<
  Reaction,
  typeof Reaction.prototype.id,
  ReactionRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(Reaction, dataSource);
  }
}
