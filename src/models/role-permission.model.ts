import {Entity, model, property} from '@loopback/repository';
import {Permission, Role} from '.';

@model({
  name: 'role_permission',
  settings: {
    postgresql: {
      table: 'role_permission',
    },
    foreignKeys: {
      fk_role_permission_roleId: {
        name: 'fk_role_permission_roleId',
        entity: 'role',
        entityKey: 'id',
        foreignKey: 'role_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
      fk_role_permission_permissionId: {
        name: 'fk_role_permission_permissionId',
        entity: 'permission',
        entityKey: 'id',
        foreignKey: 'permission_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class RolePermission extends Entity {
  @property({
    type: 'number',
    required: true,
    id: true,
    postgresql: {
      columnName: 'role_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  roleId: number;

  @property({
    type: 'number',
    required: true,
    id: true,
    postgresql: {
      columnName: 'permission_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  permissionId: number;

  constructor(data?: Partial<RolePermission>) {
    super(data);
  }
}

export interface RolePermissionRelations {
  role?: Role;
  permission?: Permission;
}

export type RolePermissionWithRelations = RolePermission & RolePermissionRelations;
