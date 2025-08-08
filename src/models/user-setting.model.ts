import {Entity, model, property} from '@loopback/repository';

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
      }
    },
    indexes: {
      idx_user_setting_user_id: {
        keys: {user_id: 1},
        options: {unique: true}
      },
      idx_user_setting_language_preference: {
        keys: {language_preference: 1}
      },
      idx_user_setting_profile_picture_file_id: {
        keys: {profile_picture_file_id: 1}
      }
    }
  }
})
export class UserSetting extends Entity {
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
    postgresql: {columnName: 'dark_mode', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  dark_mode: boolean;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'language_preference', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  language_preference: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'user_display_status', dataType: 'character varying', dataLength: 255, nullable: 'YES', generated: false},
  })
  user_display_status?: string;

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
