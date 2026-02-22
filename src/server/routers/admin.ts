import { router, protectedProcedure } from '@/server/trpc';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { TRPCError } from '@trpc/server';

// Schema for product creation/update
const productSchema = z.object({
    name: z.string().min(1),
    category: z.string(),
    basePrice: z.number().min(0),
    description: z.string().optional(),

    // Specifics
    dataVolume: z.string().optional(),
    downloadSpeed: z.number().optional(),
    uploadSpeed: z.number().optional(),
    contractDuration: z.number().default(24),

    // Fees
    activationFeeNew: z.number().optional().nullable(),
    allowMagentaTV: z.boolean().default(false),
    hasMagentaTVBundle: z.boolean().default(false),
    magentaTVBundleName: z.string().optional().nullable(),
    magentaTVBundlePrice: z.number().optional().nullable(),

    // Devices
    deviceManufacturer: z.string().optional().nullable(),
    purchasePrice: z.number().optional().nullable(),
    rentalPrice: z.number().optional().nullable(),

    features: z.array(z.string()).default([]),
    targetGroups: z.array(z.string()).default([]),
    salesArguments: z.array(z.string()).default([]),
});

const tierSchema = z.object({
    price: z.number().min(0),
    fromMonth: z.number().min(1),
    toMonth: z.number().min(1),
});

const specialPriceSchema = z.object({
    name: z.string().min(1),
    productIds: z.array(z.string()).min(1),
    tiers: z.array(tierSchema).min(1),
    requiresMagentaTV: z.boolean().default(false),
    requiresSpeedUp: z.boolean().default(false),
    requiresMove: z.boolean().default(false),
    priority: z.number().default(0),
    isActive: z.boolean().default(true),
});

