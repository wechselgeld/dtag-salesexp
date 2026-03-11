import { prisma } from '../src/lib/prisma';

async function main() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log(`Checking AnalyticsEvent for today: ${today.toISOString()}`);
    try {
        const count = await (prisma as any).analyticsEvent.count({
            where: { date: { gte: today } }
        });
        console.log(`Today's Count: ${count}`);

        const events = await (prisma as any).analyticsEvent.findMany({
            where: { date: { gte: today } }
        });
        console.log("Today's Samples:", JSON.stringify(events, null, 2));
    } catch (error) {
        console.error("Error checking analytics:", error);
    } finally {
        process.exit(0);
    }
}

main();
