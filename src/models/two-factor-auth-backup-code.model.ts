import {Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({
  name: 'two_factor_auth_backup_code',
  settings: {
    postgresql: {
      table: 'two_factor_auth_backup_code',
    },
    foreignKeys: {
      fk_two_factor_auth_backup_code_userId: {
        name: 'fk_two_factor_auth_backup_code_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class TwoFactorAuthBackupCode extends Entity {
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
      columnName: 'user_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  userId: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'code_hash',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'NO',
      unique: true,
    },
  })
  codeHash: string;

  @property({
    type: 'date',
    required: false,
    postgresql: {
      columnName: 'used_at',
      dataType: 'timestamp with time zone',
      nullable: 'YES',
    },
  })
  usedAt?: Date;

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
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'batch_id',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'YES',
    },
  })
  batchId?: string;

  constructor(data?: Partial<TwoFactorAuthBackupCode>) {
    super(data);
  }
}

export interface TwoFactorAuthBackupCodeRelations {
  user?: User;
}

export type TwoFactorAuthBackupCodeWithRelations = TwoFactorAuthBackupCode & TwoFactorAuthBackupCodeRelations;
