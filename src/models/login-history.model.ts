import {Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum LoginStatus {
  success = 'success',
  failure = 'failure',
  pending_2fa = 'pending_2fa',
}

@model({
  name: 'login_history',
  settings: {
    postgresql: {
      table: 'login_history',
    },
    foreignKeys: {
      fk_login_history_userId: {
        name: 'fk_login_history_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class LoginHistory extends Entity {
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
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'login_time',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  loginTime: Date;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(LoginStatus),
    },
    postgresql: {
      columnName: 'status',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  status: LoginStatus;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'failure_reason',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'YES',
    },
  })
  failureReason?: string;

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

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'user_agent',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  userAgent?: string;

  constructor(data?: Partial<LoginHistory>) {
    super(data);
  }
}

export interface LoginHistoryRelations {
  user?: User;
}

export type LoginHistoryWithRelations = LoginHistory & LoginHistoryRelations;
