import { prisma } from '../src/lib/prisma';

async function main() {
	console.log('Starting purge of personal data...');

	// 1. Delete all user sessions
	const sessionsDeleted = await prisma.userSession.deleteMany({});
	console.log(`Deleted ${sessionsDeleted.count} active user sessions.`);

	// 2. Delete all passkeys
	const passkeysDeleted = await prisma.passkey.deleteMany({});
	console.log(`Deleted ${passkeysDeleted.count} passkeys.`);

	// 3. Delete all users
	const usersDeleted = await prisma.user.deleteMany({});
	console.log(`Deleted ${usersDeleted.count} user profiles.`);

	// 4. Anonymize Error Logs
	const errorLogsAnonymized = await prisma.errorLog.updateMany({
		data: {
			userId: null,
			userEmail: null,
			clientIp: null,
		},
	});
	console.log(`Anonymized ${errorLogsAnonymized.count} error log records.`);

	// 5. Anonymize Audit Logs
	const auditLogsAnonymized = await prisma.auditLog.updateMany({
		data: {
			userId: null,
			userEmail: null,
			clientIp: null,
		},
	});
	console.log(`Anonymized ${auditLogsAnonymized.count} audit log records.`);

	console.log('Purge complete: All personal data and user profiles have been deleted/anonymized.');
}

main()
	.catch((e) => {
		console.error('Purge error:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
