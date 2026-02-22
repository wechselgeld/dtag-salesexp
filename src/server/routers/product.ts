import { router, publicProcedure } from '@/server/trpc';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const productRouter = router({
    getProductsByCategory: publicProcedure
        .input(z.object({ category: z.string() }))
        .query(async ({ input }) => {
            const categoryMap: Record<string, string> = {
                'mobile': 'MOBILE',
                'fiber': 'FIBER',
                'dsl': 'DSL',
                'magenta-tv': 'MAGENTA_TV_OTT',
                'device': 'DEVICE',
                'data': 'DATA' // Assuming DATA exists, logical guess based on "Datentarife"
            };

            // Default to uppercase if not found in map (fallback)
            const mappedCategory = categoryMap[input.category.toLowerCase()] || input.category.toUpperCase();

            return await prisma.product.findMany({
                where: {
                    category: mappedCategory,
                    isActive: true,
                },
                include: {
                    specialPrices: {
                        include: { tiers: { orderBy: { fromMonth: 'asc' } } },
                    },
                    salesArguments: {
                        where: { isActive: true },
                        orderBy: { sortOrder: 'asc' },
                    },
                },
                orderBy: {
                    priority: 'desc',
                },
            });
        }),

    getProductById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const product = await prisma.product.findUnique({
                where: { id: input.id },
                include: {
                    specialPrices: {
                        include: { tiers: { orderBy: { fromMonth: 'asc' } } },
                    },
                    compatibleAddons: {
                        where: { isActive: true },
                        include: { tiers: true }
                    },
                    salesArguments: {
                        where: { isActive: true },
                        orderBy: { sortOrder: 'asc' },
                    },
                },
            });

            if (!product) return null;

            // Fetch global addons
            const globalAddons = await prisma.addon.findMany({
                where: { isGlobal: true, isActive: true },
                include: { tiers: true },
            });

            // Merge unique
            const addonMap = new Map();
            product.compatibleAddons.forEach(a => addonMap.set(a.id, a));
            globalAddons.forEach(a => addonMap.set(a.id, a));

            return {
                ...product,
                compatibleAddons: Array.from(addonMap.values())
            };
        }),

    getAllProducts: publicProcedure.query(async () => {
        return await prisma.product.findMany({
            where: { isActive: true },
            orderBy: { priority: 'desc' },
        });
    }),

    getOneTimeCredits: publicProcedure.query(async () => {
        return await prisma.oneTimeCredit.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }),
});
