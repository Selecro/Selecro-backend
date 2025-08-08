import {belongsTo, Entity, model, property} from '@loopback/repository';
import {File, Manual} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'manual_step'},
    foreignKeys: {
      manual_step_image_file_id_fkeyRel: {
        name: 'manual_step_image_file_id_fkeyRel',
        entity: 'File',
        entityKey: 'id',
        foreignKey: 'image_file_id'
      },
      manual_step_manual_id_fkeyRel: {
        name: 'manual_step_manual_id_fkeyRel',
        entity: 'Manual',
        entityKey: 'id',
        foreignKey: 'manual_id'
      }
    },
    indexes: {
      idx_manual_step_manual_id: {
        keys: {manual_id: 1}
      },
      idx_manual_step_image_file_id: {
        keys: {image_file_id: 1}
      },
      uq_manual_step_manual_step_order: {
        keys: {manual_id: 1, step_order: 1},
        options: {unique: true}
      }
    }
  }
})
export class ManualStep extends Entity {
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

  @belongsTo(() => Manual)
  manual_id: number;

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
    postgresql: {columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  created_at: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  updated_at: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<ManualStep>) {
    super(data);
  }
}

export interface ManualStepRelations {
  // describe navigational properties here
}

export type ManualStepWithRelations = ManualStep & ManualStepRelations;
