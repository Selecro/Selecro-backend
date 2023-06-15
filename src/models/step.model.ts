import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'steps',
})
export class Step extends Entity {
  @property({
    id: true,
    generaetd: true,
    required: true,
    postgresql: {
      columnName: 'id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'title',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  title: string;

  @property.array({
    type: 'array',
    itemType: 'string',
    required: true,
    postgresql: {
      columnName: 'description',
      dataType: 'text[]',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  description: string[];

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'link',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  link?: string | null;

  constructor(data?: Partial<Step>) {
    super(data);
  }
}

export interface StepRelations {
  // describe navigational properties here
}

export type StepWithRelations = Step & StepRelations;
