import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum FileType {
  Image = 'image',
  Video = 'video',
  Document = 'document',
  Other = 'other'
}

export enum FileCategory {
  ProfilePicture = 'profile_picture',
  UserUploadedDocument = 'user_uploaded_document',
  SystemGeneratedDocument = 'system_generated_document',
  Invoice = 'invoice',
  Report = 'report',
  Contract = 'contract',
  OtherCategory = 'other_category'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'file'},
    foreignKeys: {
      file_creator_user_id_fkeyRel: {
        name: 'file_creator_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'creator_user_id'
      },
      file_deleted_by_fkeyRel: {
        name: 'file_deleted_by_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'deleted_by'
      }
    },
    indexes: {
      idx_file_creator_user_id: {
        keys: {creator_user_id: 1}
      },
      idx_file_creator_user_uploaded_at: {
        keys: {creator_user_id: 1, uploaded_at: 1}
      },
      idx_file_deleted_by: {
        keys: {deleted_by: 1}
      }
    }
  }
})
export class File extends Entity {
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

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'file_name', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  file_name: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(FileType)
    },
    length: 255,
    generated: false,
    postgresql: {columnName: 'file_type', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  file_type: FileType;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(FileCategory)
    },
    length: 255,
    generated: false,
    postgresql: {columnName: 'file_category', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  file_category: FileCategory;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'file_size_bytes', dataType: 'bigint', dataScale: 0, nullable: 'YES', generated: false},
  })
  file_size_bytes?: number;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    postgresql: {columnName: 'mime_type', dataType: 'character varying', dataLength: 100, nullable: 'YES', generated: false},
  })
  mime_type?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 64,
    generated: false,
    postgresql: {columnName: 'file_checksum', dataType: 'character varying', dataLength: 64, nullable: 'YES', generated: false},
  })
  file_checksum?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 512,
    generated: false,
    index: {unique: true},
    postgresql: {columnName: 'storage_url', dataType: 'character varying', dataLength: 512, nullable: 'NO', generated: false},
  })
  storage_url: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    postgresql: {columnName: 'storage_service', dataType: 'character varying', dataLength: 100, nullable: 'YES', generated: false},
  })
  storage_service?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    index: {unique: true},
    postgresql: {columnName: 'storage_identifier', dataType: 'character varying', dataLength: 255, nullable: 'YES', generated: false},
  })
  storage_identifier?: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'uploaded_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  uploaded_at: string;

  @belongsTo(() => User)
  creator_user_id: number;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'deleted', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  deleted: boolean;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'deleted_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  deleted_at?: string;

  @belongsTo(() => User)
  deleted_by?: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<File>) {
    super(data);
  }
}

export interface FileRelations {
  // describe navigational properties here
}

export type FileWithRelations = File & FileRelations;
