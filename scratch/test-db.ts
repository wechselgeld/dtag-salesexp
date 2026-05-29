import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Querying Isabel Löpert...');
  const user = await prisma.user.findUnique({
    where: { id: 'cmpf7fwa60007mu0k7p8d2tfr' },
    include: {
      team: {
        include: {
          location: true,
        },
      },
      location: true,
    },
  });
  console.log('User:', JSON.stringify(user, null, 2));

  if (user?.teamId) {
    console.log('Querying Team...');
    const team = await prisma.team.findUnique({
      where: { id: user.teamId },
      include: { location: true },
    });
    console.log('Team:', JSON.stringify(team, null, 2));
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
