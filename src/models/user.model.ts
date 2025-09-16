import {Entity, model, property} from '@loopback/repository';

export enum AccountStatus {
  Active = 'active',
  Suspended = 'suspended',
  Deleted = 'deleted',
  PendingVerification = 'pending_verification'
}

@model({
  name: 'user',
  settings: {
    description: 'User',
    forceId: true,
    strict: true,
    hiddenProperties: [],//
    indexes: {},//
    scope: {},
    base: 'Entity',
    idInjection: true,
    plural: 'users',
    strictObjectIDCoercion: false,
    foreignKeys: {},//
    hidden: [],//
    visible: [],//
    relations: {},
    mixins: {},
    postgresql: {
      schema: 'public',
      table: 'user',
    },
  },
})
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'bigint', nullable: 'NO', generated: true},
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    length: 36,
    postgresql: {columnName: 'uuid', dataType: 'character varying', dataLength: 36, nullable: 'NO'},
    index: {unique: true},
  })
  uuid: string;

  @property({
    type: 'string',
    length: 100,
    postgresql: {columnName: 'first_name', dataType: 'character varying', dataLength: 100, nullable: 'YES'},
  })
  first_name?: string;

  @property({
    type: 'string',
    length: 100,
    postgresql: {columnName: 'last_name', dataType: 'character varying', dataLength: 100, nullable: 'YES'},
  })
  last_name?: string;

  @property({
    type: 'string',
    required: true,
    length: 50,
    postgresql: {columnName: 'username', dataType: 'character varying', dataLength: 50, nullable: 'NO'},
    index: {unique: true},
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    length: 255,
    postgresql: {columnName: 'email', dataType: 'character varying', dataLength: 255, nullable: 'NO'},
    index: {unique: true},
  })
  email: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {columnName: 'email_verified', dataType: 'boolean', nullable: 'NO'},
  })
  email_verified: boolean;

  @property({
    type: 'date',
    postgresql: {columnName: 'date_of_birth', dataType: 'date', nullable: 'YES'},
  })
  date_of_birth?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {enum: Object.values(AccountStatus)},
    default: AccountStatus.PendingVerification,
    postgresql: {columnName: 'account_status', dataType: 'character varying', dataLength: 255, nullable: 'NO'},
  })
  account_status: AccountStatus;

  @property({
    type: 'date',
    postgresql: {columnName: 'last_login_at', dataType: 'timestamp without time zone', nullable: 'YES'},
  })
  last_login_at?: string;

  @property({
    type: 'date',
    postgresql: {columnName: 'last_active_at', dataType: 'timestamp without time zone', nullable: 'YES'},
  })
  last_active_at?: string;

  @property({
    type: 'date',
    required: true,
    default: new Date(),
    postgresql: {columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO'},
  })
  created_at: string;

  @property({
    type: 'date',
    required: true,
    default: new Date(),
    postgresql: {columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO'},
  })
  updated_at: string;

  @property({
    type: 'string',
    length: 20,
    postgresql: {columnName: 'phone_number', dataType: 'character varying', dataLength: 20, nullable: 'YES'},
  })
  phone_number?: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {columnName: 'is_oauth_user', dataType: 'boolean', nullable: 'NO'},
  })
  is_oauth_user: boolean;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations { }

export type UserWithRelations = User & UserRelations;
