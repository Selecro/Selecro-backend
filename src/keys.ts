import {BindingKey} from '@loopback/core';
import cookieParser from 'cookie-parser';
import {CorsOptions} from 'cors';
import {CookieOptions} from 'csurf';
import {IpFilterOptions, IpList} from 'express-ipfilter';
import {Options as RateLimitOptions} from 'express-rate-limit';
import * as admin from 'firebase-admin';
import {User} from './models';
import {RemoteConfigParameters} from './providers';
import {
  EmailService,
  FirebaseAdminService,
  NotificationService
} from './services';
import {FirebaseOauthStrategy} from './strategies';

export interface CookieParserOptions extends cookieParser.CookieParseOptions { }

export const COOKIE_PARSER_OPTIONS = BindingKey.create<CookieParserOptions | undefined>(
  'cookieParser.options',
);

export interface CsrfMiddlewareOptions extends CorsOptions {
  cookie?: CookieOptions;
}

export const CSRF_OPTIONS = BindingKey.create<CsrfMiddlewareOptions | undefined>(
  'csrf.options',
);

export const CORS_OPTIONS = BindingKey.create<CorsOptions | undefined>(
  'cors.options',
);

export const CORRELATION_ID_BINDING_KEY = BindingKey.create<string>(
  'request.correlationId',
);

export const CORRELATION_ID_HEADER_KEY = BindingKey.create<string>(
  'middleware.correlationId.headerName',
);

export namespace CorrelationIdBindings {
  export const CORRELATION_ID = CORRELATION_ID_BINDING_KEY;
  export const HEADER_NAME = CORRELATION_ID_HEADER_KEY;
}

export interface RateLimitConfig extends RateLimitOptions { }

export const RATE_LIMIT_OPTIONS = BindingKey.create<Partial<RateLimitConfig> | undefined>(
  'rateLimit.options',
);

export const IP_FILTER_IPS = BindingKey.create<IpList | undefined>(
  'ipFilter.ips',
);

export const IP_FILTER_OPTIONS = BindingKey.create<IpFilterOptions | undefined>(
  'ipFilter.options',
);

export namespace IpFilterBindings {
  export const IP_LIST = IP_FILTER_IPS;
  export const OPTIONS = IP_FILTER_OPTIONS;
}

export namespace FirebaseBindings {
  export const ADMIN = BindingKey.create<typeof admin>('services.firebase.admin');
  export const OAUTH_STRATEGY = BindingKey.create<FirebaseOauthStrategy>('authentication.strategies.firebase-oauth');
  export const ADMIN_SERVICE = BindingKey.create<FirebaseAdminService>('services.FirebaseAdminService');
}

export namespace RemoteConfigBindings {
  export const CONFIG = BindingKey.create<RemoteConfigParameters>('services.remoteConfig.config');
  export const MAINTENANCE_MODE = BindingKey.create<boolean>('services.remoteConfig.maintenanceMode');
  export const MAINTENANCE_MESSAGE = BindingKey.create<string>('services.remoteConfig.maintenanceMessage');
  export const API_RATE_LIMIT_PER_SECOND = BindingKey.create<number>('services.remoteConfig.apiRateLimitPerSecond');
  export const API_REQUEST_WINDOW_MINUTES = BindingKey.create<number>('services.remoteConfig.apiRequestWindowMinutes');
  export const MAX_FILE_UPLOAD_SIZE_MB = BindingKey.create<number>('services.remoteConfig.maxFileUploadSizeMb');
  export const REDIS_CACHE_EXPIRY_SECONDS = BindingKey.create<number>('services.remoteConfig.redisCacheExpirySeconds');
}

export namespace NotificationBindings {
  export const NOTIFICATION_SERVICE = BindingKey.create<NotificationService>('services.NotificationService');
  export const EMAIL_SERVICE = BindingKey.create<EmailService>('services.EmailService');
}

export const TENANT_BINDING_KEY = BindingKey.create<string>('tenant.id');

export namespace MyAuthBindings {
  export const CURRENT_USER = BindingKey.create<User>('authentication.current-user');
}
