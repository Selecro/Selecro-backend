import {Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum OAuthProvider {
  google = 'google',
  apple = 'apple',
  github = 'github',
  facebook = 'facebook',
  microsoft = 'microsoft',
  linkedin = 'linkedin',
}

@model({
  name: 'oauth_account',
  settings: {
    postgresql: {
      table: 'oauth_account',
      indexes: {
        uniqueUserProvider: {
          keys: {
            user_id: 1,
            provider: 1,
          },
          options: {
            unique: true,
          },
        },
      },
    },
    foreignKeys: {
      fk_oauth_account_userId: {
        name: 'fk_oauth_account_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class OAuthAccount extends Entity {
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
      enum: Object.values(OAuthProvider),
    },
    postgresql: {
      columnName: 'provider',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  provider: OAuthProvider;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'provider_user_id',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'NO',
      unique: true,
    },
  })
  providerUserId: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'access_token',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  accessToken: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'refresh_token',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  refreshToken?: string;

  @property({
    type: 'date',
    required: false,
    postgresql: {
      columnName: 'token_expires_at',
      dataType: 'timestamp with time zone',
      nullable: 'YES',
    },
  })
  tokenExpiresAt?: Date;

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

  constructor(data?: Partial<OAuthAccount>) {
    super(data);
  }
}

export interface OAuthAccountRelations {
  user?: User;
}

export type OAuthAccountWithRelations = OAuthAccount & OAuthAccountRelations;
