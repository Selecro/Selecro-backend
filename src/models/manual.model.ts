import {belongsTo, Entity, model, property} from '@loopback/repository';
import {File, User} from '.';

export enum ManualDifficulty {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced'
}

export enum ManualType {
  Assembly = 'assembly',
  Repair = 'repair',
  HowTo = 'how_to',
  Guide = 'guide',
  Other = 'other'
}

export enum ManualStatus {
  Public = 'public',
  Private = 'private',
  Premium = 'premium',
  Draft = 'draft',
  Archived = 'archived'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'manual'},
    foreignKeys: {
      manual_creator_user_id_fkeyRel: {
        name: 'manual_creator_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'creator_user_id'
      },
      manual_image_file_id_fkeyRel: {
        name: 'manual_image_file_id_fkeyRel',
        entity: 'File',
        entityKey: 'id',
        foreignKey: 'image_file_id'
      },
      manual_deleted_by_fkeyRel: {
        name: 'manual_deleted_by_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'deleted_by'
      }
    },
    indexes: {
      idx_manual_creator_user_id: {
        keys: {creator_user_id: 1}
      },
      idx_manual_image_file_id: {
        keys: {image_file_id: 1}
      },
      uq_manual_uuid: {
        keys: {uuid: 1},
        options: {unique: true}
      },
      idx_manual_deleted_by: {
        keys: {deleted_by: 1}
      }
    }
  }
})
export class Manual extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: true},
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 36,
    generated: false,
    index: {unique: true},
    postgresql: {columnName: 'uuid', dataType: 'character varying', dataLength: 36, nullable: 'NO', generated: false},
  })
  uuid: string;

  @belongsTo(() => User)
  creator_user_id?: number;

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
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(ManualDifficulty)
    },
    length: 255,
    generated: false,
    postgresql: {columnName: 'manual_difficulty', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  manual_difficulty: ManualDifficulty;

  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    precision: 10,
    scale: 2,
    generated: false,
    default: 99.90,
    postgresql: {columnName: 'price', dataType: 'numeric', dataPrecision: 10, dataScale: 2, nullable: 'NO', generated: false},
  })
  price: number;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 50,
    generated: false,
    postgresql: {columnName: 'crochet_abbreviation', dataType: 'character varying', dataLength: 50, nullable: 'YES', generated: false},
  })
  crochet_abbreviation?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'crochet_tool', dataType: 'character varying', dataLength: 255, nullable: 'YES', generated: false},
  })
  crochet_tool?: string;

  @property({
    type: 'string',
    jsonSchema: {
      nullable: true,
      enum: Object.values(ManualType)
    },
    length: 255,
    generated: false,
    postgresql: {columnName: 'manual_type', dataType: 'character varying', dataLength: 255, nullable: 'YES', generated: false},
  })
  manual_type?: ManualType;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(ManualStatus)
    },
    length: 255,
    generated: false,
    default: ManualStatus.Draft,
    postgresql: {columnName: 'manual_status', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  manual_status: ManualStatus;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  created_at: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  updated_at: string;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'deleted', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  deleted: boolean;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'deleted_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  deleted_at?: string;

  @belongsTo(() => User)
  deleted_by?: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Manual>) {
    super(data);
  }
}

export interface ManualRelations {
  // describe navigational properties here
}

export type ManualWithRelations = Manual & ManualRelations;
