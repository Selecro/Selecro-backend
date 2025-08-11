import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  UserRepository
} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import csurf from 'csurf';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'path';
import {PingController} from './controllers';
import {KafkaDataSource, KmsDataSource, PostgresqlDataSource, RedisDataSource} from './datasources';
import {startHardDeleteJob} from './jobs/hard-delete.job';
import {COOKIE_PARSER_OPTIONS, CorrelationIdBindings, FcmBindings, FirebaseBindings, IpFilterBindings} from './keys';
import {
  ApiVersioningMiddlewareProvider,
  AuditTrailMiddlewareProvider,
  CookieParserMiddlewareProvider,
  CorrelationIdMiddlewareProvider,
  CsrfMiddlewareProvider,
  FeatureFlagMiddlewareProvider,
  GeoipMiddlewareProvider,
  HmacMiddlewareProvider,
  InputSanitizerMiddlewareProvider,
  IpFilterMiddlewareProvider,
  MaintenanceMiddlewareProvider,
  RateLimitMiddlewareProvider,
  TenantResolverMiddlewareProvider
} from './middleware';
import {RemoteConfigObserver} from './observers';
import {FirebaseAdminProvider, RemoteConfigService} from './providers';
import {
  BadgeRepository,
  CommentRepository,
  DeviceRepository,
  DictionaryRepository,
  EducationModeRepository,
  EducationStepRepository,
  FileRepository,
  FollowerRepository,
  LoginHistoryRepository,
  ManualProgressRepository,
  ManualPurchaseRepository,
  ManualRepository,
  ManualStepRepository,
  NewsDeliveryRepository,
  NewsRepository,
  NotificationRepository,
  OauthAccountRepository,
  PasswordHistoryRepository,
  PermissionRepository,
  RolePermissionRepository,
  RoleRepository,
  SessionRepository,
  SystemLogRepository,
  ToolRepository,
  TwoFactorAuthBackupCodeRepository,
  TwoFactorAuthLogRepository,
  TwoFactorAuthMethodRepository,
  UserBadgeRepository,
  UserFileRepository,
  UserLocationRepository,
  UserManualInteractionRepository,
  UserNotificationSettingRepository,
  UserRoleRepository,
  UserSecurityRepository,
  UserSettingRepository
} from './repositories';
import {MySequence} from './sequence';
import {FcmService, TenantService} from './services';

dotenv.config();

const helmetMiddlewareFactory = () => helmet();

export {ApplicationConfig};

