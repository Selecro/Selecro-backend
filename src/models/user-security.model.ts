import {Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({
  name: 'user_security',
  settings: {
    postgresql: {
      table: 'user_security',
    },
    foreignKeys: {
      fk_user_security_userId: {
        name: 'fk_user_security_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class UserSecurity extends Entity {
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
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {
      columnName: 'two_factor_enabled',
      dataType: 'boolean',
      nullable: 'NO',
      default: false,
    },
  })
  twoFactorEnabled: boolean;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'recovery_email',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'YES',
    },
  })
  recoveryEmail?: string;

  @property({
    type: 'number',
    required: true,
    default: 0,
    postgresql: {
      columnName: 'failed_login_attempts',
      dataType: 'integer',
      nullable: 'NO',
      default: 0,
    },
  })
  failedLoginAttempts: number;

  @property({
    type: 'date',
    required: false,
    postgresql: {
      columnName: 'password_last_changed_at',
      dataType: 'timestamp with time zone',
      nullable: 'YES',
    },
  })
  passwordLastChangedAt?: Date;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'last_login_ip',
      dataType: 'varchar',
      dataLength: 45,
      nullable: 'YES',
    },
  })
  lastLoginIp?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'password_hash',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'YES',
    },
  })
  passwordHash?: string;

  constructor(data?: Partial<UserSecurity>) {
    super(data);
  }
}

export interface UserSecurityRelations {
  user?: User;
}

export type UserSecurityWithRelations = UserSecurity & UserSecurityRelations;
