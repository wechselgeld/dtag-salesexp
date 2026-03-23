import { createConnection } from 'mysql2/promise';
import { Client } from 'pg';

async function migrate() {
  const mysqlUrl = 'mysql://quantaservice:9v%5EI%40%267p6V%2A%5E@130.61.44.105:3306/dtag_sales-exp_prod';
  const pgConfig = {
    host: '178.104.100.186',
    port: 5432,
    user: 'postgres',
    password: 'yAPgc5SO7ph3M8M0byLYFQUivWo31m8jWu1zv3W4GDAsmjxXL5uAvI8ApYgtxR3V',
    database: 'dtag_prod',
    ssl: false,
  };

  console.log('Connecting to databases...');
  const mysql = await createConnection(mysqlUrl);
  const pg = new Client(pgConfig);
  await pg.connect();

  const tables = [
    'OdRegion',
    'Location',
    'Team',
    'User',
    'Product',
    'SalesArgument',
    'PriceHistory',
    'SpecialPrice',
    'SpecialPriceTier',
    'Addon',
    'AddonTier',
    'TeamHighlight',
    'MaintenanceAnnouncement',
    'OneTimeCredit',
    'SalesSession',
    'News',
    'SystemSetting',
    '_ProductSpecialPrices',
    '_ProductAddons',
  ];

  try {
    // Disable all triggers to avoid FK issues during migration
    await pg.query('SET session_replication_role = "replica"');

    for (const table of tables) {
      console.log(`Migrating table: ${table}...`);
      
      const [rows]: any = await mysql.query(`SELECT * FROM \`${table}\``);
      console.log(`Found ${rows.length} rows in ${table}.`);

      if (rows.length === 0) continue;

      // Clear the target table first (just in case)
      await pg.query(`TRUNCATE TABLE "${table}" CASCADE`);

      const columns = Object.keys(rows[0]);
      const columnNames = columns.map(c => `"${c}"`).join(', ');
      
      for (const row of rows) {
        const values = columns.map(c => {
          let val = row[c];
          if (val instanceof Date) {
            return val.toISOString();
          }
          if (typeof val === 'object' && val !== null) {
            return JSON.stringify(val);
          }
          return val;
        });
        
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO "${table}" (${columnNames}) VALUES (${placeholders})`;
        
        await pg.query(query, values);
      }
      console.log(`Finished migrating ${table}.`);
    }

    // Restore triggers
    await pg.query('SET session_replication_role = "origin"');
    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    await pg.query('SET session_replication_role = "origin"');
  } finally {
    await mysql.end();
    await pg.end();
  }
}

migrate();
