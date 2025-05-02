import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'users_users',
  settings: {
    foreignKeys: {
      fk_userlink_followerId: {
        name: 'fk_userlink_followerId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'followerId',
        onDelete: 'CASCADE',
        onUpdate: 'SET NULL',
      },
      fk_userlink_followeeId: {
        name: 'fk_userlink_followeeId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'followeeId',
        onDelete: 'CASCADE',
        onUpdate: 'SET NULL',
      },
    },
  }
})
export class UserLink extends Entity {
  @property({
    type: 'string',
    id: true,
    defaultFn: 'uuidv4',
    postgresql: {
      columnName: 'id',
      dataLength: null,
      dataPrecision: 10,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  id: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'followerId',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  followerId: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'followeeId',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  followeeId: string;

  constructor(data?: Partial<UserLink>) {
    super(data);
  }
}

export interface UserLinkRelations {
  // describe navigational properties here
}

export type UserLinkWithRelations = UserLink & UserLinkRelations;
