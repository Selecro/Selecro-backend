import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'user_notification_setting'},
    foreignKeys: {
      user_notification_setting_user_id_fkeyRel: {
        name: 'user_notification_setting_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_user_notification_setting_user_id: {
        keys: {user_id: 1},
        options: {unique: true}
      }
    }
  }
})
export class UserNotificationSetting extends Entity {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    scale: 0,
    generated: false,
    id: 1,
    postgresql: {columnName: 'user_id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: false},
  })
  user_id: number;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: true,
    postgresql: {columnName: 'receive_news', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  receive_news: boolean;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: true,
    postgresql: {columnName: 'receive_private_messages', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  receive_private_messages: boolean;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'marketing_consent_given_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  marketing_consent_given_at?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserNotificationSetting>) {
    super(data);
  }
}

export interface UserNotificationSettingRelations {
  // describe navigational properties here
}

export type UserNotificationSettingWithRelations = UserNotificationSetting & UserNotificationSettingRelations;
