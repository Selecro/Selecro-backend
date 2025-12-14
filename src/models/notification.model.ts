import {Entity, model, property} from '@loopback/repository';

export enum NotificationType {
  Info = 'info',
  Warning = 'warning',
  Alert = 'alert',
  Promotion = 'promotion',
}

@model({
  settings: {idInjection: false, postgresql: {schema: 'public', table: 'notification'}}
})
export class Notification extends Entity {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    scale: 0,
    generated: false,
    id: 1,
    postgresql: {columnName: 'id', dataType: 'bigint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO', generated: false},
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'translation_group_id', dataType: 'uuid', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  translationGroupId: string;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'language_id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  languageId?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 50,
    generated: false,
    postgresql: {columnName: 'audience_type', dataType: 'character varying', dataLength: 50, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  audienceType: string;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'user_id', dataType: 'bigint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  userId?: number;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'fcm_token', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  fcmToken?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'title', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  title: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'notification_message', dataType: 'text', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  notificationMessage: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'notification_type', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  notificationType: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 2048,
    generated: false,
    postgresql: {columnName: 'image_url', dataType: 'character varying', dataLength: 2048, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  imageUrl?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 2048,
    generated: false,
    postgresql: {columnName: 'action_url', dataType: 'character varying', dataLength: 2048, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  actionUrl?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'data_payload', dataType: 'jsonb', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  dataPayload?: string;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'is_read', dataType: 'boolean', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  isRead: boolean;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'created_at', dataType: 'timestamp with time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  createdAt: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'read_at', dataType: 'timestamp with time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  readAt?: string;

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
