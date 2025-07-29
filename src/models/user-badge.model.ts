import {Entity, model, property} from '@loopback/repository';
import {Badge, User} from '.';

@model({
  name: 'user_badge',
  settings: {
    postgresql: {
      table: 'user_badge',
    },
    foreignKeys: {
      fk_user_badge_badgeId: {
        name: 'fk_user_badge_badgeId',
        entity: 'badge',
        entityKey: 'id',
        foreignKey: 'badge_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      fk_user_badge_userId: {
        name: 'fk_user_badge_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class UserBadge extends Entity {
  @property({
    type: 'number',
    required: true,
    id: true,
    postgresql: {
      columnName: 'badge_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  badgeId: number;

  @property({
    type: 'number',
    required: true,
    id: true,
    postgresql: {
      columnName: 'user_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  userId: number;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'awarded_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  awardedAt: Date;

  @property({
    type: 'boolean',
    required: true,
    default: true,
    postgresql: {
      columnName: 'visible_on_profile',
      dataType: 'boolean',
      nullable: 'NO',
      default: true,
    },
  })
  visibleOnProfile: boolean;

  constructor(data?: Partial<UserBadge>) {
    super(data);
  }
}

export interface UserBadgeRelations {
  user?: User;
  badge?: Badge;
}

export type UserBadgeWithRelations = UserBadge & UserBadgeRelations;
