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
        });
        if (user) {
            if (user.role === 'ADMIN') { isAdmin = true; }
            odRegionId = user.odRegionId || null;
            locationId = user.locationId || null;
            teamId = user.teamId || null;
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

        const whereClause: any = {
            isActive: true,
        };

        if (!isAdmin) {
            whereClause.OR = [
                {
                    odRegionId: null,
                    locationId: null,
                    teamId: null,
                }, // GLOBAL
            ];
            if (odRegionId) {
                whereClause.OR.push({
                    odRegionId,
                });
            }
            if (locationId) {
                whereClause.OR.push({
                    locationId,
                });
            }
            if (teamId) {
                whereClause.OR.push({
                    teamId,
                });
            }
        }

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

            const isGlobal = !news.odRegionId && !news.locationId && !news.teamId;
            const isForRegion = news.odRegionId && news.odRegionId === odRegionId;
            const isForLocation = news.locationId && news.locationId === locationId;
            const isForTeam = news.teamId && news.teamId === teamId;

            if (isGlobal || isForRegion || isForLocation || isForTeam) {
                yield news;
            }
        }
    }),
});
