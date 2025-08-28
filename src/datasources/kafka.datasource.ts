import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as dotenv from 'dotenv';
import {Kafka} from 'kafkajs';
dotenv.config();

const kafkaHost = process.env.KAFKA_HOST || 'localhost';
const kafkaPort = process.env.KAFKA_PORT || '9092';

const config = {
  name: 'kafka',
  connector: 'kafka',
  connectionString: `${kafkaHost}:${kafkaPort}`,
  disableMigration: true,
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class KafkaDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'kafka';
  static readonly defaultConfig = config;

  public client: Kafka;

  constructor(
    @inject('datasources.config.kafka', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
    this.client = new Kafka({
      clientId: 'loopback-app',
      brokers: [config.connectionString],
    });
  }
}
