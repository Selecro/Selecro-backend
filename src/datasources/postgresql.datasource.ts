import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  name: 'postgresql',
  connector: 'postgresql',
  url: process.env.POSTGRESQL_URL || undefined,
  host: process.env.POSTGRESQL_HOST || 'localhost',
  port: process.env.POSTGRESQL_PORT ? Number(process.env.POSTGRESQL_PORT) : 5432,
  user: process.env.POSTGRESQL_USER || undefined,
  password: process.env.POSTGRESQL_PASSWORD || undefined,
  database: process.env.POSTGRESQL_DATABASE || undefined,
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class PostgresqlDataSource
  extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'postgresql';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.postgresql', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
