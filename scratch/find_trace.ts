import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const traceId = 'tr_77badc11733e4d07';
  console.log(`Searching for trace ID: ${traceId}`);

  const errorLogs = await prisma.errorLog.findMany({
    where: {
      traceId: traceId,
    },
  });

  const outputPath = path.join(__dirname, 'trace_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(errorLogs, null, 2), 'utf-8');
  console.log('Results written to:', outputPath);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
