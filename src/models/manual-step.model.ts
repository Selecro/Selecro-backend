import {Entity, model, property} from '@loopback/repository';
import {File, Manual} from '.';

@model({
  name: 'manual_step',
  settings: {
    postgresql: {
      table: 'manual_step',
      indexes: {
        uniqueManualStepOrder: {
          keys: {
            manual_id: 1,
            step_order: 1,
          },
          options: {
            unique: true,
          },
        },
      },
    },
    foreignKeys: {
      fk_manual_step_manualId: {
        name: 'fk_manual_step_manualId',
        entity: 'manual',
        entityKey: 'id',
        foreignKey: 'manual_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      fk_manual_step_imageFileId: {
        name: 'fk_manual_step_imageFileId',
        entity: 'file',
        entityKey: 'id',
        foreignKey: 'image_file_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class ManualStep extends Entity {
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
      columnName: 'manual_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  manualId: number;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'image_file_id',
      dataType: 'bigint',
      nullable: 'YES',
    },
  })
  imageFileId?: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'title_cz',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'NO',
    },
  })
  titleCz: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'title_en',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'NO',
    },
  })
  titleEn: string;

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

  constructor(data?: Partial<ManualStep>) {
    super(data);
  }
}

export interface ManualStepRelations {
  manual?: Manual;
  imageFile?: File;
}

export type ManualStepWithRelations = ManualStep & ManualStepRelations;
