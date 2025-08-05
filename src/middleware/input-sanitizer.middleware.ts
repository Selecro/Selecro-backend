import {BindingScope, injectable, Provider} from '@loopback/core';
import {Middleware, MiddlewareContext, RequestContext} from '@loopback/rest';
import xss from 'xss';

@injectable({scope: BindingScope.TRANSIENT})
export class InputSanitizerMiddlewareProvider implements Provider<Middleware> {
  constructor() {
    console.log('InputSanitizerMiddlewareProvider initialized.');
  }

  value(): Middleware {
    return async (ctx: MiddlewareContext, next) => {
      const requestContext = ctx as RequestContext;
      const {request} = requestContext;
      const correlationId = requestContext.getSync('request.correlationId');
      console.log(`[${correlationId || 'N/A'}] InputSanitizerMiddleware: Processing request.`);

      if (request.body && typeof request.body === 'object') {
        request.body = this.deepSanitize(request.body);
        console.log(`[${correlationId || 'N/A'}] InputSanitizerMiddleware: Request body sanitized.`);
      }

      if (request.query && typeof request.query === 'object') {
        request.query = this.deepSanitize(request.query);
        console.log(`[${correlationId || 'N/A'}] InputSanitizerMiddleware: Query parameters sanitized.`);
      }

      const result = await next();
      console.log(`[${correlationId || 'N/A'}] InputSanitizerMiddleware: Request finished.`);
      return result;
    };
  }

  private deepSanitize(input: any): any {
    if (Array.isArray(input)) {
      return input.map(item => this.deepSanitize(item));
    } else if (typeof input === 'object' && input !== null) {
      const sanitizedObject: {[key: string]: any} = {};
      for (const key in input) {
        if (Object.prototype.hasOwnProperty.call(input, key)) {
          sanitizedObject[key] = this.deepSanitize(input[key]);
        }
      }
      return sanitizedObject;
    } else if (typeof input === 'string') {
      return xss(input);
    }

    return input;
  }
}
