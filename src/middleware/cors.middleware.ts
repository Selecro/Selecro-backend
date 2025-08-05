import {inject, Provider} from '@loopback/core';
import {Middleware, Request, Response} from '@loopback/rest';
import cors, {CorsOptions} from 'cors';
import {CORS_OPTIONS} from '../keys';

type CorsHandler = (req: Request, res: Response, next: (err?: any) => any) => void;

export class CorsMiddlewareProvider implements Provider<Middleware> {
  private corsHandler: CorsHandler;

  constructor(
    @inject(CORS_OPTIONS, {optional: true})
    private options: CorsOptions = {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    },
  ) {
    console.log('CORS Middleware initialized with:', this.options);
    this.corsHandler = cors(this.options);
  }

  value(): Middleware {
    return async (ctx, next) => {
      console.log('CORS Middleware processing request for:', ctx.request.url);
      await new Promise<void>((resolve, reject) => {
        this.corsHandler(ctx.request, ctx.response, err => {
          if (err) {
            console.error('CORS middleware error:', err.message);
            return reject(err);
          }
          resolve();
        });
      });
      return next();
    };
  }
}
