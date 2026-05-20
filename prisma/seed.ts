import {
    PrismaClient,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting comprehensive database seed...');

    // 1. Clean existing seed data (optional/safe upserts used below)
    console.log('🧹 Cleaning up old demo data...');
    // We rely on upsert or deleteMany where appropriate to keep it clean but avoid breaking foreign keys if possible.

    // 2. OdRegions
    console.log('🗺️ Seeding OdRegions...');
    const regionsData = [
        {
            name: 'Region Nord',
            isActive: true,
        },
        {
            name: 'Region Ost',
            isActive: true,
        },
        {
            name: 'Region Süd',
            isActive: true,
        },
        {
            name: 'Region West',
            isActive: true,
        },
        {
            name: 'Region Mitte',
            isActive: true,
        },
    ];

    const regions: Record<string, any> = {
    };
    for (const r of regionsData) {
        const reg = await prisma.odRegion.create({
            data: r,
        });
        regions[r.name] = reg;
    }

    // 3. Locations
    console.log('🏢 Seeding Locations...');
    const locationsData = [
        {
            name: 'Berlin',
            address: 'Friedrichstraße 1, 10117 Berlin',
            odRegionId: regions['Region Ost'].id,
            isActive: true,
        },
        {
            name: 'Hamburg',
            address: 'Spitalerstraße 22, 20095 Hamburg',
            odRegionId: regions['Region Nord'].id,
            isActive: true,
        },
        {
            name: 'München',
            address: 'Erhardtstraße 10, 80469 München',
            odRegionId: regions['Region Süd'].id,
            isActive: true,
        },
        {
            name: 'Köln',
            address: 'Schildergasse 80, 50667 Köln',
            odRegionId: regions['Region West'].id,
            isActive: true,
        },
        {
            name: 'Frankfurt am Main',
            address: 'Zeil 106, 60313 Frankfurt am Main',
            odRegionId: regions['Region Mitte'].id,
            isActive: true,
        },
        {
            name: 'Stuttgart',
            point: 'Königstraße 38, 70173 Stuttgart',
            odRegionId: regions['Region Süd'].id,
            isActive: true,
        },
        {
            name: 'Düsseldorf',
            address: 'Königsallee 50, 40212 Düsseldorf',
            odRegionId: regions['Region West'].id,
            isActive: true,
        },
        {
            name: 'Leipzig',
            address: 'Grimmaische Straße 14, 04109 Leipzig',
            odRegionId: regions['Region Ost'].id,
            isActive: true,
        },
        {
            name: 'Dortmund',
            address: 'Westenhellweg 30, 44137 Dortmund',
            odRegionId: regions['Region West'].id,
            isActive: true,
        },
        {
            name: 'Essen',
            address: 'Kettwiger Straße 44, 45127 Essen',
            odRegionId: regions['Region West'].id,
            isActive: true,
        },
        {
            name: 'Bremen',
            address: 'Obernstraße 45, 28195 Bremen',
            odRegionId: regions['Region Nord'].id,
            isActive: true,
        },
        {
            name: 'Dresden',
            address: 'Prager Straße 15, 01069 Dresden',
            odRegionId: regions['Region Ost'].id,
            isActive: true,
        },
        {
            name: 'Hannover',
            address: 'Bahnhofstraße 12, 30159 Hannover',
            odRegionId: regions['Region Nord'].id,
            isActive: true,
        },
        {
            name: 'Nürnberg',
            address: 'Karolinenstraße 25, 90402 Nürnberg',
            odRegionId: regions['Region Süd'].id,
            isActive: true,
        },
        {
            name: 'Chemnitz',
            address: 'Straße der Nationen 12, 09111 Chemnitz',
            odRegionId: regions['Region Ost'].id,
            isActive: true,
        },
    ];

    const locations: Record<string, any> = {
    };
    for (const l of locationsData) {
        const loc = await prisma.location.create({
            data: {
                name: l.name,
                address: l.address || l.point,
                odRegionId: l.odRegionId,
                isActive: l.isActive,
            },
        });
        locations[l.name] = loc;
    }

    // 4. Teams
    console.log('👥 Seeding Teams...');
    const teamsData: { name: string; email: string; locationName: string }[] = [
        {
            name: 'Team Alpha Berlin',
            email: 'team.berlin.alpha@telekom.de',
            locationName: 'Berlin',
        },
        {
            name: 'Team Beta Berlin',
            email: 'team.berlin.beta@telekom.de',
            locationName: 'Berlin',
        },
        {
            name: 'Team Premium Berlin',
            email: 'team.berlin.premium@telekom.de',
            locationName: 'Berlin',
        },
        {
            name: 'Team Glasfaser Hamburg',
            email: 'team.hamburg.fiber@telekom.de',
            locationName: 'Hamburg',
        },
        {
            name: 'Team City Hamburg',
            email: 'team.hamburg.city@telekom.de',
            locationName: 'Hamburg',
        },
        {
            name: 'Team B2B München',
            email: 'team.muenchen.b2b@telekom.de',
            locationName: 'München',
        },
        {
            name: 'Team Young München',
            email: 'team.muenchen.young@telekom.de',
            locationName: 'München',
        },
        {
            name: 'Team Residenz München',
            email: 'team.muenchen.residenz@telekom.de',
            locationName: 'München',
        },
        {
            name: 'Team Dom Köln',
            email: 'team.koeln.dom@telekom.de',
            locationName: 'Köln',
        },
        {
            name: 'Team West Köln',
            email: 'team.koeln.west@telekom.de',
            locationName: 'Köln',
        },
        {
            name: 'Team Skyline Frankfurt',
            email: 'team.frankfurt.skyline@telekom.de',
            locationName: 'Frankfurt am Main',
        },
        {
            name: 'Team Airport Frankfurt',
            email: 'team.frankfurt.airport@telekom.de',
            locationName: 'Frankfurt am Main',
        },
        {
            name: 'Team Kessel Stuttgart',
            email: 'team.stuttgart.kessel@telekom.de',
            locationName: 'Stuttgart',
        },
        {
            name: 'Team Kö Düsseldorf',
            email: 'team.duesseldorf.koe@telekom.de',
            locationName: 'Düsseldorf',
        },
        {
            name: 'Team Messe Leipzig',
            email: 'team.leipzig.messe@telekom.de',
            locationName: 'Leipzig',
        },
        {
            name: 'Team Campus Dortmund',
            email: 'team.dortmund.campus@telekom.de',
            locationName: 'Dortmund',
        },
        {
            name: 'Team Ruhr Essen',
            email: 'team.essen.ruhr@telekom.de',
            locationName: 'Essen',
        },
        {
            name: 'Team Weser Bremen',
            email: 'team.bremen.weser@telekom.de',
            locationName: 'Bremen',
        },
        {
            name: 'Team Elbflorenz Dresden',
            email: 'team.dresden.elbflorenz@telekom.de',
            locationName: 'Dresden',
        },
        {
            name: 'Team Maschsee Hannover',
            email: 'team.hannover.maschsee@telekom.de',
            locationName: 'Hannover',
        },
        {
            name: 'Team Burg Nürnberg',
            email: 'team.nuernberg.burg@telekom.de',
            locationName: 'Nürnberg',
        },
        {
            name: 'Team Marx Chemnitz',
            email: 'team.chemnitz.marx@telekom.de',
            locationName: 'Chemnitz',
        },
    ];

    const teams: Record<string, any> = {
    };
    for (const t of teamsData) {
        const loc = locations[t.locationName];
        const team = await prisma.team.create({
            data: {
                name: t.name,
                email: t.email,
                locationId: loc ? loc.id : undefined,
            },
        });
        teams[t.name] = team;
    }

    // 5. Users
    console.log('👤 Seeding Users...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedPin = await bcrypt.hash('123456', 10);

    const usersData = [
        {
            email: 'admin@telekom.de',
            password: hashedAdminPassword,
            pin: hashedPin,
            firstName: 'Admin',
            lastName: 'Telekom',
            role: 'ADMIN',
            isVerified: true,
            acceptedTerms: true,
            teamId: teams['Team Alpha Berlin'].id,
            locationId: locations['Berlin'].id,
            odRegionId: regions['Region Ost'].id,
        },
        {
            email: 'max.mustermann@telekom.de',
            pin: hashedPin,
            firstName: 'Max',
            lastName: 'Mustermann',
            role: 'USER',
            isVerified: true,
            acceptedTerms: true,
            teamId: teams['Team Alpha Berlin'].id,
            locationId: locations['Berlin'].id,
            odRegionId: regions['Region Ost'].id,
        },
        {
            email: 'anna.beispiel@telekom.de',
            pin: hashedPin,
            firstName: 'Anna',
            lastName: 'Beispiel',
            role: 'USER',
            isVerified: true,
            acceptedTerms: true,
            teamId: teams['Team B2B München'].id,
            locationId: locations['München'].id,
            odRegionId: regions['Region Süd'].id,
        },
        {
            email: 'felix.berater@telekom.de',
            pin: hashedPin,
            firstName: 'Felix',
            lastName: 'Berater',
            role: 'USER',
            isVerified: true,
            acceptedTerms: true,
            teamId: teams['Team Marx Chemnitz'].id,
            locationId: locations['Chemnitz'].id,
            odRegionId: regions['Region Ost'].id,
        },
        {
            email: 'sarah.sales@telekom.de',
            pin: hashedPin,
            firstName: 'Sarah',
            lastName: 'Sales',
            role: 'USER',
            isVerified: true,
            acceptedTerms: true,
            teamId: teams['Team Glasfaser Hamburg'].id,
            locationId: locations['Hamburg'].id,
            odRegionId: regions['Region Nord'].id,
        },
        {
            email: 'tim.telekom@telekom.de',
            pin: hashedPin,
            firstName: 'Tim',
            lastName: 'Telekom',
            role: 'USER',
            isVerified: true,
            acceptedTerms: true,
            teamId: teams['Team Dom Köln'].id,
            locationId: locations['Köln'].id,
            odRegionId: regions['Region West'].id,
        },
        {
            email: 'demo.agent@telekom.de',
            pin: hashedPin,
            firstName: 'Demo',
            lastName: 'Agent',
            role: 'USER',
            isVerified: true,
            acceptedTerms: true,
            teamId: teams['Team Skyline Frankfurt'].id,
            locationId: locations['Frankfurt am Main'].id,
            odRegionId: regions['Region Mitte'].id,
        },
        {
            email: 'test.berater@telekom.de',
            pin: hashedPin,
            firstName: 'Test',
            lastName: 'Berater',
            role: 'USER',
            isVerified: false,
            acceptedTerms: true,
            teamId: teams['Team Alpha Berlin'].id,
            locationId: locations['Berlin'].id,
            odRegionId: regions['Region Ost'].id,
        },
        {
            email: 'dev.admin@telekom.de',
            password: hashedAdminPassword,
            pin: hashedPin,
            firstName: 'Dev',
            lastName: 'Admin',
            role: 'ADMIN',
            isVerified: true,
            acceptedTerms: true,
            teamId: teams['Team Kessel Stuttgart'].id,
            locationId: locations['Stuttgart'].id,
            odRegionId: regions['Region Süd'].id,
        },
    ];

    const users: Record<string, any> = {
    };
    for (const u of usersData) {
        const user = await prisma.user.upsert({
            where: {
                email: u.email,
            },
            update: u,
            create: u,
        });
        users[u.email] = user;
    }

    // 6. UserSessions
    console.log('💻 Seeding UserSession logs...');
    const sampleIps = [
        '10.0.1.55',
        '192.168.178.20',
        '172.16.0.100',
        '87.123.45.67',
        '80.150.140.22',
        '10.10.50.12',
        '192.168.1.105',
        '172.20.10.2',
    ];
    const sampleUserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
        'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    ];

    const allUserObjList = Object.values(users);
    for (let i = 0; i < 40; i++) {
        const randUser = allUserObjList[Math.floor(Math.random() * allUserObjList.length)];
        const randIp = sampleIps[Math.floor(Math.random() * sampleIps.length)];
        const randUA = sampleUserAgents[Math.floor(Math.random() * sampleUserAgents.length)];
        // Random date within the last 14 days
        const randDaysAgo = Math.floor(Math.random() * 14);
        const randHoursAgo = Math.floor(Math.random() * 24);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - randDaysAgo);
        createdAt.setHours(createdAt.getHours() - randHoursAgo);

        const expiresAt = new Date(createdAt);
        expiresAt.setDate(expiresAt.getDate() + (randUser.role === 'USER' ? 30 : 1));

        await prisma.userSession.create({
            data: {
                userId: randUser.id,
                ip: randIp,
                userAgent: randUA,
                deviceId: `dev-${Math.floor(Math.random() * 10000)}`,
                isActive: randDaysAgo < 5,
                createdAt,
                expiresAt,
            },
        });
    }

    // 7. Products
    console.log('📦 Seeding Products...');

    // MOBILE
    const mobilS = await prisma.product.create({
        data: {
            name: 'MagentaMobil S',
            category: 'MOBILE',
            basePrice: 39.95,
            dataVolume: '10 GB',
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
            magentaInfosUrl: 'https://magentainfos.telekom.de/mobile/mobil-s',
        },
    });
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
            magentaInfosUrl: 'https://magentainfos.telekom.de/mobile/mobil-l',
        },
    });
    const mobilXL = await prisma.product.create({
        data: {
            name: 'MagentaMobil XL',
            category: 'MOBILE',
            basePrice: 84.95,
            dataVolume: 'Unlimited',
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
                'Unlimited GB',
            ]),
            magentaInfosUrl: 'https://magentainfos.telekom.de/mobile/mobil-xl',
        },
    });
    const mobilYoungM = await prisma.product.create({
        data: {
            name: 'MagentaMobil Young M',
            category: 'MOBILE',
            basePrice: 39.95,
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
                'Young Vorteil',
            ]),
            magentaInfosUrl: 'https://magentainfos.telekom.de/mobile/mobil-young-m',
        },
    });
    const _prepaid5G = await prisma.product.create({
        data: {
            name: 'Prepaid 5G Jahrestarif',
            category: 'MOBILE',
            basePrice: 99.95,
            dataVolume: '96 GB / Jahr',
            downloadSpeed: 300,
            uploadSpeed: 50,
            contractDuration: 12,
            allowNewActivation: true,
            allowMove: false,
            allowPlanChange: false,
            activationFeeNew: 0,
            features: JSON.stringify([
                '5G',
                'Phone Flat',
                'SMS Flat',
                'EU Roaming',
                'Einmalzahlung',
            ]),
            magentaInfosUrl: 'https://magentainfos.telekom.de/mobile/prepaid-5g',
        },
    });

    // FIBER
    const fiberS = await prisma.product.create({
        data: {
            name: 'MagentaZuhause S',
            category: 'FIBER',
            basePrice: 37.95,
            downloadSpeed: 16,
            uploadSpeed: 2.4,
            contractDuration: 24,
            allowNewActivation: true,
            allowMove: true,
            allowPlanChange: true,
            allowSpeedUp: true,
            activationFeeNew: 69.95,
            activationFeeMove: 69.95,
            allowMagentaTV: true,
            hasMagentaTVBundle: true,
            magentaTVBundleName: 'MagentaZuhause S mit MagentaTV Smart',
            magentaTVBundlePrice: 47.95,
            features: JSON.stringify([
                'Flatrate ins dt. Festnetz',
                'Internet Flat',
            ]),
        },
    });
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
    const fiberL = await prisma.product.create({
        data: {
            name: 'MagentaZuhause L',
            category: 'FIBER',
            basePrice: 47.95,
            downloadSpeed: 100,
            uploadSpeed: 40,
            contractDuration: 24,
            allowNewActivation: true,
            allowMove: true,
            allowPlanChange: true,
            allowSpeedUp: true,
            activationFeeNew: 69.95,
            activationFeeMove: 69.95,
            allowMagentaTV: true,
            hasMagentaTVBundle: true,
            magentaTVBundleName: 'MagentaZuhause L mit MagentaTV Smart',
            magentaTVBundlePrice: 57.95,
            features: JSON.stringify([
                'Flatrate ins dt. Festnetz',
                'Internet Flat',
                '100 MBit/s',
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
            magentaTVBundleName: 'MagentaZuhause XL mit MagentaTV Smart',
            magentaTVBundlePrice: 64.95,
            features: JSON.stringify([
                'Flatrate ins dt. Festnetz',
                'Internet Flat',
                'SuperVectoring',
            ]),
        },
    });
    const fiberXXL = await prisma.product.create({
        data: {
            name: 'MagentaZuhause XXL',
            category: 'FIBER',
            basePrice: 59.95,
            downloadSpeed: 500,
            uploadSpeed: 100,
            contractDuration: 24,
            allowNewActivation: true,
            allowMove: true,
            allowPlanChange: true,
            allowSpeedUp: true,
            activationFeeNew: 69.95,
            allowMagentaTV: true,
            hasMagentaTVBundle: true,
            magentaTVBundleName: 'MagentaZuhause XXL mit MagentaTV Smart',
            magentaTVBundlePrice: 69.95,
            features: JSON.stringify([
                'Flatrate ins dt. Festnetz',
                'Internet Flat',
                '500 MBit/s Glasfaser',
            ]),
        },
    });
    const fiberGiga = await prisma.product.create({
        data: {
            name: 'MagentaZuhause Giga',
            category: 'FIBER',
            basePrice: 79.95,
            downloadSpeed: 1000,
            uploadSpeed: 200,
            contractDuration: 24,
            allowNewActivation: true,
            allowMove: true,
            allowPlanChange: true,
            allowSpeedUp: true,
            activationFeeNew: 69.95,
            allowMagentaTV: true,
            hasMagentaTVBundle: true,
            magentaTVBundleName: 'MagentaZuhause Giga mit MagentaTV Smart',
            magentaTVBundlePrice: 89.95,
            features: JSON.stringify([
                'Flatrate ins dt. Festnetz',
                'Internet Flat',
                '1000 MBit/s Gigabit Glasfaser',
            ]),
        },
    });

    // DSL
    const _dslM = await prisma.product.create({
        data: {
            name: 'MagentaZuhause M (DSL)',
            category: 'DSL',
            basePrice: 42.95,
            downloadSpeed: 50,
            uploadSpeed: 10,
            contractDuration: 24,
            allowNewActivation: true,
            allowMove: true,
            allowPlanChange: true,
            allowSpeedUp: true,
            activationFeeNew: 69.95,
            allowMagentaTV: true,
            features: JSON.stringify([
                'Flatrate ins dt. Festnetz',
                'Internet Flat',
            ]),
        },
    });

    // MAGENTA_TV_OTT
    const _tvSmart = await prisma.product.create({
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
    const _tvFlex = await prisma.product.create({
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
    const _tvSmartStream = await prisma.product.create({
        data: {
            name: 'MagentaTV SmartStream',
            category: 'MAGENTA_TV_OTT',
            basePrice: 17.00,
            contractDuration: 24,
            features: JSON.stringify([
                '100+ Sender',
                'HD',
                'Netflix Standard m. Werbung',
                'Disney+ Standard m. Werbung',
                'RTL+ Premium',
            ]),
        },
    });
    const _tvMegaStream = await prisma.product.create({
        data: {
            name: 'MagentaTV MegaStream',
            category: 'MAGENTA_TV_OTT',
            basePrice: 27.00,
            contractDuration: 24,
            features: JSON.stringify([
                '100+ Sender',
                'HD',
                'Netflix Standard',
                'Disney+ Standard',
                'RTL+ Premium',
                'Apple TV+',
            ]),
        },
    });

    // DEVICE
    const _routerSmart4 = await prisma.product.create({
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
    const routerProPlus = await prisma.product.create({
        data: {
            name: 'Speedport Pro Plus',
            category: 'DEVICE',
            basePrice: 9.95,
            purchasePrice: 389.99,
            rentalPrice: 9.95,
            deviceManufacturer: 'Telekom',
            deviceContext: 'Router',
            features: JSON.stringify([
                'Wi-Fi 6',
                'Hybrid-LTE',
                'Premium Mesh',
            ]),
        },
    });
    const _modem2 = await prisma.product.create({
        data: {
            name: 'Glasfaser Modem 2',
            category: 'DEVICE',
            basePrice: 0,
            purchasePrice: 49.99,
            rentalPrice: 0,
            deviceManufacturer: 'Telekom',
            deviceContext: 'Modem',
            features: JSON.stringify([
                '2.5 Gigabit LAN',
                'Wandmontage möglich',
            ]),
        },
    });
    const iphone15 = await prisma.product.create({
        data: {
            name: 'Apple iPhone 15 Pro (128GB)',
            category: 'DEVICE',
            basePrice: 39.95,
            purchasePrice: 1199.00,
            rentalPrice: 39.95,
            deviceManufacturer: 'Apple',
            deviceContext: 'Smartphone',
            features: JSON.stringify([
                'Titan-Design',
                'A17 Pro Chip',
                '48 MP Hauptkamera',
            ]),
        },
    });
    const _s24Ultra = await prisma.product.create({
        data: {
            name: 'Samsung Galaxy S24 Ultra (256GB)',
            category: 'DEVICE',
            basePrice: 45.95,
            purchasePrice: 1449.00,
            rentalPrice: 45.95,
            deviceManufacturer: 'Samsung',
            deviceContext: 'Smartphone',
            features: JSON.stringify([
                'Galaxy AI',
                'S-Pen integriert',
                '200 MP Kamera',
            ]),
        },
    });
    const _pixel8Pro = await prisma.product.create({
        data: {
            name: 'Google Pixel 8 Pro (128GB)',
            category: 'DEVICE',
            basePrice: 29.95,
            purchasePrice: 1099.00,
            rentalPrice: 29.95,
            deviceManufacturer: 'Google',
            deviceContext: 'Smartphone',
            features: JSON.stringify([
                'Google AI',
                'Tensor G3',
                'Best-in-class Kamera',
            ]),
        },
    });
    const _ipadAir = await prisma.product.create({
        data: {
            name: 'Apple iPad Air (5. Gen, 64GB)',
            category: 'DEVICE',
            basePrice: 24.95,
            purchasePrice: 799.00,
            rentalPrice: 24.95,
            deviceManufacturer: 'Apple',
            deviceContext: 'Tablet',
            features: JSON.stringify([
                'M1 Chip',
                '10.9" Liquid Retina',
                '5G fähig',
            ]),
        },
    });
    const _tvOne = await prisma.product.create({
        data: {
            name: 'MagentaTV One (2. Gen)',
            category: 'DEVICE',
            basePrice: 5.00,
            purchasePrice: 169.00,
            rentalPrice: 5.00,
            deviceManufacturer: 'Telekom',
            deviceContext: 'TV-Box',
            features: JSON.stringify([
                '4K Ultra HD',
                'Android TV',
                'Sprachsteuerung',
            ]),
        },
    });

    // 8. Special Prices
    console.log('🏷️ Seeding Special Prices...');
    await prisma.specialPrice.create({
        data: {
            name: 'Mobil Aktion 6 Monate',
            priority: 10,
            products: {
                connect: [
                    {
                        id: mobilS.id,
                    },
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
                        id: fiberS.id,
                    },
                    {
                        id: fiberM.id,
                    },
                    {
                        id: fiberL.id,
                    },
                    {
                        id: fiberXL.id,
                    },
                    {
                        id: fiberXXL.id,
                    },
                    {
                        id: fiberGiga.id,
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
                    {
                        id: fiberL.id,
                    },
                    {
                        id: fiberXL.id,
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
    await prisma.specialPrice.create({
        data: {
            name: 'Young Vorteil 10€ Rabatt',
            priority: 15,
            products: {
                connect: [
                    {
                        id: mobilYoungM.id,
                    },
                ],
            },
            tiers: {
                create: [
                    {
                        price: 29.95,
                        fromMonth: 1,
                        toMonth: 24,
                    },
                ],
            },
        },
    });
    await prisma.specialPrice.create({
        data: {
            name: 'MagentaEINS Kombivorteil',
            priority: 25,
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
                        price: 44.95,
                        fromMonth: 1,
                        toMonth: 24,
                    },
                ],
            },
        },
    });

    // 9. Addons
    console.log('🧩 Seeding Addons...');
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
    await prisma.addon.create({
        data: {
            name: 'Disney+',
            category: 'Entertainment',
            isGlobal: true,
            tiers: {
                create: [
                    {
                        name: 'Standard mit Werbung',
                        price: 5.99,
                    },
                    {
                        name: 'Standard',
                        price: 8.99,
                    },
                    {
                        name: 'Premium',
                        price: 11.99,
                    },
                ],
            },
        },
    });
    await prisma.addon.create({
        data: {
            name: 'RTL+ Premium',
            category: 'Entertainment',
            isGlobal: true,
            tiers: {
                create: [
                    {
                        name: 'Premium',
                        price: 6.99,
                    },
                    {
                        name: 'Max',
                        price: 12.99,
                    },
                ],
            },
        },
    });
    await prisma.addon.create({
        data: {
            name: 'Apple TV+',
            category: 'Entertainment',
            isGlobal: true,
            tiers: {
                create: [
                    {
                        name: 'Abo',
                        price: 9.99,
                    },
                ],
            },
        },
    });
    await prisma.addon.create({
        data: {
            name: 'Spotify Premium',
            category: 'Music',
            isGlobal: true,
            tiers: {
                create: [
                    {
                        name: 'Individual',
                        price: 10.99,
                    },
                    {
                        name: 'Family',
                        price: 17.99,
                    },
                ],
            },
        },
    });
    await prisma.addon.create({
        data: {
            name: 'MagentaSport',
            category: 'Sports',
            isGlobal: true,
            tiers: {
                create: [
                    {
                        name: 'Jahresabo',
                        price: 7.95,
                    },
                    {
                        name: 'Monatsabo',
                        price: 12.95,
                    },
                ],
            },
        },
    });
    await prisma.addon.create({
        data: {
            name: 'Sicherheitspaket Komplett',
            category: 'Security',
            isGlobal: true,
            tiers: {
                create: [
                    {
                        name: 'S (3 Geräte)',
                        price: 4.95,
                    },
                    {
                        name: 'L (5 Geräte)',
                        price: 6.95,
                    },
                ],
            },
        },
    });
    await prisma.addon.create({
        data: {
            name: '5G Option',
            category: 'Network',
            isGlobal: true,
            tiers: {
                create: [
                    {
                        name: '5G Speed',
                        price: 5.00,
                    },
                ],
            },
        },
    });
    await prisma.addon.create({
        data: {
            name: 'Family Card',
            category: 'Mobile',
            isGlobal: true,
            tiers: {
                create: [
                    {
                        name: 'Family Card S',
                        price: 19.95,
                    },
                    {
                        name: 'Family Card M',
                        price: 29.95,
                    },
                ],
            },
        },
    });

    // 10. OneTimeCredits
    console.log('💳 Seeding OneTimeCredits...');
    const creditsData = [
        {
            name: 'Online-Vorteil 100€',
            value: 100.0,
        },
        {
            name: 'Online-Vorteil 70€',
            value: 70.0,
        },
        {
            name: 'Wechsler-Bonus 120€',
            value: 120.0,
        },
        {
            name: 'Router-Gutschrift 70€',
            value: 70.0,
        },
        {
            name: 'Anschlussgebühr Befreiung (69,95€)',
            value: 69.95,
        },
        {
            name: 'Bereitstellungspreis Befreiung (39,95€)',
            value: 39.95,
        },
        {
            name: 'Junge Leute Bonus 50€',
            value: 50.0,
        },
        {
            name: 'Aktionsgutschrift 150€',
            value: 150.0,
        },
    ];
    for (const c of creditsData) {
        await prisma.oneTimeCredit.create({
            data: c,
        });
    }

    // 11. News
    console.log('📰 Seeding News...');
    const newsArticles = [
        {
            title: 'Neuer Glasfaser-Ausbau in München gestartet!',
            content: 'In den Stadtteilen Schwabing und Bogenhausen beginnen ab sofort die Tiefbauarbeiten für das neue FTTH-Netz. Bitte informiert die Kunden über die kostenlose Hausanschluss-Aktion!',
            priority: 'HIGH',
            odRegionId: regions['Region Süd'].id,
            locationId: locations['München'].id,
        },
        {
            title: 'MagentaMobil Young Kampagne Q2/2026',
            content: 'Unsere neuen Young-Tarife bieten ab sofort noch mehr Datenvolumen zum gleichen Preis. Nutzt die neuen Argumentationsleitfäden im Verkaufsgespräch.',
            priority: 'INFO',
            odRegionId: regions['Region Ost'].id,
        },
        {
            title: 'Wichtige Info zum Speedport Smart 4 Firmware-Update',
            content: 'Das neue Update v4.2 behebt bekannte WLAN-Abbrüche bei Mesh-Konfigurationen. Bei Kundenreklamationen bitte auf das automatische Update verweisen.',
            priority: 'WARNING',
        },
        {
            title: 'Erfolgreicher Verkaufsmonat im Standort Berlin',
            content: 'Herzlichen Glückwunsch an Team Alpha für das Erreichen von 120% der Monatsziele im Bereich Glasfaser-Neuanschlüsse! Weiter so!',
            priority: 'INFO',
            locationId: locations['Berlin'].id,
        },
        {
            title: 'Neue Schulungstermine für MagentaTV MegaStream',
            content: 'Am kommenden Dienstag finden zwei Online-Schulungen zu den neuen Features von Disney+ und Apple TV+ im MegaStream-Tarif statt. Anmeldung über das Intranet.',
            priority: 'INFO',
        },
        {
            title: 'Glasfaser-Messe in Hamburg: Standbesetzung gesucht',
            content: 'Für die Messe am 28. Mai suchen wir noch motivierte Berater für unseren Telekom-Stand. Interessenten melden sich bitte beim Teamleiter.',
            priority: 'INFO',
            locationId: locations['Hamburg'].id,
        },
        {
            title: 'System-Update: Verbesserte Adressprüfung',
            content: 'Die Adressprüfung im Festnetz-Bereich wurde optimiert und liefert nun exaktere Ergebnisse für die buchbaren Bandbreiten.',
            priority: 'INFO',
        },
        {
            title: 'Top-Seller Bonus für Apple iPhone 15 Pro',
            content: 'Im aktuellen Aktionszeitraum erhalten Berater für jedes verkaufte iPhone 15 Pro mit MagentaMobil L einen Sonderbonus.',
            priority: 'HIGH',
        },
    ];
    for (const n of newsArticles) {
        await prisma.news.create({
            data: n,
        });
    }

    // 12. MaintenanceAnnouncements
    console.log('⚠️ Seeding MaintenanceAnnouncements...');
    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now); nextWeek.setDate(nextWeek.getDate() + 7);

    await prisma.maintenanceAnnouncement.create({
        data: {
            title: 'Geplante Systemwartung am kommenden Sonntag',
            message: 'Aufgrund von Datenbank-Optimierungen steht das Buchungssystem am Sonntag zwischen 02:00 und 05:00 Uhr nur eingeschränkt zur Verfügung.',
            priority: 'WARNING',
            validFrom: tomorrow,
            validUntil: nextWeek,
        },
    });

    // 13. TeamHighlights
    console.log('⭐ Seeding TeamHighlights...');
    await prisma.teamHighlight.create({
        data: {
            teamId: teams['Team Alpha Berlin'].id,
            productId: fiberGiga.id,
            category: 'FIBER',
            businessCase: 'NEW',
            reason: 'Fokus-Produkt für den neuen FTTH-Ausbau in Berlin-Mitte.',
            active: true,
        },
    });
    await prisma.teamHighlight.create({
        data: {
            teamId: teams['Team Alpha Berlin'].id,
            productId: iphone15.id,
            category: 'DEVICE',
            businessCase: 'NEW',
            reason: 'Bestseller in Kombination mit MagentaMobil M.',
            active: true,
        },
    });
    await prisma.teamHighlight.create({
        data: {
            teamId: teams['Team B2B München'].id,
            productId: mobilXL.id,
            category: 'MOBILE',
            businessCase: 'NEW',
            reason: 'Unbegrenztes Datenvolumen für Geschäftskunden.',
            active: true,
        },
    });
    await prisma.teamHighlight.create({
        data: {
            teamId: teams['Team B2B München'].id,
            productId: routerProPlus.id,
            category: 'DEVICE',
            businessCase: 'NEW',
            reason: 'Maximale Ausfallsicherheit durch Hybrid-LTE.',
            active: true,
        },
    });
    await prisma.teamHighlight.create({
        data: {
            teamId: teams['Team Marx Chemnitz'].id,
            productId: fiberM.id,
            category: 'FIBER',
            businessCase: 'NEW',
            reason: 'Attraktiver Einstiegstarif für Wechsler.',
            active: true,
        },
    });
    await prisma.teamHighlight.create({
        data: {
            teamId: teams['Team Glasfaser Hamburg'].id,
            productId: fiberXXL.id,
            category: 'FIBER',
            businessCase: 'NEW',
            reason: 'Highspeed-Anschluss für anspruchsvolle Haushalte.',
            active: true,
        },
    });

    console.log('✨ Comprehensive database seed completed successfully!');
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
