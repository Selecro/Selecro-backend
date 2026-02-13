import {Next, Provider} from '@loopback/core';
import {Middleware, MiddlewareContext, Request} from '@loopback/rest';
import geoip from 'geoip-lite';

declare module '@loopback/rest' {
  interface Request {
    geo?: geoip.Lookup;
  }
}

export class GeoipMiddlewareProvider implements Provider<Middleware> {
  value(): Middleware {
    return async (ctx: MiddlewareContext, next: Next) => {
      const req = ctx.request as Request;

      const ip = (req.headers['x-forwarded-for'] ??
        req.socket.remoteAddress) as string;

      if (ip) {
        const geo = geoip.lookup(ip);
        if (geo) {
          req.geo = geo;
        }
      }

      await next();
    };
  }
}
