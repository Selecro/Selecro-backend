import {Entity, hasMany, hasOne, model, property} from '@loopback/repository';
import {Badge, Comment, Device, Dictionary, EducationMode, File, Follower, LoginHistory, Manual, ManualProgress, ManualPurchase, News, NewsDelivery, Notification, OAuthAccount, PasswordHistory, Permission, Role, Session, SystemLog, Tool, TwoFactorAuthBackupCode, TwoFactorAuthLog, TwoFactorAuthMethod, UserBadge, UserFile, UserLocation, UserManualInteraction, UserNotificationSetting, UserRole, UserSecurity, UserSetting} from '.';

export enum AccountStatus {
  active = 'active',
  suspended = 'suspended',
  deleted = 'deleted',
  pending_verification = 'pending_verification',
}

@model({
  name: 'user',
  settings: {
    postgresql: {
      table: 'user',
    },
  }
})
export class User extends Entity {
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

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'first_name',
      dataType: 'varchar',
      dataLength: 100,
      nullable: 'YES',
    },
  })
  firstName?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'last_name',
      dataType: 'varchar',
      dataLength: 100,
      nullable: 'YES',
    },
  })
  lastName?: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'username',
      dataType: 'varchar',
      dataLength: 50,
      nullable: 'NO',
      unique: true,
    },
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'email',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'NO',
      unique: true,
    },
  })
  email: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {
      columnName: 'email_verified',
      dataType: 'boolean',
      nullable: 'NO',
      default: false,
    },
  })
  emailVerified: boolean;

  @property({
    type: 'date',
    required: false,
    postgresql: {
      columnName: 'date_of_birth',
      dataType: 'date',
      nullable: 'YES',
    },
  })
  dateOfBirth?: Date;

  @property({
    type: 'string',
    required: true,
    default: AccountStatus.pending_verification,
    jsonSchema: {
      enum: Object.values(AccountStatus),
    },
    postgresql: {
      columnName: 'account_status',
      dataType: 'text',
      nullable: 'NO',
      default: 'pending_verification',
    },
  })
  accountStatus: AccountStatus;

  @property({
    type: 'date',
    required: false,
    postgresql: {
      columnName: 'last_login_at',
      dataType: 'timestamp with time zone',
      nullable: 'YES',
    },
  })
  lastLoginAt?: Date;

  @property({
    type: 'date',
    required: false,
    postgresql: {
      columnName: 'last_active_at',
      dataType: 'timestamp with time zone',
      nullable: 'YES',
    },
  })
  lastActiveAt?: Date;

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

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'phone_number',
      dataType: 'varchar',
      dataLength: 20,
      nullable: 'YES',
    },
  })
  phoneNumber?: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {
      columnName: 'is_oauth_user',
      dataType: 'boolean',
      nullable: 'NO',
      default: false,
    },
  })
  isOauthUser: boolean;

  @hasOne(() => UserSecurity, {keyTo: 'userId'})
  userSecurity: UserSecurity;

  @hasOne(() => UserNotificationSetting, {keyTo: 'userId'})
  userNotificationSetting: UserNotificationSetting;

  @hasOne(() => UserLocation, {keyTo: 'userId'})
  userLocation: UserLocation;

  @hasOne(() => UserSetting, {keyTo: 'userId'})
  userSetting: UserSetting;

  @hasMany(() => Session, {keyTo: 'userId'})
  sessions: Session[];

  @hasMany(() => Device, {keyTo: 'userId'})
  devices: Device[];

  @hasMany(() => PasswordHistory, {keyTo: 'userId'})
  passwordHistories: PasswordHistory[];

  @hasMany(() => OAuthAccount, {keyTo: 'userId'})
  oAuthAccounts: OAuthAccount[];

  @hasMany(() => TwoFactorAuthBackupCode, {keyTo: 'userId'})
  twoFactorAuthBackupCodes: TwoFactorAuthBackupCode[];

  @hasMany(() => Role, {keyTo: 'creatorUserId'})
  roles: Role[];

  @hasMany(() => TwoFactorAuthMethod, {keyTo: 'userId'})
  twoFactorAuthMethods: TwoFactorAuthMethod[];

  @hasMany(() => SystemLog, {keyTo: 'userId'})
  systemLogs: SystemLog[];

  @hasMany(() => UserRole, {keyTo: 'userId'})
  userRoles: UserRole[];

  @hasMany(() => Permission, {keyTo: 'creatorUserId'})
  permissions: Permission[];

  @hasMany(() => LoginHistory, {keyTo: 'userId'})
  loginHistories: LoginHistory[];

  @hasMany(() => TwoFactorAuthLog, {keyTo: 'userId'})
  twoFactorAuthLogs: TwoFactorAuthLog[];

  @hasMany(() => NewsDelivery, {keyTo: 'userId'})
  newsDeliveries: NewsDelivery[];

  @hasMany(() => News, {keyTo: 'creatorUserId'})
  news: News[];

  @hasMany(() => Notification, {keyTo: 'creatorUserId'})
  createdNotifications: Notification[];

  @hasMany(() => Notification, {keyTo: 'userId'})
  receivedNotifications: Notification[];

  @hasMany(() => UserBadge, {keyTo: 'userId'})
  userBadges: UserBadge[];

  @hasMany(() => Follower, {keyTo: 'followerId'})
  followers: Follower[];

  @hasMany(() => Follower, {keyTo: 'followedId'})
  following: Follower[];

  @hasMany(() => Badge, {keyTo: 'creatorUserId'})
  badges: Badge[];

  @hasMany(() => UserFile, {keyTo: 'userId'})
  userFiles: UserFile[];

  @hasMany(() => File, {keyTo: 'creatorUserId'})
  files: File[];

  @hasMany(() => Tool, {keyTo: 'creatorUserId'})
  tools: Tool[];

  @hasMany(() => Dictionary, {keyTo: 'creatorUserId'})
  dictionaries: Dictionary[];

  @hasMany(() => UserManualInteraction, {keyTo: 'userId'})
  userManualInteractions: UserManualInteraction[];

  @hasMany(() => ManualPurchase, {keyTo: 'userId'})
  manualPurchases: ManualPurchase[];

  @hasMany(() => ManualProgress, {keyTo: 'userId'})
  manualProgresses: ManualProgress[];

  @hasMany(() => EducationMode, {keyTo: 'creatorUserId'})
  educationModes: EducationMode[];

  @hasMany(() => Manual, {keyTo: 'creatorUserId'})
  manuals: Manual[];

  @hasMany(() => Comment, {keyTo: 'userId'})
  comments: Comment[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
}

export type UserWithRelations = User & UserRelations;
