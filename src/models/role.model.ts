import {Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum RoleName {
  admin = 'admin',
  user = 'user',
  marketer = 'marketer',
  educator = 'educator',
  customer = 'customer',
}

@model({
  name: 'role',
  settings: {
    postgresql: {
      table: 'role',
    },
    foreignKeys: {
      fk_role_creatorUserId: {
        name: 'fk_role_creatorUserId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'creator_user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class Role extends Entity {
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
    type: 'string',
    required: true,
    default: RoleName.user,
    jsonSchema: {
      enum: Object.values(RoleName),
    },
    postgresql: {
      columnName: 'name',
      dataType: 'text',
      nullable: 'NO',
      default: 'user',
    },
  })
  name: RoleName;

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

  constructor(data?: Partial<Role>) {
    super(data);
  }
}

export interface RoleRelations {
  creatorUser?: User;
}

export type RoleWithRelations = Role & RoleRelations;
