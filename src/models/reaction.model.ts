import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {idInjection: false, postgresql: {schema: 'public', table: 'reaction'}}
})
export class Reaction extends Entity {
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
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'comment_id', dataType: 'bigint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  commentId?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 20,
    generated: false,
    postgresql: {columnName: 'reaction_type', dataType: 'character varying', dataLength: 20, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  reactionType: string;

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
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'deleted_at', dataType: 'timestamp with time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  deletedAt?: string;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'deleted_by_user_id', dataType: 'bigint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  deletedByUserId?: number;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'is_deleted', dataType: 'boolean', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  isDeleted: boolean;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Reaction>) {
    super(data);
  }
}

export interface ReactionRelations {
  // describe navigational properties here
}

export type ReactionWithRelations = Reaction & ReactionRelations;
