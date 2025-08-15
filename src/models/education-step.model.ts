import {belongsTo, Entity, model, property} from '@loopback/repository';
import {EducationMode, User} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'education_step'},
    foreignKeys: {
      education_step_education_mode_id_fkeyRel: {
        name: 'education_step_education_mode_id_fkeyRel',
        entity: 'EducationMode',
        entityKey: 'id',
        foreignKey: 'education_mode_id'
      },
      education_step_deleted_by_fkeyRel: {
        name: 'education_step_deleted_by_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'deleted_by'
      }
    },
    indexes: {
      idx_education_step_education_mode_id: {
        keys: {education_mode_id: 1}
      },
      idx_education_step_step_order: {
        keys: {step_order: 1}
      },
      idx_education_step_mode_order: {
        keys: {education_mode_id: 1, step_order: 1}
      },
      idx_education_step_deleted_by: {
        keys: {deleted_by: 1}
      }
    }
  }
})
export class EducationStep extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: true},
  })
  id: number;

  @belongsTo(() => EducationMode)
  education_mode_id: number;

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
    jsonSchema: {nullable: true},
    length: 2048,
    generated: false,
    postgresql: {columnName: 'video_url', dataType: 'character varying', dataLength: 2048, nullable: 'YES', generated: false},
  })
  video_url?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'tool', dataType: 'character varying', dataLength: 255, nullable: 'YES', generated: false},
  })
  tool?: string;

  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'step_order', dataType: 'integer', dataScale: 0, nullable: 'NO', generated: false},
  })
  step_order: number;

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
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'deleted', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  deleted: boolean;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'deleted_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  deleted_at?: string;

  @belongsTo(() => User)
  deleted_by?: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<EducationStep>) {
    super(data);
  }
}

export interface EducationStepRelations {
  // describe navigational properties here
}

export type EducationStepWithRelations = EducationStep & EducationStepRelations;
