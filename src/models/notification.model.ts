import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'notification'},
    foreignKeys: {
      notification_creator_user_id_fkeyRel: {
        name: 'notification_creator_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'creator_user_id'
      },
      notification_user_id_fkeyRel: {
        name: 'notification_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_notification_user_id: {
        keys: {user_id: 1}
      },
      idx_notification_creator_user_id: {
        keys: {creator_user_id: 1}
      },
      idx_notification_type: {
        keys: {type: 1}
      },
      idx_notification_delivery_method: {
        keys: {delivery_method: 1}
      },
      idx_notification_read_at: {
        keys: {read_at: 1}
      }
    }
  }
})
export class Notification extends Entity {
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
  user_id: number;

  @belongsTo(() => User)
  creator_user_id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'title', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  title: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'message', dataType: 'text', nullable: 'NO', generated: false},
  })
  message: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'type', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  type: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'delivery_method', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  delivery_method: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 2048,
    generated: false,
    postgresql: {columnName: 'image_url', dataType: 'character varying', dataLength: 2048, nullable: 'YES', generated: false},
  })
  image_url?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 2048,
    generated: false,
    postgresql: {columnName: 'action_url', dataType: 'character varying', dataLength: 2048, nullable: 'YES', generated: false},
  })
  action_url?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'extra_data', dataType: 'json', nullable: 'YES', generated: false},
  })
  extra_data?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'read_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  read_at?: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  created_at: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Notification>) {
    super(data);
  }
}

export interface NotificationRelations {
  // describe navigational properties here
}

export type NotificationWithRelations = Notification & NotificationRelations;
