import {Entity, model, property} from '@loopback/repository';
import {Role, User} from '.';

@model({
  name: 'user_role',
  settings: {
    postgresql: {
      table: 'user_role',
    },
    foreignKeys: {
      fk_user_role_userId: {
        name: 'fk_user_role_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
      fk_user_role_roleId: {
        name: 'fk_user_role_roleId',
        entity: 'role',
        entityKey: 'id',
        foreignKey: 'role_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class UserRole extends Entity {
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
    type: 'number',
    required: true,
    id: true,
    postgresql: {
      columnName: 'role_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  roleId: number;

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

  constructor(data?: Partial<UserRole>) {
    super(data);
  }
}

export interface UserRoleRelations {
  user?: User;
  role?: Role;
}

export type UserRoleWithRelations = UserRole & UserRoleRelations;
