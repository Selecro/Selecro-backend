import {inject, Provider} from '@loopback/core';
import {Middleware} from '@loopback/rest';
import {RemoteConfigService} from '../providers';

export class MaintenanceMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject('services.RemoteConfigService')
    private remoteConfigService: RemoteConfigService,
  ) {}

  value(): Middleware {
    return async (ctx, next) => {
      const config = await this.remoteConfigService.getConfigValues();

      if (config?.maintenanceMode) {
        ctx.response.statusCode = 503;
        ctx.response.setHeader('Retry-After', '3600');
        ctx.response.end(
          config.maintenanceMessage ?? 'Service is temporarily unavailable.',
        );
        console.warn(
          `Application in maintenance mode. Message: ${config.maintenanceMessage}`,
        );
        return;
      }

      return next();
    };
  }
}
