import {belongsTo, Entity, model, property} from '@loopback/repository';
import {File, User} from '.';

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
      }
    }
  }
})
export class Manual extends Entity {
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
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'difficulty', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  difficulty: string;

  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    precision: 10,
    scale: 2,
    generated: false,
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
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'manual_type', dataType: 'character varying', dataLength: 255, nullable: 'YES', generated: false},
  })
  manual_type?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'status', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  status: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  created_at: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  updated_at: string;

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
