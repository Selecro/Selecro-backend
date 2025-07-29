import {Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum FileType {
  image = 'image',
  video = 'video',
  document = 'document',
  other = 'other',
}

export enum FileCategory {
  profile_picture = 'profile_picture',
  user_uploaded_document = 'user_uploaded_document',
  system_generated_document = 'system_generated_document',
  invoice = 'invoice',
  report = 'report',
  contract = 'contract',
  other_category = 'other_category',
}

@model({
  name: 'file',
  settings: {
    postgresql: {
      table: 'file',
    },
    foreignKeys: {
      fk_file_creatorUserId: {
        name: 'fk_file_creatorUserId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'creator_user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class File extends Entity {
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
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'file_name',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'NO',
    },
  })
  fileName: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(FileType),
    },
    postgresql: {
      columnName: 'file_type',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  fileType: FileType;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(FileCategory),
    },
    postgresql: {
      columnName: 'file_category',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  fileCategory: FileCategory;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'file_size_bytes',
      dataType: 'bigint',
      nullable: 'YES',
    },
  })
  fileSizeBytes?: number;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'mime_type',
      dataType: 'varchar',
      dataLength: 100,
      nullable: 'YES',
    },
  })
  mimeType?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'checksum',
      dataType: 'varchar',
      dataLength: 64,
      nullable: 'YES',
    },
  })
  checksum?: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'storage_url',
      dataType: 'varchar',
      dataLength: 512,
      nullable: 'NO',
      unique: true,
    },
  })
  storageUrl: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'storage_service',
      dataType: 'varchar',
      dataLength: 100,
      nullable: 'YES',
    },
  })
  storageService?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'storage_identifier',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'YES',
      unique: true,
    },
  })
  storageIdentifier?: string;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'uploaded_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  uploadedAt: Date;

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

  constructor(data?: Partial<File>) {
    super(data);
  }
}

export interface FileRelations {
  creatorUser?: User;
}

export type FileWithRelations = File & FileRelations;
