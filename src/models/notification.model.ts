import {Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum NotificationType {
  info = 'info',
  warning = 'warning',
  error = 'error',
  success = 'success',
  promotion = 'promotion',
  activity = 'activity',
}

export enum DeliveryMethod {
  email = 'email',
  push = 'push',
  in_app = 'in_app',
}

@model({
  name: 'notification',
  settings: {
    postgresql: {
      table: 'notification',
    },
    foreignKeys: {
      fk_notification_userId: {
        name: 'fk_notification_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      fk_notification_creatorUserId: {
        name: 'fk_notification_creatorUserId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'creator_user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class Notification extends Entity {
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
    required: true,
    postgresql: {
      columnName: 'creator_user_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  creatorUserId: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'title',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'NO',
    },
  })
  title: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'message',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  message: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(NotificationType),
    },
    postgresql: {
      columnName: 'type',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  type: NotificationType;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(DeliveryMethod),
    },
    postgresql: {
      columnName: 'delivery_method',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  deliveryMethod: DeliveryMethod;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'image_url',
      dataType: 'varchar',
      dataLength: 2048,
      nullable: 'YES',
    },
  })
  imageUrl?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'action_url',
      dataType: 'varchar',
      dataLength: 2048,
      nullable: 'YES',
    },
  })
  actionUrl?: string;

  @property({
    type: 'object',
    required: false,
    postgresql: {
      columnName: 'extra_data',
      dataType: 'jsonb',
      nullable: 'YES',
    },
  })
  extraData?: object;

  @property({
    type: 'date',
    required: false,
    postgresql: {
      columnName: 'read_at',
      dataType: 'timestamp with time zone',
      nullable: 'YES',
    },
  })
  readAt?: Date;

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

  constructor(data?: Partial<Notification>) {
    super(data);
  }
}

export interface NotificationRelations {
  user?: User;
  creatorUser?: User;
}

export type NotificationWithRelations = Notification & NotificationRelations;
