import {Entity, model, property} from '@loopback/repository';
import {Device, News, User} from '.';

export enum NewsDeliveryLanguage {
  cz = 'cz',
  en = 'en',
}

@model({
  name: 'news_delivery',
  settings: {
    postgresql: {
      table: 'news_delivery',
      indexes: {
        uniqueNewsUserDevice: {
          keys: {
            news_id: 1,
            user_id: 1,
            device_id: 1,
          },
          options: {
            unique: true,
          },
        },
      },
    },
    foreignKeys: {
      fk_news_delivery_newsId: {
        name: 'fk_news_delivery_newsId',
        entity: 'news',
        entityKey: 'id',
        foreignKey: 'news_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      fk_news_delivery_userId: {
        name: 'fk_news_delivery_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      fk_news_delivery_deviceId: {
        name: 'fk_news_delivery_deviceId',
        entity: 'device',
        entityKey: 'id',
        foreignKey: 'device_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class NewsDelivery extends Entity {
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
      columnName: 'news_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  newsId: number;

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
    default: NewsDeliveryLanguage.cz,
    jsonSchema: {
      enum: Object.values(NewsDeliveryLanguage),
    },
    postgresql: {
      columnName: 'language',
      dataType: 'text',
      nullable: 'NO',
      default: 'cz',
    },
  })
  language: NewsDeliveryLanguage;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {
      columnName: 'sent_as_push',
      dataType: 'boolean',
      nullable: 'NO',
      default: false,
    },
  })
  sentAsPush: boolean;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {
      columnName: 'delivered_as_in_app',
      dataType: 'boolean',
      nullable: 'NO',
      default: false,
    },
  })
  deliveredAsInApp: boolean;

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

  constructor(data?: Partial<NewsDelivery>) {
    super(data);
  }
}

export interface NewsDeliveryRelations {
  news?: News;
  user?: User;
  device?: Device;
}

export type NewsDeliveryWithRelations = NewsDelivery & NewsDeliveryRelations;
