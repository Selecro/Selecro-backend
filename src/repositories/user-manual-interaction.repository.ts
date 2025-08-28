import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserManualInteraction, UserManualInteractionRelations} from '../models';

export class UserManualInteractionRepository extends DefaultCrudRepository<
  UserManualInteraction,
  typeof UserManualInteraction.prototype.id,
  UserManualInteractionRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserManualInteraction, dataSource);
  }
}
