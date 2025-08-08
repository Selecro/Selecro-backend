import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as dotenv from 'dotenv';
dotenv.config();

const protocol = process.env.VAULT_PROTOCOL || 'http';
const host = process.env.VAULT_HOST || 'localhost';
const port = process.env.VAULT_PORT ? Number(process.env.VAULT_PORT) : 8200;

const config = {
  name: 'kms',
  connector: 'rest',
  baseURL: `${protocol}://${host}:${port}`,
  crud: false,
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class KmsDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'kms';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.kms', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
