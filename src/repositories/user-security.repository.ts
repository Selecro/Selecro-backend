import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserSecurity, UserSecurityRelations} from '../models';

export class UserSecurityRepository extends DefaultCrudRepository<
  UserSecurity,
  typeof UserSecurity.prototype.userId,
  UserSecurityRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserSecurity, dataSource);
  }
}
