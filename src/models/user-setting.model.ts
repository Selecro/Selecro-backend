import {Entity, model, property} from '@loopback/repository';

export enum LanguagePreference {
  en = 'en',
  cz = 'cz',
}

export enum UserDisplayStatus {
  online = 'online',
  away = 'away',
  do_not_disturb = 'do_not_disturb',
  invisible = 'invisible',
}

@model({
  name: 'user_setting',
  settings: {
    postgresql: {
      table: 'user_setting',
    },
    foreignKeys: {
      fk_user_setting_userId: {
        name: 'fk_user_setting_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
      fk_user_setting_profilePictureFileId: {
        name: 'fk_user_setting_profilePictureFileId',
        entity: 'file',
        entityKey: 'id',
        foreignKey: 'profile_picture_file_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class UserSetting extends Entity {
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
    required: false,
    postgresql: {
      columnName: 'bio',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  bio?: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {
      columnName: 'dark_mode',
      dataType: 'boolean',
      nullable: 'NO',
      default: false,
    },
  })
  darkMode: boolean;

  @property({
    type: 'string',
    required: true,
    default: LanguagePreference.cz,
    jsonSchema: {
      enum: Object.values(LanguagePreference),
    },
    postgresql: {
      columnName: 'language_preference',
      dataType: 'text',
      nullable: 'NO',
      default: 'cz',
    },
  })
  languagePreference: LanguagePreference;

  @property({
    type: 'string',
    required: false,
    jsonSchema: {
      enum: Object.values(UserDisplayStatus),
    },
    postgresql: {
      columnName: 'user_display_status',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  userDisplayStatus?: UserDisplayStatus;

  @property({
    type: 'date',
    required: false,
    postgresql: {
      columnName: 'terms_privacy_agreement_accepted_at',
      dataType: 'timestamp with time zone',
      nullable: 'YES',
    },
  })
  termsPrivacyAgreementAcceptedAt?: Date;

  @property({
    type: 'date',
    required: false,
    postgresql: {
      columnName: 'gdpr_consent_given_at',
      dataType: 'timestamp with time zone',
      nullable: 'YES',
    },
  })
  gdprConsentGivenAt?: Date;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'profile_picture_file_id',
      dataType: 'bigint',
      nullable: 'YES',
    },
  })
  profilePictureFileId?: number;

  constructor(data?: Partial<UserSetting>) {
    super(data);
  }
}

export interface UserSettingRelations {
}

export type UserSettingWithRelations = UserSetting & UserSettingRelations;
