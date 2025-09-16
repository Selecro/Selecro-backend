import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Device, User} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'session'},
    foreignKeys: {
      session_device_id_fkeyRel: {
        name: 'session_device_id_fkeyRel',
        entity: 'Device',
        entityKey: 'id',
        foreignKey: 'device_id',
      },
      session_user_id_fkeyRel: {
        name: 'session_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id',
      },
    },
    indexes: {
      idx_session_token_unique: {
        keys: {session_token: 1},
        options: {unique: true},
      },
      idx_session_user_id: {
        keys: {user_id: 1},
      },
      idx_session_device_id: {
        keys: {device_id: 1},
      },
      idx_session_is_active: {
        keys: {is_active: 1},
      },
    },
  },
})
export class Session extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'bigint', nullable: 'NO', generated: true},
  })
  id: number;

  @belongsTo(() => User)
  user_id?: number;

  @belongsTo(() => Device, {name: 'device'}, {required: true})
  device_id: number;

  @property({
    type: 'string',
    required: true,
    length: 255,
    postgresql: {columnName: 'session_token', dataType: 'character varying', dataLength: 255, nullable: 'NO'},
  })
  session_token: string;

  @property({
    type: 'date',
    required: true,
    default: new Date(),
    postgresql: {columnName: 'login_time', dataType: 'timestamp without time zone', nullable: 'NO'},
  })
  login_time: string;

  @property({
    type: 'date',
    required: true,
    default: new Date(),
    postgresql: {columnName: 'last_active', dataType: 'timestamp without time zone', nullable: 'NO'},
  })
  last_active: string;

  @property({
    type: 'date',
    required: true,
    postgresql: {columnName: 'expires_at', dataType: 'timestamp without time zone', nullable: 'NO'},
  })
  expires_at: string;

  @property({
    type: 'boolean',
    required: true,
    default: true,
    postgresql: {columnName: 'is_active', dataType: 'boolean', nullable: 'NO'},
  })
  is_active: boolean;

  @property({
    type: 'string',
    postgresql: {columnName: 'user_agent', dataType: 'text', nullable: 'YES'},
  })
  user_agent?: string;

  @property({
    type: 'string',
    length: 45,
    postgresql: {columnName: 'ip_address', dataType: 'character varying', dataLength: 45, nullable: 'YES'},
  })
  ip_address?: string;

  @property({
    type: 'string',
    length: 100,
    postgresql: {columnName: 'country', dataType: 'character varying', dataLength: 100, nullable: 'YES'},
  })
  country?: string;

  @property({
    type: 'string',
    length: 100,
    postgresql: {columnName: 'region', dataType: 'character varying', dataLength: 100, nullable: 'YES'},
  })
  region?: string;

  @property({
    type: 'string',
    length: 100,
    postgresql: {columnName: 'city', dataType: 'character varying', dataLength: 100, nullable: 'YES'},
  })
  city?: string;

  @property({
    type: 'number',
    precision: 10,
    scale: 8,
    postgresql: {columnName: 'latitude', dataType: 'numeric', dataPrecision: 10, dataScale: 8, nullable: 'YES'},
  })
  latitude?: number;

  @property({
    type: 'number',
    precision: 11,
    scale: 8,
    postgresql: {columnName: 'longitude', dataType: 'numeric', dataPrecision: 11, dataScale: 8, nullable: 'YES'},
  })
  longitude?: number;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {columnName: 'cookie_consent', dataType: 'boolean', nullable: 'NO'},
  })
  cookie_consent: boolean;

  @property({
    type: 'string',
    length: 100,
    postgresql: {columnName: 'system_version', dataType: 'character varying', dataLength: 100, nullable: 'YES'},
  })
  system_version?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'public_key', dataType: 'text', nullable: 'YES'},
  })
  public_key?: string;

  constructor(data?: Partial<Session>) {
    super(data);
  }
}

export interface SessionRelations { }

export type SessionWithRelations = Session & SessionRelations;
