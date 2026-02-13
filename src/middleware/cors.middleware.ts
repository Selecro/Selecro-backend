import {inject, Provider} from '@loopback/core';
import {Middleware} from '@loopback/rest';
import cors, {CorsOptions} from 'cors';
import {CORS_OPTIONS} from '../keys';

const getOrigin = () => {
  const origin = process.env.CORS_ORIGIN;
  if (!origin) return false;
  if (origin === '*') return '*';
  return origin.split(',');
};

export class CorsMiddlewareProvider implements Provider<Middleware> {
  private corsHandler: any;

  constructor(
    @inject(CORS_OPTIONS, {optional: true})
    private options: CorsOptions = {
      origin: getOrigin(),
      credentials: true,
      methods: process.env.CORS_METHODS?.split(',') ?? ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
    },
  ) {
    this.corsHandler = cors(this.options);
  }

  value(): Middleware {
    return async (ctx, next) => {
      await new Promise<void>((resolve, reject) => {
        this.corsHandler(ctx.request, ctx.response, (err: any) => {
          if (err) return reject(err);
          resolve();
        });
      });
      return next();
    };
  }
}
