import {
    router, publicProcedure, protectedProcedure, requirePermission, withHierarchicalScope,
} from '../trpc';
import {
    z,
} from 'zod';
import {
    TRPCError,
} from '@trpc/server';
import bcrypt from 'bcryptjs';
import {
    getLocationFilter, hasRole, canManageLocation,
} from '@/lib/rbac';

export const locationRouter = router({
    list: publicProcedure
        .input(z.object({
            locationId: z.string().optional(),
            odRegionId: z.string().optional(),
            limit: z.number().min(1).max(1000).default(50),
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
            const securityFilter = getLocationFilter(session);

            if (securityFilter.id === 'UNAUTHORIZED') {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                });
            }

            const where: any = {
                AND: [
                    securityFilter,
                ],
            };

            if (input?.locationId) {
                where.AND.push({
                    id: input.locationId,
                });
            }

            if (input?.odRegionId) {
                where.AND.push({
                    odRegionId: input.odRegionId,
                });
            }

            if (search) {
                where.AND.push({
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            address: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            odRegion: {
                                name: {
                                    contains: search,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    ],
                });
            }

            const items = await ctx.prisma.location.findMany({
                take: limit + 1,
                cursor: cursor ? {
                    id: cursor,
                } : undefined,
                where,
                select: {
                    id: true,
                    name: true,
                    address: true,
                    isActive: true,
                    odRegionId: true,
                    odRegion: {
                        select: {
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            teams: true,
                        },
                    },
                },
                orderBy: {
                    name: 'asc',
                },
            });

            let nextCursor: typeof cursor | undefined;
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
        .use(requirePermission('locations:manage'))
        .input(z.object({
            name: z.string().min(1),
            address: z.string().optional().nullable(),
            isActive: z.boolean().default(true),
            odRegionId: z.string().optional().nullable(),
        }))
        .mutation(({
            ctx, input,
        }) => {
            const session = ctx.session as any;

            if (!hasRole(session, 'OD_MANAGER')) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Keine Berechtigung zum Erstellen von Standorten',
                });
            }

            if (!canManageLocation(session, input.odRegionId)) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Dieser OD-Bereich gehört nicht zu dir.',
                });
            }

            let assignedOdRegion = input.odRegionId;
            if (session.role === 'OD_MANAGER') {
                assignedOdRegion = session.odRegionId;
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
        .use(requirePermission('locations:manage'))
        .use(withHierarchicalScope('location'))
        .input(z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            address: z.string().optional().nullable(),
            isActive: z.boolean().optional(),
            odRegionId: z.string().optional().nullable(),
        }))
        .mutation(({
            ctx, input,
        }) => {
            const session = ctx.session as any;
            const {
                id, ...dataToUpdate
            } = input;

            if (session.role === 'OD_MANAGER' && input.odRegionId !== undefined) {
                dataToUpdate.odRegionId = session.odRegionId;
            }
            if (session.role === 'LOCATION_MANAGER' && input.odRegionId !== undefined) {
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
        .use(requirePermission('locations:delete'))
        .use(withHierarchicalScope('location'))
        .input(z.object({
            id: z.string(),
            sudoPassword: z.string().optional(),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            const session = ctx.session as any;

            if (!session.password) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Sicherheitsbestätigung (Passwort) fehlgeschlagen.',
                });
            }

            const isPasswordValid = await bcrypt.compare(input.sudoPassword || '', session.password);

            if (!isPasswordValid) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Sicherheitsbestätigung (Passwort) fehlgeschlagen.',
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
