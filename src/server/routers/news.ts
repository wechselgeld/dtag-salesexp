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

    const user = await prisma.user.findUnique({
        where: {
            id: ctx.session.sub,
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
}

export const newsRouter = router({
    listActive: publicProcedure.query(async ({
        ctx,
    }) => {
        const {
            odRegionId, locationId, teamId, isAdmin, role,
        } = await getSessionContext(ctx);

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
    }),

    onAdd: publicProcedure.subscription(async function* ({
        ctx, signal,
    }) {
        const {
            odRegionId, locationId, teamId, isAdmin, role,
        } = await getSessionContext(ctx);

        for await (const [
            news,
        ] of on(newsEmitter, 'add', {
            signal,
        })) {
            if (isAdmin) {
                yield news;
                continue;
            }

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
