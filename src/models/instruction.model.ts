import {Entity, hasMany, model, property} from '@loopback/repository';
import {Step} from './step.model';

export enum Difficulty {
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

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'difficulty',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  difficulty: Difficulty;

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
    type: 'any',
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

  @property({
    type: 'number',
  })
  userId: number;

  @hasMany(() => Step, {keyTo: 'instructionId'})
  steps: Step[];

  constructor(data?: Partial<Instruction>) {
    super(data);
  }
}

export interface InstructionRelations {
  // describe navigational properties here
}

export type InstructionWithRelations = Instruction & InstructionRelations;
