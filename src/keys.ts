import {BindingKey} from '@loopback/core';
import cookieParser from 'cookie-parser';
import {CorsOptions} from 'cors';
import {IpFilterOptions, IpList} from 'express-ipfilter';
import {Options as RateLimitOptions} from 'express-rate-limit';
import * as admin from 'firebase-admin';

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
