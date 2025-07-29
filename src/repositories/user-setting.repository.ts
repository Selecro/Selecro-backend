import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserSetting, UserSettingRelations} from '../models';

export class UserSettingRepository extends DefaultCrudRepository<
  UserSetting,
  typeof UserSetting.prototype.userId,
  UserSettingRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserSetting, dataSource);
  }
}
