import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {TwoFactorAuthMethod, TwoFactorAuthMethodRelations} from '../models';

export class TwoFactorAuthMethodRepository extends DefaultCrudRepository<
  TwoFactorAuthMethod,
  typeof TwoFactorAuthMethod.prototype.id,
  TwoFactorAuthMethodRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(TwoFactorAuthMethod, dataSource);
  }
}
