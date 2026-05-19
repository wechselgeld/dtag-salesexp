import {
	PrismaClient,
} from '@prisma/client';
import {
	sendAccountResetEmail,
} from '../src/lib/email';
import readline from 'readline';
import path from 'path';
import dotenv from 'dotenv';

// Configure dotenv: first load standard .env as fallback, then override with .env.production
dotenv.config({ override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env.production'), override: true });

const prisma = new PrismaClient();
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const ask = (question: string): Promise<string> => {
	return new Promise((resolve) => {
		rl.question(question, resolve);
	});
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
	console.log('\n======================================================');
	console.log('   PRODUCTION USER ACCOUNT RESET NOTIFICATION TOOL    ');
	console.log('======================================================\n');

	// Parse arguments
	const args = process.argv.slice(2);
	const isDryRun = args.includes('--dry-run');
	const testEmailIndex = args.indexOf('--test-email');
	const testEmail = testEmailIndex !== -1 ? args[testEmailIndex + 1] : null;

	const dbUrl = process.env.DATABASE_URL || 'Not Set';
	const maskedDbUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
	const emailFrom = process.env.EMAIL_FROM || 'Not Set';

	console.log(`Database Target: ${maskedDbUrl}`);
	console.log(`Email Sender:    ${emailFrom}`);
	console.log(`Mode:            ${isDryRun ? 'DRY-RUN (Safe, no emails sent)' : testEmail ? `TEST-EMAIL (Send single to ${testEmail})` : 'LIVE (Send to all users)'}`);
	console.log('------------------------------------------------------\n');

	try {
		// 1. Fetch Users
		console.log('Fetching users from the database...');
		const users = await prisma.user.findMany({
			select: {
				email: true,
				firstName: true,
			},
			orderBy: {
				email: 'asc',
			},
		});

		console.log(`Found ${users.length} users in the database.`);
		if (users.length === 0) {
			console.log('No users found. Exiting...');
			process.exit(0);
		}

		console.log('\nList of Users:');
		users.forEach((u, i) => {
			console.log(`  [${i + 1}] ${u.email}`);
		});

		// 2. Handle Test Email Mode
		if (testEmail) {
			console.log(`\nSending test reset email to: ${testEmail}...`);
			const res = await sendAccountResetEmail(testEmail, 'Test-Nutzer');
			if (res) {
				console.log('Test email sent successfully! Response:', res);
			} else {
				console.error('Failed to send test email.');
			}
			process.exit(0);
		}

		// 3. Handle Dry Run Mode
		if (isDryRun) {
			console.log('\n--- DRY RUN PREVIEW ---');
			console.log(`Subject: Wichtige Systemaktualisierung: Sales Experience`);
			console.log(`Sender:  Sales Experience <${emailFrom}>`);
			console.log('\nSample Copy (for user with first name):');
			console.log('------------------------------------------------------');
			console.log(`Hallo [Vorname],`);
			console.log('wir haben wichtige Sicherheits- und Struktur-Updates an der Authentifizierung');
			console.log('und der Kontoverwaltung der Sales Experience Plattform vorgenommen.');
			console.log('\nIm Zuge dieser Umstellung müssen alle bestehenden Konten zurückgesetzt werden.');
			console.log('Dein bisheriges Passwort und deine Passkey-Einstellungen können aus Sicherheitsgründen');
			console.log('leider nicht automatisch in das neue System übertragen werden.');
			console.log('\nWas bedeutet das für dich?');
			console.log('Sobald die Wartungsarbeiten abgeschlossen sind, musst du dich einmalig neu auf');
			console.log('der Plattform registrieren, um deinen Zugang zu reaktivieren. Verwende dazu bitte');
			console.log('deine bekannte E-Mail-Adresse: [Email]');
			console.log('\nWir bitten die Umstände zu entschuldigen und danken dir herzlich für dein Verständnis!');
			console.log('------------------------------------------------------');
			console.log('\nDry run completed successfully. No emails were sent.');
			process.exit(0);
		}

		// 4. Handle Live Email Dispatches with Interactive Prompts
		console.log('\n⚠️  WARNING: You are about to send notifications to ALL listed production users! ⚠️');
		const confirmation = (await ask(`Are you absolutely sure you want to send emails to all ${users.length} users? (y/n): `)).trim().toLowerCase();

		if (confirmation !== 'y') {
			console.log('Operation cancelled by user.');
			process.exit(0);
		}

		console.log('\nStarting email sending sequence...');
		let successCount = 0;
		let failCount = 0;

		for (let i = 0; i < users.length; i++) {
			const user = users[i];
			console.log(`[${i + 1}/${users.length}] Sending reset email to ${user.email}...`);

			try {
				const res = await sendAccountResetEmail(user.email, user.firstName);
				if (res) {
					console.log(`  -> SUCCESS!`);
					successCount++;
				} else {
					console.error(`  -> FAILED: sendAccountResetEmail returned falsy value`);
					failCount++;
				}
			} catch (e: any) {
				console.error(`  -> ERROR:`, e.message || e);
				failCount++;
			}

			// Add a delay of 500ms between emails to prevent hitting Resend free tier limits (usually 2 emails/sec)
			if (i < users.length - 1) {
				await delay(500);
			}
		}

		console.log('\n======================================================');
		console.log('   EMAIL DISPATCH SEQUENCE COMPLETED!');
		console.log(`   Success: ${successCount}`);
		console.log(`   Failed:  ${failCount}`);
		console.log('======================================================\n');

	} catch (error: any) {
		console.error('An unexpected error occurred:', error.message || error);
	} finally {
		rl.close();
		await prisma.$disconnect();
	}
}

main();
