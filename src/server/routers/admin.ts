import { router, protectedProcedure, publicProcedure } from '@/server/trpc';
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

    // Business Case Options
    allowNewActivation: z.boolean().default(true).optional(),
    allowMove: z.boolean().default(true).optional(),
    allowPlanChange: z.boolean().default(true).optional(),
    allowSpeedUp: z.boolean().default(false).optional(),

    // Fees
    activationFeeNew: z.number().optional().nullable(),
    activationFeeMove: z.number().optional().nullable(),
    activationFeePlanChange: z.number().optional().nullable(),
    activationFeeSpeedUp: z.number().optional().nullable(),
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
    salesScript: z.string().optional().nullable(),
    magentaInfosUrl: z.string().optional().nullable(),
});

const tierSchema = z.object({
    price: z.number().min(0),
    fromMonth: z.number().min(1),
    toMonth: z.number().min(1),
});

const specialPriceSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    internalNote: z.string().optional(),
    productIds: z.array(z.string()).min(1),
    tiers: z.array(tierSchema).min(1),
    requiresMagentaTV: z.boolean().default(false),
    requiresSpeedUp: z.boolean().default(false),
    requiresMove: z.boolean().default(false),
    priority: z.number().default(0),
    isActive: z.boolean().default(true),
    discountTarget: z.enum(["BASE_PRICE", "MAGENTA_TV"]).default("BASE_PRICE"),
    discountType: z.enum(["ABSOLUTE", "RELATIVE"]).default("ABSOLUTE"),
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
    if ((ctx.session as any)?.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Nur Administratoren erlaubt.' });
    }
    return next({ ctx });
});

const editorProcedure = protectedProcedure.use(({ ctx, next }) => {
    const session = ctx.session as any;
    if (session?.role !== 'ADMIN' && !session?.isEditor) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Du benötigst Editor-Rechte für diese Aktion.' });
    }
    return next({ ctx });
});

