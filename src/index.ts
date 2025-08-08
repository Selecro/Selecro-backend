import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {ApplicationConfig, SelecroBackendApplication} from './application';
import {PostgresqlDataSource} from './datasources';
dotenv.config();

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new SelecroBackendApplication(options);
  await app.boot();

  const dataSource = await app.get<PostgresqlDataSource>('datasources.postgresql');

  if (process.env.NODE_ENV !== 'production') {
    try {
      const tableCount = await dataSource.execute(`
        SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';
      `);

      if (tableCount[0].count === '0') {
        console.log('Database is empty. Starting full schema migration and seeding...');
        console.log('Dropping and recreating schema "public"...');
        try {
          await dataSource.execute('DROP SCHEMA public CASCADE;');
          await dataSource.execute('CREATE SCHEMA public;');
          console.log('Schema "public" dropped and recreated successfully.');
        } catch (err) {
          if (err.code === '42P06') {
            console.log('Schema "public" does not exist, creating it...');
            await dataSource.execute('CREATE SCHEMA public;');
          } else {
            console.error('Error dropping/recreating schema:', err);
            process.exit(1);
          }
        }

        const modelsInOrder = [
          'User',
          'File',
          'Badge',
          'News',
          'Tool',
          'EducationMode',
          'Dictionary',
          'Manual',
          'Permission',
          'Role',
          'ManualStep',
          'UserSetting',
          'UserLocation',
          'UserNotificationSetting',
          'UserSecurity',
          'Device',
          'LoginHistory',
          'TwoFactorAuthLog',
          'SystemLog',
          'TwoFactorAuthMethod',
          'PasswordHistory',
          'OauthAccount',
          'TwoFactorAuthBackupCode',
          'Notification',
          'Comment',
          'EducationStep',
          'UserFile',
          'UserRole',
          'Follower',
          'UserBadge',
          'NewsDelivery',
          'ManualProgress',
          'ManualPurchase',
          'UserManualInteraction',
          'Session',
          'RolePermission'
        ];

        for (const model of modelsInOrder) {
          console.log(`Migrating model: ${model}`);
          await app.migrateSchema({
            existingSchema: 'alter',
            models: [model],
          });
        }
        console.log('Schema migration completed.');

        const testDataPath = path.join(__dirname, '../test-data.sql');
        if (fs.existsSync(testDataPath)) {
          console.log('Seeding database with test data...');
          const sqlFile = fs.readFileSync(testDataPath, 'utf8');
          const sqlStatements = sqlFile.split(';').filter((s) => s.trim().length > 0);
          for (const sqlStatement of sqlStatements) {
            await dataSource.execute(sqlStatement);
          }
          console.log('Database seeding completed.');
        } else {
          console.warn('test-data.sql file not found. Skipping data seeding.');
        }
      }
    } catch (err) {
      console.error('Error during schema migration check:', err);
      process.exit(1);
    }
  }

  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  const defaultOrigin = `http://localhost:${process.env.APP_DEFAULT_PORT ?? '3000'}`;
  let corsOrigins: string[] | boolean = [defaultOrigin];

  if (process.env.CORS_ORIGINS) {
    if (process.env.CORS_ORIGINS === '*') {
      corsOrigins = true;
    } else {
      corsOrigins = process.env.CORS_ORIGINS.split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      if (corsOrigins.length === 0) {
        console.warn('CORS_ORIGINS environment variable was set but resulted in an empty list. Falling back to default origin.');
        corsOrigins = [defaultOrigin];
      }
    }
  }

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
      cors: {
        origin: corsOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
        allowedHeaders: [
          'Authorization',
          'Content-Type',
          'Origin',
          'X-Requested-With',
          'Accept',
        ],
        exposedHeaders: [
          'Authorization',
          'Content-Type',
          'Origin',
          'X-Requested-With',
          'Accept',
        ],
        maxAge: 60,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
