import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserFile, UserFileRelations} from '../models';

export class UserFileRepository extends DefaultCrudRepository<
  UserFile,
  typeof UserFile.prototype.userId,
  UserFileRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserFile, dataSource);
  }
}
