import {Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({
  name: 'follower',
  settings: {
    postgresql: {
      table: 'follower',
    },
    foreignKeys: {
      fk_follower_followerId: {
        name: 'fk_follower_followerId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'follower_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      fk_follower_followedId: {
        name: 'fk_follower_followedId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'followed_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class Follower extends Entity {
  @property({
    type: 'number',
    required: true,
    id: true,
    postgresql: {
      columnName: 'follower_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  followerId: number;

  @property({
    type: 'number',
    required: true,
    id: true,
    postgresql: {
      columnName: 'followed_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  followedId: number;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'followed_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  followedAt: Date;

  @property({
    type: 'boolean',
    required: true,
    default: true,
    postgresql: {
      columnName: 'is_active',
      dataType: 'boolean',
      nullable: 'NO',
      default: true,
    },
  })
  isActive: boolean;

  constructor(data?: Partial<Follower>) {
    super(data);
  }
}

export interface FollowerRelations {
  followerUser?: User;
  followedUser?: User;
}

export type FollowerWithRelations = Follower & FollowerRelations;
