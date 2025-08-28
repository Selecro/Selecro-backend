import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {SystemLog, SystemLogRelations} from '../models';

export class SystemLogRepository extends DefaultCrudRepository<
  SystemLog,
  typeof SystemLog.prototype.id,
  SystemLogRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(SystemLog, dataSource);
  }
}
