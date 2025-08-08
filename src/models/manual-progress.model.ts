import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Manual, ManualStep, User} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'manual_progress'},
    foreignKeys: {
      manual_progress_current_step_id_fkeyRel: {
        name: 'manual_progress_current_step_id_fkeyRel',
        entity: 'ManualStep',
        entityKey: 'id',
        foreignKey: 'current_step_id'
      },
      manual_progress_manual_id_fkeyRel: {
        name: 'manual_progress_manual_id_fkeyRel',
        entity: 'Manual',
        entityKey: 'id',
        foreignKey: 'manual_id'
      },
      manual_progress_user_id_fkeyRel: {
        name: 'manual_progress_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_manual_progress_user_id: {
        keys: {user_id: 1}
      },
      idx_manual_progress_manual_id: {
        keys: {manual_id: 1}
      },
      idx_manual_progress_current_step_id: {
        keys: {current_step_id: 1}
      },
      uq_manual_progress_user_manual: {
        keys: {user_id: 1, manual_id: 1},
        options: {unique: true}
      }
    }
  }
})
export class ManualProgress extends Entity {
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

  @belongsTo(() => User)
  user_id: number;

  @belongsTo(() => Manual)
  manual_id: number;

  @belongsTo(() => ManualStep)
  current_step_id?: number;

  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'total_time_seconds', dataType: 'integer', dataScale: 0, nullable: 'NO', generated: false},
  })
  total_time_seconds: number;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'started_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  started_at: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'last_updated_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  last_updated_at: string;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'is_finished', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  is_finished: boolean;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<ManualProgress>) {
    super(data);
  }
}

export interface ManualProgressRelations {
  // describe navigational properties here
}

export type ManualProgressWithRelations = ManualProgress & ManualProgressRelations;
