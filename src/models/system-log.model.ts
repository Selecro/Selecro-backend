import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

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
      idx_system_log_log_time: {
        keys: {log_time: 1}
      },
      idx_system_log_severity: {
        keys: {severity: 1}
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
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'log_type', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  log_type: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'log_time', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  log_time: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'action', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  action: string;

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
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'severity', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  severity: string;

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
