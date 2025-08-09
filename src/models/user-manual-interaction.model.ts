import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Manual, User} from '.';

export enum UserManualInteractionType {
  View = 'view',
  Like = 'like',
  Share = 'share',
  Save = 'save'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'user_manual_interaction'},
    foreignKeys: {
      user_manual_interaction_manual_id_fkeyRel: {
        name: 'user_manual_interaction_manual_id_fkeyRel',
        entity: 'Manual',
        entityKey: 'id',
        foreignKey: 'manual_id'
      },
      user_manual_interaction_user_id_fkeyRel: {
        name: 'user_manual_interaction_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_user_manual_interaction_user_id: {
        keys: {user_id: 1}
      },
      idx_user_manual_interaction_manual_id: {
        keys: {manual_id: 1}
      },
      idx_user_manual_interaction_created_at: {
        keys: {created_at: 1}
      },
      uq_user_manual_interaction: {
        keys: {user_id: 1, manual_id: 1, user_manual_interaction_type: 1},
        options: {unique: true}
      }
    }
  }
})
export class UserManualInteraction extends Entity {
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

  @belongsTo(() => User)
  user_id: number;

  @belongsTo(() => Manual)
  manual_id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(UserManualInteractionType)
    },
    length: 255,
    generated: false,
    postgresql: {columnName: 'user_manual_interaction_type', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  user_manual_interaction_type: UserManualInteractionType;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  created_at: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserManualInteraction>) {
    super(data);
  }
}

export interface UserManualInteractionRelations {
  // describe navigational properties here
}

export type UserManualInteractionWithRelations = UserManualInteraction & UserManualInteractionRelations;
