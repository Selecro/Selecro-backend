import {Entity, model, property} from '@loopback/repository';
import {EducationMode} from '.';

@model({
  name: 'education_step',
  settings: {
    postgresql: {
      table: 'education_step',
      indexes: {
        uniqueEducationModeStepOrder: {
          keys: {
            education_mode_id: 1,
            step_order: 1,
          },
          options: {
            unique: true,
          },
        },
      },
    },
    foreignKeys: {
      fk_education_step_educationModeId: {
        name: 'fk_education_step_educationModeId',
        entity: 'education_mode',
        entityKey: 'id',
        foreignKey: 'education_mode_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class EducationStep extends Entity {
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
    required: true,
    postgresql: {
      columnName: 'education_mode_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  educationModeId: number;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'description_cz',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  descriptionCz?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'description_en',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  descriptionEn?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'video_url',
      dataType: 'varchar',
      dataLength: 2048,
      nullable: 'YES',
    },
  })
  videoUrl?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'tool',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'YES',
    },
  })
  tool?: string;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'step_order',
      dataType: 'integer',
      nullable: 'NO',
    },
  })
  stepOrder: number;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'created_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  createdAt: Date;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    updateDefaultFn: 'now',
    postgresql: {
      columnName: 'updated_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  updatedAt: Date;

  constructor(data?: Partial<EducationStep>) {
    super(data);
  }
}

export interface EducationStepRelations {
  educationMode?: EducationMode;
}

export type EducationStepWithRelations = EducationStep & EducationStepRelations;
