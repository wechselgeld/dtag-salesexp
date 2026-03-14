import {
	prisma,
} from '../src/lib/prisma';

async function main() {
	console.log('Checking AnalyticsEvent count...');
	try {
		const count = await (prisma as any).analyticsEvent.count();
		console.log(`Current Count: ${count}`);

		const events = await (prisma as any).analyticsEvent.findMany({
			take: 5,
		});
		console.log('Samples:', JSON.stringify(events, null, 2));

		const types = await (prisma as any).analyticsEvent.groupBy({
			by: [
				'eventType',
			],
			_sum: {
				count: true,
			},
		});
		console.log('Events by type:', JSON.stringify(types, null, 2));
	}
	catch (error) {
		console.error('Error checking analytics:', error);
	}
	finally {
		process.exit(0);
	}
}

main();
