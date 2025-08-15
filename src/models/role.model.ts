import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum RoleName {
  Admin = 'admin',
  User = 'user',
  Marketer = 'marketer',
  Educator = 'educator',
  Customer = 'customer'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'role'},
    foreignKeys: {
      role_creator_user_id_fkeyRel: {
        name: 'role_creator_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'creator_user_id'
      },
      role_deleted_by_fkeyRel: {
        name: 'role_deleted_by_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'deleted_by'
      }
    },
    indexes: {
      idx_role_creator_user_id: {
        keys: {creator_user_id: 1}
      },
      idx_role_deleted_by: {
        keys: {deleted_by: 1}
      }
    }
  }
})
export class Role extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: true},
  })
  id: number;

  @belongsTo(() => User)
  creator_user_id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(RoleName)
    },
    length: 255,
    generated: false,
    default: RoleName.User,
    postgresql: {columnName: 'role_name', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  role_name: RoleName;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'role_description', dataType: 'text', nullable: 'YES', generated: false},
  })
  role_description?: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  created_at: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  updated_at: string;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'deleted', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  deleted: boolean;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'deleted_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  deleted_at?: string;

  @belongsTo(() => User)
  deleted_by?: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Role>) {
    super(data);
  }
}

export interface RoleRelations {
  // describe navigational properties here
}

export type RoleWithRelations = Role & RoleRelations;
