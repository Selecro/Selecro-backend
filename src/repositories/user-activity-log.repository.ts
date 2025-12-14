import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserActivityLog, UserActivityLogRelations} from '../models';

export class UserActivityLogRepository extends DefaultCrudRepository<
  UserActivityLog,
  typeof UserActivityLog.prototype.id,
  UserActivityLogRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserActivityLog, dataSource);
  }
}
