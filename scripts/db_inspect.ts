import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Querying Database Logs and exporting...');
  
  const alexUser = await prisma.user.findUnique({
    where: { id: 'cmpghwqpy000fmu0kj2lczck8' },
  });

  const errorLogs = await prisma.errorLog.findMany({
    where: {
      OR: [
        { userId: 'cmpghwqpy000fmu0kj2lczck8' },
        { userEmail: 'a.geue@telekom.de' },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });

  const allNewsErrors = await prisma.errorLog.findMany({
    where: {
      path: {
        contains: 'news',
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });

  const results = {
    alexUser,
    errorLogs,
    allNewsErrors,
  };

  const outputPath = path.join(__dirname, 'db_inspect_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log('Results written to:', outputPath);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
