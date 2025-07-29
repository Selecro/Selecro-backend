import {Entity, model, property} from '@loopback/repository';
import {File, User} from '.';

export enum DictionaryStatus {
  active = 'active',
  draft = 'draft',
  archived = 'archived',
}

@model({
  name: 'dictionary',
  settings: {
    postgresql: {
      table: 'dictionary',
    },
    foreignKeys: {
      fk_dictionary_creatorUserId: {
        name: 'fk_dictionary_creatorUserId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'creator_user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
      fk_dictionary_imageFileId: {
        name: 'fk_dictionary_imageFileId',
        entity: 'file',
        entityKey: 'id',
        foreignKey: 'image_file_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
      fk_dictionary_animationFileId: {
        name: 'fk_dictionary_animationFileId',
        entity: 'file',
        entityKey: 'id',
        foreignKey: 'animation_file_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
      fk_dictionary_markFileId: {
        name: 'fk_dictionary_markFileId',
        entity: 'file',
        entityKey: 'id',
        foreignKey: 'mark_file_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class Dictionary extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      columnName: 'id',
      dataType: 'bigint',
      nullable: 'NO',
      generated: true,
    },
  })
  id?: number;

  @property({
    type: 'string',
    defaultFn: 'uuidv4',
    postgresql: {
      columnName: 'uuid',
      dataType: 'varchar',
      dataLength: 36,
      nullable: 'NO',
      unique: true,
    },
  })
  uuid: string;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'creator_user_id',
      dataType: 'bigint',
      nullable: 'YES',
    },
  })
  creatorUserId?: number;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'image_file_id',
      dataType: 'bigint',
      nullable: 'YES',
    },
  })
  imageFileId?: number;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'animation_file_id',
      dataType: 'bigint',
      nullable: 'YES',
    },
  })
  animationFileId?: number;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'mark_file_id',
      dataType: 'bigint',
      nullable: 'YES',
    },
  })
  markFileId?: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'title_cz',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'NO',
    },
  })
  titleCz: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'title_en',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'NO',
    },
  })
  titleEn: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'description_cz',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  descriptionCz?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'description_en',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  descriptionEn?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'abbrevation_cz',
      dataType: 'varchar',
      dataLength: 50,
      nullable: 'YES',
    },
  })
  abbrevationCz?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'abbrevation_en',
      dataType: 'varchar',
      dataLength: 50,
      nullable: 'YES',
    },
  })
  abbrevationEn?: string;

  @property({
    type: 'string',
    required: true,
    default: DictionaryStatus.draft,
    jsonSchema: {
      enum: Object.values(DictionaryStatus),
    },
    postgresql: {
      columnName: 'status',
      dataType: 'text',
      nullable: 'NO',
      default: 'draft',
    },
  })
  status: DictionaryStatus;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'created_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  createdAt: Date;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    updateDefaultFn: 'now',
    postgresql: {
      columnName: 'updated_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  updatedAt: Date;

  constructor(data?: Partial<Dictionary>) {
    super(data);
  }
}

export interface DictionaryRelations {
  creatorUser?: User;
  imageFile?: File;
  animationFile?: File;
  markFile?: File;
}

export type DictionaryWithRelations = Dictionary & DictionaryRelations;
