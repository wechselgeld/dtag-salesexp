import { router, publicProcedure } from '@/server/trpc';
import { prisma } from '@/lib/prisma';
import { on } from 'node:events';
import { newsEmitter } from '@/lib/news-emitter';

export const newsRouter = router({
    listActive: publicProcedure.query(async () => {
        return prisma.news.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }),

    onAdd: publicProcedure.subscription(async function* ({ signal }) {
        // Yield events from the 'add' event listener
        for await (const [data] of on(newsEmitter, 'add', { signal })) {
            yield data;
        }
    }),
});
