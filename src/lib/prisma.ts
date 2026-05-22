import {
  PrismaClient, Prisma,
} from '@prisma/client';
export {
  Prisma,
};
import pRetry, {
  AbortError,
} from 'p-retry';
import {
  dbLogger, formatDuration, formatQuery,
} from './logger';

const RETRYABLE_ERROR_CODES = [
  'P1001', // Can't reach database server
  'P1002', // Database server timed out
  'P1008', // Operations timed out
  'P1017', // Server closed the connection
  'P2024', // Connection pool timeout
  'P2034', // Write conflict / deadlock
];

// Only reads are idempotent. Retrying a write that timed out on the client but
// succeeded in the DB causes duplicates, double-charges, or constraint violations.
const READ_OPERATIONS = new Set([
  'findMany',
  'findUnique',
  'findFirst',
  'findUniqueOrThrow',
  'findFirstOrThrow',
  'count',
  'aggregate',
  'groupBy',
]);

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

  client.$on('query', (e) => {
    const durationStr = formatDuration(e.duration);
    const queryStr = formatQuery(e.query);
    if (e.duration > 500) {
      dbLogger.warn(`Slow Query (${durationStr}): ${queryStr}`);
    }
    else {
      dbLogger.debug(`Query (${durationStr}): ${queryStr}`);
    }
  });

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({
          model, operation, args, query,
        }) {
          // Intercept single-row creations, updates, and deletions for audited models
          const isWrite = [
 'create',
'update',
'delete',
].includes(operation);
          if (model && isWrite) {
            try {
              const {
                isAuditedModel,
                fetchCurrentState,
                fetchCurrentStateWithRelations,
                logAutomaticAction,
              } = await import('./audit-logger');

              if (isAuditedModel(model)) {
                if (operation === 'create') {
                  const result = await query(args);
                  await logAutomaticAction('CREATE', model, result);
                  return result;
                }
                if (operation === 'update') {
                  const oldValue = await fetchCurrentState(model, args.where);
                  const result = await query(args);
                  await logAutomaticAction('UPDATE', model, result, oldValue);
                  return result;
                }
                if (operation === 'delete') {
                  const oldValue = await fetchCurrentStateWithRelations(model, args.where);
                  const result = await query(args);
                  await logAutomaticAction('DELETE', model, result, oldValue);
                  return result;
                }
              }
            }
 catch (err) {
              console.error('[Audit Interceptor Error]', err);
            }
          }

          // Pass writes through directly — the caller is responsible for retry
          // semantics within explicit transactions when needed.
          if (!READ_OPERATIONS.has(operation)) {
            return query(args);
          }

          return pRetry(
            async () => {
              try {
                return await query(args);
              }
              catch (error) {
                const err = error as any;
                const isRetryable =
                  err &&
                  typeof err === 'object' &&
                  'code' in err &&
                  typeof err.code === 'string' &&
                  RETRYABLE_ERROR_CODES.includes(err.code);

                if (isRetryable) {
                  throw error; // pRetry will retry this
                }
                throw new AbortError(error as Error); // non-retryable, surface immediately
              }
            },
            {
              retries: 3,
              minTimeout: 100,
              maxTimeout: 1000,
              randomize: true,
              onFailedAttempt: (error) => {
                const err = error as any;
                if (err?.code && RETRYABLE_ERROR_CODES.includes(err.code)) {
                  dbLogger.warn(
                    `Retrying ${model}.${operation} (Code: ${err.code}) — attempt ${error.attemptNumber}/4`,
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

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
