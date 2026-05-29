import {
    router, protectedProcedure, requirePermission,
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
import {
    invalidateCache,
} from '@/lib/cache';

const addonFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    category: z.string().optional(),
    imageUrl: z.string().optional(),
    isGlobal: z.boolean().default(false),
    isActive: z.boolean().default(true),
    magentaTVRequirement: z.enum([
        'REQUIRED',
        'NOT_ALLOWED',
        'NONE',
        'ONLY_SMART',
        'ONLY_SMARTSTREAM',
        'ONLY_MEGASTREAM',
    ]).default('NONE'),
});

const tierSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    price: z.number().min(0),
});

const editorProcedure = protectedProcedure.use(requirePermission('addons:manage'));


export const addonRouter = router({
    list: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(1000).default(50),
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
        .mutation(async ({
            input,
        }) => {
            const {
                productIds, tiers, ...data
            } = input;

            const result = await prisma.addon.create({
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
            invalidateCache('product');
            return result;
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

            const result = await prisma.addon.update({
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
            invalidateCache('product');
            return result;
        }),

    delete: editorProcedure
        .input(z.object({
            id: z.string(),
            sudoPassword: z.string().optional(),
        }))
        .mutation(async ({
            input, ctx,
        }) => {
            const bcrypt = await import('bcryptjs');
            const session = ctx.session as any;
            if (!session.password) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Sicherheitsbestätigung (Passwort) fehlgeschlagen.',
                });
            }
            const isSudoValid = await bcrypt.compare(input.sudoPassword || '', session.password);
            if (!isSudoValid) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Sicherheitsbestätigung (Passwort) fehlgeschlagen.',
                });
            }
            const result = await prisma.addon.delete({
                where: {
                    id: input.id,
                },
            });
            invalidateCache('product');
            return result;
        }),
});
