import {belongsTo, Entity, model, property} from '@loopback/repository';
import {File, User} from '.';

export enum NewsStatus {
  Active = 'active',
  Draft = 'draft',
  Archived = 'archived'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'news'},
    foreignKeys: {
      news_creator_user_id_fkeyRel: {
        name: 'news_creator_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'creator_user_id'
      },
      news_image_file_id_fkeyRel: {
        name: 'news_image_file_id_fkeyRel',
        entity: 'File',
        entityKey: 'id',
        foreignKey: 'image_file_id'
      }
    },
    indexes: {
      idx_news_creator_user_id: {
        keys: {creator_user_id: 1}
      },
      idx_news_image_file_id: {
        keys: {image_file_id: 1}
      },
      idx_news_news_status: {
        keys: {news_status: 1}
      },
      idx_news_published_at: {
        keys: {published_at: 1}
      }
    }
  }
})
export class News extends Entity {
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

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 36,
    generated: false,
    index: {unique: true},
    postgresql: {columnName: 'uuid', dataType: 'character varying', dataLength: 36, nullable: 'NO', generated: false},
  })
  uuid: string;

  @belongsTo(() => User)
  creator_user_id: number;

  @belongsTo(() => File)
  image_file_id?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'title_cz', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  title_cz: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'title_en', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  title_en: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'content_cz', dataType: 'text', nullable: 'NO', generated: false},
  })
  content_cz: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'content_en', dataType: 'text', nullable: 'NO', generated: false},
  })
  content_en: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'published_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  published_at?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(NewsStatus)
    },
    length: 255,
    generated: false,
    default: NewsStatus.Draft,
    postgresql: {columnName: 'news_status', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  news_status: NewsStatus;

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

  constructor(data?: Partial<News>) {
    super(data);
  }
}

export interface NewsRelations {
  // describe navigational properties here
}

export type NewsWithRelations = News & NewsRelations;
