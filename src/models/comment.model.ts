import {belongsTo, Entity, model, property} from '@loopback/repository';
import {EducationMode, Manual, User} from '.';

export enum CommentOnType {
  Manual = 'manual',
  EducationMode = 'education_mode'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'comment'},
    foreignKeys: {
      comment_education_mode_id_fkeyRel: {
        name: 'comment_education_mode_id_fkeyRel',
        entity: 'EducationMode',
        entityKey: 'id',
        foreignKey: 'education_mode_id'
      },
      comment_manual_id_fkeyRel: {
        name: 'comment_manual_id_fkeyRel',
        entity: 'Manual',
        entityKey: 'id',
        foreignKey: 'manual_id'
      },
      comment_parent_comment_id_fkeyRel: {
        name: 'comment_parent_comment_id_fkeyRel',
        entity: 'Comment',
        entityKey: 'id',
        foreignKey: 'parent_comment_id'
      },
      comment_user_id_fkeyRel: {
        name: 'comment_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_comment_user_id: {
        keys: {user_id: 1}
      },
      idx_comment_manual_id: {
        keys: {manual_id: 1}
      },
      idx_comment_parent_comment_id: {
        keys: {parent_comment_id: 1}
      },
      idx_comment_education_mode_id: {
        keys: {education_mode_id: 1}
      },
      idx_comment_commented_at: {
        keys: {commented_at: 1}
      }
    }
  }
})
export class Comment extends Entity {
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

  @belongsTo(() => Comment)
  parent_comment_id?: number;

  @belongsTo(() => User)
  user_id: number;

  @belongsTo(() => Manual)
  manual_id?: number;

  @belongsTo(() => EducationMode)
  education_mode_id?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'comment_text', dataType: 'text', nullable: 'NO', generated: false},
  })
  comment_text: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(CommentOnType)
    },
    length: 255,
    generated: false,
    postgresql: {columnName: 'comment_on_type', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  comment_on_type: CommentOnType;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'rating', dataType: 'integer', dataScale: 0, nullable: 'YES', generated: false},
  })
  rating?: number;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'commented_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  commented_at: string;

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
