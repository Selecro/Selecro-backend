import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Badge, User} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'user_badge'},
    foreignKeys: {
      user_badge_badge_id_fkeyRel: {
        name: 'user_badge_badge_id_fkeyRel',
        entity: 'Badge',
        entityKey: 'id',
        foreignKey: 'badge_id'
      },
      user_badge_user_id_fkeyRel: {
        name: 'user_badge_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_user_badge_user_id: {
        keys: {user_id: 1}
      },
      idx_user_badge_badge_id: {
        keys: {badge_id: 1}
      },
      uq_user_badge_user_badge: {
        keys: {user_id: 1, badge_id: 1},
        options: {unique: true}
      }
    }
  }
})
export class UserBadge extends Entity {
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

  @belongsTo(() => Badge)
  badge_id: number;

  @belongsTo(() => User)
  user_id: number;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'awarded_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  awarded_at: string;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: true,
    postgresql: {columnName: 'visible_on_profile', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  visible_on_profile: boolean;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserBadge>) {
    super(data);
  }
}

export interface UserBadgeRelations {
  // describe navigational properties here
}

export type UserBadgeWithRelations = UserBadge & UserBadgeRelations;
