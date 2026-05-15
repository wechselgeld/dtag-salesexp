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
    cookies,
} from 'next/headers';

async function getSessionContext(ctx: any) {
    let odRegionId: string | null = null;
    let locationId: string | null = null;
    let teamId: string | null = null;
    let isAdmin = false;

    if (ctx.session?.sub) {
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
        if (user) {
            if (user.role === 'ADMIN') { isAdmin = true; }
            
            // Managers have these directly. Regular users get them from their team.
            teamId = user.teamId || null;
            locationId = user.locationId || user.team?.locationId || null;
            odRegionId = user.odRegionId || user.location?.odRegionId || user.team?.location?.odRegionId || null;
        }
    }
    else {
        const cookieStore = await cookies();
        const token = cookieStore.get('sales-session-id')?.value;
        if (token) {
            try {
                const {
                    verifySessionId,
                } = await import('@/lib/auth');
                const sessionId = await verifySessionId(token);
                if (sessionId) {
                    const session = await prisma.salesSession.findUnique({
                        where: {
                            id: sessionId,
                        },
                        include: {
                            team: {
                                include: {
                                    location: true,
                                },
                            },
                        },
                    });
                    if (session && session.team) {
                        teamId = session.teamId;
                        locationId = session.team.locationId || null;
                        odRegionId = session.team.location?.odRegionId || null;
                    }
                }
            }
            catch (error) {
                // Ignore session verification errors which will fall back to default context values
                console.error(error);
            }
        }
    }

    return {
        odRegionId,
        locationId,
        teamId,
        isAdmin,
    };
}

export const newsRouter = router({
    listActive: publicProcedure.query(async ({
        ctx,
    }) => {
        const {
            odRegionId, locationId, teamId, isAdmin,
        } = await getSessionContext(ctx);

        const { getNewsVisibilityFilter } = await import('@/lib/rbac');
        const sessionUser = { id: ctx.session?.sub || 'anonymous', role: isAdmin ? 'ADMIN' : (odRegionId ? 'OD_MANAGER' : (locationId ? 'LOCATION_MANAGER' : (teamId ? 'TEAM_LEADER' : 'USER'))), isEditor: isAdmin, odRegionId, locationId, teamId };
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
            odRegionId, locationId, teamId, isAdmin,
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

            const { isNewsVisible } = await import('@/lib/rbac');
            const sessionUser = { id: ctx.session?.sub || 'anonymous', role: isAdmin ? 'ADMIN' : (odRegionId ? 'OD_MANAGER' : (locationId ? 'LOCATION_MANAGER' : (teamId ? 'TEAM_LEADER' : 'USER'))), isEditor: isAdmin, odRegionId, locationId, teamId };
            
            if (isNewsVisible(sessionUser as any, news)) {
                yield news;
            }
        }
    }),
});
