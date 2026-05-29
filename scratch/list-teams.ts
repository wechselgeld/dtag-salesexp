import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Querying all teams...');
  const teams = await prisma.team.findMany({
    include: {
      location: true,
    },
  });
  console.log(`Found ${teams.length} teams:`);
  for (const t of teams) {
    console.log(`- Team ID: ${t.id}, Name: ${t.name}, LocationId: ${t.locationId}, Location Name: ${t.location?.name || 'None'}`);
  }

  console.log('\nQuerying all locations...');
  const locations = await prisma.location.findMany();
  for (const l of locations) {
    console.log(`- Location ID: ${l.id}, Name: ${l.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
