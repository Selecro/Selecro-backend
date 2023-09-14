import {Entity, hasMany, model, property} from '@loopback/repository';
import {UserLink} from '.';
import {Instruction} from './instruction.model';
import {Progress} from './progress.model';

export enum Language {
  CZ = 'CZ',
  EN = 'EN',
}

@model({
  name: 'users',
})
export class User extends Entity {
  @property({
    id: true,
    generated: true,
    postgresql: {
      columnName: 'id',
      dataLength: null,
      dataPrecision: 10,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'email',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  email: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'username',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'password_hash',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  passwordHash: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'wrapped_dek',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  wrappedDEK: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'initialization_vector',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  initializationVector: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'kek_salt',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  kekSalt: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'language',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  language: Language;

  @property({
    type: 'boolean',
    required: true,
    postgresql: {
      columnName: 'darkmode',
      dataType: 'boolean',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
      default: false,
    },
    default: false,
  })
  darkmode: boolean;

  @property({
    type: 'boolean',
    required: true,
    postgresql: {
      columnName: 'email_verified',
      dataType: 'boolean',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
      default: false,
    },
    default: false,
  })
  emailVerified: boolean;

  @property({
    type: 'date',
    required: true,
    postgresql: {
      columnName: 'date',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
    },
    default: () => new Date(),
    valueGenerator: () => 'NOW()',
  })
  date: Date;

  @property({
    type: 'any',
    required: false,
    postgresql: {
      columnName: 'nick',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  nick?: string | null;

  @property({
    type: 'any',
    required: false,
    postgresql: {
      columnName: 'bio',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  bio?: string | null;

  @property({
    type: 'any',
    required: false,
    postgresql: {
      columnName: 'link',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  link?: string | null;

  @property({
    type: 'any',
    required: false,
    postgresql: {
      columnName: 'delete_hash',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  deleteHash?: string | null;

  @property.array(Number, {
    required: false,
    postgresql: {
      columnName: 'favorites',
      array: true,
    },
    default: () => [],
  })
  favorites?: number[];

  @hasMany(() => User, {
    through: {
      model: () => UserLink,
      keyFrom: 'followerId',
      keyTo: 'followeeId',
    },
  })
  users: User[];

  @hasMany(() => Instruction, {keyTo: 'userId'})
  instructions: Instruction[];

  @hasMany(() => Progress, {keyTo: 'userId'})
  progresses: Progress[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
