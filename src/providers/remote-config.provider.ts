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
      console.log('Attempting to fetch initial Remote Config values using server-side template...');
      const rc = this.firebaseAdmin.remoteConfig(this.firebaseAdmin.app());
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
      };

      console.log('Fetched Remote Config values:');
      console.log('maintenance_mode:', values.maintenance_mode);
      console.log('maintenance_message:', values.maintenance_message);
      console.log('redis_cache_expiry_seconds:', values.redis_cache_expiry_seconds);
      console.log('api_rate_limit_per_second:', values.api_rate_limit_per_second);
      console.log('max_file_upload_size_mb:', values.max_file_upload_size_mb);
      console.log('api_request_window_minutes:', values.api_request_window_minutes);

      cachedConfig = values;
      lastFetchTime = now;
      console.log('Successfully fetched and cached new Remote Config values.');
      return values;
    } catch (error) {
      console.error('Failed to fetch Remote Config template:', error);
      console.warn('Using default fallback Remote Config values.');
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
      api_request_window_minutes: 1
    };
  }

  private parseBoolean(value: string | undefined): boolean {
    return value === 'true';
  }

  private parseNumber(value: string | undefined): number {
    if (value === undefined) {
      return 0;
    }
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
}
