import {Entity, model, property} from '@loopback/repository';
import {Device, User} from '.';

@model({
  name: 'session',
  settings: {
    postgresql: {
      table: 'session',
    },
    foreignKeys: {
      fk_session_userId: {
        name: 'fk_session_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
      fk_session_deviceId: {
        name: 'fk_session_deviceId',
        entity: 'device',
        entityKey: 'id',
        foreignKey: 'device_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class Session extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      columnName: 'id',
      dataType: 'bigint',
      nullable: 'NO',
      generated: true,
    },
  })
  id?: number;

  @property({
    type: 'string',
    defaultFn: 'uuidv4',
    postgresql: {
      columnName: 'uuid',
      dataType: 'varchar',
      dataLength: 36,
      nullable: 'NO',
      unique: true,
    },
  })
  uuid: string;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'user_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  userId: number;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'device_id',
      dataType: 'bigint',
      nullable: 'YES',
    },
  })
  deviceId?: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'session_token',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'NO',
      unique: true,
    },
  })
  sessionToken: string;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'login_time',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  loginTime: Date;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'last_active',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  lastActive: Date;

  @property({
    type: 'date',
    required: true,
    postgresql: {
      columnName: 'expires_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
    },
  })
  expiresAt: Date;

  @property({
    type: 'boolean',
    required: true,
    default: true,
    postgresql: {
      columnName: 'is_active',
      dataType: 'boolean',
      nullable: 'NO',
      default: true,
    },
  })
  isActive: boolean;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'user_agent',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  userAgent?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'ip_address',
      dataType: 'varchar',
      dataLength: 45,
      nullable: 'YES',
    },
  })
  ipAddress?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'country',
      dataType: 'varchar',
      dataLength: 100,
      nullable: 'YES',
    },
  })
  country?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'region',
      dataType: 'varchar',
      dataLength: 100,
      nullable: 'YES',
    },
  })
  region?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'city',
      dataType: 'varchar',
      dataLength: 100,
      nullable: 'YES',
    },
  })
  city?: string;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'latitude',
      dataType: 'decimal',
      dataPrecision: 10,
      dataScale: 8,
      nullable: 'YES',
    },
  })
  latitude?: number;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'longitude',
      dataType: 'decimal',
      dataPrecision: 11,
      dataScale: 8,
      nullable: 'YES',
    },
  })
  longitude?: number;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {
      columnName: 'cookie_consent',
      dataType: 'boolean',
      nullable: 'NO',
      default: false,
    },
  })
  cookieConsent: boolean;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'system_version',
      dataType: 'varchar',
      dataLength: 100,
      nullable: 'YES',
    },
  })
  systemVersion?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'public_key',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  publicKey?: string;

  constructor(data?: Partial<Session>) {
    super(data);
  }
}

export interface SessionRelations {
  user?: User;
  device?: Device;
}

export type SessionWithRelations = Session & SessionRelations;
