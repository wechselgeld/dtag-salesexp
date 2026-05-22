import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Creating a test Location to trigger the audit logger...');
  const location = await prisma.location.create({
    data: {
      name: 'Temp Test Hannover',
      address: 'Test Str. 1, 30159 Hannover',
      isActive: true,
    },
  });

  console.log('Location created:', location);

  console.log('Fetching the latest audit log entry...');
  const latestLog = await prisma.auditLog.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  console.log('Latest Audit Log Entry:');
  console.log(JSON.stringify(latestLog, null, 2));

  // Clean up the created location
  console.log('Cleaning up the test location...');
  await prisma.location.delete({
    where: { id: location.id },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
