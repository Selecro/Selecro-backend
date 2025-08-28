import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserBadge, UserBadgeRelations} from '../models';

export class UserBadgeRepository extends DefaultCrudRepository<
  UserBadge,
  typeof UserBadge.prototype.badgeId,
  UserBadgeRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserBadge, dataSource);
  }
}
