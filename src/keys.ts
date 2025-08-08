import {BindingKey} from '@loopback/core';
import cookieParser from 'cookie-parser';
import {CorsOptions} from 'cors';
import {IpFilterOptions, IpList} from 'express-ipfilter';
import {Options as RateLimitOptions} from 'express-rate-limit';
import * as admin from 'firebase-admin';
import {RemoteConfigParameters} from './providers/remote-config.provider';

export interface CookieParserOptions extends cookieParser.CookieParseOptions { }

export const COOKIE_PARSER_OPTIONS = BindingKey.create<CookieParserOptions | undefined>(
  'cookieParser.options',
);

export interface CsrfMiddlewareOptions extends CorsOptions { }

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
