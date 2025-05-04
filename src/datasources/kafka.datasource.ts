import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'kafka',
  connector: 'kafka',                   // juggler will resolve this to loopback-connector-kafka :contentReference[oaicite:0]{index=0}
  connectionString: 'zookeeper:2181/kafka',  // or use hosts/brokers if your connector supports it
  disableMigration: true,               // skip this datasource during app.migrateSchema() :contentReference[oaicite:1]{index=1}
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

  constructor(
    @inject('datasources.config.kafka', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
