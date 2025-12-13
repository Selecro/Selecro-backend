import {
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  MetadataInspector,
  Provider,
} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {AUTHORIZE_METADATA_KEY} from '../decorators';
import {MyAuthBindings} from '../keys';
import {User} from '../models';
import {PermissionService} from '../services';

type NextFunction = () => Promise<InvocationResult>;

export class AuthorizationInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(MyAuthBindings.CURRENT_USER) private currentUser: User,
    @inject('services.PermissionService') private permissionService: PermissionService,
  ) { }

  /**
   * The core of the fix is here. The value() method returns an async function
   * that explicitly casts the `next` parameter to our custom `NextFunction` type.
   */
  value(): Interceptor {
    return async (invocationCtx, next) => {
      return this.intercept(invocationCtx, next as NextFunction);
    };
  }

  async intercept(
    invocationCtx: InvocationContext,
    next: NextFunction,) {
    const requiredPermissions = MetadataInspector.getMethodMetadata<string[]>(
      AUTHORIZE_METADATA_KEY,
      invocationCtx.target,
      invocationCtx.methodName) || [];

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return next();
    }

    if (!this.currentUser) {
      throw new HttpErrors.Unauthorized('User not authenticated');
    }

    const isAuthorized = await this.permissionService.checkPermissions(
      this.currentUser.id, requiredPermissions,
    );

    if (isAuthorized) {
      return next();
    } else {
      throw new HttpErrors.Forbidden('You do not have the required permissions');
    }
  }
}
