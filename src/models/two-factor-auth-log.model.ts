import {Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum TwoFactorAuthMethodType {
  email = 'email',
  TOTP = 'TOTP',
  biometric = 'biometric',
  U2F = 'U2F',
  backup_code = 'backup_code',
}

@model({
  name: 'two_factor_auth_log',
  settings: {
    postgresql: {
      table: 'two_factor_auth_log',
    },
    foreignKeys: {
      fk_two_factor_auth_log_userId: {
        name: 'fk_two_factor_auth_log_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class TwoFactorAuthLog extends Entity {
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
    jsonSchema: {
      enum: Object.values(TwoFactorAuthMethodType),
    },
    postgresql: {
      columnName: 'method_type',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  methodType: TwoFactorAuthMethodType;

  @property({
    type: 'boolean',
    required: true,
    postgresql: {
      columnName: 'success',
      dataType: 'boolean',
      nullable: 'NO',
    },
  })
  success: boolean;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'attempted_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  attemptedAt: Date;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'ip_address',
      dataType: 'varchar',
      dataLength: 45,
      nullable: 'YES',
    },
  })
  ipAddress?: string;

  constructor(data?: Partial<TwoFactorAuthLog>) {
    super(data);
  }
}

export interface TwoFactorAuthLogRelations {
  user?: User;
}

export type TwoFactorAuthLogWithRelations = TwoFactorAuthLog & TwoFactorAuthLogRelations;
