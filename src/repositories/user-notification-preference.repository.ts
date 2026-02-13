import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {
  UserNotificationPreference,
  UserNotificationPreferenceRelations,
} from '../models';

export class UserNotificationPreferenceRepository extends DefaultCrudRepository<
  UserNotificationPreference,
  typeof UserNotificationPreference.prototype.userId,
  UserNotificationPreferenceRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserNotificationPreference, dataSource);
  }
}
