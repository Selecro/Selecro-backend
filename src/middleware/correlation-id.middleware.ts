import {inject, Provider} from '@loopback/core';
import {Middleware} from '@loopback/rest';
import {v4 as uuidv4} from 'uuid';
import {CorrelationIdBindings} from '../keys';

export class CorrelationIdMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject(CorrelationIdBindings.HEADER_NAME, {optional: true})
    private headerName = 'X-Request-ID',
  ) {
    console.log('Correlation ID middleware initialized');
  }

  value(): Middleware {
    return async (ctx, next) => {
      const {request, response} = ctx;
      let correlationId: string;
      const existingId = request.headers[this.headerName.toLowerCase()] as string;
      if (existingId) {
        correlationId = existingId;
      } else {
        correlationId = uuidv4();
      }
      ctx.bind(CorrelationIdBindings.CORRELATION_ID).to(correlationId);
      response.header(this.headerName, correlationId);
      console.log(`[${correlationId}] Incoming request: ${request.method} ${request.url}`);
      const result = await next();
      console.log(`[${correlationId}] Request finished: ${request.method} ${request.url} - Status: ${response.statusCode}`);
      return result;
    };
  }
}
