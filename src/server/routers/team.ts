import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const teamRouter = router({
    list: publicProcedure
        .input(z.object({
            locationId: z.string().optional(),
            odRegionId: z.string().optional()
        }).optional())
        .query(async ({ ctx, input }) => {
            const session = ctx.session as any;

            let securityFilter: any = {};
            if (session?.role) {
                if (session.role === 'OD_MANAGER' && session.odRegionId) {
                    securityFilter = { location: { odRegionId: session.odRegionId } };
                } else if (session.role === 'LOCATION_MANAGER' && session.locationId) {
                    securityFilter = { locationId: session.locationId };
                } else if (session.role === 'TEAM_LEADER' && session.teamId) {
                    securityFilter = { id: session.teamId };
                }
            }

            return await ctx.prisma.team.findMany({
                where: {
                    ...securityFilter,
                    ...(input?.locationId ? { locationId: input.locationId } : {}),
                    ...(input?.odRegionId ? { location: { odRegionId: input.odRegionId } } : {})
                },
                include: {
                    location: true,
                    highlights: {
                        include: {
                            product: true
                        }
                    }
                },
                orderBy: { name: 'asc' }
            });
        }),

    getById: publicProcedure
        .input(z.object({
            id: z.string()
        }))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.team.findUnique({
                where: { id: input.id },
                include: {
                    location: true,
                    highlights: {
                        include: {
                            product: true
                        }
                    }
                }
            });
        }),

    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                email: z.string().email().optional().or(z.literal("")).transform(v => v === "" ? undefined : v),
                locationId: z.string().optional().or(z.literal("")).transform(v => v === "" ? undefined : v)
            })
        )
        .mutation(async ({ ctx, input }) => {
            const role = (ctx.session as any)?.role;
            if (!role || (role !== 'ADMIN' && role !== 'OD_MANAGER' && role !== 'LOCATION_MANAGER')) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Keine Berechtigung zum Erstellen von Teams.' });
            }

            return await ctx.prisma.team.create({
                data: {
                    name: input.name,
                    email: input.email || "team06@telekom.de",
                    locationId: input.locationId
                }
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            email: z.string().email().optional(),
            locationId: z.string().optional().nullable()
        }))
        .mutation(async ({ ctx, input }) => {
            const role = (ctx.session as any)?.role;
            if (!role || (role !== 'ADMIN' && role !== 'OD_MANAGER' && role !== 'LOCATION_MANAGER' && role !== 'TEAM_LEADER')) {
                throw new TRPCError({ code: 'FORBIDDEN' });
            }

            const { id, ...dataToUpdate } = input;

            if (Object.keys(dataToUpdate).length === 0) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'No fields to update provided.' });
            }

            return await ctx.prisma.team.update({
                where: { id },
                data: dataToUpdate
            });
        }),

    delete: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const role = (ctx.session as any)?.role;
            if (!role || (role !== 'ADMIN' && role !== 'OD_MANAGER' && role !== 'LOCATION_MANAGER')) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Keine Berechtigung zum Löschen dieses Teams.' });
            }

            try {
                return await ctx.prisma.team.delete({
                    where: { id: input.id }
                });
            } catch (error: any) {
                // Check for P2003 (Foreign key constraint failed) or P2025 (Record not found)
                if (error.code === 'P2003') {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'Dieses Team kann nicht gelöscht werden, da noch Verknüpfungen (z.B. Sessions) existieren. Bitte stelle sicher, dass alle Cascade-Regeln in der Datenbank aktiv sind.'
                    });
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error.message || 'Fehler beim Löschen des Teams'
                });
            }
        }),

    toggleFocus: protectedProcedure
        .input(z.object({
            teamId: z.string(),
            productId: z.string().optional(),
            category: z.string().optional(),
            businessCase: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const role = (ctx.session as any)?.role;
            if (!role || (role !== 'ADMIN' && role !== 'OD_MANAGER' && role !== 'LOCATION_MANAGER' && role !== 'TEAM_LEADER')) {
                throw new TRPCError({ code: 'FORBIDDEN' });
            }

            // At least one target must be provided
            if (!input.productId && !input.category && !input.businessCase) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Target missing' });
            }

            const existing = await ctx.prisma.teamHighlight.findFirst({
                where: {
                    teamId: input.teamId,
                    ...(input.productId ? { productId: input.productId } : {}),
                    ...(input.category ? { category: input.category } : {}),
                    ...(input.businessCase ? { businessCase: input.businessCase } : {})
                }
            });

            if (existing) {
                await ctx.prisma.teamHighlight.delete({
                    where: { id: existing.id }
                });
                return { added: false };
            } else {
                await ctx.prisma.teamHighlight.create({
                    data: {
                        teamId: input.teamId,
                        productId: input.productId,
                        category: input.category,
                        businessCase: input.businessCase
                    }
                });
                return { added: true };
            }
        }),
});
