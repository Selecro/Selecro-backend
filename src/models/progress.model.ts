import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'progress',
})
export class Progress extends Entity {
  @property({
    id: true,
    generated: true,
    postgresql: {
      columnName: 'id',
      dataLength: null,
      dataPrecision: 10,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  id: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'instruction_id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  instructionId: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'step_id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  stepId: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'description_id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  descriptionId: number;

  @property({
    type: 'number',
  })
  userId: number;

  constructor(data?: Partial<Progress>) {
    super(data);
  }
}

export interface ProgressRelations {
  // describe navigational properties here
}

export type ProgressWithRelations = Progress & ProgressRelations;
