import {Entity, model, property} from '@loopback/repository';
import {EducationMode, Manual, User} from '.';

export enum CommentOnType {
  manual = 'manual',
  education_mode = 'education_mode',
}

@model({
  name: 'comment',
  settings: {
    postgresql: {
      table: 'comment',
    },
    foreignKeys: {
      fk_comment_manualId: {
        name: 'fk_comment_manualId',
        entity: 'manual',
        entityKey: 'id',
        foreignKey: 'manual_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      fk_comment_educationModeId: {
        name: 'fk_comment_educationModeId',
        entity: 'education_mode',
        entityKey: 'id',
        foreignKey: 'education_mode_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      fk_comment_userId: {
        name: 'fk_comment_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      fk_comment_parentCommentId: {
        name: 'fk_comment_parentCommentId',
        entity: 'comment',
        entityKey: 'id',
        foreignKey: 'parent_comment_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class Comment extends Entity {
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
    required: false,
    postgresql: {
      columnName: 'parent_comment_id',
      dataType: 'bigint',
      nullable: 'YES',
    },
  })
  parentCommentId?: number;

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
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'manual_id',
      dataType: 'bigint',
      nullable: 'YES',
    },
  })
  manualId?: number;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'education_mode_id',
      dataType: 'bigint',
      nullable: 'YES',
    },
  })
  educationModeId?: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'comment_text',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  commentText: string;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'commented_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  commentedAt: Date;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(CommentOnType),
    },
    postgresql: {
      columnName: 'comment_on_type',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  commentOnType: CommentOnType;

  @property({
    type: 'number',
    required: false,
    jsonSchema: {
      minimum: 1,
      maximum: 5,
    },
    postgresql: {
      columnName: 'rating',
      dataType: 'integer',
      nullable: 'YES',
    },
  })
  rating?: number;

  constructor(data?: Partial<Comment>) {
    super(data);
  }
}

export interface CommentRelations {
  user?: User;
  manual?: Manual;
  educationMode?: EducationMode;
  parentComment?: Comment;
}

export type CommentWithRelations = Comment & CommentRelations;
