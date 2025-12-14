import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserFileAccess, UserFileAccessRelations} from '../models';

export class UserFileAccessRepository extends DefaultCrudRepository<
  UserFileAccess,
  typeof UserFileAccess.prototype.userId,
  UserFileAccessRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserFileAccess, dataSource);
  }
}
