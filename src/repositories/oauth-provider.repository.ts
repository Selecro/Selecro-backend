import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {OauthProvider, OauthProviderRelations} from '../models';

export class OauthProviderRepository extends DefaultCrudRepository<
  OauthProvider,
  typeof OauthProvider.prototype.id,
  OauthProviderRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(OauthProvider, dataSource);
  }
}
