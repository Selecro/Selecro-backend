import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'password_history'},
    foreignKeys: {
      password_history_user_id_fkeyRel: {
        name: 'password_history_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_password_history_user_id: {
        keys: {user_id: 1}
      },
      idx_password_history_changed_at: {
        keys: {changed_at: -1}
      }
    }
  }
})
export class PasswordHistory extends Entity {
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
  user_id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'password_hash', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  password_hash: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'changed_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  changed_at: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<PasswordHistory>) {
    super(data);
  }
}

export interface PasswordHistoryRelations {
  // describe navigational properties here
}

export type PasswordHistoryWithRelations = PasswordHistory & PasswordHistoryRelations;
