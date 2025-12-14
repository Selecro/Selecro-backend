import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserConsent, UserConsentRelations} from '../models';

export class UserConsentRepository extends DefaultCrudRepository<
  UserConsent,
  typeof UserConsent.prototype.userId,
  UserConsentRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserConsent, dataSource);
  }
}
