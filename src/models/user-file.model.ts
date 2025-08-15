import {belongsTo, Entity, model, property} from '@loopback/repository';
import {File, User} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'user_file'},
    foreignKeys: {
      user_file_file_id_fkeyRel: {
        name: 'user_file_file_id_fkeyRel',
        entity: 'File',
        entityKey: 'id',
        foreignKey: 'file_id'
      },
      user_file_user_id_fkeyRel: {
        name: 'user_file_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_user_file_user_id: {
        keys: {user_id: 1}
      },
      idx_user_file_file_id: {
        keys: {file_id: 1}
      },
      uq_user_file_user_file: {
        keys: {user_id: 1, file_id: 1},
        options: {unique: true}
      }
    }
  }
})
export class UserFile extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: true},
  })
  id: number;

  @belongsTo(() => User)
  user_id: number;

  @belongsTo(() => File)
  file_id: number;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'generated_or_uploaded_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  generated_or_uploaded_at: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserFile>) {
    super(data);
  }
}

export interface UserFileRelations {
  // describe navigational properties here
}

export type UserFileWithRelations = UserFile & UserFileRelations;
