import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'users_users',
})
export class UserLink extends Entity {
  @property({
    id: true,
    generated: true,
    postgresql: {
      columnName: 'id',
      dataLength: null,
      dataPrecision: 10,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  id: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'follower_id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  followerId: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'followee_id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  followeeId: number;

  constructor(data?: Partial<UserLink>) {
    super(data);
  }
}

export interface UserLinkRelations {
  // describe navigational properties here
}

export type UserLinkWithRelations = UserLink & UserLinkRelations;
