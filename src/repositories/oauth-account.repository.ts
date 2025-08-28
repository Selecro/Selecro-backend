import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {OauthAccount, OauthAccountRelations} from '../models';

export class OauthAccountRepository extends DefaultCrudRepository<
  OauthAccount,
  typeof OauthAccount.prototype.id,
  OauthAccountRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(OauthAccount, dataSource);
  }
}
