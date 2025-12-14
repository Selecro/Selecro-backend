import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserLoginHistory, UserLoginHistoryRelations} from '../models';

export class UserLoginHistoryRepository extends DefaultCrudRepository<
  UserLoginHistory,
  typeof UserLoginHistory.prototype.id,
  UserLoginHistoryRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserLoginHistory, dataSource);
  }
}
