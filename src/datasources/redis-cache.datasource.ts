import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'RedisCache',
  connector: 'kv-redis',
  url: process.env.REDIS_URL ?? undefined,
  host: process.env.REDIS_HOST ?? 'localhost',
  port: process.env.REDIS_PORT_INTERNAL
    ? Number(process.env.REDIS_PORT_INTERNAL)
    : 6379,
  password: process.env.REDIS_PASSWORD ?? undefined,
  db: process.env.REDIS_CACHE_DB ? Number(process.env.REDIS_CACHE_DB) : 0,
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class RedisCacheDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'RedisCache';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.RedisCache', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
