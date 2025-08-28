import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {LoginHistory, LoginHistoryRelations} from '../models';

export class LoginHistoryRepository extends DefaultCrudRepository<
  LoginHistory,
  typeof LoginHistory.prototype.id,
  LoginHistoryRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(LoginHistory, dataSource);
  }
}
