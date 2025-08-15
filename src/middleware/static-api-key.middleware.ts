import {
  inject,
  injectable,
  Interceptor,
  InvocationContext,
  Next,
  Provider
} from '@loopback/core';
import {
  HttpErrors,
  Request,
  RestBindings
} from '@loopback/rest';

@injectable({
  tags: {
    key: 'middleware.staticApiKey'
  }
})
export class StaticApiKeyMiddlewareProvider implements Provider<Interceptor> {
  constructor(
    @inject(RestBindings.Http.REQUEST)
    private request: Request,
  ) { }

  value(): Interceptor {
    return this.intercept.bind(this);
  }

  async intercept(
    invocationCtx: InvocationContext,
    next: Next,
  ): Promise<any> {
    const apiKey = this.request.headers['x-api-key'];
    const expectedApiKey = process.env.STATIC_API_KEY;

    if (!apiKey || apiKey !== expectedApiKey) {
      throw new HttpErrors.Unauthorized('Invalid or missing API key.');
    }

    return next();
  }
}
