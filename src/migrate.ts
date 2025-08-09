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
  } else {
    console.warn(`${seedFileName} file not found. Skipping data seeding.`);
  }

  process.exit(0);
}

migrate(process.argv).catch(err => {
  console.error('Cannot migrate database schema', err);
  process.exit(1);
});
