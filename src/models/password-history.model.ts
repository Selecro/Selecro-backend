import {Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({
  name: 'password_history',
  settings: {
    postgresql: {
      table: 'password_history',
    },
    foreignKeys: {
      fk_password_history_userId: {
        name: 'fk_password_history_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class PasswordHistory extends Entity {
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
      columnName: 'password_hash',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'NO',
    },
  })
  passwordHash: string;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'changed_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  changedAt: Date;

  constructor(data?: Partial<PasswordHistory>) {
    super(data);
  }
}

export interface PasswordHistoryRelations {
  user?: User;
}

export type PasswordHistoryWithRelations = PasswordHistory & PasswordHistoryRelations;
