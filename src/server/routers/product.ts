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

    matchTariffNames: publicProcedure
        .input(z.object({ tariffNames: z.array(z.string()) }))
        .query(async ({ input }) => {
            const allProducts = await prisma.product.findMany({
                where: { isActive: true },
                select: { id: true, name: true, category: true },
            });

            return input.tariffNames.map((tariffName) => {
                // The availability name is like "MagentaZuhause XL (250/40 MBit/s) [POTS- Kupfer]"
                // The DB product name is like "MagentaZuhause XL"
                // Match if the availability name starts with the product name (case-insensitive)
                const lower = tariffName.toLowerCase();
                const match = allProducts.find(
                    (p) =>
                        lower.startsWith(p.name.toLowerCase()) ||
                        lower.includes(p.name.toLowerCase())
                );
                return {
                    tariffName,
                    matched: !!match,
                    product: match
                        ? { id: match.id, name: match.name, category: match.category }
                        : null,
                };
            });
        }),
});
