import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum DeviceLanguagePreference {
  EN = 'en',
  CZ = 'cz',
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'device'},
    foreignKeys: {
      device_user_id_fkeyRel: {
        name: 'device_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id',
      },
    },
    indexes: {
      idx_device_user_id: {
        keys: {user_id: 1},
      },
      idx_device_last_used_at: {
        keys: {last_used_at: 1},
      },
      idx_device_device_token: {
        keys: {device_token: 1},
      },
      idx_device_device_language_preference: {
        keys: {device_language_preference: 1},
      },
    },
  },
})
export class Device extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'bigint', nullable: 'NO', generated: true},
  })
  id: number;

  @belongsTo(() => User)
  user_id?: number;

  @property({
    type: 'string',
    required: true,
    length: 255,
    postgresql: {columnName: 'device_name', dataType: 'character varying', dataLength: 255, nullable: 'NO'},
  })
  device_name: string;

  @property({
    type: 'date',
    postgresql: {columnName: 'last_used_at', dataType: 'timestamp without time zone', nullable: 'YES'},
  })
  last_used_at?: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {columnName: 'is_trusted', dataType: 'boolean', nullable: 'NO'},
  })
  is_trusted: boolean;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {columnName: 'biometric_enabled', dataType: 'boolean', nullable: 'NO'},
  })
  biometric_enabled: boolean;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {enum: Object.values(DeviceLanguagePreference)},
    default: DeviceLanguagePreference.CZ,
    length: 255,
    postgresql: {columnName: 'device_language_preference', dataType: 'character varying', dataLength: 255, nullable: 'NO'},
  })
  device_language_preference: DeviceLanguagePreference;

  @property({
    type: 'string',
    length: 100,
    postgresql: {columnName: 'device_os', dataType: 'character varying', dataLength: 100, nullable: 'YES'},
  })
  device_os?: string;

  @property({
    type: 'string',
    length: 100,
    postgresql: {columnName: 'device_version', dataType: 'character varying', dataLength: 100, nullable: 'YES'},
  })
  device_version?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'device_fingerprint', dataType: 'text', nullable: 'YES'},
  })
  device_fingerprint?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'device_token', dataType: 'text', nullable: 'YES'},
  })
  device_token?: string;

  @property({
    type: 'string',
    length: 45,
    postgresql: {columnName: 'last_known_ip', dataType: 'character varying', dataLength: 45, nullable: 'YES'},
  })
  last_known_ip?: string;

  @property({
    type: 'date',
    required: true,
    default: new Date(),
    postgresql: {columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO'},
  })
  created_at: string;

  @property({
    type: 'date',
    required: true,
    default: new Date(),
    postgresql: {columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO'},
  })
  updated_at: string;

  constructor(data?: Partial<Device>) {
    super(data);
  }
}

export interface DeviceRelations { }

export type DeviceWithRelations = Device & DeviceRelations;
