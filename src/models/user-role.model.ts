import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Role, User} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'user_role'},
    foreignKeys: {
      user_role_role_id_fkeyRel: {
        name: 'user_role_role_id_fkeyRel',
        entity: 'Role',
        entityKey: 'id',
        foreignKey: 'role_id'
      },
      user_role_user_id_fkeyRel: {
        name: 'user_role_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_user_role_user_id: {
        keys: {user_id: 1}
      },
      idx_user_role_role_id: {
        keys: {role_id: 1}
      },
      uq_user_role_user_id_role_id: {
        keys: {user_id: 1, role_id: 1},
        options: {unique: true}
      }
    }
  }
})
export class UserRole extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: true},
  })
  id: number;

  @belongsTo(() => User)
  user_id: number;

  @belongsTo(() => Role)
  role_id: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserRole>) {
    super(data);
  }
}

export interface UserRoleRelations {
  // describe navigational properties here
}

export type UserRoleWithRelations = UserRole & UserRoleRelations;
