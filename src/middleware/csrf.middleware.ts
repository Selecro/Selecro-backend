import {inject, Provider} from '@loopback/core';
import {Middleware, Request, Response} from '@loopback/rest';
import csurf from 'csurf';

type CsrfHandler = (req: Request, res: Response, next: (err?: any) => any) => void;

export class CsrfMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject('csrf.options', {optional: true})
    private options: csurf.CookieOptions | undefined = undefined,
  ) { }

  value(): Middleware {
    const csrfHandler: CsrfHandler = csurf({
      cookie: {
        key: '_csrf',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        ...this.options,
      },
    });

    return async (ctx, next) => {
      await new Promise<void>((resolve, reject) => {
        csrfHandler(ctx.request, ctx.response, err => {
          if (err) {
            console.error('CSRF middleware error:', err.message);
            return reject(err);
          }
          resolve();
        });
      });

      if (ctx.request.method === 'GET' || ctx.request.method === 'HEAD' || ctx.request.method === 'OPTIONS') {
        ctx.response.header('X-CSRF-Token', (ctx.request as any).csrfToken());
      }

      return next();
    };
  }
}
