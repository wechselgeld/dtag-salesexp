import {
    router, protectedProcedure,
} from '@/server/trpc';
import {
    z,
} from 'zod';
import {
    prisma,
} from '@/lib/prisma';
import {
    TRPCError,
} from '@trpc/server';
import type {
    Prisma,
} from '@prisma/client';

const addonFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    category: z.string().optional(),
    imageUrl: z.string().optional(),
    isGlobal: z.boolean().default(false),
    isActive: z.boolean().default(true),
    requiresNoMagentaTV: z.boolean().default(false),
});

const tierSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    price: z.number().min(0),
});

const editorProcedure = protectedProcedure.use(({
    ctx, next,
}) => {
    const session = ctx.session as { role?: string; isEditor?: boolean };
    if (session?.role !== 'ADMIN' && !session?.isEditor) {
        throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Du benötigst Editor-Rechte für diese Aktion.',
        });
    }
    return next({
        ctx,
    });
});

export const addonRouter = router({
    list: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(50),
            cursor: z.string().nullish(),
            search: z.string().optional(),
        }).optional())
        .query(async ({
            input,
        }) => {
            const limit = input?.limit ?? 50;
            const cursor = input?.cursor;
            const search = input?.search;

            const where: Prisma.AddonWhereInput = {
            };
            if (search) {
                where.OR = [
                    {
                        name: {
                            contains: search,
                        },
                    },
                    {
                        description: {
                            contains: search,
                        },
                    },
                ];
            }

            const items = await prisma.addon.findMany({
                take: limit + 1,
                cursor: cursor ? {
                    id: cursor,
                } : undefined,
                where,
                include: {
                    compatibleProducts: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                        },
                    },
                    tiers: true,
                },
                orderBy: {
                    name: 'asc',
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
        }),

    getById: protectedProcedure
        .input(z.object({
            id: z.string(),
        }))
        .query(async ({
            input,
        }) => {
            const addon = await prisma.addon.findUnique({
                where: {
                    id: input.id,
                },
                include: {
                    compatibleProducts: {
                        select: {
                            id: true,
                        },
                    },
                    tiers: true,
                },
            });
            if (!addon) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                });
            }
            return {
                ...addon,
                productIds: addon.compatibleProducts.map(p => p.id),
            };
        }),

    create: editorProcedure
        .input(addonFormSchema.extend({
            productIds: z.array(z.string()),
            tiers: z.array(tierSchema),
        }))
        .mutation(({
            input,
        }) => {
            const {
                productIds, tiers, ...data
            } = input;

            return prisma.addon.create({
                data: {
                    ...data,
                    compatibleProducts: {
                        connect: productIds.map(id => ({
                            id,
                        })),
                    },
                    tiers: {
                        create: tiers.map(t => ({
                            name: t.name,
                            price: t.price,
                        })),
                    },
                },
            });
        }),

    update: editorProcedure
        .input(addonFormSchema.extend({
            id: z.string(),
            productIds: z.array(z.string()),
            tiers: z.array(tierSchema),
        }))
        .mutation(async ({
            input,
        }) => {
            const {
                id, productIds, tiers, ...data
            } = input;

            // Delete old tiers and recreate (simplest array update strategy for this usecase)
            await prisma.addonTier.deleteMany({
                where: {
                    addonId: id,
                },
            });

            return prisma.addon.update({
                where: {
                    id,
                },
                data: {
                    ...data,
                    compatibleProducts: {
                        set: productIds.map(pid => ({
                            id: pid,
                        })),
                    },
                    tiers: {
                        create: tiers.map(t => ({
                            name: t.name,
                            price: t.price,
                        })),
                    },
                },
            });
        }),

    delete: editorProcedure
        .input(z.object({
            id: z.string(),
        }))
        .mutation(({
            input,
        }) => {
            return prisma.addon.delete({
                where: {
                    id: input.id,
                },
            });
        }),
});
