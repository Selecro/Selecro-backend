import {inject, Provider} from '@loopback/core';
import {Middleware, Request, Response} from '@loopback/rest';
import cookieParser from 'cookie-parser';
import {COOKIE_PARSER_OPTIONS, CookieParserOptions} from '../keys';

type CookieParserHandler = (req: Request, res: Response, next: (err?: any) => any) => void;

export class CookieParserMiddlewareProvider implements Provider<Middleware> {
  private cookieParserHandler: CookieParserHandler;

  constructor(
    @inject('cookieParser.secret', {optional: true})
    private secret: string | string[] = '',
    @inject(COOKIE_PARSER_OPTIONS, {optional: true})
    private options: CookieParserOptions = {},
  ) {
    if (!this.secret || this.secret.length === 0) {
      console.warn('WARNING: Cookie Parser secret is not set. Signed cookies will not work properly.');
      console.warn('  Please bind `cookieParser.secret` in application.ts with a strong, unique secret.');
    }

    console.log('Cookie Parser Middleware initialized');
    this.cookieParserHandler = cookieParser(this.secret, this.options);
  }

  value(): Middleware {
    return async (ctx, next) => {
      await new Promise<void>((resolve, reject) => {
        this.cookieParserHandler(ctx.request, ctx.response, err => {
          if (err) {
            console.error('Cookie Parser middleware error:', err.message);
            return reject(err);
          }
          resolve();
        });
      });

      return next();
    };
  }
}
