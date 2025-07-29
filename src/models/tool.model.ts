import {Entity, model, property} from '@loopback/repository';
import {File, User} from '.';

export enum ToolStatus {
  active = 'active',
  draft = 'draft',
  archived = 'arch'
}

@model({
  name: 'tool',
  settings: {
    postgresql: {
      table: 'tool',
    },
    foreignKeys: {
      fk_tool_creatorUserId: {
        name: 'fk_tool_creatorUserId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'creator_user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
      fk_tool_imageFileId: {
        name: 'fk_tool_imageFileId',
        entity: 'file',
        entityKey: 'id',
        foreignKey: 'image_file_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class Tool extends Entity {
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
      columnName: 'creator_user_id',
      dataType: 'bigint',
      nullable: 'YES',
    },
  })
  creatorUserId?: number;

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
    required: false,
    postgresql: {
      columnName: 'description_cz',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  descriptionCz?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'description_en',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  descriptionEn?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'video_url',
      dataType: 'varchar',
      dataLength: 2048,
      nullable: 'YES',
    },
  })
  videoUrl?: string;

  @property({
    type: 'string',
    required: true,
    default: ToolStatus.draft,
    jsonSchema: {
      enum: Object.values(ToolStatus),
    },
    postgresql: {
      columnName: 'status',
      dataType: 'text',
      nullable: 'NO',
      default: 'draft',
    },
  })
  status: ToolStatus;

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

  constructor(data?: Partial<Tool>) {
    super(data);
  }
}

export interface ToolRelations {
  creatorUser?: User;
  imageFile?: File;
}

export type ToolWithRelations = Tool & ToolRelations;
