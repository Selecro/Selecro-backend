import {belongsTo, Entity, model, property} from '@loopback/repository';
import {File, User} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'tool'},
    foreignKeys: {
      tool_creator_user_id_fkeyRel: {
        name: 'tool_creator_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'creator_user_id'
      },
      tool_image_file_id_fkeyRel: {
        name: 'tool_image_file_id_fkeyRel',
        entity: 'File',
        entityKey: 'id',
        foreignKey: 'image_file_id'
      }
    },
    indexes: {
      unique_uuid: {
        keys: {uuid: 1},
        options: {unique: true}
      }
    }
  }
})
export class Tool extends Entity {
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
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'description_cz', dataType: 'text', nullable: 'YES', generated: false},
  })
  description_cz?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'description_en', dataType: 'text', nullable: 'YES', generated: false},
  })
  description_en?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 2048,
    generated: false,
    postgresql: {columnName: 'video_url', dataType: 'character varying', dataLength: 2048, nullable: 'YES', generated: false},
  })
  video_url?: string;

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

  constructor(data?: Partial<Tool>) {
    super(data);
  }
}

export interface ToolRelations {
  // describe navigational properties here
}

export type ToolWithRelations = Tool & ToolRelations;
