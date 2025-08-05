import {inject, Provider} from '@loopback/core';
import {Middleware, Request, Response} from '@loopback/rest';
import csurf from 'csurf';
import {CSRF_OPTIONS, CsrfMiddlewareOptions} from '../keys';

type CsrfHandler = (req: Request, res: Response, next: (err?: any) => any) => void;

export class CsrfMiddlewareProvider implements Provider<Middleware> {
  private csrfHandler: CsrfHandler;

  constructor(
    @inject(CSRF_OPTIONS, {optional: true})
    private options: CsrfMiddlewareOptions = {},
  ) {
    this.csrfHandler = csurf({
      cookie: {
        key: 'selecro_csrf',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
      },
      ...this.options,
    });
  }

  value(): Middleware {
    return async (ctx, next) => {
      await new Promise<void>((resolve, reject) => {
        this.csrfHandler(ctx.request, ctx.response, err => {
          if (err) {
            if (err.code === 'EBADCSRFTOKEN') {
              console.error('CSRF middleware error: Invalid CSRF token.');
              ctx.response.status(403).send('Invalid CSRF token');
              return reject(err);
            }
            console.error('CSRF middleware error:', err.message);
            return reject(err);
          }
          resolve();
        });
      });

      const csrfToken = (ctx.request as any).csrfToken();
      ctx.response.header('X-CSRF-Token', csrfToken);

      return next();
    };
  }
}
