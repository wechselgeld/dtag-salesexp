import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const traceId = 'tr_77badc11733e4d07';
  console.log(`Searching for trace ID: ${traceId}`);

  const errorLogs = await prisma.errorLog.findMany({
    where: {
      traceId: traceId,
    },
  });

  console.log('\n--- Error Logs ---');
  console.log(JSON.stringify(errorLogs, null, 2));

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      details: {
        path: ['traceId'],
        equals: traceId,
      },
    },
  });
  
  if (auditLogs.length > 0) {
    console.log('\n--- Audit Logs ---');
    console.log(JSON.stringify(auditLogs, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
