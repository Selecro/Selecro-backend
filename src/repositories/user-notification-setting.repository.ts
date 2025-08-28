import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserNotificationSetting, UserNotificationSettingRelations} from '../models';

export class UserNotificationSettingRepository extends DefaultCrudRepository<
  UserNotificationSetting,
  typeof UserNotificationSetting.prototype.userId,
  UserNotificationSettingRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserNotificationSetting, dataSource);
  }
}
