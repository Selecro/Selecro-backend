import {Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum LogType {
  authentication = 'authentication',
  data_access = 'data_access',
  error = 'error',
  system_event = 'system_event',
}

export enum LogAction {
  create = 'create',
  read = 'read',
  update = 'update',
  delete = 'delete',
  login = 'login',
  logout = 'logout',
  error = 'error',
}

export enum LogSeverity {
  info = 'info',
  warning = 'warning',
  error = 'error',
  debug = 'debug',
  critical = 'critical',
}

@model({
  name: 'system_log',
  settings: {
    postgresql: {
      table: 'system_log',
    },
    foreignKeys: {
      fk_system_log_userId: {
        name: 'fk_system_log_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class SystemLog extends Entity {
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
    required: false,
    postgresql: {
      columnName: 'user_id',
      dataType: 'bigint',
      nullable: 'YES',
    },
  })
  userId?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(LogType),
    },
    postgresql: {
      columnName: 'log_type',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  logType: LogType;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'log_time',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  logTime: Date;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(LogAction),
    },
    postgresql: {
      columnName: 'action',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  action: LogAction;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'resource_id',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'YES',
    },
  })
  resourceId?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(LogSeverity),
    },
    postgresql: {
      columnName: 'severity',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  severity: LogSeverity;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'details',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  details?: string;

  @property({
    type: 'object',
    required: false,
    postgresql: {
      columnName: 'metadata',
      dataType: 'jsonb',
      nullable: 'YES',
    },
  })
  metadata?: object;

  constructor(data?: Partial<SystemLog>) {
    super(data);
  }
}

export interface SystemLogRelations {
  user?: User;
}

export type SystemLogWithRelations = SystemLog & SystemLogRelations;
