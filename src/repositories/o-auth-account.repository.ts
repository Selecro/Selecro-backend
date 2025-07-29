import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {OAuthAccount, OAuthAccountRelations} from '../models';

export class OAuthAccountRepository extends DefaultCrudRepository<
  OAuthAccount,
  typeof OAuthAccount.prototype.id,
  OAuthAccountRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(OAuthAccount, dataSource);
  }
}
