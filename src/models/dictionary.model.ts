import {belongsTo, Entity, model, property} from '@loopback/repository';
import {File, User} from '.';

export enum DictionaryStatus {
  Active = 'active',
  Draft = 'draft',
  Archived = 'archived'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'dictionary'},
    foreignKeys: {
      dictionary_animation_file_id_fkeyRel: {
        name: 'dictionary_animation_file_id_fkeyRel',
        entity: 'File',
        entityKey: 'id',
        foreignKey: 'animation_file_id'
      },
      dictionary_creator_user_id_fkeyRel: {
        name: 'dictionary_creator_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'creator_user_id'
      },
      dictionary_image_file_id_fkeyRel: {
        name: 'dictionary_image_file_id_fkeyRel',
        entity: 'File',
        entityKey: 'id',
        foreignKey: 'image_file_id'
      },
      dictionary_mark_file_id_fkeyRel: {
        name: 'dictionary_mark_file_id_fkeyRel',
        entity: 'File',
        entityKey: 'id',
        foreignKey: 'mark_file_id'
      }
    },
    indexes: {
      idx_dictionary_creator_user_id: {
        keys: {creator_user_id: 1}
      },
      idx_dictionary_image_file_id: {
        keys: {image_file_id: 1}
      },
      idx_dictionary_animation_file_id: {
        keys: {animation_file_id: 1}
      },
      idx_dictionary_mark_file_id: {
        keys: {mark_file_id: 1}
      },
      idx_dictionary_creator_dictionary_status: {
        keys: {creator_user_id: 1, dictionary_status: 1}
      }
    }
  }
})
export class Dictionary extends Entity {
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

  @belongsTo(() => File)
  animation_file_id?: number;

  @belongsTo(() => File)
  mark_file_id?: number;

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
    length: 50,
    generated: false,
    postgresql: {columnName: 'abbrevation_cz', dataType: 'character varying', dataLength: 50, nullable: 'YES', generated: false},
  })
  abbrevation_cz?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 50,
    generated: false,
    postgresql: {columnName: 'abbrevation_en', dataType: 'character varying', dataLength: 50, nullable: 'YES', generated: false},
  })
  abbrevation_en?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(DictionaryStatus)
    },
    length: 255,
    generated: false,
    default: DictionaryStatus.Draft,
    postgresql: {columnName: 'dictionary_status', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  dictionary_status: DictionaryStatus;

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

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Dictionary>) {
    super(data);
  }
}

export interface DictionaryRelations {
  // describe navigational properties here
}

export type DictionaryWithRelations = Dictionary & DictionaryRelations;
