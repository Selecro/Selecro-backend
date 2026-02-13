import {Next, Provider, inject} from '@loopback/core';
import {Middleware, MiddlewareContext, Request} from '@loopback/rest';

export interface FeatureFlagOptions {
  supportedFlags: string[];
}

declare module '@loopback/rest' {
  interface Request {
    features?: {[key: string]: boolean};
  }
}

export class FeatureFlagMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject('feature.flags.options', {optional: true})
    private opts: FeatureFlagOptions = {supportedFlags: []},
  ) {}

  value(): Middleware {
    return async (ctx: MiddlewareContext, next: Next) => {
      const req = ctx.request as Request;
      req.features = {};
      const enabledFlags = ((req.headers['x-feature-flags'] as string) || '')
        .split(',')
        .map(flag => flag.trim().toLowerCase())
        .filter(Boolean);

      for (const flag of this.opts.supportedFlags) {
        if (enabledFlags.includes(flag.toLowerCase())) {
          req.features[flag] = true;
        } else {
          req.features[flag] = false;
        }
      }

      await next();
    };
  }
}
