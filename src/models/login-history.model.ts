import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum LoginStatus {
  Success = 'success',
  Failure = 'failure',
  Pending2FA = 'pending_2fa'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'login_history'},
    foreignKeys: {
      login_history_user_id_fkeyRel: {
        name: 'login_history_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_login_history_user_id: {
        keys: {user_id: 1}
      },
      idx_login_history_login_time: {
        keys: {login_time: 1}
      }
    }
  }
})
export class LoginHistory extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: true},
  })
  id: number;

  @belongsTo(() => User)
  user_id: number;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'login_time', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  login_time: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(LoginStatus)
    },
    length: 255,
    generated: false,
    postgresql: {columnName: 'login_status', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  login_status: LoginStatus;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'failure_reason', dataType: 'character varying', dataLength: 255, nullable: 'YES', generated: false},
  })
  failure_reason?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 45,
    generated: false,
    postgresql: {columnName: 'ip_address', dataType: 'character varying', dataLength: 45, nullable: 'YES', generated: false},
  })
  ip_address?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'user_agent', dataType: 'text', nullable: 'YES', generated: false},
  })
  user_agent?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<LoginHistory>) {
    super(data);
  }
}

export interface LoginHistoryRelations {
  // describe navigational properties here
}

export type LoginHistoryWithRelations = LoginHistory & LoginHistoryRelations;
