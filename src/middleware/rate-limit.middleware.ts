import {inject, Provider} from '@loopback/core';
import {Middleware, Request, Response} from '@loopback/rest';
import rateLimit from 'express-rate-limit';
import {RATE_LIMIT_OPTIONS, RateLimitConfig} from '../keys';
import {RemoteConfigParameters, RemoteConfigService} from '../providers/remote-config.provider';

type RateLimitHandler = (req: Request, res: Response, next: (err?: any) => any) => void;

const DEFAULT_RATE_LIMIT_OPTIONS: Partial<RateLimitConfig> = {
  windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
};

export class RateLimitMiddlewareProvider implements Provider<Middleware> {
  private rateLimitHandler: RateLimitHandler;
  private isInitialized: Promise<void>;
  constructor(
    @inject(RATE_LIMIT_OPTIONS, {optional: true})
    private injectedOptions: Partial<RateLimitConfig> = {},
    @inject('services.RemoteConfigService')
    private remoteConfigService: RemoteConfigService,
  ) {
    this.isInitialized = this.initializeRateLimit();
  }

  private async initializeRateLimit(): Promise<void> {
    try {
      const remoteConfig: RemoteConfigParameters = await this.remoteConfigService.getConfigValues();

      const windowMsFromConfig = remoteConfig.api_request_window_minutes * 60 * 1000;
      const maxFromConfig = remoteConfig.api_rate_limit_per_second;

      const finalOptions: Partial<RateLimitConfig> = {
        ...DEFAULT_RATE_LIMIT_OPTIONS,
        ...this.injectedOptions,
        windowMs: windowMsFromConfig,
        max: maxFromConfig,
      };

      console.log('Rate Limit Middleware initialized with:', {
        windowMs: finalOptions.windowMs,
        max: finalOptions.max
      });

      this.rateLimitHandler = rateLimit(finalOptions);
    } catch (error) {
      console.error('Failed to initialize Rate Limit Middleware with Remote Config:', error);
      this.rateLimitHandler = rateLimit(DEFAULT_RATE_LIMIT_OPTIONS);
      console.warn('Rate Limit Middleware falling back to default options.');
    }
  }

  value(): Middleware {
    return async (ctx, next) => {
      await this.isInitialized;

      await new Promise<void>((resolve, reject) => {
        this.rateLimitHandler(ctx.request, ctx.response, err => {
          if (err) {
            console.error('Rate Limit middleware error:', err.message);
            return reject(err);
          }
          resolve();
        });
      });
      return next();
    };
  }
}
