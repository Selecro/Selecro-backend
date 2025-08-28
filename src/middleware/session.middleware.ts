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
      if (sessionToken) {
        existingSession = await this.sessionRepository.findOne({where: {session_token: sessionToken}});
        if (!existingSession) {
          sessionToken = undefined;
        }
      }

      if (!sessionToken) {
        sessionToken = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const clientIp = this.request.headers['x-forwarded-for'] as string || this.request.ip;

        const newSessionData: any = {
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          is_active: true,
          user_agent: this.request.headers['user-agent'] ?? 'Unknown',
          ip_address: clientIp ?? '0.0.0.0',
        };

        if (deviceId) {
          newSessionData.device_id = deviceId;
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
          await this.sessionRepository.updateById(existingSession.id, {
            last_active: new Date().toISOString(),
          });
        }
      }

      await next();
    };
  }
}
