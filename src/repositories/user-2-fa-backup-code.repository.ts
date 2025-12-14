import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {User2FaBackupCode, User2FaBackupCodeRelations} from '../models';

export class User2FaBackupCodeRepository extends DefaultCrudRepository<
  User2FaBackupCode,
  typeof User2FaBackupCode.prototype.id,
  User2FaBackupCodeRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(User2FaBackupCode, dataSource);
  }
}
