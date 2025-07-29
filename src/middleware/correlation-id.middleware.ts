import {Provider} from '@loopback/core';
import {Middleware} from '@loopback/rest';
import {v4 as uuidv4} from 'uuid';

export class CorrelationIdMiddlewareProvider implements Provider<Middleware> {
  constructor() { }

  value(): Middleware {
    return async (ctx, next) => {
      const {request, response} = ctx;
      let correlationId: string;

      const existingId = request.headers['x-request-id'] as string;

      if (existingId) {
        correlationId = existingId;
      } else {
        correlationId = uuidv4();
      }

      ctx.bind('request.correlationId').to(correlationId);

      response.header('X-Request-ID', correlationId);

      console.log(`[${correlationId}] Incoming request: ${request.method} ${request.url}`);

      const result = await next();

      console.log(`[${correlationId}] Request finished: ${request.method} ${request.url} - Status: ${response.statusCode}`);

      return result;
    };
  }
}
