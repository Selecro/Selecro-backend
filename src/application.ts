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
import {CookieParserMiddlewareProvider, CorrelationIdMiddlewareProvider, CorsMiddlewareProvider, CsrfMiddlewareProvider, IpFilterMiddlewareProvider, RateLimitMiddlewareProvider} from './middleware';
import {BadgeRepository, CommentRepository, DeviceRepository, DictionaryRepository, EducationModeRepository, EducationStepRepository, FileRepository, FollowerRepository, LoginHistoryRepository, ManualProgressRepository, ManualPurchaseRepository, ManualRepository, ManualStepRepository, NewsDeliveryRepository, NewsRepository, NotificationRepository, OAuthAccountRepository, PasswordHistoryRepository, PermissionRepository, RolePermissionRepository, RoleRepository, SessionRepository, SystemLogRepository, ToolRepository, TwoFactorAuthBackupCodeRepository, TwoFactorAuthLogRepository, TwoFactorAuthMethodRepository, UserBadgeRepository, UserFileRepository, UserLocationRepository, UserManualInteractionRepository, UserNotificationSettingRepository, UserRoleRepository, UserSecurityRepository, UserSettingRepository} from './repositories';
import {MySequence} from './sequence';
dotenv.config();

export {ApplicationConfig};

function helmetMiddlewareFactory() {
  return helmet();
}

export class SelecroBackendApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    this.restServer.expressMiddleware(helmetMiddlewareFactory);

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
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
    this.repository(OAuthAccountRepository);
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

    /*this.component(AuthorizationComponent);
    this.configure(AuthorizationBindings.COMPONENT).to({
      defaultDecision: AuthorizationDecision.DENY,
      precedence: AuthorizationDecision.DENY,
    });

    this.bind('authorizationProviders.my-authorizer-provider')
      .toProvider(MyAuthorizerProvider)
      .tag(AuthorizationTags.AUTHORIZER);*/

    // 1. IP Filter (Should be one of the very first middlewares)
    const allowedIps = process.env.ALLOWED_IPS?.split(',').map(s => s.trim()) || [];
    const deniedIps = process.env.DENIED_IPS?.split(',').map(s => s.trim()) || [];
    this.bind('ipFilter.ips').to([...deniedIps]);
    this.bind('ipFilter.options').to({
      mode: 'deny',
      log: true,
      logLevel: 'deny',
    });
    this.bind('ipFilter.forbiddenMessage').to('403 Forbidden: Access denied from your IP address.');
    this.bind('middleware.ipFilter').toProvider(IpFilterMiddlewareProvider);

    // 2. Correlation ID (Runs very early to establish ID for logging/tracing)
    this.bind('middleware.correlationId').toProvider(CorrelationIdMiddlewareProvider);

    // 3. CORS
    const defaultHost = process.env.APP_DEFAULT_HOST ?? 'localhost';
    const defaultPort = process.env.APP_DEFAULT_PORT ?? '3000';
    const defaultOrigin = `http://${defaultHost}:${defaultPort}`;
    const corsOrigins = process.env.CORS_ORIGINS?.split(',').map(s => s.trim()) ?? [defaultOrigin];
    this.bind('cors.allowedOrigins').to(corsOrigins);
    this.bind('middleware.cors').toProvider(CorsMiddlewareProvider);

    // 4. Rate Limiting
    const rateLimitConfig = {
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again after 15 minutes.',
    };
    this.bind('rateLimit.options').to(rateLimitConfig);
    this.bind('middleware.rateLimit').toProvider(RateLimitMiddlewareProvider);

    // 5. Cookie Parser (REQUIRED for CSRF)
    const cookieParserSecret = process.env.COOKIE_PARSER_SECRET || 'your-super-secret-key-please-change-this';
    if (cookieParserSecret === 'your-super-secret-key-please-change-this' && process.env.NODE_ENV === 'production') {
      console.warn('WARNING: COOKIE_PARSER_SECRET is not set in production. Please set a strong, unique secret!');
    }
    this.bind('cookieParser.secret').to(cookieParserSecret);
    this.bind('middleware.cookieParser').toProvider(CookieParserMiddlewareProvider);

    // 6. CSRF Middleware
    const csrfOptions: csurf.CookieOptions = {
      //domain: '.yourdomain.com', // If your app spans multiple subdomains
      //path: '/api', // If CSRF token is only for a specific path
      //maxAge: 3600, // Cookie expiry in seconds
    };
    this.bind('csrf.options').to(csrfOptions);
    this.bind('middleware.csrf').toProvider(CsrfMiddlewareProvider);

    /*this.bind('services.jwt.service').toClass(JWTService);
    this.bind('authentication.jwt.expiresIn').to('32d');
    this.bind('authentication.jwt.secret').to(process.env.JWT_SECRET);
    this.bind('services.hasher').toClass(BcryptHasher);
    this.bind('services.hasher.rounds').to(10);
    this.bind('services.user.service').toClass(MyUserService);
    this.bind('services.email').toClass(EmailService);
    this.bind('services.vault').toClass(VaultService);*/

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
