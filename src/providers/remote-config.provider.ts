import {bind, BindingScope, inject, injectable} from '@loopback/core';
import * as admin from 'firebase-admin';
import {FirebaseBindings} from '../keys';

export interface RemoteConfigParameters {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  redisCacheExpirySeconds: number;
  apiRateLimitPerSecond: number;
  maxFileUploadSizeMb: number;
  apiRequestWindowMinutes: number;
  retentionPeriodDays: number;
}

let cachedConfig: RemoteConfigParameters | null = null;
const CACHE_EXPIRY_MS = 5 * 60 * 1000;
let lastFetchTime = 0;

@injectable({scope: BindingScope.SINGLETON})
@bind({tags: 'remoteConfig'})
export class RemoteConfigService {
  private readonly firebaseAdmin: typeof admin;

  constructor(@inject(FirebaseBindings.ADMIN) firebaseAdmin: typeof admin) {
    this.firebaseAdmin = firebaseAdmin;
  }

  public async getConfigValues(): Promise<RemoteConfigParameters> {
    const now = Date.now();
    if (cachedConfig && now - lastFetchTime < CACHE_EXPIRY_MS) {
      return cachedConfig;
    }

    try {
      const rc = this.firebaseAdmin.remoteConfig();

      const template = rc.initServerTemplate();
      await template.load();

      const config = template.evaluate();

      const values: RemoteConfigParameters = {
        maintenanceMode: config.getBoolean('maintenance_mode'),
        maintenanceMessage: config.getString('maintenance_message'),
        redisCacheExpirySeconds: config.getNumber('redis_cache_expiry_seconds'),
        apiRateLimitPerSecond: config.getNumber('api_rate_limit_per_second'),
        maxFileUploadSizeMb: config.getNumber('max_file_upload_size_mb'),
        apiRequestWindowMinutes: config.getNumber('api_request_window_minutes'),
        retentionPeriodDays: config.getNumber('retention_period_days'),
      };

      cachedConfig = values;
      lastFetchTime = now;
      return values;
    } catch (error) {
      console.error('Failed to fetch Firebase Remote Config:', error);
      return this.getSafeDefaults();
    }
  }

  public getSafeDefaults(): RemoteConfigParameters {
    console.warn('Using default fallback Remote Config values.');
    return {
      maintenanceMode: false,
      maintenanceMessage: '',
      redisCacheExpirySeconds: 60,
      apiRateLimitPerSecond: 10,
      maxFileUploadSizeMb: 10,
      apiRequestWindowMinutes: 1,
      retentionPeriodDays: 30,
    };
  }
}
