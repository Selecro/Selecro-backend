import {inject, Provider} from '@loopback/core';
import {Middleware} from '@loopback/rest';
import {RemoteConfigService} from '../providers/remote-config.provider';

export class MaintenanceMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject('services.RemoteConfigService')
    private remoteConfigService: RemoteConfigService,
  ) { }

  value(): Middleware {
    return async (ctx, next) => {
      const config = await this.remoteConfigService.getConfigValues();

      if (config?.maintenance_mode) {
        ctx.response.statusCode = 503; ctx.response.setHeader('Retry-After', '3600');
        ctx.response.end(config.maintenance_message || 'Service is temporarily unavailable.');
        console.warn(`Application in maintenance mode. Message: ${config.maintenance_message}`);
        return;
      }

      return next();
    };
  }
}