export const adminRouter = router({
    getDashboardStats: protectedProcedure.query(async () => {
        return {
            products: await prisma.product.count(),
            users: await prisma.user.count(),
            specialPrices: await prisma.specialPrice.count(),
        }
    }),

    // --- Product CRUD ---
    createProduct: protectedProcedure
        .input(productSchema)
        .mutation(async ({ input }) => {
            const { features, targetGroups, salesArguments, ...data } = input;
            return await prisma.product.create({
                data: {
                    ...data,
                    features: JSON.stringify(features),
                    targetGroups: JSON.stringify(targetGroups),
                    salesArguments: {
                        create: salesArguments.map((text, i) => ({
                            text,
                            sortOrder: i,
                            isActive: true,
                        }))
                    }
                }
            });
        }),

    updateProduct: protectedProcedure
        .input(productSchema.extend({ id: z.string() }))
        .mutation(async ({ input }) => {
            const { id, features, targetGroups, salesArguments, ...data } = input;

            // Recreate sales arguments to preserve order easily
            await prisma.salesArgument.deleteMany({ where: { productId: id } });

            return await prisma.product.update({
                where: { id },
                data: {
                    ...data,
                    features: JSON.stringify(features),
                    targetGroups: JSON.stringify(targetGroups),
                    salesArguments: {
                        create: salesArguments.map((text, i) => ({
                            text,
                            sortOrder: i,
                            isActive: true,
                        }))
                    }
                }
            });
        }),

    deleteProduct: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            return await prisma.product.delete({
                where: { id: input.id }
            });
        }),

    getProductById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const product = await prisma.product.findUnique({
                where: { id: input.id },
                include: { salesArguments: { orderBy: { sortOrder: 'asc' } } }
            });
            if (!product) throw new TRPCError({ code: 'NOT_FOUND' });
            return {
                ...product,
                features: product.features ? JSON.parse(product.features) : [],
                targetGroups: product.targetGroups ? JSON.parse(product.targetGroups) : []
            };
        }),

    // --- Special Price CRUD ---
    getAllSpecialPrices: protectedProcedure.query(async () => {
        return await prisma.specialPrice.findMany({
            include: { products: true, tiers: { orderBy: { fromMonth: 'asc' } } },
            orderBy: { createdAt: 'desc' }
        });
    }),

    getSpecialPriceById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const sp = await prisma.specialPrice.findUnique({
                where: { id: input.id },
                include: { products: true, tiers: { orderBy: { fromMonth: 'asc' } } },
            });
            if (!sp) throw new TRPCError({ code: 'NOT_FOUND' });
            return sp;
        }),

    createSpecialPrice: protectedProcedure
        .input(specialPriceSchema)
        .mutation(async ({ input }) => {
            const { tiers, productIds, ...data } = input;
            return await prisma.specialPrice.create({
                data: {
                    ...data,
                    products: { connect: productIds.map(id => ({ id })) },
                    tiers: { create: tiers },
                },
                include: { tiers: true, products: true },
            });
        }),

    updateSpecialPrice: protectedProcedure
        .input(specialPriceSchema.extend({ id: z.string() }))
        .mutation(async ({ input }) => {
            const { id, tiers, productIds, ...data } = input;
            await prisma.specialPriceTier.deleteMany({ where: { specialPriceId: id } });
            return await prisma.specialPrice.update({
                where: { id },
                data: {
                    ...data,
                    products: { set: productIds.map(pid => ({ id: pid })) },
                    tiers: { create: tiers },
                },
                include: { tiers: true, products: true },
            });
        }),

    deleteSpecialPrice: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            return await prisma.specialPrice.delete({
                where: { id: input.id }
            });
        }),

    // One-Time Credits Management
    oneTimeCredit: router({
        list: protectedProcedure.query(async () => {
            return prisma.oneTimeCredit.findMany({
                orderBy: { createdAt: 'desc' },
            });
        }),

        getById: protectedProcedure
            .input(z.object({ id: z.string() }))
            .query(async ({ input }) => {
                const credit = await prisma.oneTimeCredit.findUnique({
                    where: { id: input.id },
                });
                if (!credit) throw new Error("Credit not found");
                return credit;
            }),

        create: protectedProcedure
            .input(z.object({
                name: z.string().min(1, "Name is required"),
                value: z.number().min(0, "Value must be positive"),
                isActive: z.boolean().default(true),
            }))
            .mutation(async ({ input }) => {
                return prisma.oneTimeCredit.create({
                    data: input,
                });
            }),

        update: protectedProcedure
            .input(z.object({
                id: z.string(),
                name: z.string().min(1, "Name is required"),
                value: z.number().min(0, "Value must be positive"),
                isActive: z.boolean(),
            }))
            .mutation(async ({ input }) => {
                const { id, ...data } = input;
                return prisma.oneTimeCredit.update({
                    where: { id },
                    data,
                });
            }),

        delete: protectedProcedure
            .input(z.object({ id: z.string() }))
            .mutation(async ({ input }) => {
                return prisma.oneTimeCredit.delete({
                    where: { id: input.id },
                });
            }),
    }),

    // --- News CRUD ---
    news: router({
        list: protectedProcedure.query(async () => {
            return prisma.news.findMany({
                orderBy: { createdAt: 'desc' },
            });
        }),

        create: protectedProcedure
            .input(z.object({
                title: z.string().min(1),
                content: z.string().min(1),
                priority: z.enum(["INFO", "UPDATE", "IMPORTANT", "CRITICAL"]).default("INFO"),
            }))
            .mutation(async ({ input }) => {
                return prisma.news.create({ data: input });
            }),

        delete: protectedProcedure
            .input(z.object({ id: z.string() }))
            .mutation(async ({ input }) => {
                return prisma.news.delete({ where: { id: input.id } });
            }),
    }),

    // --- Sales Arguments CRUD ---
    salesArguments: router({
        list: protectedProcedure.query(async () => {
            return prisma.salesArgument.findMany({
                include: { product: { select: { id: true, name: true, category: true } } },
                orderBy: [{ productId: 'asc' }, { sortOrder: 'asc' }],
            });
        }),

        listByProduct: protectedProcedure
            .input(z.object({ productId: z.string() }))
            .query(async ({ input }) => {
                return prisma.salesArgument.findMany({
                    where: { productId: input.productId, isActive: true },
                    orderBy: { sortOrder: 'asc' },
                });
            }),

        create: protectedProcedure
            .input(z.object({
                text: z.string().min(1),
                productId: z.string(),
                sortOrder: z.number().default(0),
            }))
            .mutation(async ({ input }) => {
                return prisma.salesArgument.create({ data: input });
            }),

        update: protectedProcedure
            .input(z.object({
                id: z.string(),
                text: z.string().min(1),
                sortOrder: z.number().default(0),
                isActive: z.boolean(),
            }))
            .mutation(async ({ input }) => {
                const { id, ...data } = input;
                return prisma.salesArgument.update({ where: { id }, data });
            }),

        delete: protectedProcedure
            .input(z.object({ id: z.string() }))
            .mutation(async ({ input }) => {
                return prisma.salesArgument.delete({ where: { id: input.id } });
            }),
    }),
});
