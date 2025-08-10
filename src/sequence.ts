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

    @inject('middleware.maintenance') private maintenanceMiddleware: Middleware,
    @inject('middleware.rateLimit') private rateLimitMiddleware: Middleware,
    @inject('middleware.ipFilter') private ipFilterMiddleware: Middleware,
    @inject('middleware.correlationId') private correlationIdMiddleware: Middleware,
    @inject('middleware.inputSanitizer') private inputSanitizerMiddleware: Middleware,
    @inject('middleware.cookieParser') private cookieParserMiddleware: Middleware,
    @inject('middleware.csrf') private csrfMiddleware: Middleware,
    @inject('middleware.tenant') private tenantMiddleware: Middleware,
    @inject('middleware.hmac') private hmacMiddleware: Middleware,
  ) { }

  async handle(context: RequestContext) {
    const {request, response} = context;

    const runMiddleware = async (middleware: Middleware) => {
      let nextCalled = false;
      await middleware(context, () => {
        nextCalled = true;
        return Promise.resolve();
      });
      return nextCalled;
    };

    try {
      if (!(await runMiddleware(this.maintenanceMiddleware))) return;
      if (!(await runMiddleware(this.rateLimitMiddleware))) return;
      if (!(await runMiddleware(this.ipFilterMiddleware))) return;
      if (!(await runMiddleware(this.correlationIdMiddleware))) return;
      if (!(await runMiddleware(this.inputSanitizerMiddleware))) return;
      if (!(await runMiddleware(this.cookieParserMiddleware))) return;
      if (process.env.NODE_ENV === 'production') {
        if (!(await runMiddleware(this.hmacMiddleware))) return;
      }
      if (!(await runMiddleware(this.csrfMiddleware))) return;
      if (!(await runMiddleware(this.tenantMiddleware))) return;

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
