import {inject, Provider} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Middleware, Request, Response, RestBindings} from '@loopback/rest';
import {v4 as uuidv4} from 'uuid';
import {SessionRepository} from '../repositories';

declare module '@loopback/rest' {
  interface Request {
    deviceId?: string;
  }
}

export class SessionMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
    @repository(SessionRepository)
    private sessionRepository: SessionRepository,
  ) { }

  value(): Middleware {
    return async (ctx, next) => {
      const cookies = (this.request as any).cookies;
      let sessionToken: string | undefined = cookies?.['session_token'];

      const deviceId: string | undefined = this.request.deviceId;

      let existingSession;

      /*if (sessionToken && sessionToken.length > 0) {
        try {
          existingSession = await this.sessionRepository.findOne({where: {sessionToken: sessionToken}});
        } catch (error) {
          console.error('SessionMiddleware: Failed to query existing session by token:', error);
        }
      }*/

      if (!sessionToken) {
        sessionToken = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const clientIp = this.request.headers['x-forwarded-for'] as string || this.request.ip;

        const uniqueId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 10000);

        const newSessionData: any = {
          id: uniqueId,
          sessionToken: sessionToken,
          expiresAt: expiresAt.toISOString(),
          isActive: true,
          userAgent: this.request.headers['user-agent'] ?? 'Unknown',
          ipAddress: clientIp ?? '0.0.0.0',
          loginAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          cookieConsent: false,
        };

        if (deviceId) {
          newSessionData.deviceId = deviceId;
        }

        try {
          await this.sessionRepository.create(newSessionData);

          let cookieHeader = `session_token=${sessionToken}; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
          if (process.env.NODE_ENV === 'production') {
            cookieHeader += '; Secure; HttpOnly; SameSite=Lax';
          } else {
            cookieHeader += '; HttpOnly; SameSite=Lax';
          }
          this.response.setHeader('Set-Cookie', cookieHeader);
        } catch (error) {
          console.error('Failed to create new session:', error);
        }
      } else {
        if (existingSession) {
          /*await this.sessionRepository.updateById(existingSession.id, {
            last_active: new Date().toISOString(),
          });*/
        }
      }

      await next();
    };
  }
}
