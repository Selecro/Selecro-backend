import {inject, Provider} from '@loopback/core';
import {Middleware} from '@loopback/rest';
import {RemoteConfigParameters, RemoteConfigService} from '../providers/remote-config.provider';

export class MaintenanceMiddlewareProvider implements Provider<Middleware> {
  private isInitialized: Promise<void>;
  private currentRemoteConfig: RemoteConfigParameters | null = null;

  constructor(
    @inject('services.RemoteConfigService')
    private remoteConfigService: RemoteConfigService,
  ) {
    this.isInitialized = this.initializeMaintenanceMode();
  }

  private async initializeMaintenanceMode(): Promise<void> {
    try {
      this.currentRemoteConfig = await this.remoteConfigService.getConfigValues();
      console.log('Maintenance Middleware initialized with:', {
        maintenance_mode: this.currentRemoteConfig.maintenance_mode,
        maintenance_message: this.currentRemoteConfig.maintenance_message,
      });
    } catch (error) {
      console.error('Failed to initialize Maintenance Middleware with Remote Config:', error);
      this.currentRemoteConfig = await this.remoteConfigService.getSafeDefaults();
      console.warn('Maintenance Middleware falling back to default options.');
    }
  }

  value(): Middleware {
    return async (ctx, next) => {
      await this.isInitialized;

      if (this.currentRemoteConfig?.maintenance_mode) {
        ctx.response.statusCode = 503;
        ctx.response.setHeader('Retry-After', '3600');
        ctx.response.end(this.currentRemoteConfig.maintenance_message || 'Service is temporarily unavailable.');
        console.warn(`Application in maintenance mode. Message: ${this.currentRemoteConfig.maintenance_message}`);
        return;
      }

      return next();
    };
  }
}
