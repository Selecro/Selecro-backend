import fs from 'fs';
import path from 'path';
import {SelecroBackendApplication} from './application';
import {PostgresqlDataSource} from './datasources';

export async function migrate(args: string[]) {
  const rebuild = args.includes('--rebuild');
  const existingSchema = rebuild ? 'drop' : 'alter';

  console.log('Migrating schemas (%s existing schema)', existingSchema);

  const app = new SelecroBackendApplication();
  await app.boot();

  const dataSource = await app.get<PostgresqlDataSource>('datasources.postgresql');

  if (rebuild) {
    console.log('Dropping schema "public" with CASCADE...');
    try {
      await dataSource.execute('DROP SCHEMA public CASCADE;');
      await dataSource.execute('CREATE SCHEMA public;');
      console.log('Schema "public" dropped and recreated successfully.');
    } catch (err) {
      if (err.code !== '42P06') {
        console.error('Error dropping/recreating schema:', err);
        process.exit(1);
      }
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
    existingSchema: existingSchema,
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
    User_2faMethod: `
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

  const seedArg = args.find(arg => arg.startsWith('--seed-file='));
  const seedFileName = seedArg ? seedArg.split('=')[1] : 'test-data.sql';
  const testDataPath = path.join(__dirname, '../', seedFileName);

  if (fs.existsSync(testDataPath)) {
    console.log(`Seeding database with test data from ${seedFileName}...`);
    const sqlFile = fs.readFileSync(testDataPath, 'utf8');
    const sqlStatements = sqlFile.split(';').filter((s) => s.trim().length > 0);
    for (const sqlStatement of sqlStatements) {
      await dataSource.execute(sqlStatement);
    }
    console.log('Database seeding completed.');

    const underscoreModels = modelsInOrder.map(name =>
      name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
    );

    const nonAutoIncrementTables = [
      'user_profile',
      'user_setting',
      'user_consent',
      'user_notification_preference',
      'user_auth',
      'user_point',
      'user_metadata',
      'user_oauth_account',
      'user_file_access',
      'user_role',
      'role_permission',
      'follower',
      'manual_product_theme',
      'manual_product_category',
      'wishlist',
      'cart_item',
    ];

    for (const model of underscoreModels) {
      if (nonAutoIncrementTables.includes(model)) {
        console.log(`ℹ️ Skipping sequence reset for "${model}" as it does not have an auto-incrementing 'id'.`);
        continue;
      }

      const sql = `ALTER TABLE "${model}" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY;`;
      console.log(sql);
      try {
        await dataSource.execute(sql);
        console.log(`✅ Sequence for "${model}" set to auto-generated successfully.`);
      } catch (err) {
        if (err.message.includes('already an identity column')) {
          console.warn(`⚠️ Column 'id' for "${model}" is already an identity column. Skipping.`);
        } else {
          console.error(`❌ Error setting 'id' column for "${model}" as auto-generated:`, err);
        }
      }

      const resetSql = `SELECT setval(pg_get_serial_sequence('${model}', 'id'), (SELECT MAX(id) FROM "${model}") + 1, false);`;
      console.log(resetSql);
      try {
        await dataSource.execute(resetSql);
        console.log(`✅ Sequence counter for "${model}" reset successfully.`);
      } catch (err) {
        console.warn(`⚠️ Failed to reset sequence for "${model}". This might be expected if the table is empty.`, err.message);
      }
    }
  } else {
    console.warn(`${seedFileName} file not found. Skipping data seeding.`);
  }

  process.exit(0);
}

migrate(process.argv).catch(err => {
  console.error('Cannot migrate database schema', err);
  process.exit(1);
});
