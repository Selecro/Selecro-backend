import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Permission, Role} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'role_permission'},
    foreignKeys: {
      role_permission_permission_id_fkeyRel: {
        name: 'role_permission_permission_id_fkeyRel',
        entity: 'Permission',
        entityKey: 'id',
        foreignKey: 'permission_id'
      },
      role_permission_role_id_fkeyRel: {
        name: 'role_permission_role_id_fkeyRel',
        entity: 'Role',
        entityKey: 'id',
        foreignKey: 'role_id'
      }
    },
    indexes: {
      uq_role_permission_role_permission: {
        keys: {role_id: 1, permission_id: 1},
        options: {unique: true}
      }
    }
  }
})
export class RolePermission extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: true},
  })
  id: number;

  @belongsTo(() => Role)
  role_id: number;

  @belongsTo(() => Permission)
  permission_id: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<RolePermission>) {
    super(data);
  }
}

export interface RolePermissionRelations {
  // describe navigational properties here
}

export type RolePermissionWithRelations = RolePermission & RolePermissionRelations;
