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
    'Device',
    'Session',
    'File',
    'UserFile',
    'UserSetting',
    'UserLocation',
    'UserNotificationSetting',
    'UserSecurity',
    'Role',
    'Permission',
    'UserRole',
    'RolePermission',
    'LoginHistory',
    'TwoFactorAuthLog',
    'SystemLog',
    'TwoFactorAuthMethod',
    'PasswordHistory',
    'OauthAccount',
    'TwoFactorAuthBackupCode',
    'Follower',
    'Badge',
    'UserBadge',
    'Notification',
    'News',
    'NewsDelivery',
    'Tool',
    'Dictionary',
    'EducationMode',
    'EducationStep',
    'Manual',
    'ManualStep',
    'ManualProgress',
    'ManualPurchase',
    'UserManualInteraction',
    'Comment',
  ];

  console.log('Migrating all models...');
  await app.migrateSchema({
    existingSchema: existingSchema,
    models: modelsInOrder,
  });
  console.log('All models migrated successfully.');

  const checkConstraints: {[key: string]: string} = {
    User: `ALTER TABLE public.user ADD CONSTRAINT chk_user_account_status
               CHECK (account_status IN ('active', 'suspended', 'deleted', 'pending_verification'));`,
    File: `ALTER TABLE public.file ADD CONSTRAINT chk_file_type
               CHECK (file_type IN ('image', 'video', 'document', 'other'));
             ALTER TABLE public.file ADD CONSTRAINT chk_file_category
               CHECK (file_category IN ('profile_picture', 'user_uploaded_document', 'system_generated_document', 'invoice', 'report', 'contract', 'other_category'));`,
    UserSetting: `ALTER TABLE public.user_setting ADD CONSTRAINT chk_user_setting_language
                                 CHECK (user_language_preference IN ('en', 'cz'));
                                 ALTER TABLE public.user_setting ADD CONSTRAINT chk_user_setting_display_status
                                 CHECK (user_display_status IN ('online', 'away', 'do_not_disturb', 'invisible'));`,
    Role: `ALTER TABLE public.role ADD CONSTRAINT chk_role_name
               CHECK (role_name IN ('admin', 'user', 'marketer', 'educator', 'customer'));`,
    Permission: `ALTER TABLE public.permission ADD CONSTRAINT chk_permission_resource
                                 CHECK (resource_type IN ('user', 'user_setting', 'user_location', 'user_notification_setting', 'user_security', 'file', 'user_file', 'role', 'permission', 'device', 'login_history', 'two_factor_auth_log', 'system_log', 'two_factor_auth_method', 'password_history', 'oauth_account', 'two_factor_auth_backup_code', 'user_role', 'role_permission', 'session', 'follower', 'badge', 'user_badge', 'notification', 'news', 'news_delivery', 'education_mode', 'tool', 'education_step', 'dictionary', 'manual', 'manual_step', 'manual_progress', 'manual_purchase', 'user_manual_interaction', 'comment'));
                                 ALTER TABLE public.permission ADD CONSTRAINT chk_permission_action
                                 CHECK (action_type IN ('read', 'write', 'delete', 'update'));`,
    LoginHistory: `ALTER TABLE public.login_history ADD CONSTRAINT chk_login_status
                                 CHECK (login_status IN ('success', 'failure', 'pending_2fa'));`,
    TwoFactorAuthLog: `ALTER TABLE public.two_factor_auth_log ADD CONSTRAINT chk_2fa_log_method
                                   CHECK (two_factor_auth_log_method_type IN ('email', 'TOTP', 'biometric', 'U2F', 'backup_code'));`,
    SystemLog: `ALTER TABLE public.system_log ADD CONSTRAINT chk_system_log_type
                                 CHECK (system_log_type IN ('authentication', 'data_access', 'error', 'system_event'));
                                 ALTER TABLE public.system_log ADD CONSTRAINT chk_system_action
                                 CHECK (system_action IN ('create', 'read', 'update', 'delete', 'login', 'logout', 'error'));
                                 ALTER TABLE public.system_log ADD CONSTRAINT chk_system_severity
                                 CHECK (system_severity IN ('info', 'warning', 'error', 'debug', 'critical'));`,
    TwoFactorAuthMethod: `ALTER TABLE public.two_factor_auth_method ADD CONSTRAINT chk_2fa_method_type
                                     CHECK (two_factor_auth_method_type IN ('email', 'TOTP', 'biometric', 'U2F'));`,
    OauthAccount: `ALTER TABLE public.oauth_account ADD CONSTRAINT chk_oauth_provider
                                 CHECK (oauth_provider IN ('google', 'apple', 'github', 'facebook', 'microsoft', 'linkedin'));`,
    Notification: `ALTER TABLE public.notification ADD CONSTRAINT chk_notification_type
                                 CHECK (notification_type IN ('info', 'warning', 'error', 'success', 'promotion', 'activity'));`,
    News: `ALTER TABLE public.news ADD CONSTRAINT chk_news_status
               CHECK (news_status IN ('active', 'draft', 'archived'));`,
    NewsDelivery: `ALTER TABLE public.news_delivery ADD CONSTRAINT chk_news_delivery_language
                                 CHECK (news_delivery_language IN ('cz', 'en'));`,
    EducationMode: `ALTER TABLE public.education_mode ADD CONSTRAINT chk_education_mode_status
                                   CHECK (education_mode_status IN ('active', 'draft', 'archived'));`,
    Tool: `ALTER TABLE public.tool ADD CONSTRAINT chk_tool_status
               CHECK (tool_status IN ('active', 'draft', 'archived'));`,
    Dictionary: `ALTER TABLE public.dictionary ADD CONSTRAINT chk_dictionary_status
                                 CHECK (dictionary_status IN ('active', 'draft', 'archived'));`,
    Manual: `ALTER TABLE public.manual ADD CONSTRAINT chk_manual_difficulty
               CHECK (manual_difficulty IN ('beginner', 'intermediate', 'advanced'));
             ALTER TABLE public.manual ADD CONSTRAINT chk_manual_type
               CHECK (manual_type IN ('assembly', 'repair', 'how_to', 'guide', 'other'));
             ALTER TABLE public.manual ADD CONSTRAINT chk_manual_status
               CHECK (manual_status IN ('public', 'private', 'premium', 'draft', 'archived'));`,
    ManualPurchase: `ALTER TABLE public.manual_purchase ADD CONSTRAINT chk_purchase_currency
                                     CHECK (currency IN ('czk', 'eur', 'usd'));
                                     ALTER TABLE public.manual_purchase ADD CONSTRAINT chk_payment_status
                                     CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));`,
    UserManualInteraction: `ALTER TABLE public.user_manual_interaction ADD CONSTRAINT chk_interaction_type
                                       CHECK (user_manual_interaction_type IN ('view', 'like', 'share', 'save'));`,
    Comment: `ALTER TABLE public.comment ADD CONSTRAINT chk_comment_on_type
               CHECK (comment_on_type IN ('manual', 'education_mode'));
             ALTER TABLE public.comment ADD CONSTRAINT chk_comment_rating
               CHECK (rating >= 1 AND rating <= 5);`,
  };

  for (const model of modelsInOrder) {
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
      'user_setting',
      'user_location',
      'user_notification_setting',
      'user_security',
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
