import {Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({
  name: 'device',
  settings: {
    postgresql: {
      table: 'device',
    },
    foreignKeys: {
      fk_device_userId: {
        name: 'fk_device_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class Device extends Entity {
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
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'device_name',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'NO',
    },
  })
  deviceName: string;

  @property({
    type: 'date',
    required: false,
    postgresql: {
      columnName: 'last_used_at',
      dataType: 'timestamp with time zone',
      nullable: 'YES',
    },
  })
  lastUsedAt?: Date;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {
      columnName: 'is_trusted',
      dataType: 'boolean',
      nullable: 'NO',
      default: false,
    },
  })
  isTrusted: boolean;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {
      columnName: 'biometric_enabled',
      dataType: 'boolean',
      nullable: 'NO',
      default: false,
    },
  })
  biometricEnabled: boolean;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'device_os',
      dataType: 'varchar',
      dataLength: 100,
      nullable: 'YES',
    },
  })
  deviceOs?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'device_version',
      dataType: 'varchar',
      dataLength: 100,
      nullable: 'YES',
    },
  })
  deviceVersion?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'device_fingerprint',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  deviceFingerprint?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'device_token',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  deviceToken?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'last_known_ip',
      dataType: 'varchar',
      dataLength: 45,
      nullable: 'YES',
    },
  })
  lastKnownIp?: string;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'created_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  createdAt: Date;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    updateDefaultFn: 'now',
    postgresql: {
      columnName: 'updated_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  updatedAt: Date;

  constructor(data?: Partial<Device>) {
    super(data);
  }
}

export interface DeviceRelations {
  user?: User;
}

export type DeviceWithRelations = Device & DeviceRelations;
