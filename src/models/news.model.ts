import {Entity, model, property} from '@loopback/repository';
import {File, User} from '.';

export enum NewsStatus {
  draft = 'draft',
  published = 'published',
  archived = 'archived',
}

@model({
  name: 'news',
  settings: {
    postgresql: {
      table: 'news',
    },
    foreignKeys: {
      fk_news_creatorUserId: {
        name: 'fk_news_creatorUserId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'creator_user_id',
        onDelete: 'RESTRICT',
        onUpdate: 'NO ACTION',
      },
      fk_news_imageFileId: {
        name: 'fk_news_imageFileId',
        entity: 'file',
        entityKey: 'id',
        foreignKey: 'image_file_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class News extends Entity {
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
      columnName: 'creator_user_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  creatorUserId: number;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'image_file_id',
      dataType: 'bigint',
      nullable: 'YES',
    },
  })
  imageFileId?: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'title_cz',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'NO',
    },
  })
  titleCz: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'title_en',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'NO',
    },
  })
  titleEn: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'content_cz',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  contentCz: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'content_en',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  contentEn: string;

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

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    updateDefaultFn: 'now',
    postgresql: {
      columnName: 'updated_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  updatedAt: Date;

  @property({
    type: 'date',
    required: false,
    postgresql: {
      columnName: 'published_at',
      dataType: 'timestamp with time zone',
      nullable: 'YES',
    },
  })
  publishedAt?: Date;

  @property({
    type: 'string',
    required: true,
    default: NewsStatus.draft,
    jsonSchema: {
      enum: Object.values(NewsStatus),
    },
    postgresql: {
      columnName: 'status',
      dataType: 'text',
      nullable: 'NO',
      default: 'draft',
    },
  })
  status: NewsStatus;

  constructor(data?: Partial<News>) {
    super(data);
  }
}

export interface NewsRelations {
  creatorUser?: User;
  imageFile?: File;
}

export type NewsWithRelations = News & NewsRelations;
