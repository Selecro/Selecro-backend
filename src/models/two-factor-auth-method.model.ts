import {Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum TwoFactorAuthMethodTypeEnum {
  email = 'email',
  TOTP = 'TOTP',
  biometric = 'biometric',
  U2F = 'U2F',
  SMS = 'SMS',
}

@model({
  name: 'two_factor_auth_method',
  settings: {
    postgresql: {
      table: 'two_factor_auth_method',
      indexes: {
        uniqueUserMethodType: {
          keys: {
            user_id: 1,
            method_type: 1,
          },
          options: {
            unique: true,
          },
        },
      },
    },
    foreignKeys: {
      fk_two_factor_auth_method_userId: {
        name: 'fk_two_factor_auth_method_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class TwoFactorAuthMethod extends Entity {
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
      enum: Object.values(TwoFactorAuthMethodTypeEnum),
    },
    postgresql: {
      columnName: 'method_type',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  methodType: TwoFactorAuthMethodTypeEnum;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {
      columnName: 'is_primary',
      dataType: 'boolean',
      nullable: 'NO',
      default: false,
    },
  })
  isPrimary: boolean;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {
      columnName: 'enabled',
      dataType: 'boolean',
      nullable: 'NO',
      default: false,
    },
  })
  enabled: boolean;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {
      columnName: 'verified',
      dataType: 'boolean',
      nullable: 'NO',
      default: false,
    },
  })
  verified: boolean;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'secret_data',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  secretData?: string;

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

  constructor(data?: Partial<TwoFactorAuthMethod>) {
    super(data);
  }
}

export interface TwoFactorAuthMethodRelations {
  user?: User;
}

export type TwoFactorAuthMethodWithRelations = TwoFactorAuthMethod & TwoFactorAuthMethodRelations;
