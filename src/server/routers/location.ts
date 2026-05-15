import {
    router, publicProcedure, protectedProcedure,
} from '../trpc';
import {
    z,
} from 'zod';
import {
    TRPCError,
} from '@trpc/server';

export const locationRouter = router({
    list: publicProcedure
        .input(z.object({
            locationId: z.string().optional(),
            odRegionId: z.string().optional(),
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
            const session = ctx.session as any;
            let securityFilter: any = {
            };
            if (session?.role) {
                if (session.role === 'OD_MANAGER' && session.odRegionId) {
                    securityFilter = {
                        odRegionId: session.odRegionId,
                    };
                }
                else if (session.role === 'LOCATION_MANAGER' && session.locationId) {
                    securityFilter = {
                        id: session.locationId,
                    };
                }
                else if (session.role === 'TEAM_LEADER' && session.teamId) {
                    // For team leader we could restrict to their location
                    securityFilter = {
                        teams: {
                            some: {
                                id: session.teamId,
                            },
                        },
                    };
                }
            }

            const where: any = {
                ...securityFilter,
            };

            // Apply optional filters, but don't allow bypassing security restrictions
            if (input?.locationId) {
                if (!securityFilter.id || securityFilter.id === input.locationId) {
                    where.id = input.locationId;
                }
            }

            if (input?.odRegionId) {
                if (!securityFilter.odRegionId || securityFilter.odRegionId === input.odRegionId) {
                    where.odRegionId = input.odRegionId;
                }
            }

            if (search) {
                where.OR = [
                    {
                        name: {
                            contains: search,
                        },
                    },
                    {
                        address: {
                            contains: search,
                        },
                    },
                ];
            }

            const items = await ctx.prisma.location.findMany({
                take: limit + 1,
                cursor: cursor ? {
                    id: cursor,
                } : undefined,
                where,
                include: {
                    odRegion: true,
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
            return ctx.prisma.location.findUnique({
                where: {
                    id: input.id,
                },
                include: {
                    teams: true,
                },
            });
        }),

    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                address: z.string().optional().nullable(),
                isActive: z.boolean().default(true),
                odRegionId: z.string().optional().nullable(),
            }),
        )
        .mutation(({
            ctx, input,
        }) => {
            const role = (ctx.session as any)?.role;
            if (!role || (role !== 'ADMIN' && role !== 'OD_MANAGER')) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Keine Berechtigung zum Erstellen von Standorten',
                });
            }

            // OD_MANAGER enforcing
            let assignedOdRegion = input.odRegionId;
            if (role === 'OD_MANAGER') {
                assignedOdRegion = (ctx.session as any).odRegionId;
            }

            return ctx.prisma.location.create({
                data: {
                    name: input.name,
                    address: input.address,
                    isActive: input.isActive,
                    odRegionId: assignedOdRegion,
                },
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            address: z.string().optional().nullable(),
            isActive: z.boolean().optional(),
            odRegionId: z.string().optional().nullable(),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            const role = (ctx.session as any)?.role;
            if (!role || (role !== 'ADMIN' && role !== 'OD_MANAGER' && role !== 'LOCATION_MANAGER')) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Keine Berechtigung zum Bearbeiten von Standorten.',
                });
            }

            const existing = await ctx.prisma.location.findUnique({
                where: {
                    id: input.id,
                },
            });
            if (!existing) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                });
            }

            if (role === 'OD_MANAGER' && existing.odRegionId !== (ctx.session as any).odRegionId) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Dieser Standort gehört nicht zu deinem OD-Bereich.',
                });
            }
            if (role === 'LOCATION_MANAGER' && input.id !== (ctx.session as any).locationId) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Du kannst nur deinen zugewiesenen Standort bearbeiten.',
                });
            }

            const {
                id, ...dataToUpdate
            } = input;

            // Re-enforce OD_MANAGER boundary
            if (role === 'OD_MANAGER' && input.odRegionId !== undefined) {
                dataToUpdate.odRegionId = (ctx.session as any).odRegionId;
            }
            // Block LOCATION_MANAGER from moving their location
            if (role === 'LOCATION_MANAGER' && input.odRegionId !== undefined) {
                delete dataToUpdate.odRegionId;
            }

            if (Object.keys(dataToUpdate).length === 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'No fields to update provided.',
                });
            }

            return ctx.prisma.location.update({
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
            const role = (ctx.session as any)?.role;
            if (!role || (role !== 'ADMIN' && role !== 'OD_MANAGER')) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Keine Berechtigung zum Löschen.',
                });
            }

            const existing = await ctx.prisma.location.findUnique({
                where: {
                    id: input.id,
                },
            });
            if (!existing) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                });
            }

            if (role === 'OD_MANAGER' && existing.odRegionId !== (ctx.session as any).odRegionId) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Dieser Standort gehört nicht zu deinem OD-Bereich.',
                });
            }

            try {
                return await ctx.prisma.location.delete({
                    where: {
                        id: input.id,
                    },
                });
            }
            catch (error: any) {
                if (error.code === 'P2003') {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'Dieser Standort kann nicht gelöscht werden, da noch Teams mit ihm verknüpft sind.',
                    });
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error.message || 'Fehler beim Löschen des Standorts',
                });
            }
        }),
});
