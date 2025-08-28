import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'session'},
    foreignKeys: {
      session_device_id_fkeyRel: {
        name: 'session_device_id_fkeyRel',
        entity: 'Device',
        entityKey: 'id',
        foreignKey: 'device_id'
      },
      session_user_id_fkeyRel: {
        name: 'session_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_session_token_unique: {
        keys: {session_token: 1},
        options: {unique: true}
      },
      idx_session_user_id: {
        keys: {user_id: 1}
      },
      idx_session_device_id: {
        keys: {device_id: 1}
      },
      idx_session_is_active: {
        keys: {is_active: 1}
      }
    }
  }
})
export class Session extends Entity {
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
    type: 'number',
    postgresql: {columnName: 'device_id', dataType: 'bigint', dataScale: 0, nullable: 'YES'},
  })
  device_id?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    index: {unique: true},
    postgresql: {columnName: 'session_token', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  session_token: string;

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
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'last_active', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  last_active: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'expires_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  expires_at: string;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: true,
    postgresql: {columnName: 'is_active', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  is_active: boolean;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'user_agent', dataType: 'text', nullable: 'YES', generated: false},
  })
  user_agent?: string;

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
    length: 100,
    generated: false,
    postgresql: {columnName: 'country', dataType: 'character varying', dataLength: 100, nullable: 'YES', generated: false},
  })
  country?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    postgresql: {columnName: 'region', dataType: 'character varying', dataLength: 100, nullable: 'YES', generated: false},
  })
  region?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    postgresql: {columnName: 'city', dataType: 'character varying', dataLength: 100, nullable: 'YES', generated: false},
  })
  city?: string;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 10,
    scale: 8,
    generated: false,
    postgresql: {columnName: 'latitude', dataType: 'numeric', dataPrecision: 10, dataScale: 8, nullable: 'YES', generated: false},
  })
  latitude?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 11,
    scale: 8,
    generated: false,
    postgresql: {columnName: 'longitude', dataType: 'numeric', dataPrecision: 11, dataScale: 8, nullable: 'YES', generated: false},
  })
  longitude?: number;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'cookie_consent', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  cookie_consent: boolean;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    postgresql: {columnName: 'system_version', dataType: 'character varying', dataLength: 100, nullable: 'YES', generated: false},
  })
  system_version?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'public_key', dataType: 'text', nullable: 'YES', generated: false},
  })
  public_key?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Session>) {
    super(data);
  }
}

export interface SessionRelations {
  // describe navigational properties here
}

export type SessionWithRelations = Session & SessionRelations;
