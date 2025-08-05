import {inject, Provider} from '@loopback/core';
import {Middleware, Request, Response} from '@loopback/rest';
import rateLimit from 'express-rate-limit';
import {RATE_LIMIT_OPTIONS, RateLimitConfig} from '../keys';

type RateLimitHandler = (req: Request, res: Response, next: (err?: any) => any) => void;

const DEFAULT_RATE_LIMIT_OPTIONS: Partial<RateLimitConfig> = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
};

export class RateLimitMiddlewareProvider implements Provider<Middleware> {
  private rateLimitHandler: RateLimitHandler;

  constructor(
    @inject(RATE_LIMIT_OPTIONS, {optional: true})
    private injectedOptions?: Partial<RateLimitConfig>,
  ) {
    const finalOptions: Partial<RateLimitConfig> = {
      ...DEFAULT_RATE_LIMIT_OPTIONS,
      ...this.injectedOptions,
    };
    this.rateLimitHandler = rateLimit(finalOptions);
  }

  value(): Middleware {
    return async (ctx, next) => {
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
