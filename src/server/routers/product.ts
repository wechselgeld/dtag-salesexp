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
            // Run both queries in parallel for ~50% less latency
            const [product, globalAddons] = await Promise.all([
                prisma.product.findUnique({
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
                }),
                prisma.addon.findMany({
                    where: { isGlobal: true, isActive: true },
                    include: { tiers: true },
                }),
            ]);

            if (!product) return null;

            // Merge product-specific + global addons (deduplicated)
            const addonMap = new Map();
            product.compatibleAddons.forEach(a => addonMap.set(a.id, a));
            globalAddons.forEach(a => addonMap.set(a.id, a));

            return {
                ...product,
                compatibleAddons: Array.from(addonMap.values())
            };
        }),

    getAllProducts: publicProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(50),
            cursor: z.string().nullish(),
            search: z.string().optional(),
            category: z.string().optional(),
        }).optional())
        .query(async ({ input }) => {
            const limit = input?.limit ?? 50;
            const cursor = input?.cursor;
            const search = input?.search;
            const category = input?.category;

            let where: any = { isActive: true };
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (category && category !== 'ALL') {
                where.category = category;
            }

            const items = await prisma.product.findMany({
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
                where,
                orderBy: { priority: 'desc' },
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }

            return { items, nextCursor };
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

    getCategoryStats: publicProcedure.query(async () => {
        const stats = await prisma.product.groupBy({
            by: ['category'],
            where: { isActive: true },
            _count: { _all: true }
        });

        // Add special counts for andons or news if needed, but for now just products
        const result: Record<string, number> = {};
        stats.forEach(s => {
            result[s.category] = s._count._all;
        });

        // Add counts for compatible addons or other categories if they don't exist as products
        // (e.g. ADDON might be a different model but handled in the grid)
        const addonCount = await prisma.addon.count({ where: { isActive: true } });
        result['ADDON'] = addonCount;

        return result;
    }),
});
