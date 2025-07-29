import {inject, Provider} from '@loopback/core';
import {Middleware, Request, Response} from '@loopback/rest';
import cors, {CorsOptions} from 'cors';

type CorsHandler = (req: Request, res: Response, next: (err?: any) => any) => void;

const corsHandlerFactory = (allowedOrigins: string[]): CorsHandler => {
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS policy did not allow access from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['WWW-Authenticate', 'X-Total-Count', 'Link'],
  };

  return cors(corsOptions);
};


export class CorsMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject('cors.allowedOrigins', {optional: true})
    private allowedOrigins: string[] = [],
  ) { }

  value(): Middleware {
    const corsHandler = corsHandlerFactory(this.allowedOrigins);

    return async (ctx, next) => {
      await new Promise<void>((resolve, reject) => {
        corsHandler(ctx.request, ctx.response, err => {
          if (err) {
            console.error('CORS error:', err.message);
            return reject(err);
          }
          resolve();
        });
      });

      return next();
    };
  }
}
