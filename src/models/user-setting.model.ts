import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Session} from '.';

export enum UserLanguagePreference {
  EN = 'en',
  CZ = 'cz'
}

export enum UserDisplayStatus {
  Online = 'online',
  Away = 'away',
  DoNotDisturb = 'do_not_disturb',
  Invisible = 'invisible',
  NotSet = 'not_set'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'user_setting'},
    foreignKeys: {
      user_setting_user_id_fkeyRel: {
        name: 'user_setting_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      },
      user_setting_profile_picture_file_id_fkeyRel: {
        name: 'user_setting_profile_picture_file_id_fkeyRel',
        entity: 'File',
        entityKey: 'id',
        foreignKey: 'profile_picture_file_id'
      },
      user_settings_session_id_fkeyRel: {
        name: 'user_settings_session_id_fkeyRel',
        entity: 'Session',
        entityKey: 'id',
        foreignKey: 'session_id'
      }
    },
    indexes: {
      idx_user_setting_user_id: {
        keys: {user_id: 1},
        options: {unique: true}
      },
      idx_user_setting_user_language_preference: {
        keys: {user_language_preference: 1}
      },
      idx_user_setting_profile_picture_file_id: {
        keys: {profile_picture_file_id: 1}
      },
      idx_user_setting_session_id: {
        keys: {session_id: 1}
      }
    }
  }
})
export class UserSetting extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
    postgresql: {columnName: 'user_id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: false},
  })
  user_id: number;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'bio', dataType: 'text', nullable: 'YES', generated: false},
  })
  bio?: string;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'dark_mode', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  dark_mode: boolean;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(UserLanguagePreference)
    },
    length: 255,
    generated: false,
    default: UserLanguagePreference.CZ,
    postgresql: {columnName: 'user_language_preference', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  user_language_preference: UserLanguagePreference;

  @property({
    type: 'string',
    jsonSchema: {
      nullable: false,
      enum: Object.values(UserDisplayStatus)
    },
    length: 255,
    generated: false,
    default: UserDisplayStatus.NotSet,
    postgresql: {columnName: 'user_display_status', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  user_display_status: UserDisplayStatus;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'terms_privacy_agreement_accepted_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  terms_privacy_agreement_accepted_at?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'gdpr_consent_given_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  gdpr_consent_given_at?: string;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'profile_picture_file_id', dataType: 'bigint', dataScale: 0, nullable: 'YES', generated: false},
  })
  profile_picture_file_id?: number;

  @belongsTo(() => Session)
  session_id?: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserSetting>) {
    super(data);
  }
}

export interface UserSettingRelations {
  // describe navigational properties here
}

export type UserSettingWithRelations = UserSetting & UserSettingRelations;
