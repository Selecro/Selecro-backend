import {BindingScope, injectable, Provider} from '@loopback/core';
import {Middleware, MiddlewareContext, RequestContext} from '@loopback/rest';
import xss from 'xss';

@injectable({scope: BindingScope.TRANSIENT})
export class InputSanitizerMiddlewareProvider implements Provider<Middleware> {
  constructor() { }

  value(): Middleware {
    return async (ctx: MiddlewareContext, next) => {
      const requestContext = ctx as RequestContext;
      const {request} = requestContext;

      if (request.body && typeof request.body === 'object') {
        request.body = this.deepSanitize(request.body);
      }

      if (request.query && typeof request.query === 'object') {
        request.query = this.deepSanitize(request.query);
      }

      const result = await next();
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
