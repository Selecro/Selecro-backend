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
          'Language',
          'Device',
          'Session',
          'File',
          'UserProfile',
          'UserSetting',
          'UserConsent',
          'UserNotificationPreference',
          "UserAuth",
          'UserPoint',
          'UserMetadata',
          'PointTransaction',
          'PasswordHistory',
          'UserActivityLog',
          'OauthProvider',
          'UserOauthAccount',
          'User_2faMethod',
          'User_2faBackupCode',
          'UserLoginHistory',
          'User_2faLoginLog',
          'Follower',
          'UserReport',
          'UserFileAccess',
          'UserWebauthnCredential',
          'News',
          'Notification',
          'Role',
          'Permission',
          'RolePermission',
          'UserRole',
          'Forum',
          'Thread',
          'SupportTicket',
          'Tool',
          'Dictionary',
          'EducationMode',
          'EducationStep',
          'Manual',
          'ManualStep',
          'ProductType',
          'Product',
          'Comment',
          'StatusHistory',
          'Rating',
          'EntityFile',
          'Reaction',
          'ProgressTracking',
          'UserManualInteraction',
          'Theme',
          'Category',
          'ManualProductTheme',
          'ManualProductCategory',
          'Inventory',
          'Cart',
          'CartItem',
          'SavedCart',
          'Wishlist',
          'Order',
          'OrderItem',
          'Payment',
          'DiscountCode',
          'OrderDiscount',
          'Refund',
        ];

        console.log('Migrating all models...');
        await app.migrateSchema({
          existingSchema: 'alter',
          models: modelsInOrder,
        });
        console.log('All models migrated successfully.');

        const checkConstraints: {[key: string]: string} = {
          User: `
      ALTER TABLE public.user ADD CONSTRAINT check_username_length
      CHECK (LENGTH(username) >= 3 AND LENGTH(username) <= 30);
      ALTER TABLE public.user ADD CONSTRAINT check_email_format
      CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$');
      -- NOTE: 'account_status' check is already in the original SQL as a column default/logic,
      -- but for completeness, adding an explicit one if it was missed in the initial CREATE.
      ALTER TABLE public.user ADD CONSTRAINT chk_user_account_status
      CHECK (account_status IN ('active', 'suspended', 'deleted', 'pending_verification'));
    `,
          UserProfile: `
      ALTER TABLE public.user_profile ADD CONSTRAINT valid_status
      CHECK (status IN ('online', 'away', 'busy', 'offline'));
    `,
          UserAuth: `
      ALTER TABLE public.user_auth ADD CONSTRAINT check_recovery_email_format
      CHECK (recovery_email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$');
    `,
          UserPoint: `
      ALTER TABLE public.user_point ADD CONSTRAINT non_negative_balance
      CHECK (balance >= 0);
    `,
          File: `
      ALTER TABLE public.file ADD CONSTRAINT check_file_category
      CHECK (file_category IN ('profile_picture', 'user_document', 'system_document', 'other', 'contract'));
    `,
          User2faMethod: `
      ALTER TABLE public.user_2fa_method ADD CONSTRAINT valid_2fa_method
      CHECK (method IN ('authenticator', 'sms', 'email', 'security_key'));
    `,
          Follower: `
      ALTER TABLE public.follower ADD CONSTRAINT valid_status
      CHECK (status IN ('pending', 'approved'));
    `,
          UserReport: `
      ALTER TABLE public.user_report ADD CONSTRAINT check_status
      CHECK (status IN ('pending', 'approved', 'rejected'));
    `,
          News: `
      ALTER TABLE public.news ADD CONSTRAINT check_status
      CHECK (status IN ('draft', 'published', 'scheduled', 'archived'));
    `,
          Notification: `
      ALTER TABLE public.notification ADD CONSTRAINT check_notification_type
      CHECK (notification_type IN ('info', 'warning', 'error', 'success', 'promotion', 'activity', 'system'));
    `,
          SupportTicket: `
      ALTER TABLE public.support_ticket ADD CONSTRAINT check_status
      CHECK (status IN ('open', 'in_progress', 'closed', 'awaiting_reply'));
      ALTER TABLE public.support_ticket ADD CONSTRAINT check_priority
      CHECK (priority IN ('low', 'medium', 'high', 'critical'));
    `,
          Tool: `
      ALTER TABLE public.tool ADD CONSTRAINT check_status
      CHECK (status IN ('draft', 'published', 'archived'));
    `,
          Dictionary: `
      ALTER TABLE public.dictionary ADD CONSTRAINT check_status
      CHECK (status IN ('draft', 'published', 'archived'));
    `,
          EducationMode: `
      ALTER TABLE public.education_mode ADD CONSTRAINT check_status
      CHECK (status IN ('draft', 'published', 'archived'));
    `,
          Manual: `
  	  ALTER TABLE public.manual ADD CONSTRAINT check_manual_difficulty
  	  CHECK (manual_difficulty IN ('easy', 'normal', 'hard'));
  	  ALTER TABLE public.manual ADD CONSTRAINT check_manual_form
  	  CHECK (manual_form IN ('draw', 'write'));
  	  ALTER TABLE public.manual ADD CONSTRAINT check_manual_type
  	  CHECK (manual_type IN ('assembly', 'repair', 'how_to', 'guide', 'other'));
  	  ALTER TABLE public.manual ADD CONSTRAINT check_status
  	  CHECK (status IN ('public', 'premium', 'draft', 'archived'));
  	`,
          Comment: `
  	  ALTER TABLE public.comment ADD CONSTRAINT check_status
  	  CHECK (status IN ('draft', 'published', 'moderated', 'archived'));
  	`,
          Rating: `
  	  ALTER TABLE public.rating ADD CONSTRAINT check_rating_value
  	  CHECK (rating_value >= 1 AND rating_value <= 5);
  	`,
          Reaction: `
  	  -- No explicit CHECK constraint in SQL, just a column. Adding a generic one
  	  -- to represent possible reaction types.
  	  ALTER TABLE public.reaction ADD CONSTRAINT chk_reaction_type
  	  CHECK (reaction_type IN ('like', 'love', 'haha', 'wow', 'sad', 'angry'));
  	`,
          UserManualInteraction: `
  	  ALTER TABLE public.user_manual_interaction ADD CONSTRAINT check_interaction_type
  	  CHECK (interaction_type IN ('view', 'like', 'share', 'save'));
  	`,
          Order: `
  	  ALTER TABLE public.order ADD CONSTRAINT check_order_status
  	  CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'canceled'));
  	`,
          Payment: `
  	  ALTER TABLE public.payment ADD CONSTRAINT check_payment_status
  	  CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));
  	`,
          Refund: `
  	  ALTER TABLE public.refund ADD CONSTRAINT check_refund_status
  	  CHECK (refund_status IN ('pending', 'completed', 'failed'));
  	`,
          DiscountCode: `
  	  -- No explicit CHECK constraint in SQL for discount_type, adding a common set
  	  ALTER TABLE public.discount_code ADD CONSTRAINT chk_discount_type
  	  CHECK (discount_type IN ('percentage', 'fixed_amount'));
  	`,
        };

        for (const model of modelsInOrder) {
          const constraintSql = checkConstraints[model];
          if (constraintSql) {
            console.log(`Adding CHECK constraints for model: ${model}`);
            try {
              await dataSource.execute(`BEGIN; ${constraintSql} COMMIT;`);
              console.log(`✅ CHECK constraints for ${model} added successfully.`);
            } catch (err) {
              if (err.message.includes('already exists')) {
                console.warn(`⚠️ CHECK constraint for ${model} already exists. Skipping.`);
              } else {
                console.error(`Error adding CHECK constraints for ${model}:`, err);
              }
            }
          }
        }

        console.log('Migration completed successfully.');

        for (const model of modelsInOrder) {
          console.log(`Migrating model: ${model}`);
          await app.migrateSchema({
            existingSchema: 'alter',
            models: [model],
          });

          const constraintSql = checkConstraints[model];
          if (constraintSql) {
            console.log(`Adding CHECK constraints for model: ${model}`);
            try {
              await dataSource.execute(constraintSql);
              console.log(`✅ CHECK constraints for ${model} added successfully.`);
            } catch (err) {
              console.error(`Error adding CHECK constraints for ${model}:`, err);
            }
          }
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
          'X-CSRF-Token',
          'X-Request-ID',
        ],
        exposedHeaders: [
          'Authorization',
          'Content-Type',
          'Origin',
          'X-Requested-With',
          'Accept',
          'X-CSRF-Token',
          'X-Request-ID',
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
