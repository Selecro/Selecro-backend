import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'two_factor_auth_backup_code'},
    foreignKeys: {
      two_factor_auth_backup_code_user_id_fkeyRel: {
        name: 'two_factor_auth_backup_code_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      uq_code_hash: {
        keys: {code_hash: 1},
        options: {unique: true}
      }
    }
  }
})
export class TwoFactorAuthBackupCode extends Entity {
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

  @belongsTo(() => User)
  user_id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'code_hash', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  code_hash: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'used_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  used_at?: string;

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
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'batch_id', dataType: 'character varying', dataLength: 255, nullable: 'YES', generated: false},
  })
  batch_id?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<TwoFactorAuthBackupCode>) {
    super(data);
  }
}

export interface TwoFactorAuthBackupCodeRelations {
  // describe navigational properties here
}

export type TwoFactorAuthBackupCodeWithRelations = TwoFactorAuthBackupCode & TwoFactorAuthBackupCodeRelations;
