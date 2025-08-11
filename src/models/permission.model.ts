import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum ResourceType {
  User = 'user',
  UserSetting = 'user_setting',
  UserLocation = 'user_location',
  UserNotificationSetting = 'user_notification_setting',
  UserSecurity = 'user_security',
  File = 'file',
  UserFile = 'user_file',
  Role = 'role',
  Permission = 'permission',
  Device = 'device',
  LoginHistory = 'login_history',
  TwoFactorAuthLog = 'two_factor_auth_log',
  SystemLog = 'system_log',
  TwoFactorAuthMethod = 'two_factor_auth_method',
  PasswordHistory = 'password_history',
  OauthAccount = 'oauth_account',
  TwoFactorAuthBackupCode = 'two_factor_auth_backup_code',
  UserRole = 'user_role',
  RolePermission = 'role_permission',
  Session = 'session',
  Follower = 'follower',
  Badge = 'badge',
  UserBadge = 'user_badge',
  Notification = 'notification',
  News = 'news',
  NewsDelivery = 'news_delivery',
  EducationMode = 'education_mode',
  Tool = 'tool',
  EducationStep = 'education_step',
  Dictionary = 'dictionary',
  Manual = 'manual',
  ManualStep = 'manual_step',
  ManualProgress = 'manual_progress',
  ManualPurchase = 'manual_purchase',
  UserManualInteraction = 'user_manual_interaction',
  Comment = 'comment'
}

export enum ActionType {
  Read = 'read',
  Write = 'write',
  Delete = 'delete',
  Update = 'update'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'permission'},
    foreignKeys: {
      permission_creator_user_id_fkeyRel: {
        name: 'permission_creator_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'creator_user_id'
      },
      permission_deleted_by_fkeyRel: {
        name: 'permission_deleted_by_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'deleted_by'
      }
    },
    indexes: {
      uq_permission_resource_action: {
        keys: {resource_type: 1, action_type: 1},
        options: {unique: true},
      },
      idx_permission_creator_user_id: {
        keys: {creator_user_id: 1},
      },
      idx_permission_created_at: {
        keys: {created_at: -1},
      },
      idx_permission_deleted_by: {
        keys: {deleted_by: 1}
      }
    }
  }
})
export class Permission extends Entity {
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
  creator_user_id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(ResourceType)
    },
    length: 255,
    generated: false,
    postgresql: {columnName: 'resource_type', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  resource_type: ResourceType;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(ActionType)
    },
    length: 255,
    generated: false,
    postgresql: {columnName: 'action_type', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  action_type: ActionType;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'permission_description', dataType: 'text', nullable: 'YES', generated: false},
  })
  permission_description?: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  created_at: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  updated_at: string;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'deleted', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  deleted: boolean;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'deleted_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  deleted_at?: string;

  @belongsTo(() => User)
  deleted_by?: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Permission>) {
    super(data);
  }
}

export interface PermissionRelations {
  // describe navigational properties here
}

export type PermissionWithRelations = Permission & PermissionRelations;
