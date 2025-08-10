import {Next, Provider} from '@loopback/core';
import {Middleware, MiddlewareContext} from '@loopback/rest';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config();

const HMAC_SECRET = process.env.API_HMAC_SECRET || 'changeme';
const SIGNATURE_HEADER = 'x-signature';
const TIMESTAMP_HEADER = 'x-timestamp';

export class HmacMiddlewareProvider implements Provider<Middleware> {
  value(): Middleware {
    return async (ctx: MiddlewareContext, next: Next) => {
      const req = ctx.request;

      const signature = req.headers[SIGNATURE_HEADER] as string | undefined;
      const timestamp = req.headers[TIMESTAMP_HEADER] as string | undefined;

      if (!signature || !timestamp) {
        ctx.response.status(401).send({error: 'Missing signature or timestamp'});
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const requestTime = parseInt(timestamp, 10);
      if (isNaN(requestTime) || Math.abs(now - requestTime) > 300) {
        ctx.response.status(401).send({error: 'Request expired'});
        return;
      }

      const bodyString =
        typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body ?? {});
      const method = req.method.toUpperCase();
      const path = req.path;

      const message = `${timestamp}:${method}:${path}:${bodyString}`;
      const expectedSignature = crypto.createHmac('sha256', HMAC_SECRET).update(message).digest('hex');

      if (signature !== expectedSignature) {
        ctx.response.status(401).send({error: 'Invalid signature'});
        return;
      }

      return next();
    };
  }
}
