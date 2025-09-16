import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Session, User} from '.';

export enum FileType {
  Image = 'image',
  Video = 'video',
  Document = 'document',
  Other = 'other',
}

export enum FileCategory {
  ProfilePicture = 'profile_picture',
  UserUploadedDocument = 'user_uploaded_document',
  SystemGeneratedDocument = 'system_generated_document',
  Invoice = 'invoice',
  Report = 'report',
  Contract = 'contract',
  OtherCategory = 'other_category',
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
        foreignKey: 'creator_user_id',
      },
      file_deleted_by_fkeyRel: {
        name: 'file_deleted_by_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'deleted_by',
      },
      file_session_id_fkeyRel: {
        name: 'file_session_id_fkeyRel',
        entity: 'Session',
        entityKey: 'id',
        foreignKey: 'session_id',
      },
    },
    indexes: {
      idx_file_uuid: {
        keys: {uuid: 1},
        options: {unique: true},
      },
      idx_file_creator_user_id: {
        keys: {creator_user_id: 1},
      },
      idx_file_category: {
        keys: {file_category: 1},
      },
      idx_file_deleted: {
        keys: {deleted: 1},
      },
      idx_file_session_id: {
        keys: {session_id: 1},
      },
    },
  },
})
export class File extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'bigint', nullable: 'NO', generated: true},
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    length: 36,
    postgresql: {columnName: 'uuid', dataType: 'character varying', dataLength: 36, nullable: 'NO'},
  })
  uuid: string;

  @property({
    type: 'string',
    required: true,
    length: 255,
    postgresql: {columnName: 'file_name', dataType: 'character varying', dataLength: 255, nullable: 'NO'},
  })
  file_name: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {enum: Object.values(FileType)},
    postgresql: {columnName: 'file_type', dataType: 'character varying', dataLength: 255, nullable: 'NO'},
  })
  file_type: FileType;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {enum: Object.values(FileCategory)},
    postgresql: {columnName: 'file_category', dataType: 'character varying', dataLength: 255, nullable: 'NO'},
  })
  file_category: FileCategory;

  @property({
    type: 'number',
    postgresql: {columnName: 'file_size_bytes', dataType: 'bigint', nullable: 'YES'},
  })
  file_size_bytes?: number;

  @property({
    type: 'string',
    length: 100,
    postgresql: {columnName: 'mime_type', dataType: 'character varying', dataLength: 100, nullable: 'YES'},
  })
  mime_type?: string;

  @property({
    type: 'string',
    length: 64,
    postgresql: {columnName: 'file_checksum', dataType: 'character varying', dataLength: 64, nullable: 'YES'},
  })
  file_checksum?: string;

  @property({
    type: 'string',
    required: true,
    length: 512,
    postgresql: {columnName: 'storage_url', dataType: 'character varying', dataLength: 512, nullable: 'NO'},
  })
  storage_url: string;

  @property({
    type: 'string',
    length: 100,
    postgresql: {columnName: 'storage_service', dataType: 'character varying', dataLength: 100, nullable: 'YES'},
  })
  storage_service?: string;

  @property({
    type: 'string',
    length: 255,
    postgresql: {columnName: 'storage_identifier', dataType: 'character varying', dataLength: 255, nullable: 'YES'},
  })
  storage_identifier?: string;

  @property({
    type: 'date',
    required: true,
    default: new Date(),
    postgresql: {columnName: 'uploaded_at', dataType: 'timestamp without time zone', nullable: 'NO'},
  })
  uploaded_at: string;

  @belongsTo(() => User, {name: 'creatorUser'}, {required: true})
  creator_user_id: number;

  @belongsTo(() => Session)
  session_id?: number;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {columnName: 'deleted', dataType: 'boolean', nullable: 'NO'},
  })
  deleted: boolean;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'deleted_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  deleted_at?: string;

  @belongsTo(() => User, {name: 'deletedBy'})
  deleted_by?: number;

  constructor(data?: Partial<File>) {
    super(data);
  }
}

export interface FileRelations { }

export type FileWithRelations = File & FileRelations;
