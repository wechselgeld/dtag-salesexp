import { router, publicProcedure } from '@/server/trpc';
import { prisma } from '@/lib/prisma';

export const newsRouter = router({
    listActive: publicProcedure.query(async () => {
        return prisma.news.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }),
});
