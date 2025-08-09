import {belongsTo, Entity, model, property} from '@loopback/repository';
import {File, User} from '.';

export enum EducationModeStatus {
  Active = 'active',
  Draft = 'draft',
  Archived = 'archived'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'education_mode'},
    foreignKeys: {
      education_mode_creator_user_id_fkeyRel: {
        name: 'education_mode_creator_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'creator_user_id'
      },
      education_mode_image_file_id_fkeyRel: {
        name: 'education_mode_image_file_id_fkeyRel',
        entity: 'File',
        entityKey: 'id',
        foreignKey: 'image_file_id'
      }
    },
    indexes: {
      idx_education_mode_creator_user_id: {
        keys: {creator_user_id: 1}
      },
      idx_education_mode_image_file_id: {
        keys: {image_file_id: 1}
      },
      idx_education_mode_creator_education_mode_status: {
        keys: {creator_user_id: 1, education_mode_status: 1}
      }
    }
  }
})
export class EducationMode extends Entity {
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

  @belongsTo(() => User)
  creator_user_id?: number;

  @belongsTo(() => File)
  image_file_id?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'title_cz', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  title_cz: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'title_en', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  title_en: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'description_cz', dataType: 'text', nullable: 'YES', generated: false},
  })
  description_cz?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'description_en', dataType: 'text', nullable: 'YES', generated: false},
  })
  description_en?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(EducationModeStatus)
    },
    length: 255,
    generated: false,
    default: EducationModeStatus.Draft,
    postgresql: {columnName: 'education_mode_status', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  education_mode_status: EducationModeStatus;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'tool', dataType: 'character varying', dataLength: 255, nullable: 'YES', generated: false},
  })
  tool?: string;

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

  constructor(data?: Partial<EducationMode>) {
    super(data);
  }
}

export interface EducationModeRelations {
  // describe navigational properties here
}

export type EducationModeWithRelations = EducationMode & EducationModeRelations;
