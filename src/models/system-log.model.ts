import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum SystemLogType {
  Authentication = 'authentication',
  DataAccess = 'data_access',
  Error = 'error',
  SystemEvent = 'system_event'
}

export enum SystemLogAction {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Login = 'login',
  Logout = 'logout',
  Error = 'error'
}

export enum SystemLogSeverity {
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Debug = 'debug',
  Critical = 'critical'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'system_log'},
    foreignKeys: {
      system_log_user_id_fkeyRel: {
        name: 'system_log_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_system_log_system_log_time: {
        keys: {system_log_time: 1}
      },
      idx_system_log_system_severity: {
        keys: {system_severity: 1}
      },
      idx_system_log_user_id: {
        keys: {user_id: 1}
      }
    }
  }
})
export class SystemLog extends Entity {
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
  user_id?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(SystemLogType)
    },
    length: 255,
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'system_log_type', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  system_log_type: SystemLogType;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'system_log_time', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  system_log_time: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(SystemLogAction)
    },
    length: 255,
    generated: false,
    postgresql: {columnName: 'system_action', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  system_action: SystemLogAction;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'resource_id', dataType: 'character varying', dataLength: 255, nullable: 'YES', generated: false},
  })
  resource_id?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(SystemLogSeverity)
    },
    length: 255,
    generated: false,
    postgresql: {columnName: 'system_severity', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  system_severity: SystemLogSeverity;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'details', dataType: 'text', nullable: 'YES', generated: false},
  })
  details?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'metadata', dataType: 'json', nullable: 'YES', generated: false},
  })
  metadata?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<SystemLog>) {
    super(data);
  }
}

export interface SystemLogRelations {
  // describe navigational properties here
}

export type SystemLogWithRelations = SystemLog & SystemLogRelations;
