import { router, publicProcedure } from '@/server/trpc';
import { productRouter } from './product';
import { authRouter } from './auth';
import { adminRouter } from './admin';
import { teamRouter } from './team';
import { sessionRouter } from './session';
import { newsRouter } from './news';
import { addonRouter } from './addon';
import { availabilityRouter } from './availability';
import { settingsRouter } from './settings';
import { adminUsersRouter } from './adminUsers';

export const appRouter = router({
    health: publicProcedure.query(() => {
        return 'ok';
    }),
    product: productRouter,
    auth: authRouter,
    admin: adminRouter,
    team: teamRouter,
    session: sessionRouter,
    news: newsRouter,
    addon: addonRouter,
    availability: availabilityRouter,
    settings: settingsRouter,
    adminUsers: adminUsersRouter,
    public: router({
        getActiveAnnouncements: publicProcedure.query(async () => {
            const { prisma } = await import('@/lib/prisma');
            return prisma.maintenanceAnnouncement.findMany({
                where: { isActive: true },
                orderBy: { priority: 'desc' }
            });
        }),
    }),
});

export type AppRouter = typeof appRouter;
