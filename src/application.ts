import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  UserRepository
} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'path';
import {PingController} from './controllers';
import {KafkaDataSource, KmsDataSource, PostgresqlDataSource, RedisCacheDataSource, RedisContentDataSource, RedisLeaderboardDataSource, RedisQueueDataSource, RedisSecurityDataSource, RedisSessionDataSource} from './datasources';
import {AuthorizationInterceptor, EncryptionInterceptor} from './interceptors';
import {startHardDeleteJob} from './jobs';
import {COOKIE_PARSER_OPTIONS, CorrelationIdBindings, FirebaseBindings, IpFilterBindings} from './keys';
import {
  ApiVersioningMiddlewareProvider,
  AuditTrailMiddlewareProvider,
  CookieParserMiddlewareProvider,
  CorrelationIdMiddlewareProvider,
  CsrfMiddlewareProvider,
  DeviceMiddlewareProvider,
  FeatureFlagMiddlewareProvider,
  GeoipMiddlewareProvider,
  HmacMiddlewareProvider,
  InputSanitizerMiddlewareProvider,
  IpFilterMiddlewareProvider,
  JwtAuthMiddleware,
  MaintenanceMiddlewareProvider,
  RateLimitMiddlewareProvider,
  SessionGeoipUpdaterMiddlewareProvider,
  SessionMiddlewareProvider,
  StaticApiKeyMiddlewareProvider,
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
import {
  BcryptPasswordHasherService,
  EmailService,
  JwtAuthService,
  NotificationService,
  PermissionService,
  TenantService,
  UserNotificationService
} from './services';

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

    this.setupApiExplorer();
    this.setupBindings();
    this.setupMiddleware();

    this.setupComponents();
    this.setupDataSources();
    this.setupRepositories();
    this.setupServices();

    this.setupInterceptors();
    startHardDeleteJob(this);

    this.setupLifecycleAndBoot();
  }

  private setupApiExplorer(): void {
    this.api({
      openapi: '3.0.0',
      info: {
        title: 'CleverCare Backend API',
        description: 'The official API for the CleverCare platform, handling user, session, and data management.',
        version: '0.0.1',
        termsOfService: 'https://clever-care.cz/terms',
        contact: {
          name: 'Support Team',
          url: 'https://clever-care.cz/support',
          email: 'support@clever-care.cz',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      externalDocs: {
        description: 'Full API docs',
        url: 'https://docs.clever-care.cz',
      },
      paths: {},
      tags: [
        {name: 'UserController', description: 'Operations related to user accounts and profiles.'},
      ],
      components: {
        securitySchemes: {
          csrfTokenAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-CSRF-Token',
            description: 'Required for all non-GET requests to prevent CSRF attacks.',
          },
          jwt: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JSON Web Token (JWT) provided after successful login.',
          },
        },
      },
      security: [
        {
          jwt: [],
          csrfTokenAuth: [],
        },
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.configure(RestExplorerBindings.COMPONENT).to({
        path: '/explorer',
      });
      this.component(RestExplorerComponent);
    }
  }

  private setupBindings(): void {
    this.bind(FirebaseBindings.ADMIN).toProvider(FirebaseAdminProvider);
    this.bind('middleware.jwt-auth').to(JwtAuthMiddleware);

    this.bind('services.jwt.service').toClass(JwtAuthService);
    this.bind('services.hasher').toClass(BcryptPasswordHasherService);
    this.bind('services.email').toClass(EmailService);
  }

  private setupMiddleware(): void {
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
    this.bind('middleware.session').toProvider(SessionMiddlewareProvider);
    this.bind('middleware.device').toProvider(DeviceMiddlewareProvider);
    this.bind('middleware.sessionGeoipUpdater').toProvider(SessionGeoipUpdaterMiddlewareProvider);
    this.bind('middleware.staticApiKey').toProvider(StaticApiKeyMiddlewareProvider);

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
    this.bind(COOKIE_PARSER_OPTIONS).to({
      decode: (val: string) => {
        try {
          return decodeURIComponent(val);
        } catch (e) {
          return val;
        }
      },
    });

    const supportedVersions = (process.env.API_SUPPORTED_VERSIONS || 'v1,v2')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const versionHeader = process.env.API_VERSION_HEADER || 'x-api-version';

    this.bind('versioning.options').to({
      supportedVersions: ['', ...supportedVersions].map(s => s.toLowerCase()),
      versionHeader: versionHeader,
    });

    this.bind('feature-flags.options').to({
      supportedFlags: ['new-product-page', 'beta-analytics'],
    });
  }

  private setupComponents(): void {
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);
  }

  private setupServices(): void {
    this.service(RemoteConfigService);
    this.service(TenantService);
    this.service(NotificationService);
    this.service(UserNotificationService);
    this.service(EmailService);
    this.service(PermissionService);
  }

  private setupDataSources(): void {
    this.dataSource(PostgresqlDataSource);
    this.dataSource(KafkaDataSource);
    this.dataSource(RedisSessionDataSource);
    this.dataSource(RedisContentDataSource);
    this.dataSource(RedisCacheDataSource);
    this.dataSource(RedisQueueDataSource);
    this.dataSource(RedisLeaderboardDataSource);
    this.dataSource(RedisSecurityDataSource);
    this.dataSource(KmsDataSource);
  }

  private setupRepositories(): void {
    /*this.repository(ContactFormRepository);
    this.repository(EntityFileRepository);
    this.repository(EventRepository);
    this.repository(GlobalReviewRepository);
    this.repository(IncidentPartyRepository);
    this.repository(InspectionRepository);
    this.repository(InsuranceCalculationLogRepository);
    this.repository(LanguageRepository);
    this.repository(LocationRepository);
    this.repository(OauthProviderRepository);
    this.repository(RatingRepository);
    this.repository(ReactionRepository);
    this.repository(StatusHistoryRepository);
    this.repository(SupportTicketRepository);
    this.repository(User2FaBackupCodeRepository);
    this.repository(User2FaLoginLogRepository);
    this.repository(User2FaMethodRepository);
    this.repository(UserActivityLogRepository);
    this.repository(UserAuthRepository);
    this.repository(UserConsentRepository);
    this.repository(UserFileAccessRepository);
    this.repository(UserLoginHistoryRepository);
    this.repository(UserMetadataRepository);
    this.repository(UserNotificationPreferenceRepository);
    this.repository(UserOauthAccountRepository);
    this.repository(UserProfileRepository);
    this.repository(UserReportRepository);
    this.repository(UserWebauthnCredentialRepository);*/
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
  }

  private setupLifecycleAndBoot(): void {
    this.lifeCycleObserver(RemoteConfigObserver);
    this.lifeCycleObserver(AuditTrailMiddlewareProvider);
    this.controller(PingController);

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
  }

  private setupInterceptors(): void {
    if (process.env.NODE_ENV === 'production') {
      this.add(createBindingFromClass(EncryptionInterceptor));
    }
    this.add(createBindingFromClass(AuthorizationInterceptor));
  }
}
