import {
  inject
} from '@loopback/core';
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

    @inject('middleware.staticApiKey') private staticApiKeyMiddleware: Middleware,
    @inject('middleware.apiVersioning') private apiVersioningMiddleware: Middleware,
    @inject('middleware.maintenance') private maintenanceMiddleware: Middleware,
    @inject('middleware.rateLimit') private rateLimitMiddleware: Middleware,
    @inject('middleware.ipFilter') private ipFilterMiddleware: Middleware,
    @inject('middleware.correlationId') private correlationIdMiddleware: Middleware,
    @inject('middleware.geoip') private geoipMiddleware: Middleware,
    @inject('middleware.featureFlags') private featureFlagsMiddleware: Middleware,
    @inject('middleware.inputSanitizer') private inputSanitizerMiddleware: Middleware,
    @inject('middleware.cookieParser') private cookieParserMiddleware: Middleware,
    @inject('middleware.csrf') private csrfMiddleware: Middleware,
    @inject('middleware.hmac') private hmacMiddleware: Middleware,
    @inject('middleware.jwt-auth') private jwtAuthMiddleware: Middleware,
    @inject('middleware.session') private sessionMiddleware: Middleware,
    @inject('middleware.sessionGeoipUpdater') private sessionGeoipUpdaterMiddleware: Middleware,
    @inject('middleware.device') private deviceMiddleware: Middleware,
    @inject('middleware.tenant') private tenantMiddleware: Middleware,
    @inject('middleware.auditTrail') private auditTrailMiddleware: Middleware,
  ) { }

  async handle(context: RequestContext) {
    const {request, response} = context;
    const isProduction = process.env.NODE_ENV === 'production';

    const chain = [
      ...(isProduction ? [this.staticApiKeyMiddleware] : []),
      this.apiVersioningMiddleware,
      this.maintenanceMiddleware,
      this.rateLimitMiddleware,
      this.ipFilterMiddleware,
      this.correlationIdMiddleware,
      this.geoipMiddleware,
      this.featureFlagsMiddleware,
      this.inputSanitizerMiddleware,
      this.cookieParserMiddleware,
      this.deviceMiddleware,
      this.sessionMiddleware,
      this.sessionGeoipUpdaterMiddleware,
      this.jwtAuthMiddleware,
      ...(isProduction ? [this.hmacMiddleware] : []),
      this.csrfMiddleware,
      this.tenantMiddleware,
      this.auditTrailMiddleware,
    ];

    try {
      for (const middleware of chain) {
        await middleware(context, () => Promise.resolve());
      }

      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (error) {
      const correlationId = context.getSync('request.correlationId');
      console.error(`[${correlationId || 'N/A'}] Request POST /signup error:`, error);
      this.reject(context, error);
    }
  }
}
