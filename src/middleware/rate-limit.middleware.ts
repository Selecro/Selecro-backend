import {inject, Provider} from '@loopback/core';
import {Middleware, Request, Response} from '@loopback/rest';
import rateLimit, {Options as RateLimitOptions} from 'express-rate-limit';

type RateLimitHandler = (req: Request, res: Response, next: (err?: any) => any) => void;

export class RateLimitMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject('rateLimit.options', {optional: true})
    private options: Partial<RateLimitOptions> = {},
  ) {
    this.options = {
      windowMs: this.options.windowMs ?? 15 * 60 * 1000,
      max: this.options.max ?? 100,
      message: this.options.message ?? 'Too many requests from this IP, please try again after 15 minutes',
      standardHeaders: this.options.standardHeaders ?? true,
      legacyHeaders: this.options.legacyHeaders ?? false,
      ...this.options,
    };
  }

  value(): Middleware {
    const rateLimitHandler: RateLimitHandler = rateLimit(this.options);

    return async (ctx, next) => {
      await new Promise<void>((resolve, reject) => {
        rateLimitHandler(ctx.request, ctx.response, err => {
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