export const adminRouter = router({
    getDashboardStats: protectedProcedure.query(async () => {
        return {
            products: await prisma.product.count(),
            users: await prisma.user.count(),
            specialPrices: await prisma.specialPrice.count(),
            teams: await prisma.team.count(),
        };
    }),

    getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session?.sub as string;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                isEditor: true,
                createdAt: true,
                odRegion: { select: { name: true } },
                location: { select: { name: true } },
                team: { select: { name: true } }
            }
        });
        if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
        return user;
    }),

    getMaintenanceStatus: publicProcedure.query(async () => {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'maintenance_mode' }
        });
        return setting?.value === 'true';
    }),

    toggleMaintenanceMode: adminProcedure
        .input(z.object({ enabled: z.boolean() }))
        .mutation(async ({ input }) => {
            return await prisma.systemSetting.upsert({
                where: { key: 'maintenance_mode' },
                update: { value: input.enabled ? 'true' : 'false' },
                create: { key: 'maintenance_mode', value: input.enabled ? 'true' : 'false' }
            });
        }),

    getSecuritySettings: protectedProcedure.query(async () => {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'allowed_ips' }
        });
        const requireEmail = await prisma.systemSetting.findUnique({
            where: { key: 'require_email_verification' }
        });
        return {
            allowedIps: setting?.value || "",
            requireEmailVerification: requireEmail?.value !== 'false'
        };
    }),

    updateSecuritySettings: adminProcedure
        .input(z.object({ allowedIps: z.string(), requireEmailVerification: z.boolean().optional() }))
        .mutation(async ({ input }) => {
            await prisma.systemSetting.upsert({
                where: { key: 'allowed_ips' },
                update: { value: input.allowedIps },
                create: { key: 'allowed_ips', value: input.allowedIps }
            });
            if (input.requireEmailVerification !== undefined) {
                await prisma.systemSetting.upsert({
                    where: { key: 'require_email_verification' },
                    update: { value: input.requireEmailVerification.toString() },
                    create: { key: 'require_email_verification', value: input.requireEmailVerification.toString() }
                });
            }
            return { success: true };
        }),

    // --- Product CRUD ---
    getAllProducts: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(50),
            cursor: z.string().nullish(),
            search: z.string().optional(),
            category: z.string().optional(),
        }))
        .query(async ({ input }) => {
            const limit = input.limit ?? 50;
            const { cursor, search, category } = input;

            let where: any = { isActive: true };
            if (search) {
                where.OR = [
                    { name: { contains: search } },
                    { description: { contains: search } }
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

            return {
                items: items.map(product => ({
                    ...product,
                    features: product.features ? JSON.parse(product.features) : [],
                    // @ts-ignore
                    targetGroups: (product as any).targetGroups ? JSON.parse((product as any).targetGroups) : []
                })),
                nextCursor
            };
        }),
    createProduct: editorProcedure
        .input(productSchema)
        .mutation(async ({ input }) => {
            const { features, targetGroups, salesArguments, ...data } = input;
            return await prisma.product.create({
                data: {
                    ...data,
                    features: JSON.stringify(features),
                    // @ts-ignore
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

    updateProduct: editorProcedure
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
                    // @ts-ignore
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

    deleteProduct: editorProcedure
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
                // @ts-ignore
                targetGroups: (product as any).targetGroups ? JSON.parse((product as any).targetGroups) : []
            };
        }),

    // --- Special Price CRUD ---
    getAllSpecialPrices: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(50),
            cursor: z.string().nullish(),
            search: z.string().optional(),
        }))
        .query(async ({ input }) => {
            const limit = input.limit ?? 50;
            const { cursor, search } = input;

            let where: any = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }

            const items = await prisma.specialPrice.findMany({
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
                where,
                include: { products: true, tiers: { orderBy: { fromMonth: 'asc' } } },
                orderBy: { createdAt: 'desc' }
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }

            return { items, nextCursor };
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

    createSpecialPrice: editorProcedure
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

    updateSpecialPrice: editorProcedure
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

    deleteSpecialPrice: editorProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            return await prisma.specialPrice.delete({
                where: { id: input.id }
            });
        }),

    // One-Time Credits Management
    oneTimeCredit: router({
        list: protectedProcedure
            .input(z.object({
                limit: z.number().min(1).max(100).default(50),
                cursor: z.string().nullish(),
                search: z.string().optional(),
            }))
            .query(async ({ input }) => {
                const limit = input.limit ?? 50;
                const { cursor, search } = input;

                let where: any = {};
                if (search) {
                    where.OR = [
                        { name: { contains: search, mode: 'insensitive' } },
                        // Value is a float, so we can't search it directly with contains.
                        // We could cast it but for credits usually name search is sufficient.
                        // { value: { equals: parseFloat(search) || undefined } }
                    ];
                }

                const items = await prisma.oneTimeCredit.findMany({
                    take: limit + 1,
                    cursor: cursor ? { id: cursor } : undefined,
                    where,
                    orderBy: { createdAt: 'desc' },
                });

                let nextCursor: typeof cursor | undefined = undefined;
                if (items.length > limit) {
                    const nextItem = items.pop();
                    nextCursor = nextItem!.id;
                }

                return { items, nextCursor };
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

        create: editorProcedure
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

        update: editorProcedure
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

        delete: editorProcedure
            .input(z.object({ id: z.string() }))
            .mutation(async ({ input }) => {
                return prisma.oneTimeCredit.delete({
                    where: { id: input.id },
                });
            }),
    }),

    // --- News CRUD ---
    news: router({
        list: protectedProcedure
            .input(z.object({
                limit: z.number().min(1).max(100).default(50),
                cursor: z.string().nullish(),
                search: z.string().optional(),
            }))
            .query(async ({ input }) => {
                const limit = input.limit ?? 50;
                const { cursor, search } = input;

                let where: any = {};
                if (search) {
                    where.OR = [
                        { title: { contains: search, mode: 'insensitive' } },
                        { content: { contains: search, mode: 'insensitive' } }
                    ];
                }

                const items = await prisma.news.findMany({
                    take: limit + 1,
                    cursor: cursor ? { id: cursor } : undefined,
                    where,
                    orderBy: { createdAt: 'desc' },
                });

                let nextCursor: typeof cursor | undefined = undefined;
                if (items.length > limit) {
                    const nextItem = items.pop();
                    nextCursor = nextItem!.id;
                }

                return { items, nextCursor };
            }),

        create: editorProcedure
            .input(z.object({
                title: z.string().min(1),
                content: z.string().min(1),
                priority: z.enum(["INFO", "UPDATE", "IMPORTANT", "CRITICAL"]).default("INFO"),
            }))
            .mutation(async ({ input }) => {
                return prisma.news.create({ data: input });
            }),

        delete: editorProcedure
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

        create: editorProcedure
            .input(z.object({
                text: z.string().min(1),
                productId: z.string(),
                sortOrder: z.number().default(0),
            }))
            .mutation(async ({ input }) => {
                return prisma.salesArgument.create({ data: input });
            }),

        update: editorProcedure
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

        delete: editorProcedure
            .input(z.object({ id: z.string() }))
            .mutation(async ({ input }) => {
                return prisma.salesArgument.delete({ where: { id: input.id } });
            }),
    }),

    // --- Settings & Profile ---
    settings: router({
        changePassword: protectedProcedure
            .input(z.object({
                oldPassword: z.string(),
                newPassword: z.string().min(6),
            }))
            .mutation(async ({ input, ctx }) => {
                const userId = ctx.session.sub as string;
                const user = await prisma.user.findUnique({ where: { id: userId } });

                if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

                const bcrypt = await import('bcryptjs');
                const isValid = await bcrypt.compare(input.oldPassword, user.password);

                if (!isValid) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Das alte Passwort ist nicht korrekt.'
                    });
                }

                const hashedPassword = await bcrypt.hash(input.newPassword, 10);
                await prisma.user.update({
                    where: { id: userId },
                    data: { password: hashedPassword }
                });

                return { success: true };
            }),
    }),
});
