import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'steps',
})
export class Step extends Entity {
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
      columnName: 'title_cz',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  titleCz: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'title_en',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  titleEn: string;

  @property.array(String, {
    required: true,
    postgresql: {
      columnName: 'description_cz',
      array: true,
    },
    default: () => [],
  })
  descriptionCz: string[];

  @property.array(String, {
    required: true,
    postgresql: {
      columnName: 'description_en',
      array: true,
    },
    default: () => [],
  })
  descriptionEn: string[];

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

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'delete_hash',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  deleteHash?: string | null;

  @property({
    type: 'string',
  })
  instructionId: string;

  constructor(data?: Partial<Step>) {
    super(data);
  }
}

export interface StepRelations {
  // describe navigational properties here
}

export type StepWithRelations = Step & StepRelations;
