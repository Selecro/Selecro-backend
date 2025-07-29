import {Entity, model, property} from '@loopback/repository';
import {File, User} from '.';

export enum ManualDifficulty {
  beginner = 'beginner',
  intermediate = 'intermediate',
  advanced = 'advanced',
}

export enum ManualType {
  assembly = 'assembly',
  repair = 'repair',
  how_to = 'how_to',
  guide = 'guide',
  other = 'other',
}

export enum ManualStatus {
  public = 'public',
  private = 'private',
  premium = 'premium',
  draft = 'draft',
  archived = 'archived',
}

@model({
  name: 'manual',
  settings: {
    postgresql: {
      table: 'manual',
    },
    foreignKeys: {
      fk_manual_creatorUserId: {
        name: 'fk_manual_creatorUserId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'creator_user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
      fk_manual_imageFileId: {
        name: 'fk_manual_imageFileId',
        entity: 'file',
        entityKey: 'id',
        foreignKey: 'image_file_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class Manual extends Entity {
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
    required: true,
    default: ManualDifficulty.beginner,
    jsonSchema: {
      enum: Object.values(ManualDifficulty),
    },
    postgresql: {
      columnName: 'difficulty',
      dataType: 'text',
      nullable: 'NO',
      default: 'beginner',
    },
  })
  difficulty: ManualDifficulty;

  @property({
    type: 'number',
    required: true,
    default: 0.00,
    postgresql: {
      columnName: 'price',
      dataType: 'decimal',
      dataPrecision: 10,
      dataScale: 2,
      nullable: 'NO',
      default: 0.00,
    },
  })
  price: number;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'crochet_abbreviation',
      dataType: 'varchar',
      dataLength: 50,
      nullable: 'YES',
    },
  })
  crochetAbbreviation?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'crochet_tool',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'YES',
    },
  })
  crochetTool?: string;

  @property({
    type: 'string',
    required: false,
    jsonSchema: {
      enum: Object.values(ManualType),
    },
    postgresql: {
      columnName: 'manual_type',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  manualType?: ManualType;

  @property({
    type: 'string',
    required: true,
    default: ManualStatus.draft,
    jsonSchema: {
      enum: Object.values(ManualStatus),
    },
    postgresql: {
      columnName: 'status',
      dataType: 'text',
      nullable: 'NO',
      default: 'draft',
    },
  })
  status: ManualStatus;

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

  constructor(data?: Partial<Manual>) {
    super(data);
  }
}

export interface ManualRelations {
  creatorUser?: User;
  imageFile?: File;
}

export type ManualWithRelations = Manual & ManualRelations;
