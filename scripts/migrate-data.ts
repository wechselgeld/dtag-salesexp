import { createConnection } from 'mysql2/promise';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const booleanFields = [
  'isEditor', 'isActive', 'allowNewActivation', 'allowMove', 'allowPlanChange',
  'allowSpeedUp', 'allowMagentaTV', 'hasMagentaTVBundle', 'allowHardwareTiers',
  'requiresSpeedUp', 'requiresMove', 'requiresNewActivation', 'isGlobal',
  'active', 'acceptedTerms', 'isVerified'
];

async function migrateDataForUrl(mysqlUrl: string, targetPostgresUrl: string, environmentName: string) {
  console.log(`\n======================================================`);
  console.log(`🚀 Starting migration for environment: ${environmentName}`);
  console.log(`======================================================\n`);
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: targetPostgresUrl
      }
    }
  });

  console.log('Connecting to old MySQL Database...');
  const oldDb = await createConnection(mysqlUrl);

  console.log(`Connecting to Postgres Database for ${environmentName}...`);
  await prisma.$connect();

  console.log('Disabling Postgres foreign key checks for migration...');
  await prisma.$executeRawUnsafe(`SET session_replication_role = 'replica';`);

  const tables = [
    'OdRegion', 'Location', 'Team', 'User',
    'Product', 'SalesArgument', 'PriceHistory',
    'SpecialPrice', 'SpecialPriceTier',
    'Addon', 'AddonTier',
    'TeamHighlight', 'MaintenanceAnnouncement', 'OneTimeCredit',
    'SalesSession', 'News', 'SystemSetting', 'AnalyticsEvent',
    '_ProductSpecialPrices', '_ProductAddons'
  ];

  for (const table of tables) {
    console.log(`Migrating table: ${table}...`);
    try {
      const [rows] = await oldDb.query(`SELECT * FROM \`${table}\``);
      const data = rows as any[];
      if (data.length > 0) {
        if (table.startsWith('_')) {
          for (const row of data) {
            const keyA = row.A;
            const keyB = row.B;
            await prisma.$executeRawUnsafe(
              `INSERT INTO "${table}" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              keyA,
              keyB
            );
          }
          console.log(`-> Copied ${data.length} relation rows for ${table} in ${environmentName}`);
        } else {
          const formattedData = data.map(row => {
            const newRow = { ...row };
            for (const key of Object.keys(newRow)) {
              if (booleanFields.includes(key)) {
                newRow[key] = Boolean(newRow[key]);
              }
            }
            return newRow;
          });

          const modelName = table.charAt(0).toLowerCase() + table.slice(1);
          // @ts-ignore
          if (prisma[modelName]) {
            // @ts-ignore
            await prisma[modelName].createMany({
              data: formattedData,
              skipDuplicates: true,
            });
            console.log(`-> Copied ${formattedData.length} records into ${table} in ${environmentName}`);
          } else {
             console.warn(`-> Model ${modelName} not found on Prisma Client!`);
          }
        }
      } else {
        console.log(`-> Table ${table} is empty. Skipping.`);
      }
    } catch (e) {
      console.error(`Error migrating table ${table}:`, e);
    }
  }

  console.log('Re-enabling Postgres foreign key checks...');
  await prisma.$executeRawUnsafe(`SET session_replication_role = 'origin';`);
  await prisma.$disconnect();
  await oldDb.end();
  console.log(`✅ Migration completed for ${environmentName}.`);
}

function parseEnv(filePath: string) {
    if (!fs.existsSync(filePath)) return {};
    return dotenv.parse(fs.readFileSync(filePath));
}

async function main() {
  const devEnv = parseEnv(path.join(process.cwd(), '.env.development'));
  const stagingEnv = parseEnv(path.join(process.cwd(), '.env.staging'));
  const prodEnv = parseEnv(path.join(process.cwd(), '.env.production'));

  const mysqlUrl = devEnv.OLD_MYSQL_URL;
  if (!mysqlUrl) {
    throw new Error('OLD_MYSQL_URL is not set in .env.development.');
  }

  // Use public database URLs for the migration script so it can be run from localhost!
  // Production and Staging might only have internal URLs on DATABASE_URL, but we added PUBLIC_DATABASE_URL
  const devTarget = devEnv.DATABASE_URL;
  const stagingTarget = stagingEnv.PUBLIC_DATABASE_URL || stagingEnv.DATABASE_URL;
  const prodTarget = prodEnv.PUBLIC_DATABASE_URL || prodEnv.DATABASE_URL;

  if (devTarget) await migrateDataForUrl(mysqlUrl, devTarget, 'Development');
  if (stagingTarget) await migrateDataForUrl(mysqlUrl, stagingTarget, 'Staging');
  if (prodTarget) await migrateDataForUrl(mysqlUrl, prodTarget, 'Production');

  console.log('\n🎉 All environment migrations finished successfully!');
  process.exit(0);
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
