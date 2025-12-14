import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {idInjection: false, postgresql: {schema: 'public', table: 'user_2fa_method'}}
})
export class User2FaMethod extends Entity {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    scale: 0,
    generated: false,
    id: 1,
    postgresql: {columnName: 'id', dataType: 'bigint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO', generated: false},
  })
  id: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'user_id', dataType: 'bigint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  userId?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 20,
    generated: false,
    postgresql: {columnName: 'method', dataType: 'character varying', dataLength: 20, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  method: string;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'is_enabled', dataType: 'boolean', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  isEnabled: boolean;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'is_primary', dataType: 'boolean', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  isPrimary: boolean;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'secret', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  secret?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 20,
    generated: false,
    postgresql: {columnName: 'phone_number', dataType: 'character varying', dataLength: 20, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  phoneNumber?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'email', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  email?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'last_verified_at', dataType: 'timestamp with time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  lastVerifiedAt?: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'created_at', dataType: 'timestamp with time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  createdAt: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'updated_at', dataType: 'timestamp with time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  updatedAt: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<User2FaMethod>) {
    super(data);
  }
}

export interface User2FaMethodRelations {
  // describe navigational properties here
}

export type User2FaMethodWithRelations = User2FaMethod & User2FaMethodRelations;
