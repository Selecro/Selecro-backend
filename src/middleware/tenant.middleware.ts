import {
  Next,
  Provider,
  injectable
} from '@loopback/core';
import {
  Middleware,
  MiddlewareContext,
  Request,
  RestBindings
} from '@loopback/rest';
import {
  TENANT_BINDING_KEY
} from '../keys';

const DEFAULT_TENANT_ID = 'default_tenant';

@injectable()
export class TenantResolverMiddlewareProvider implements Provider<Middleware> {
  constructor() { }

  value(): Middleware {
    return async (context: MiddlewareContext, next: Next) => {

      const request = await context.get<Request>(RestBindings.Http.REQUEST);

      const tenantId = request.headers['x-tenant-id'];

      let resolvedTenantId: string | undefined = Array.isArray(tenantId) ? tenantId[0] : tenantId;

      if (!resolvedTenantId) {
        resolvedTenantId = DEFAULT_TENANT_ID;
      }

      context.bind(TENANT_BINDING_KEY).to(resolvedTenantId);

      const result = await next();

      return result;
    };
  }
}
