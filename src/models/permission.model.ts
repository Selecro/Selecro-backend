import {Entity, model, property} from '@loopback/repository';

export enum ResourceType {
  User = 'User',
  UserSetting = 'User_Setting',
  UserLocation = 'User_Location',
  UserNotificationSetting = 'User_Notification_Setting',
  UserSecurity = 'User_Security',
  File = 'file',
  UserDocument = 'User_Document',
  Role = 'Role',
  Permission = 'Permission',
  Device = 'Device',
  LoginHistory = 'Login_History',
  TwoFactorAuthLog = 'Two_Factor_Auth_Log',
  SystemLog = 'System_Log',
  TwoFactorAuthMethod = 'Two_Factor_Auth_Method',
  PasswordHistory = 'Password_History',
  OAuthAccount = 'OAuth_Account',
  TwoFactorAuthBackupCode = 'Two_Factor_Auth_Backup_Code',
  UserRole = 'User_Role',
  RolePermission = 'Role_Permission',
  Session = 'Session',
  Follower = 'Follower',
  Badge = 'Badge',
  UserBadge = 'User_Badge',
  Notification = 'Notification',
  News = 'News',
  NewsDelivery = 'News_Delivery',
  EducationMode = 'Education_Mode',
  Tool = 'Tool',
  EducationStep = 'Education_Step',
  Dictionary = 'Dictionary',
  Manual = 'Manual',
  ManualStep = 'Manual_Step',
  ManualProgress = 'Manual_Progress',
  ManualPurchase = 'Manual_Purchase',
  UserManualInteraction = 'User_Manual_Interaction',
  Comment = 'Comment',
}

export enum ActionType {
  read = 'read',
  write = 'write',
  delete = 'delete',
  update = 'update',
}

@model({
  name: 'permission',
  settings: {
    postgresql: {
      table: 'permission',
      indexes: {
        uniqueResourceTypeActionType: {
          keys: {
            resource_type: 1,
            action_type: 1,
          },
          options: {
            unique: true,
          },
        },
      },
    },
    foreignKeys: {
      fk_permission_creatorUserId: {
        name: 'fk_permission_creatorUserId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'creator_user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class Permission extends Entity {
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
  id: number;

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
    jsonSchema: {
      enum: Object.values(ResourceType),
    },
    postgresql: {
      columnName: 'resource_type',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  resourceType: ResourceType;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(ActionType),
    },
    postgresql: {
      columnName: 'action_type',
      dataType: 'text',
      nullable: 'NO',
    },
  })
  actionType: ActionType;

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

  constructor(data?: Partial<Permission>) {
    super(data);
  }
}

export interface PermissionRelations {
  // describe navigational properties here
}

export type PermissionWithRelations = Permission & PermissionRelations;
