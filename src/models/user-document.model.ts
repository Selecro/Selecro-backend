import {Entity, model, property} from '@loopback/repository';
import {File, User} from '.';

@model({
  name: 'user_document',
  settings: {
    postgresql: {
      table: 'user_document',
    },
    foreignKeys: {
      fk_user_document_userId: {
        name: 'fk_user_document_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
      fk_user_document_fileId: {
        name: 'fk_user_document_fileId',
        entity: 'file',
        entityKey: 'id',
        foreignKey: 'file_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class UserDocument extends Entity {
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
      columnName: 'file_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  fileId: number;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'generated_or_uploaded_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  generatedOrUploadedAt: Date;

  constructor(data?: Partial<UserDocument>) {
    super(data);
  }
}

export interface UserDocumentRelations {
  user?: User;
  file?: File;
}

export type UserDocumentWithRelations = UserDocument & UserDocumentRelations;
