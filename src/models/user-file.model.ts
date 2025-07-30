import {Entity, model, property} from '@loopback/repository';
import {File, User} from '.';

@model({
  name: 'user_file',
  settings: {
    postgresql: {
      table: 'user_file',
    },
    foreignKeys: {
      fk_user_File_userId: {
        name: 'fk_user_file_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
      fk_user_File_fileId: {
        name: 'fk_user_file_fileId',
        entity: 'file',
        entityKey: 'id',
        foreignKey: 'file_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class UserFile extends Entity {
  @property({
    type: 'number',
    required: true,
    id: true,
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
    id: true,
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

  constructor(data?: Partial<UserFile>) {
    super(data);
  }
}

export interface UserFileRelations {
  user?: User;
  file?: File;
}

export type UserFileWithRelations = UserFile & UserFileRelations;
