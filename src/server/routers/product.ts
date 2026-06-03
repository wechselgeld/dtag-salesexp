import {
    router, publicProcedure,
} from '@/server/trpc';
import {
    z,
} from 'zod';
import {
    prisma,
} from '@/lib/prisma';
import {
    getCached,
} from '@/lib/cache';

export const productRouter = router({
    getProductsByCategory: publicProcedure
        .input(z.object({
            category: z.string(),
        }))
        .query(({
            input,
        }) => {
            const categoryMap: Record<string, string> = {
                'mobile': 'MOBILE',
                'fiber': 'FIBER',
                'dsl': 'DSL',
                'magenta-tv': 'MAGENTA_TV_OTT',
                'device': 'DEVICE',
                'data': 'DATA', // Assuming DATA exists, logical guess based on "Datentarife"
            };

            // Default to uppercase if not found in map (fallback)
            const mappedCategory = categoryMap[input.category.toLowerCase()] || input.category.toUpperCase();

            // Cache for 5 minutes, invalidated when products are modified in admin panel via invalidateCache('product')
            return getCached(`products:category:${mappedCategory}`, 5 * 60 * 1000, () => {
                return prisma.product.findMany({
                    where: {
                        category: mappedCategory,
                        isActive: true,
                    },
                    include: {
                        specialPrices: {
                            include: {
                                tiers: {
                                    orderBy: {
                                        fromMonth: 'asc',
                                    },
                                },
                            },
                        },
                        salesArguments: {
                            where: {
                                isActive: true,
                            },
                            orderBy: {
                                sortOrder: 'asc',
                            },
                        },
                    },
                    orderBy: {
                        priority: 'desc',
                    },
                });
            });
        }),

    getProductById: publicProcedure
        .input(z.object({
            id: z.string(),
        }))
        .query(({
            input,
        }) => {
            return getCached(`product:${input.id}`, 60 * 1000, async () => {
                // Run both queries in parallel for ~50% less latency
                const [
                    product,
                    globalAddons,
                ] = await Promise.all([
                    prisma.product.findUnique({
                        where: {
                            id: input.id,
                        },
                        include: {
                            specialPrices: {
                                include: {
                                    tiers: {
                                        orderBy: {
                                            fromMonth: 'asc',
                                        },
                                    },
                                },
                            },
                            compatibleAddons: {
                                where: {
                                    isActive: true,
                                },
                                include: {
                                    tiers: true,
                                },
                            },
                            salesArguments: {
                                where: {
                                    isActive: true,
                                },
                                orderBy: {
                                    sortOrder: 'asc',
                                },
                            },
                            priceHistory: {
                                orderBy: {
                                    createdAt: 'desc',
                                },
                            },
                        },
                    }),
                    prisma.addon.findMany({
                        where: {
                            isGlobal: true,
                            isActive: true,
                        },
                        include: {
                            tiers: true,
                        },
                    }),
                ]);

                if (!product) { return null; }

                // Merge product-specific + global addons (deduplicated)
                const addonMap = new Map();
                product.compatibleAddons.forEach(a => addonMap.set(a.id, a));
                globalAddons.forEach(a => addonMap.set(a.id, a));

                return {
                    ...product,
                    compatibleAddons: Array.from(addonMap.values()),
                };
            });
        }),

    getAllProducts: publicProcedure
        .input(z.object({
            limit: z.number().min(1).max(1000).default(50),
            cursor: z.string().nullish(),
            search: z.string().optional(),
            category: z.string().optional(),
        }).optional())
        .query(({
            input,
        }) => {
            const limit = input?.limit ?? 50;
            const cursor = input?.cursor;
            const search = input?.search;
            const category = input?.category;

            const cacheKey = `products:all:${category || 'ALL'}:${search || ''}:${cursor || ''}:${limit}`;
            return getCached(cacheKey, 60 * 1000, async () => {
                const where: any = {
                    isActive: true,
                };
                if (search) {
                    where.OR = [
                        {
                            name: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            description: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                    ];
                }
                if (category && category !== 'ALL') {
                    where.category = category;
                }

                const items = await prisma.product.findMany({
                    take: limit + 1,
                    cursor: cursor ? {
                        id: cursor,
                    } : undefined,
                    where,
                    orderBy: {
                        priority: 'desc',
                    },
                });

                let nextCursor: typeof cursor | undefined = undefined;
                if (items.length > limit) {
                    const nextItem = items.pop();
                    nextCursor = nextItem!.id;
                }

                return {
                    items,
                    nextCursor,
                };
            });
        }),

    getOneTimeCredits: publicProcedure.query(() => {
        return getCached('products:oneTimeCredits', 60 * 60 * 1000, () => {
            return prisma.oneTimeCredit.findMany({
                where: {
                    isActive: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        });
    }),


    getCategoryStats: publicProcedure.query(() => {
        return getCached('product:categoryStats', 15 * 60 * 1000, async () => {
            const [
                stats,
                addonCount,
            ] = await Promise.all([
                prisma.product.groupBy({
                    by: [
                        'category',
                    ],
                    where: {
                        isActive: true,
                    },
                    _count: {
                        _all: true,
                    },
                }),
                prisma.addon.count({
                    where: {
                        isActive: true,
                    },
                }),
            ]);

            // Add special counts for andons or news if needed, but for now just products
            const result: Record<string, number> = {
            };
            stats.forEach(s => {
                result[s.category] = s._count._all;
            });

            result['ADDON'] = addonCount;

            return result;
        });
    }),
});

