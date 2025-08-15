import {Entity, model, property} from '@loopback/repository';

export enum AccountStatus {
  Active = 'active',
  Suspended = 'suspended',
  Deleted = 'deleted',
  PendingVerification = 'pending_verification'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'user'},
    indexes: {
      idx_user_uuid: {
        keys: {uuid: 1},
        options: {unique: true}
      },
      idx_user_username: {
        keys: {username: 1},
        options: {unique: true}
      },
      idx_user_email: {
        keys: {email: 1},
        options: {unique: true}
      }
    }
  }
})
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: true},
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 36,
    generated: false,
    index: {unique: true},
    postgresql: {columnName: 'uuid', dataType: 'character varying', dataLength: 36, nullable: 'NO', generated: false},
  })
  uuid: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    postgresql: {columnName: 'first_name', dataType: 'character varying', dataLength: 100, nullable: 'YES', generated: false},
  })
  first_name?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    postgresql: {columnName: 'last_name', dataType: 'character varying', dataLength: 100, nullable: 'YES', generated: false},
  })
  last_name?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 50,
    generated: false,
    index: {unique: true},
    postgresql: {columnName: 'username', dataType: 'character varying', dataLength: 50, nullable: 'NO', generated: false},
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    index: {unique: true},
    postgresql: {columnName: 'email', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  email: string;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'email_verified', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  email_verified: boolean;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'date_of_birth', dataType: 'date', nullable: 'YES', generated: false},
  })
  date_of_birth?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(AccountStatus)
    },
    length: 255,
    generated: false,
    default: AccountStatus.PendingVerification,
    postgresql: {columnName: 'account_status', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  account_status: AccountStatus;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'last_login_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  last_login_at?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'last_active_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  last_active_at?: string;

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

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 20,
    generated: false,
    postgresql: {columnName: 'phone_number', dataType: 'character varying', dataLength: 20, nullable: 'YES', generated: false},
  })
  phone_number?: string;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'is_oauth_user', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  is_oauth_user: boolean;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
