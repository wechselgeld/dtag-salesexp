import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const teamRouter = router({
    list: publicProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.team.findMany({
            include: {
                highlights: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
    }),

    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1)
        }))
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session || (ctx.session.role !== 'ADMIN' && ctx.session.role !== 'TEAM_LEADER')) {
                throw new TRPCError({ code: 'FORBIDDEN' });
            }

            return await ctx.prisma.team.create({
                data: {
                    name: input.name
                }
            });
        }),

    delete: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session || ctx.session.role !== 'ADMIN') {
                throw new TRPCError({ code: 'FORBIDDEN' });
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
                        message: 'Dieses Team kann nicht gelöscht werden, da noch Verknüpfungen (z.B. Sessions) existieren. Bitte stellen Sie sicher, dass alle Cascade-Regeln in der Datenbank aktiv sind.'
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
            if (!ctx.session || (ctx.session.role !== 'ADMIN' && ctx.session.role !== 'TEAM_LEADER')) {
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
