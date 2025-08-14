import {bind, BindingScope, inject, injectable} from '@loopback/core';
import * as admin from 'firebase-admin';
import {FirebaseBindings} from '../keys';

export interface RemoteConfigParameters {
  maintenance_mode: boolean;
  maintenance_message: string;
  redis_cache_expiry_seconds: number;
  api_rate_limit_per_second: number;
  max_file_upload_size_mb: number;
  api_request_window_minutes: number;
  retention_period_days: number;
}

let cachedConfig: RemoteConfigParameters | null = null;
const CACHE_EXPIRY_MS = 5 * 60 * 1000;
let lastFetchTime = 0;

@injectable({scope: BindingScope.SINGLETON})
@bind({tags: 'remoteConfig'})
export class RemoteConfigService {
  private readonly firebaseAdmin: typeof admin;

  constructor(
    @inject(FirebaseBindings.ADMIN) firebaseAdmin: typeof admin
  ) {
    this.firebaseAdmin = firebaseAdmin;
  }

  public async getConfigValues(): Promise<RemoteConfigParameters> {
    const now = Date.now();
    if (cachedConfig && (now - lastFetchTime) < CACHE_EXPIRY_MS) {
      return cachedConfig;
    }

    try {
      const rc = this.firebaseAdmin.remoteConfig();

      const template = rc.initServerTemplate();
      await template.load();

      const config = template.evaluate();

      const values: RemoteConfigParameters = {
        maintenance_mode: config.getBoolean('maintenance_mode'),
        maintenance_message: config.getString('maintenance_message'),
        redis_cache_expiry_seconds: config.getNumber('redis_cache_expiry_seconds'),
        api_rate_limit_per_second: config.getNumber('api_rate_limit_per_second'),
        max_file_upload_size_mb: config.getNumber('max_file_upload_size_mb'),
        api_request_window_minutes: config.getNumber('api_request_window_minutes'),
        retention_period_days: config.getNumber('retention_period_days'),
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
      maintenance_mode: false,
      maintenance_message: '',
      redis_cache_expiry_seconds: 60,
      api_rate_limit_per_second: 10,
      max_file_upload_size_mb: 10,
      api_request_window_minutes: 1,
      retention_period_days: 30
    };
  }
}
