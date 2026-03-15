import { PrismaClient } from '@prisma/client';
import readline from 'readline';
import dotenv from 'dotenv';
import path from 'path';

// We need two clients: Staging and Production
// We'll load the env variables manually to ensure we have both
const stagingEnv = dotenv.config({ path: path.resolve(process.cwd(), '.env.staging') }).parsed || {};
const prodEnv = dotenv.config({ path: path.resolve(process.cwd(), '.env.production') }).parsed || {};

if (!stagingEnv.DATABASE_URL || !prodEnv.DATABASE_URL) {
	console.error('Error: DATABASE_URL missing in .env.staging or .env.production');
	process.exit(1);
}

const stagingPrisma = new PrismaClient({
	datasources: {
		db: {
			url: stagingEnv.DATABASE_URL,
		},
	},
});

const prodPrisma = new PrismaClient({
	datasources: {
		db: {
			url: prodEnv.DATABASE_URL,
		},
	},
});

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const TABLE_GROUPS = {
	'1': {
		name: 'Catalog (Products, Prices, Addons, Arguments)',
		tables: ['Product', 'SpecialPrice', 'SpecialPriceTier', 'Addon', 'AddonTier', 'SalesArgument', 'PriceHistory', 'OneTimeCredit'],
	},
	'2': {
		name: 'Infrastructure (Regions, Locations, Teams)',
		tables: ['OdRegion', 'Location', 'Team'],
	},
	'3': {
		name: 'Configuration (System Settings, Maintenance)',
		tables: ['SystemSetting', 'MaintenanceAnnouncement'],
	},
	'4': {
		name: 'News',
		tables: ['News'],
	},
};

async function askQuestion(query: string): Promise<string> {
	return new Promise((resolve) => rl.question(query, resolve));
}

async function syncTable(tableName: string) {
	console.log(`Syncing ${tableName}...`);
	const modelName = tableName.charAt(0).toLowerCase() + tableName.slice(1);

	// @ts-ignore - Dynamic access to prisma models
	const stagingData = await stagingPrisma[modelName].findMany();

	console.log(`Found ${stagingData.length} items in Staging.`);

	for (const item of stagingData) {
		// We use upsert to ensure we don't create duplicates and update existing ones
		const { id, ...data } = item;

		// @ts-ignore
		await prodPrisma[modelName].upsert({
			where: {
				id: id,
			},
			update: data,
			create: item,
		});
	}
	console.log(`Successfully synced ${tableName}.`);
}

async function main() {
	console.log('\n--- 🔄 Database Sync: Staging -> Production ---\n');
	console.log('Select Table Groups to sync (comma-separated, e.g. 1,3):');
	Object.entries(TABLE_GROUPS).forEach(([key, group]) => {
		console.log(`${key}: ${group.name}`);
	});

	const choice = await askQuestion('\nChoice: ');
	const selectedKeys = choice.split(',').map((k) => k.trim());

	const tablesToSync: string[] = [];
	selectedKeys.forEach((key) => {
		if (TABLE_GROUPS[key as keyof typeof TABLE_GROUPS]) {
			tablesToSync.push(...TABLE_GROUPS[key as keyof typeof TABLE_GROUPS].tables);
		}
	});

	if (tablesToSync.length === 0) {
		console.log('No tables selected. Aborting.');
		process.exit(0);
	}

	console.log(`\nWill sync: ${tablesToSync.join(', ')}`);
	const confirm = await askQuestion('Are you sure? (y/N): ');

	if (confirm.toLowerCase() !== 'y') {
		process.exit(0);
	}

	try {
		// Order matters for foreign keys
		const executionOrder = [
			'OdRegion', 'Location', 'Team', // Infrastructure
			'Product', 'Addon', 'SpecialPrice', 'OneTimeCredit', // Primary entities
			'AddonTier', 'SpecialPriceTier', 'SalesArgument', 'PriceHistory', // Dependent entities
			'News', 'SystemSetting', 'MaintenanceAnnouncement', // Others
		];

		const sortedTables = tablesToSync.sort((a, b) => executionOrder.indexOf(a) - executionOrder.indexOf(b));

		for (const table of sortedTables) {
			await syncTable(table);
		}

		console.log('\n✅ Sync completed successfully!');
	} catch (error) {
		console.error('\n❌ Sync failed:', error);
	} finally {
		await stagingPrisma.$disconnect();
		await prodPrisma.$disconnect();
		rl.close();
	}
}

main();
