import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {RolePermission, RolePermissionRelations} from '../models';

export class RolePermissionRepository extends DefaultCrudRepository<
  RolePermission,
  typeof RolePermission.prototype.roleId,
  RolePermissionRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(RolePermission, dataSource);
  }
}
