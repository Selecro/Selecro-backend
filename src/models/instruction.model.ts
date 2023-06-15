import {Entity, model, property} from '@loopback/repository';

enum Difficulty {
  easy = 'easy',
  medium = 'medium',
  hard = 'hard',
}

@model({
  name: 'instructions',
})
export class Instruction extends Entity {
  @property({
    id: true,
    generated: true,
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
      columnName: 'name',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  name: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'type',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  type: Difficulty;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'link',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  link: string;

  @property({
    type: 'boolean',
    required: true,
    postgresql: {
      columnName: 'private',
      dataType: 'boolean',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
      default: false,
    },
  })
  private: boolean;

  @property({
    type: 'date',
    required: true,
    postgresql: {
      columnName: 'date',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
    },
    default: () => new Date(),
    valueGenerator: () => 'NOW()',
  })
  date: Date;

  constructor(data?: Partial<Instruction>) {
    super(data);
  }
}

export interface InstructionRelations {
  // describe navigational properties here
}

export type InstructionWithRelations = Instruction & InstructionRelations;
