import { router, publicProcedure } from '@/server/trpc';
import { productRouter } from './product';
import { authRouter } from './auth';
import { adminRouter } from './admin';
import { teamRouter } from './team';
import { sessionRouter } from './session';
import { newsRouter } from './news';
import { addonRouter } from './addon';

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
});

export type AppRouter = typeof appRouter;
