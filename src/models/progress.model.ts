import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'progress',
})
export class Progress extends Entity {
  @property({
    type: 'string',
    id: true,
    defaultFn: 'uuidv4',
    postgresql: {
      columnName: 'id',
      dataLength: null,
      dataPrecision: 10,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  id: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'instruction_id',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  instructionId: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'step_id',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  stepId: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'description_id',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  descriptionId: string;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'time',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  time: number;

  @property({
    type: 'string',
  })
  userId: string;

  constructor(data?: Partial<Progress>) {
    super(data);
  }
}

export interface ProgressRelations {
  // describe navigational properties here
}

export type ProgressWithRelations = Progress & ProgressRelations;
