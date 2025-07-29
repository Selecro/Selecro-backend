import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {TwoFactorAuthBackupCode, TwoFactorAuthBackupCodeRelations} from '../models';

export class TwoFactorAuthBackupCodeRepository extends DefaultCrudRepository<
  TwoFactorAuthBackupCode,
  typeof TwoFactorAuthBackupCode.prototype.id,
  TwoFactorAuthBackupCodeRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(TwoFactorAuthBackupCode, dataSource);
  }
}
