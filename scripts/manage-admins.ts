import {
	PrismaClient,
} from '@prisma/client';
import readline from 'readline';
import bcrypt from 'bcryptjs';

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

async function main() {
	console.log('\n--- Admin User Management ---\n');
	console.log('1. List Users');
	console.log('2. Create User');
	console.log('3. Delete User');
	console.log('4. Change Password');
	console.log('5. Exit');

	const choice = (await ask('\nSelect an option (1-5): ')).trim();

	switch (choice) {
	case '1':
		await listUsers();
		break;
	case '2':
		await createUser();
		break;
	case '3':
		await deleteUser();
		break;
	case '4':
		await changePassword();
		break;
	case '5':
		console.log('Exiting...');
		process.exit(0);
	default:
		console.log('Invalid option.');
	}

	// Loop
	main();
}

async function listUsers() {
	const users = await prisma.user.findMany();
	console.log('\nExisting Users:');
	if (users.length === 0) {
		console.log('  No users found.');
	}
	else {
		console.table(users.map(u => ({
			id: u.id,
			email: u.email,
			role: u.role,
		})));
	}
}

async function createUser() {
	console.log('\nCreate New User:');
	const email = await ask('Email: ');
	const password = await ask('Password: ');
	const role = await ask('Role (ADMIN/TEAM_LEADER, default ADMIN): ') || 'ADMIN';

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				role,
			},
		});
		console.log(`User ${email} created successfully.`);
	}
	catch (e) {
		console.error('Error creating user (Email might already exist).', e);
	}
}

async function deleteUser() {
	await listUsers();
	const email = await ask('\nEnter Email of user to delete: ');

	try {
		await prisma.user.delete({
			where: {
				email,
			},
		});
		console.log(`User ${email} deleted.`);
	}
	catch (e) {
		console.error('Error deleting user.', e);
	}
}

async function changePassword() {
	const email = await ask('\nEnter Email of user: ');
	const newPassword = await ask('New Password: ');

	try {
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: {
				email,
			},
			data: {
				password: hashedPassword,
			},
		});
		console.log('Password updated.');
	}
	catch (e) {
		console.error('Error updating password.', e);
	}
}

main();
