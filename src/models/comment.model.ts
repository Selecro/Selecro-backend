import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {idInjection: false, postgresql: {schema: 'public', table: 'comment'}}
})
export class Comment extends Entity {
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
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'comment_uuid', dataType: 'uuid', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  commentUuid: string;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'thread_id', dataType: 'bigint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  threadId?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'support_ticket_id', dataType: 'bigint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  supportTicketId?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'manual_id', dataType: 'bigint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  manualId?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'education_mode_id', dataType: 'bigint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  educationModeId?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'product_id', dataType: 'bigint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  productId?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'parent_comment_id', dataType: 'bigint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  parentCommentId?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'author_user_id', dataType: 'bigint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  authorUserId?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'body', dataType: 'text', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  body: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 20,
    generated: false,
    postgresql: {columnName: 'status', dataType: 'character varying', dataLength: 20, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  status: string;

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

  constructor(data?: Partial<Comment>) {
    super(data);
  }
}

export interface CommentRelations {
  // describe navigational properties here
}

export type CommentWithRelations = Comment & CommentRelations;
