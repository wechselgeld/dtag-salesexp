import {
    router, publicProcedure,
} from '@/server/trpc';
import {
    prisma,
} from '@/lib/prisma';
import {
    on,
} from 'node:events';
import {
    newsEmitter,
} from '@/lib/news-emitter';
import {
    getNewsVisibilityFilter, isNewsVisible,
} from '@/lib/rbac';
import {
    getCached,
} from '@/lib/cache';

async function getSessionContext(ctx: any) {
    if (!ctx.session?.sub) {
        return {
            odRegionId: null,
            locationId: null,
            teamId: null,
            isAdmin: false,
            role: 'USER',
        };
    }

    const userId = ctx.session.sub;

    // Cache the fully resolved hierarchical context under `session:user:${userId}:context`.
    // It will be automatically invalidated by calls to `invalidateCache("session:user:" + userId)`
    // because that uses `session:user:${userId}*` prefix pattern matching.
    const sessionContext = await getCached(`session:user:${userId}:context`, 5 * 60 * 1000, async () => {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                team: {
                    include: {
                        location: true,
                    },
                },
                location: true,
                odRegion: true,
            },
        });

        if (!user) {
            return {
                odRegionId: null,
                locationId: null,
                teamId: null,
                isAdmin: false,
                role: 'USER',
            };
        }

        return {
            odRegionId: user.odRegionId || user.location?.odRegionId || user.team?.location?.odRegionId || null,
            locationId: user.locationId || user.team?.locationId || null,
            teamId: user.teamId || null,
            isAdmin: user.role === 'ADMIN',
            role: user.role,
        };
    });

    return sessionContext;
}

export const newsRouter = router({
    listActive: publicProcedure.query(async ({
        ctx,
    }) => {
        const {
            odRegionId, locationId, teamId, isAdmin, role,
        } = await getSessionContext(ctx);

        const cacheKey = `news:active:r_${odRegionId || 'null'}:l_${locationId || 'null'}:t_${teamId || 'null'}`;

        return getCached(cacheKey, 5 * 60 * 1000, () => {
            const sessionUser = {
                id: ctx.session?.sub || 'anonymous',
                role,
                isEditor: isAdmin,
                odRegionId,
                locationId,
                teamId,
            };
            const visibilityFilter = getNewsVisibilityFilter(sessionUser as any);

            const whereClause: any = {
                isActive: true,
                ...visibilityFilter,
            };

            return prisma.news.findMany({
                where: whereClause,
                include: {
                    odRegion: {
                        select: {
                            name: true,
                        },
                    },
                    location: {
                        select: {
                            name: true,
                        },
                    },
                    team: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        });
    }),

    onAdd: publicProcedure.subscription(async function* ({
        ctx, signal,
    }) {
        const {
            odRegionId, locationId, teamId, isAdmin, role,
        } = await getSessionContext(ctx);

        for await (const [
            news,
        ] of on(newsEmitter, 'local_add', {
            signal,
        })) {
            const sessionUser = {
                id: ctx.session?.sub || 'anonymous',
                role,
                isEditor: isAdmin,
                odRegionId,
                locationId,
                teamId,
            };

            if (isNewsVisible(sessionUser as any, news)) {
                yield news;
            }
        }
    }),
});
