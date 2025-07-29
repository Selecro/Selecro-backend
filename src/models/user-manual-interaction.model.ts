import {Entity, model, property} from '@loopback/repository';
import {Manual, User} from '.';

export enum InteractionType {
  view = 'view',
  like = 'like',
  share = 'share',
}

@model({
  name: 'user_manual_interaction',
  settings: {
    postgresql: {
      table: 'user_manual_interaction',
    },
    foreignKeys: {
      fk_user_manual_interaction_manualId: {
        name: 'fk_user_manual_interaction_manualId',
        entity: 'manual',
        entityKey: 'id',
        foreignKey: 'manual_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      fk_user_manual_interaction_userId: {
        name: 'fk_user_manual_interaction_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class UserManualInteraction extends Entity {
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
      columnName: 'user_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  userId: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'manual_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  manualId: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(InteractionType),
    },
    postgresql: {
      columnName: 'interaction_type',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  interactionType: InteractionType;

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

  constructor(data?: Partial<UserManualInteraction>) {
    super(data);
  }
}

export interface UserManualInteractionRelations {
  user?: User;
  manual?: Manual;
}

export type UserManualInteractionWithRelations = UserManualInteraction & UserManualInteractionRelations;
