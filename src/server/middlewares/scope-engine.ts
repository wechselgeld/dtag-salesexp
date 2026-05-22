import {
  TRPCError,
} from '@trpc/server';
import {
  prisma,
} from '@/lib/prisma';
import {
  ROLE_RANKS,
  type Role,
  type SessionUser,
} from '@/lib/rbac';

export type HierarchicalEntity = 'user' | 'team' | 'location' | 'odRegion' | 'news' | 'product';

/**
 * Higher-order tRPC middleware that automatically inspects the target entity ID
 * and verifies that it falls strictly within the caller's organizational hierarchy.
 */
export const withHierarchicalScope = (entityType: HierarchicalEntity) =>
  async ({
    ctx, input, next,
  }: { ctx: any; input: any; next: any }) => {
    const session = ctx.session as SessionUser | undefined;
    if (!session || !session.role) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
      });
    }

    if (session.role === 'ADMIN') {
      return next({
        ctx,
      });
    }

    const id = (input?.id || input?.teamId || input?.locationId) as string | undefined;
    if (!id) {
      // If no ID is provided in the input (e.g. create operations), pass to resolver.
      // Creation scope checks are handled by canCreate* or requirePermission.
      return next({
        ctx,
      });
    }

    try {
      let lineage: { odRegionId?: string | null; locationId?: string | null; teamId?: string | null } | null = null;

      if (entityType === 'user') {
        const u = await prisma.user.findUnique({
          where: {
            id,
          },
          select: {
            role: true,
            odRegionId: true,
            locationId: true,
            teamId: true,
            location: {
              select: {
                odRegionId: true,
              },
            },
            team: {
              select: {
                locationId: true,
                location: {
                  select: {
                    odRegionId: true,
                  },
                },
              },
            },
          },
        });
        if (u) {
          lineage = {
            odRegionId: u.odRegionId || u.location?.odRegionId || u.team?.location?.odRegionId || null,
            locationId: u.locationId || u.team?.locationId || null,
            teamId: u.teamId || null,
          };

          // Role Rank Validation: Enforce that the target user's rank is strictly lower than the caller's rank.
          // Self-management (session.id === id) is bypassed here.
          if (session.id !== id) {
            const currentRank = ROLE_RANKS[session.role as Role] || 0;
            const targetRank = ROLE_RANKS[u.role as Role] || 0;
            if (targetRank >= currentRank) {
              throw new TRPCError({
                code: 'FORBIDDEN',
                message: 'Du hast keine Berechtigung, einen gleich- oder höherrangigen Account zu verwalten.',
              });
            }
          }
        }
      }
      else if (entityType === 'team') {
        const t = await prisma.team.findUnique({
          where: {
            id,
          },
          select: {
            locationId: true,
            location: {
              select: {
                odRegionId: true,
              },
            },
          },
        });
        if (t) {
          lineage = {
            odRegionId: t.location?.odRegionId || null,
            locationId: t.locationId || null,
            teamId: id,
          };
        }
      }
      else if (entityType === 'location') {
        const l = await prisma.location.findUnique({
          where: {
            id,
          },
          select: {
            odRegionId: true,
          },
        });
        if (l) {
          lineage = {
            odRegionId: l.odRegionId || null,
            locationId: id,
            teamId: null,
          };
        }
      }
      else if (entityType === 'odRegion') {
        lineage = {
          odRegionId: id,
          locationId: null,
          teamId: null,
        };
      }
      else if (entityType === 'news') {
        const n = await prisma.news.findUnique({
          where: {
            id,
          },
          select: {
            odRegionId: true,
            locationId: true,
            teamId: true,
            location: {
              select: {
                odRegionId: true,
              },
            },
          },
        });
        if (n) {
          lineage = {
            odRegionId: n.odRegionId || n.location?.odRegionId || null,
            locationId: n.locationId || null,
            teamId: n.teamId || null,
          };
        }
      }
      else if (entityType === 'product') {
        // Products are global catalog items managed by ADMIN or OD_MANAGER with catalog:manage
        return next({
          ctx,
        });
      }

      if (!lineage) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Entität nicht gefunden.',
        });
      }

      if (session.role === 'OD_MANAGER') {
        if (!session.odRegionId || lineage.odRegionId !== session.odRegionId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Diese Entität befindet sich außerhalb Deines OD-Bereichs.',
          });
        }
      }
      else if (session.role === 'LOCATION_MANAGER') {
        if (!session.locationId || lineage.locationId !== session.locationId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Diese Entität befindet sich außerhalb Deines Standorts.',
          });
        }
      }
      else if (session.role === 'TEAM_LEADER') {
        if (!session.teamId || lineage.teamId !== session.teamId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Diese Entität befindet sich außerhalb Deines Teams.',
          });
        }
      }

      return next({
        ctx,
      });
    }
    catch (err: any) {
      if (err instanceof TRPCError) throw err;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Fehler bei der Hierarchie-Überprüfung.',
      });
    }
  };
