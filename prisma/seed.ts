import {
	PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();
import bcrypt from 'bcryptjs';

async function main() {
	console.log('Seeding database...');

	// Create default admin user
	const hashedPassword = await bcrypt.hash('admin123', 10);

	await prisma.user.upsert({
		where: {
			email: 'admin@telekom.de',
		},
		update: {
		},
		create: {
			email: 'admin@telekom.de',
			password: hashedPassword,
			role: 'ADMIN',
		},
	});

	// Mobile Tariffs
	const mobilM = await prisma.product.create({
		data: {
			name: 'MagentaMobil M',
			category: 'MOBILE',
			basePrice: 49.95,
			dataVolume: '20 GB',
			downloadSpeed: 300,
			uploadSpeed: 50,
			contractDuration: 24,
			allowNewActivation: true,
			allowMove: false,
			allowPlanChange: true,
			activationFeeNew: 39.95,
			features: JSON.stringify([
				'5G',
				'Phone Flat',
				'SMS Flat',
				'EU Roaming',
			]),
			magentaInfosUrl: 'https://magentainfos.telekom.de/mobile/mobil-m',
		},
	});

	const mobilL = await prisma.product.create({
		data: {
			name: 'MagentaMobil L',
			category: 'MOBILE',
			basePrice: 59.95,
			dataVolume: '40 GB',
			downloadSpeed: 300,
			uploadSpeed: 50,
			contractDuration: 24,
			allowNewActivation: true,
			allowMove: false,
			allowPlanChange: true,
			activationFeeNew: 39.95,
			features: JSON.stringify([
				'5G',
				'Phone Flat',
				'SMS Flat',
				'EU Roaming',
				'StreamOn',
			]),
		},
	});

	// Fiber Tariffs
	const fiberM = await prisma.product.create({
		data: {
			name: 'MagentaZuhause M',
			category: 'FIBER',
			basePrice: 42.95,
			downloadSpeed: 50,
			uploadSpeed: 10,
			contractDuration: 24,
			allowNewActivation: true,
			allowMove: true,
			allowPlanChange: true,
			allowSpeedUp: true,
			activationFeeNew: 69.95,
			activationFeeMove: 69.95,
			allowMagentaTV: true,
			hasMagentaTVBundle: true,
			magentaTVBundleName: 'MagentaZuhause M mit MagentaTV Smart',
			magentaTVBundlePrice: 52.95,
			features: JSON.stringify([
				'Flatrate ins dt. Festnetz',
				'Internet Flat',
			]),
		},
	});

	const fiberXL = await prisma.product.create({
		data: {
			name: 'MagentaZuhause XL',
			category: 'FIBER',
			basePrice: 54.95,
			downloadSpeed: 250,
			uploadSpeed: 40,
			contractDuration: 24,
			allowNewActivation: true,
			allowMove: true,
			allowPlanChange: true,
			allowSpeedUp: true,
			activationFeeNew: 69.95,
			allowMagentaTV: true,
			hasMagentaTVBundle: true,
			features: JSON.stringify([
				'Flatrate ins dt. Festnetz',
				'Internet Flat',
				'SuperVectoring',
			]),
		},
	});

	// MagentaTV OTT Tariffs (standalone)
	await prisma.product.create({
		data: {
			name: 'MagentaTV Smart',
			category: 'MAGENTA_TV_OTT',
			basePrice: 10.00,
			contractDuration: 24,
			features: JSON.stringify([
				'100+ Sender',
				'HD',
				'RTL+ Premium',
				'MagentaTV App',
			]),
		},
	});

	await prisma.product.create({
		data: {
			name: 'MagentaTV Smart Flex',
			category: 'MAGENTA_TV_OTT',
			basePrice: 15.00,
			contractDuration: 1,
			features: JSON.stringify([
				'100+ Sender',
				'HD',
				'RTL+ Premium',
				'Monatlich kündbar',
			]),
		},
	});

	// Device
	await prisma.product.create({
		data: {
			name: 'Speedport Smart 4',
			category: 'DEVICE',
			basePrice: 6.95,
			purchasePrice: 169.99,
			rentalPrice: 6.95,
			deviceManufacturer: 'Telekom',
			deviceContext: 'Router',
			features: JSON.stringify([
				'Wi-Fi 6',
				'Mesh master',
				'SmartHome Hub',
			]),
		},
	});

	// Special Prices (multi-product)
	await prisma.specialPrice.create({
		data: {
			name: 'Mobil Aktion 6 Monate',
			priority: 10,
			products: {
				connect: [
					{
						id: mobilM.id,
					},
					{
						id: mobilL.id,
					},
				],
			},
			tiers: {
				create: [
					{
						price: 29.95,
						fromMonth: 1,
						toMonth: 6,
					},
				],
			},
		},
	});

	await prisma.specialPrice.create({
		data: {
			name: 'Neuanschluss Aktion',
			priority: 10,
			products: {
				connect: [
					{
						id: fiberM.id,
					},
					{
						id: fiberXL.id,
					},
				],
			},
			tiers: {
				create: [
					{
						price: 19.95,
						fromMonth: 1,
						toMonth: 6,
					},
					{
						price: 34.95,
						fromMonth: 7,
						toMonth: 12,
					},
				],
			},
		},
	});

	await prisma.specialPrice.create({
		data: {
			name: 'MagentaTV Bundle Promo',
			magentaTVRequirement: 'REQUIRED',
			priority: 20,
			products: {
				connect: [
					{
						id: fiberM.id,
					},
				],
			},
			tiers: {
				create: [
					{
						price: 39.95,
						fromMonth: 1,
						toMonth: 12,
					},
				],
			},
		},
	});

	// Addons
	await prisma.addon.create({
		data: {
			name: 'Netflix',
			category: 'Entertainment',
			isGlobal: true,
			tiers: {
				create: [
					{
						name: 'Standard mit Werbung',
						price: 4.99,
					},
					{
						name: 'Standard',
						price: 12.99,
					},
					{
						name: 'Premium',
						price: 17.99,
					},
				],
			},
		},
	});

	console.log('Seeding finished.');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
