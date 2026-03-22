import {
  PrismaClient,
} from '@prisma/client';
import pRetry, {
  AbortError,
} from 'p-retry';
import { dbLogger, formatDuration, formatQuery } from './logger';

// Transient Prisma Error Codes that are safe to retry
const RETRYABLE_ERROR_CODES = [
  'P1001', // Can't reach database server
  'P1002', // The database server was reached but timed out
  'P1008', // Operations timed out
  'P1017', // Server has closed the connection
  'P2024', // Timed out fetching a new connection from the connection pool
  'P2034', // Transaction failed due to a write conflict or a deadlock
];

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  });

  // Pretty log for all queries
  client.$on('query', (e) => {
    const durationStr = formatDuration(e.duration);
    const queryStr = formatQuery(e.query);
    
    if (e.duration > 500) {
      dbLogger.warn(`Slow Query (${durationStr}): ${queryStr}`);
    } else {
      dbLogger.debug(`Query (${durationStr}): ${queryStr}`);
    }
  });

  return client.$extends({
    query: {
      $allModels: {
        $allOperations({
          model, operation, args, query,
        }) {
          return pRetry(
            async () => {
              try {
                return await query(args);
              }
              catch (error) {
                // Check if the error is a Prisma client known request error
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const err = error as any;
                if (
                  err &&
                  typeof err === 'object' &&
                  'code' in err &&
                  typeof err.code === 'string' &&
                  RETRYABLE_ERROR_CODES.includes(err.code)
                ) {
                  throw error; // Rethrow to be caught and retried by pRetry
                }
                else {
                  throw new AbortError(error as Error);
                }
              }
            },
            {
              retries: 3,
              minTimeout: 100,
              maxTimeout: 1000,
              randomize: true,
              onFailedAttempt: (error) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const err = error as any;
                if (
                  err &&
                  typeof err === 'object' &&
                  'code' in err &&
                  typeof err.code === 'string' &&
                  RETRYABLE_ERROR_CODES.includes(err.code)
                ) {
                  dbLogger.error(
                    `Retry failed for ${model}.${operation} (Code: ${err.code}). Attempt ${error.attemptNumber}/4`,
                  );
                }
              },
            },
          );
        },
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') { globalForPrisma.prisma = prisma; }
