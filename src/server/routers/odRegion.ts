import {
    router, publicProcedure, protectedProcedure,
} from '../trpc';
import {
    z,
} from 'zod';
import {
    TRPCError,
} from '@trpc/server';

export const odRegionRouter = router({
    list: publicProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(50),
            cursor: z.string().nullish(),
            search: z.string().optional(),
        }).optional())
        .query(async ({
            ctx, input,
        }) => {
            const limit = input?.limit ?? 50;
            const cursor = input?.cursor;
            const search = input?.search;

            const where: any = {
            };
            if (search) {
                where.name = {
                    contains: search,
                    mode: 'insensitive',
                };
            }

            const items = await ctx.prisma.odRegion.findMany({
                take: limit + 1,
                cursor: cursor ? {
                    id: cursor,
                } : undefined,
                where,
                include: {
                    locations: true,
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

    getById: publicProcedure
        .input(z.object({
            id: z.string(),
        }))
        .query(({
            ctx, input,
        }) => {
            return ctx.prisma.odRegion.findUnique({
                where: {
                    id: input.id,
                },
                include: {
                    locations: true,
                },
            });
        }),

    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
            isActive: z.boolean().optional(),
        }))
        .mutation(({
            ctx, input,
        }) => {
            if (!ctx.session || (ctx.session as any).role !== 'ADMIN') {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Keine Berechtigung',
                });
            }

            return ctx.prisma.odRegion.create({
                data: {
                    name: input.name,
                    isActive: input.isActive ?? true,
                },
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            isActive: z.boolean().optional(),
        }))
        .mutation(({
            ctx, input,
        }) => {
            const role = (ctx.session as any)?.role;
            if (!ctx.session || (role !== 'ADMIN' && role !== 'OD_MANAGER')) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                });
            }

            if (role === 'OD_MANAGER' && (ctx.session as any).odRegionId !== input.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Nur deinen eigenen OD-Bereich kannst du bearbeiten.',
                });
            }

            const {
                id, ...dataToUpdate
            } = input;
            if (Object.keys(dataToUpdate).length === 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'No fields to update',
                });
            }

            return ctx.prisma.odRegion.update({
                where: {
                    id,
                },
                data: dataToUpdate,
            });
        }),

    delete: protectedProcedure
        .input(z.object({
            id: z.string(),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            if (!ctx.session || (ctx.session as any).role !== 'ADMIN') {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                });
            }

            try {
                return await ctx.prisma.odRegion.delete({
                    where: {
                        id: input.id,
                    },
                });
            }
            catch (error: any) {
                if (error.code === 'P2003') {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'OD-Bereich hat verknüpfte Standorte/Teams.',
                    });
                }
                throw error;
            }
        }),
});
