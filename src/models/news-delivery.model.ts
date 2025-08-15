import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Device, News, User} from '.';

export enum NewsDeliveryLanguage {
  CZ = 'cz',
  EN = 'en'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'news_delivery'},
    foreignKeys: {
      news_delivery_device_id_fkeyRel: {
        name: 'news_delivery_device_id_fkeyRel',
        entity: 'Device',
        entityKey: 'id',
        foreignKey: 'device_id'
      },
      news_delivery_news_id_fkeyRel: {
        name: 'news_delivery_news_id_fkeyRel',
        entity: 'News',
        entityKey: 'id',
        foreignKey: 'news_id'
      },
      news_delivery_user_id_fkeyRel: {
        name: 'news_delivery_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_news_delivery_news_id: {
        keys: {news_id: 1}
      },
      idx_news_delivery_user_id: {
        keys: {user_id: 1}
      },
      idx_news_delivery_device_id: {
        keys: {device_id: 1}
      },
      idx_news_delivery_news_delivery_language: {
        keys: {news_delivery_language: 1}
      }
    }
  }
})
export class NewsDelivery extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: true},
  })
  id: number;

  @belongsTo(() => News)
  news_id: number;

  @belongsTo(() => User)
  user_id: number;

  @belongsTo(() => Device)
  device_id?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(NewsDeliveryLanguage),
    },
    length: 255,
    generated: false,
    default: NewsDeliveryLanguage.CZ,
    postgresql: {columnName: 'news_delivery_language', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  news_delivery_language: NewsDeliveryLanguage;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'sent_as_push', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  sent_as_push: boolean;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'delivered_as_in_app', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  delivered_as_in_app: boolean;

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
    default: new Date(),
    postgresql: {columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  created_at: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<NewsDelivery>) {
    super(data);
  }
}

export interface NewsDeliveryRelations {
  // describe navigational properties here
}

export type NewsDeliveryWithRelations = NewsDelivery & NewsDeliveryRelations;