export class SelecroBackendApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.sequence(MySequence);
    this.static('/', path.join(__dirname, '../public'));
    this.restServer.expressMiddleware(helmetMiddlewareFactory);

    this.bind(FirebaseBindings.ADMIN).toProvider(FirebaseAdminProvider);
    this.service(RemoteConfigService);
    this.lifeCycleObserver(RemoteConfigObserver);
    this.lifeCycleObserver(AuditTrailMiddlewareProvider);

    this.configureMiddleware();

    if (process.env.NODE_ENV !== 'production') {
      this.configure(RestExplorerBindings.COMPONENT).to({
        path: '/explorer',
      });
      this.component(RestExplorerComponent);
    }

    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);
    this.controller(PingController);

    this.repository(UserRepository);
    this.repository(FileRepository);
    this.repository(UserFileRepository);
    this.repository(UserSettingRepository);
    this.repository(UserLocationRepository);
    this.repository(UserNotificationSettingRepository);
    this.repository(UserSecurityRepository);
    this.repository(RoleRepository);
    this.repository(PermissionRepository);
    this.repository(DeviceRepository);
    this.repository(LoginHistoryRepository);
    this.repository(TwoFactorAuthLogRepository);
    this.repository(SystemLogRepository);
    this.repository(TwoFactorAuthMethodRepository);
    this.repository(PasswordHistoryRepository);
    this.repository(OauthAccountRepository);
    this.repository(TwoFactorAuthBackupCodeRepository);
    this.repository(UserRoleRepository);
    this.repository(RolePermissionRepository);
    this.repository(SessionRepository);
    this.repository(FollowerRepository);
    this.repository(BadgeRepository);
    this.repository(UserBadgeRepository);
    this.repository(NotificationRepository);
    this.repository(NewsRepository);
    this.repository(NewsDeliveryRepository);
    this.repository(EducationModeRepository);
    this.repository(ToolRepository);
    this.repository(EducationStepRepository);
    this.repository(DictionaryRepository);
    this.repository(ManualRepository);
    this.repository(ManualStepRepository);
    this.repository(ManualProgressRepository);
    this.repository(ManualPurchaseRepository);
    this.repository(UserManualInteractionRepository);
    this.repository(CommentRepository);

    this.dataSource(PostgresqlDataSource);
    this.dataSource(KafkaDataSource);
    this.dataSource(RedisDataSource);
    this.dataSource(KmsDataSource);

    this.service(TenantService);

    this.projectRoot = __dirname;
    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
      models: {
        dirs: ['models'],
        extensions: ['.model.js'],
        nested: true,
      },
    };
    startHardDeleteJob(this);
  }

  configureMiddleware() {
    this.bind('middleware.maintenance').toProvider(MaintenanceMiddlewareProvider);
    this.bind('middleware.rateLimit').toProvider(RateLimitMiddlewareProvider);
    this.bind('middleware.ipFilter').toProvider(IpFilterMiddlewareProvider);
    this.bind('middleware.correlationId').toProvider(CorrelationIdMiddlewareProvider);
    this.bind('middleware.inputSanitizer').toProvider(InputSanitizerMiddlewareProvider);
    this.bind('middleware.cookieParser').toProvider(CookieParserMiddlewareProvider);
    this.bind('middleware.csrf').toProvider(CsrfMiddlewareProvider);
    this.bind('middleware.tenant').toProvider(TenantResolverMiddlewareProvider);
    this.bind('middleware.hmac').toProvider(HmacMiddlewareProvider);
    this.bind('middleware.apiVersioning').toProvider(ApiVersioningMiddlewareProvider);
    this.bind('middleware.featureFlags').toProvider(FeatureFlagMiddlewareProvider);
    this.bind('middleware.geoip').toProvider(GeoipMiddlewareProvider);
    this.bind('middleware.auditTrail').toProvider(AuditTrailMiddlewareProvider);

    this.bind(IpFilterBindings.IP_LIST).to(process.env.DENIED_IPS?.split(',').map(s => s.trim()) || []);
    this.bind(IpFilterBindings.OPTIONS).to({
      mode: 'deny',
      log: true,
      logLevel: 'deny',
    });

    this.bind(CorrelationIdBindings.HEADER_NAME).to('X-Request-ID');

    const cookieParserSecret = process.env.COOKIE_PARSER_SECRET || 'your-super-secret-key-please-change-this';
    if (cookieParserSecret === 'your-super-secret-key-please-change-this' && process.env.NODE_ENV === 'production') {
      console.warn('WARNING: COOKIE_PARSER_SECRET is not set in production. Please set a strong, unique secret!');
    }
    this.bind('cookieParser.secret').to(cookieParserSecret);
    const cookieParserOptions = {
      decode: (val: string) => {
        try {
          return decodeURIComponent(val);
        } catch (e) {
          return val;
        }
      },
    };
    this.bind(COOKIE_PARSER_OPTIONS).to(cookieParserOptions);

    const csrfOptions: csurf.CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    };
    this.bind('csrf.options').to({cookie: csrfOptions});

    const supportedFromEnv = (process.env.API_SUPPORTED_VERSIONS || 'v1,v2')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const supported = ['', ...supportedFromEnv];

    const versionHeaderFromEnv = process.env.API_VERSION_HEADER || 'x-api-version';

    this.bind('versioning.options').to({
      supportedVersions: supported.map(s => s.toLowerCase()),
      versionHeader: versionHeaderFromEnv,
    });

    this.bind('feature.flags.options').to({
      supportedFlags: ['new-product-page', 'beta-analytics'],
    });

    this.bind(FcmBindings.SERVICE).toClass(FcmService);
  }
}
