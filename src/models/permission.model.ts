import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'permission'},
    foreignKeys: {
      permission_creator_user_id_fkeyRel: {
        name: 'permission_creator_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'creator_user_id'
      }
    },
    indexes: {
      uq_permission_resource_action: {
        keys: {resource_type: 1, action_type: 1},
        options: {unique: true},
      },
      idx_permission_creator_user_id: {
        keys: {creator_user_id: 1},
      },
      idx_permission_created_at: {
        keys: {created_at: -1},
      }
    }
  }
})
export class Permission extends Entity {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    scale: 0,
    generated: false,
    id: 1,
    postgresql: {columnName: 'id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: false},
  })
  id: number;

  @belongsTo(() => User)
  creator_user_id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'resource_type', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  resource_type: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'action_type', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  action_type: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'description', dataType: 'text', nullable: 'YES', generated: false},
  })
  description?: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  created_at: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  updated_at: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Permission>) {
    super(data);
  }
}

export interface PermissionRelations {
  // describe navigational properties here
}

export type PermissionWithRelations = Permission & PermissionRelations;
