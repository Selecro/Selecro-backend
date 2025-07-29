import {Entity, model, property} from '@loopback/repository';
import {File, User} from '.';

@model({
  name: 'badge',
  settings: {
    postgresql: {
      table: 'badge',
    },
    foreignKeys: {
      fk_badge_imageFileId: {
        name: 'fk_badge_imageFileId',
        entity: 'file',
        entityKey: 'id',
        foreignKey: 'image_file_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
      fk_badge_creatorUserId: {
        name: 'fk_badge_creatorUserId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'creator_user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class Badge extends Entity {
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
    required: true,
    postgresql: {
      columnName: 'creator_user_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  creatorUserId: number;

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
      columnName: 'name',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'NO',
      unique: true,
    },
  })
  name: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'description',
      dataType: 'text',
      nullable: 'YES',
    },
  })
  description?: string;

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

  constructor(data?: Partial<Badge>) {
    super(data);
  }
}

export interface BadgeRelations {
  imageFile?: File;
  creatorUser?: User;
}

export type BadgeWithRelations = Badge & BadgeRelations;
