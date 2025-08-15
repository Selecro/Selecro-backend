import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum DeviceLanguagePreference {
  EN = 'en',
  CZ = 'cz'
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
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_device_user_id: {
        keys: {user_id: 1}
      },
      idx_device_last_used_at: {
        keys: {last_used_at: 1}
      },
      idx_device_device_token: {
        keys: {device_token: 1}
      },
      idx_device_device_language_preference: {
        keys: {device_language_preference: 1}
      }
    }
  }
})
export class Device extends Entity {
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
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'device_name', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  device_name: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'last_used_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  last_used_at?: string;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'is_trusted', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  is_trusted: boolean;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'biometric_enabled', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  biometric_enabled: boolean;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(DeviceLanguagePreference)
    },
    length: 255,
    generated: false,
    default: DeviceLanguagePreference.CZ,
    postgresql: {columnName: 'device_language_preference', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  device_language_preference: DeviceLanguagePreference;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    postgresql: {columnName: 'device_os', dataType: 'character varying', dataLength: 100, nullable: 'YES', generated: false},
  })
  device_os?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    postgresql: {columnName: 'device_version', dataType: 'character varying', dataLength: 100, nullable: 'YES', generated: false},
  })
  device_version?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'device_fingerprint', dataType: 'text', nullable: 'YES', generated: false},
  })
  device_fingerprint?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'device_token', dataType: 'text', nullable: 'YES', generated: false},
  })
  device_token?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 45,
    generated: false,
    postgresql: {columnName: 'last_known_ip', dataType: 'character varying', dataLength: 45, nullable: 'YES', generated: false},
  })
  last_known_ip?: string;

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

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Device>) {
    super(data);
  }
}

export interface DeviceRelations {
  // describe navigational properties here
}

export type DeviceWithRelations = Device & DeviceRelations;
