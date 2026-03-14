import {
  PrismaClient,
} from '@prisma/client';
import pRetry, {
  AbortError,
} from 'p-retry';

// Transient Prisma Error Codes that are safe to retry
// https://www.prisma.io/docs/reference/api-reference/error-reference#prisma-client-query-engine
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
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  });

  // Listen for queries and log warnings if they take more than 500ms
  client.$on('query', (e) => {
    if (e.duration > 500) {
      console.warn(`[Slow Query Warning] Query took ${e.duration}ms: ${e.query}`);
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
                  // If it's not a retryable error, abort immediately.
                  // p-retry will unwrap AbortError and throw the original error.
                  throw new AbortError(error as Error);
                }
              }
            },
            {
              retries: 3,
              minTimeout: 100,
              maxTimeout: 1000,
              randomize: true, // adds jitter
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
                  console.warn(
                    `[Prisma Retry Warning] ${model}.${operation} failed with code ${err.code}. Retrying... (Attempt ${error.attemptNumber} of 4)`,
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
