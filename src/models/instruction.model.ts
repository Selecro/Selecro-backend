import {Entity, hasMany, model, property} from '@loopback/repository';
import {Step} from './step.model';

export enum Difficulty {
  easy = 'easy',
  medium = 'medium',
  hard = 'hard',
}

@model({
  name: 'instructions',
  settings: {
    foreignKeys: {
      fk_instuction_userId: {
        name: 'fk_instruction_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'userId',
        onDelete: 'CASCADE',
        onUpdate: 'SET NULL'
      },
    },
  }
})
export class Instruction extends Entity {
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
    type: 'boolean',
    required: true,
    postgresql: {
      columnName: 'premium',
      dataType: 'boolean',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
      default: false,
    },
  })
  premium: boolean;

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

  @property.array(String, {
    required: false,
    postgresql: {
      columnName: 'premium_user_ids',
      array: true,
    },
    default: () => [],
  })
  premiumUserIds?: string[];

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'userId',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  userId: string;

  @hasMany(() => Step, {keyTo: 'instructionId'})
  steps?: Step[];

  constructor(data?: Partial<Instruction>) {
    super(data);
  }
}

export interface InstructionRelations {
  // describe navigational properties here
}

export type InstructionWithRelations = Instruction & InstructionRelations;
