import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'users_groups',
})
export class UserGroup extends Entity {
  @property({
    id: true,
    generated: true,
    required: true,
    postgresql: {
      columnName: 'id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  id: number;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'group_id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'YES',
    },
  })
  groupId?: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'user_id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'YES',
    },
  })
  userId?: number;

  constructor(data?: Partial<UserGroup>) {
    super(data);
  }
}

export interface UserGroupRelations {
  // describe navigational properties here
}

export type UserGroupWithRelations = UserGroup & UserGroupRelations;
