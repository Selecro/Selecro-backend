import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {User2FaLoginLog, User2FaLoginLogRelations} from '../models';

export class User2FaLoginLogRepository extends DefaultCrudRepository<
  User2FaLoginLog,
  typeof User2FaLoginLog.prototype.id,
  User2FaLoginLogRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(User2FaLoginLog, dataSource);
  }
}
