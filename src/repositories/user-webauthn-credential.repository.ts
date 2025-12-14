import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserWebauthnCredential, UserWebauthnCredentialRelations} from '../models';

export class UserWebauthnCredentialRepository extends DefaultCrudRepository<
  UserWebauthnCredential,
  typeof UserWebauthnCredential.prototype.id,
  UserWebauthnCredentialRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserWebauthnCredential, dataSource);
  }
}
