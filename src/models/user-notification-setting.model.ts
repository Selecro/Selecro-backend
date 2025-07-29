import {Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({
  name: 'user_notification_setting',
  settings: {
    postgresql: {
      table: 'user_notification_setting',
    },
    foreignKeys: {
      fk_user_notification_setting_userId: {
        name: 'fk_user_notification_setting_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class UserNotificationSetting extends Entity {
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
    default: true,
    postgresql: {
      columnName: 'receive_news',
      dataType: 'boolean',
      nullable: 'NO',
      default: true,
    },
  })
  receiveNews: boolean;

  @property({
    type: 'boolean',
    required: true,
    default: true,
    postgresql: {
      columnName: 'receive_private_messages',
      dataType: 'boolean',
      nullable: 'NO',
      default: true,
    },
  })
  receivePrivateMessages: boolean;

  @property({
    type: 'date',
    required: false,
    postgresql: {
      columnName: 'marketing_consent_given_at',
      dataType: 'timestamp with time zone',
      nullable: 'YES',
    },
  })
  marketingConsentGivenAt?: Date;

  constructor(data?: Partial<UserNotificationSetting>) {
    super(data);
  }
}

export interface UserNotificationSettingRelations {
  user?: User;
}

export type UserNotificationSettingWithRelations = UserNotificationSetting & UserNotificationSettingRelations;
