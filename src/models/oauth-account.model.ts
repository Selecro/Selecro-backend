import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum OauthProvider {
  Google = 'google',
  Apple = 'apple',
  Github = 'github',
  Facebook = 'facebook',
  Microsoft = 'microsoft',
  Linkedin = 'linkedin'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'oauth_account'},
    foreignKeys: {
      oauth_account_user_id_fkeyRel: {
        name: 'oauth_account_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_oauth_account_user_id: {
        keys: {user_id: 1}
      },
      uq_oauth_account_provider_provider_user_id: {
        keys: {oauth_provider: 1, provider_user_id: 1},
        options: {unique: true}
      },
      idx_oauth_account_oauth_provider: {
        keys: {oauth_provider: 1}
      },
      idx_oauth_account_created_at: {
        keys: {created_at: -1}
      }
    }
  }
})
export class OauthAccount extends Entity {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    scale: 0,
    generated: false,
    id: 1,
    postgresql: {columnName: 'id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: false},
  })
  id: number;

  @belongsTo(() => User)
  user_id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(OauthProvider)
    },
    length: 255,
    generated: false,
    postgresql: {columnName: 'oauth_provider', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  oauth_provider: OauthProvider;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'provider_user_id', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  provider_user_id: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'access_token', dataType: 'text', nullable: 'NO', generated: false},
  })
  access_token: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'refresh_token', dataType: 'text', nullable: 'YES', generated: false},
  })
  refresh_token?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'token_expires_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  token_expires_at?: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  created_at: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  updated_at: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<OauthAccount>) {
    super(data);
  }
}

export interface OauthAccountRelations {
  // describe navigational properties here
}

export type OauthAccountWithRelations = OauthAccount & OauthAccountRelations;
