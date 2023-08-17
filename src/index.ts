import {BindingKey} from '@loopback/core';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import path from 'path';
import {ApplicationConfig, SelecroBackendApplication} from './application';
import {SocketController} from './controllers';
dotenv.config();

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new SelecroBackendApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  ////
  app.bind('controllers.YourController').toClass(SocketController);
  const yourController = await app.get<SocketController>(
    BindingKey.create<SocketController>('controllers.YourController'),
  );
  await yourController.start();
  ////

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.EXTPORT ?? 3000),
      host: process.env.HOST,
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
      protocol: 'https',
      key: fs.readFileSync(
        path.join(
          String(process.env.CERT_PATH),
          String(process.env.PRIVATE_KEY_FILE),
        ),
        'utf-8',
      ),
      cert: fs.readFileSync(
        path.join(String(process.env.CERT_PATH), String(process.env.CERT_FILE)),
        'utf-8',
      ),
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
