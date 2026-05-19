import {
  prisma,
} from './prisma';
import type {
  SessionUser,
} from './rbac';
import {
  getUserFilter, getTeamFilter, getLocationFilter, getOdRegionFilter,
} from './rbac';

/**
 * Returns an extended Prisma Client instance that automatically injects
 * row-level security (RLS) filters into findMany and findFirst queries based on the user session.
 */
export function getScopedPrisma(session: SessionUser | undefined | null) {
  if (!session) {
    return prisma;
  }

  return prisma.$extends({
    query: {
      user: {
        findMany({
          args, query,
        }) {
          const rlsWhere = getUserFilter(session);
          args.where = {
            AND: [
              args.where || {
              },
              rlsWhere,
            ],
          };
          return query(args);
        },
        findFirst({
          args, query,
        }) {
          const rlsWhere = getUserFilter(session);
          args.where = {
            AND: [
              args.where || {
              },
              rlsWhere,
            ],
          };
          return query(args);
        },
      },
      team: {
        findMany({
          args, query,
        }) {
          const rlsWhere = getTeamFilter(session);
          args.where = {
            AND: [
              args.where || {
              },
              rlsWhere,
            ],
          };
          return query(args);
        },
        findFirst({
          args, query,
        }) {
          const rlsWhere = getTeamFilter(session);
          args.where = {
            AND: [
              args.where || {
              },
              rlsWhere,
            ],
          };
          return query(args);
        },
      },
      location: {
        findMany({
          args, query,
        }) {
          const rlsWhere = getLocationFilter(session);
          args.where = {
            AND: [
              args.where || {
              },
              rlsWhere,
            ],
          };
          return query(args);
        },
        findFirst({
          args, query,
        }) {
          const rlsWhere = getLocationFilter(session);
          args.where = {
            AND: [
              args.where || {
              },
              rlsWhere,
            ],
          };
          return query(args);
        },
      },
      odRegion: {
        findMany({
          args, query,
        }) {
          const rlsWhere = getOdRegionFilter(session);
          args.where = {
            AND: [
              args.where || {
              },
              rlsWhere,
            ],
          };
          return query(args);
        },
        findFirst({
          args, query,
        }) {
          const rlsWhere = getOdRegionFilter(session);
          args.where = {
            AND: [
              args.where || {
              },
              rlsWhere,
            ],
          };
          return query(args);
        },
      },
    },
  });
}
