import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {TwoFactorAuthLog, TwoFactorAuthLogRelations} from '../models';

export class TwoFactorAuthLogRepository extends DefaultCrudRepository<
  TwoFactorAuthLog,
  typeof TwoFactorAuthLog.prototype.id,
  TwoFactorAuthLogRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(TwoFactorAuthLog, dataSource);
  }
}
