import {Next, Provider} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Middleware, MiddlewareContext, Request} from '@loopback/rest';
import geoip from 'geoip-lite';
import {SessionRepository} from '../repositories';

declare module '@loopback/rest' {
  interface Request {
    geo?: geoip.Lookup;
  }
}

export class SessionGeoipUpdaterMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @repository(SessionRepository)
    private sessionRepository: SessionRepository,
  ) { }

  value(): Middleware {
    return async (ctx: MiddlewareContext, next: Next) => {
      const req = ctx.request as Request;
      const cookies = (req as any).cookies;
      const sessionToken: string | undefined = cookies?.['session_token'];
      const geoData: geoip.Lookup | undefined = req.geo;

      if (sessionToken && geoData) {
        try {
          const session = await this.sessionRepository.findOne({where: {session_token: sessionToken}});
          if (session) {
            await this.sessionRepository.updateById(session.id, {
              country: geoData.country,
              region: geoData.region,
              city: geoData.city,
              latitude: geoData.ll[0],
              longitude: geoData.ll[1],
            });
          }
        } catch (error) {
          console.error('❌ Failed to update session with geo data:', error);
        }
      }

      await next();
    };
  }
}
