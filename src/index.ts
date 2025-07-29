import {juggler} from '@loopback/repository';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import {ApplicationConfig, SelecroBackendApplication} from './application';
dotenv.config();

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new SelecroBackendApplication(options);
  await app.boot();

  if (process.env.NODE_ENV !== 'production') {
    console.log('Running schema migration for the main relational database (existingSchema: "alter")...');
    try {
      const postgresqlDataSource = await app.get<juggler.DataSource>('datasources.postgresql');
      await postgresqlDataSource.autoupdate?.();
      console.log('Schema migration for "postgresql" datasource completed.');
    } catch (error) {
      console.error('Error migrating "postgresql" datasource:', error);
    }
  }

  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.APP_DEFAULT_PORT ?? 3000),
      host: process.env.APP_DEFAULT_HOST ?? '0.0.0.0',
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
