import {Entity, model, property} from '@loopback/repository';
import {Manual, ManualStep, User} from '.';

@model({
  name: 'manual_progress',
  settings: {
    postgresql: {
      table: 'manual_progress',
      indexes: {
        uniqueUserManual: {
          keys: {
            user_id: 1,
            manual_id: 1,
          },
          options: {
            unique: true,
          },
        },
      },
    },
    foreignKeys: {
      fk_manual_progress_currentStepId: {
        name: 'fk_manual_progress_currentStepId',
        entity: 'manual_step',
        entityKey: 'id',
        foreignKey: 'current_step_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
      fk_manual_progress_userId: {
        name: 'fk_manual_progress_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      fk_manual_progress_manualId: {
        name: 'fk_manual_progress_manualId',
        entity: 'manual',
        entityKey: 'id',
        foreignKey: 'manual_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class ManualProgress extends Entity {
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
      columnName: 'user_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  userId: number;

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
      columnName: 'current_step_id',
      dataType: 'bigint',
      nullable: 'YES',
    },
  })
  currentStepId?: number;

  @property({
    type: 'number',
    required: true,
    default: 0,
    postgresql: {
      columnName: 'total_time_seconds',
      dataType: 'integer',
      nullable: 'NO',
      default: 0,
    },
  })
  totalTimeSeconds: number;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'started_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  startedAt: Date;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    updateDefaultFn: 'now',
    postgresql: {
      columnName: 'last_updated_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  lastUpdatedAt: Date;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {
      columnName: 'is_finished',
      dataType: 'boolean',
      nullable: 'NO',
      default: false,
    },
  })
  isFinished: boolean;

  constructor(data?: Partial<ManualProgress>) {
    super(data);
  }
}

export interface ManualProgressRelations {
  user?: User;
  manual?: Manual;
  currentStep?: ManualStep;
}

export type ManualProgressWithRelations = ManualProgress & ManualProgressRelations;
