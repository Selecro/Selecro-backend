import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {StatusHistory, StatusHistoryRelations} from '../models';

export class StatusHistoryRepository extends DefaultCrudRepository<
  StatusHistory,
  typeof StatusHistory.prototype.id,
  StatusHistoryRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(StatusHistory, dataSource);
  }
}
