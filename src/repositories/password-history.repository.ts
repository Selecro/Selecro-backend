import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {PasswordHistory, PasswordHistoryRelations} from '../models';

export class PasswordHistoryRepository extends DefaultCrudRepository<
  PasswordHistory,
  typeof PasswordHistory.prototype.id,
  PasswordHistoryRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(PasswordHistory, dataSource);
  }
}
