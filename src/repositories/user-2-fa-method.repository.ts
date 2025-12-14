import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {User2FaMethod, User2FaMethodRelations} from '../models';

export class User2FaMethodRepository extends DefaultCrudRepository<
  User2FaMethod,
  typeof User2FaMethod.prototype.id,
  User2FaMethodRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(User2FaMethod, dataSource);
  }
}
