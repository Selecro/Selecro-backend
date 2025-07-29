
import {inject} from '@loopback/core';
import {
  FindRoute,
  InvokeMethod,
  Middleware,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) protected send: Send,
    @inject(SequenceActions.REJECT) protected reject: Reject,

    @inject('middleware.ipFilter') private ipFilterMiddleware: Middleware,
    @inject('middleware.correlationId') private correlationIdMiddleware: Middleware,
    @inject('middleware.cors') private corsMiddleware: Middleware,
    @inject('middleware.rateLimit') private rateLimitMiddleware: Middleware,
    @inject('middleware.cookieParser') private cookieParserMiddleware: Middleware,
    @inject('middleware.csrf') private csrfMiddleware: Middleware,
  ) { }

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;

      await this.ipFilterMiddleware(context, () => Promise.resolve());

      await this.correlationIdMiddleware(context, () => Promise.resolve());

      await this.corsMiddleware(context, () => Promise.resolve());

      await this.rateLimitMiddleware(context, () => Promise.resolve());

      await this.cookieParserMiddleware(context, () => Promise.resolve());

      await this.csrfMiddleware(context, () => Promise.resolve());

      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (error) {
      const correlationId = context.getSync('request.correlationId');
      console.error(`[${correlationId || 'N/A'}] Request error:`, error);
      this.reject(context, error);
    }
  }
}
