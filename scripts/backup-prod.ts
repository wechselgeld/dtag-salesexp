import {
 Client,
} from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({
 path: path.resolve(process.cwd(), '.env.production'),
});
dotenv.config(); // fallback to .env

// Construct production database URL with dtag_prod
// Since .env.production might still have dtag_dev or need updating, we let the script use dtag_prod directly
const originalDbUrl = process.env.DATABASE_URL || 'postgres://postgres:yAPgc5SO7ph3M8M0byLYFQUivWo31m8jWu1zv3W4GDAsmjxXL5uAvI8ApYgtxR3V@178.104.100.186:5432/dtag_dev';

let prodDbUrl = originalDbUrl;
try {
	const urlObj = new URL(originalDbUrl);
	urlObj.pathname = '/dtag_prod';
	prodDbUrl = urlObj.toString();
}
 catch {
	// Fallback if URL parsing fails
	prodDbUrl = originalDbUrl.replace(/\/dtag_dev([?&]|$)/, '/dtag_prod$1').replace(/\/dtag([?&]|$)/, '/dtag_prod$1');
}

async function runBackup() {
	console.log('\n=========================================');
	console.log('   DATABASE BACKUP TOOL (PRODUCTION)   ');
	console.log('=========================================\n');
	console.log(`Connecting to database: ${prodDbUrl.replace(/:[^:@]+@/, ':****@')}`);

	const client = new Client({
		connectionString: prodDbUrl,
	});

	try {
		await client.connect();
		console.log('Successfully connected to PostgreSQL!');

		// 1. Fetch all table names in public schema
		const tablesRes = await client.query(`
			SELECT table_name 
			FROM information_schema.tables 
			WHERE table_schema = 'public' 
			  AND table_type = 'BASE TABLE'
			ORDER BY table_name;
		`);

		const tables = tablesRes.rows.map(row => row.table_name);
		console.log(`Discovered ${tables.length} tables in public schema.`);

		const backupData: Record<string, any[]> = {
};

		// 2. Query each table
		for (const table of tables) {
			console.log(`Backing up table: "${table}"...`);
			try {
				const rowsRes = await client.query(`SELECT * FROM "${table}"`);
				backupData[table] = rowsRes.rows;
				console.log(`  -> OK: Saved ${rowsRes.rows.length} rows.`);
			}
 catch (err: any) {
				console.error(`  -> ERROR reading table "${table}":`, err.message);
				backupData[table] = [
];
			}
		}

		// 3. Write backup file
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const backupsDir = path.resolve(process.cwd(), 'backups');
		if (!fs.existsSync(backupsDir)) {
			fs.mkdirSync(backupsDir);
		}

		const backupFilePath = path.join(backupsDir, `dtag_prod_backup_${timestamp}.json`);
		fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');

		console.log('\n=========================================');
		console.log('   BACKUP COMPLETED SUCCESSFULLY!');
		console.log(`File saved to: ${backupFilePath}`);
		console.log(`Total tables backed up: ${Object.keys(backupData).length}`);
		console.log('=========================================\n');

	}
 catch (error: any) {
		console.error('\nDatabase Backup FAILED:', error.message);
		process.exit(1);
	}
 finally {
		await client.end();
	}
}

runBackup();
