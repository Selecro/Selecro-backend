import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {UserGroup, UserGroupRelations} from '../models';

export class UserGroupRepository extends DefaultCrudRepository<
  UserGroup,
  typeof UserGroup.prototype.id,
  UserGroupRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(UserGroup, dataSource);
  }
}
