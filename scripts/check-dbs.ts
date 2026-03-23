import { createConnection } from 'mysql2/promise';
import { Client } from 'pg';

async function main() {
  const mysqlUrl = 'mysql://quantaservice:9v%5EI%40%267p6V%2A%5E@130.61.44.105:3306/dtag_sales-exp_prod';
  const postgresUrl = 'postgres://postgres:yAPgc5SO7ph3M8M0byLYFQUivWo31m8jWu1zv3W4GDAsmjxXL5uAvI8ApYgtxR3V@178.104.100.186:5432/postgres';

  console.log('Connecting to MySQL...');
  const mysql = await createConnection(mysqlUrl);
  console.log('Connected to MySQL.');

  const [mysqlTables] = await mysql.query('SHOW TABLES');
  console.log('MySQL Tables:', JSON.stringify(mysqlTables, null, 2));

  await mysql.end();

  console.log('Connecting to Postgres...');
  const pg = new Client({
    host: '178.104.100.186',
    port: 5432,
    user: 'postgres',
    password: 'yAPgc5SO7ph3M8M0byLYFQUivWo31m8jWu1zv3W4GDAsmjxXL5uAvI8ApYgtxR3V',
    database: 'postgres',
    ssl: false,
  });

  try {
    await pg.connect();
    console.log('Connected to Postgres.');

    const pgTables = await pg.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Postgres Tables:', JSON.stringify(pgTables.rows, null, 2));

    const dbCheck = await pg.query("SELECT datname FROM pg_database WHERE datname = 'dtag_prod'");
    if (dbCheck.rows.length === 0) {
      console.log('dtag_prod database does NOT exist. Creating it...');
      await pg.query('CREATE DATABASE dtag_prod');
      console.log('dtag_prod database created.');
    } else {
      console.log('dtag_prod database exists.');
    }

    await pg.end();
  } catch (err: any) {
    console.error('Postgres Error:', err.message);
    if (err.code) {
      console.error('Error Code:', err.code);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
