import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserOauthAccount, UserOauthAccountRelations} from '../models';

export class UserOauthAccountRepository extends DefaultCrudRepository<
  UserOauthAccount,
  typeof UserOauthAccount.prototype.userId,
  UserOauthAccountRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserOauthAccount, dataSource);
  }
}
