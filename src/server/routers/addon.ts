import { router, protectedProcedure, publicProcedure } from '@/server/trpc';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { TRPCError } from '@trpc/server';

const addonFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    category: z.string().optional(),
    isGlobal: z.boolean().default(false),
    isActive: z.boolean().default(true),
    requiresNoMagentaTV: z.boolean().default(false),
});

const tierSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    price: z.number().min(0),
});

export const addonRouter = router({
    list: protectedProcedure.query(async () => {
        return prisma.addon.findMany({
            include: {
                compatibleProducts: { select: { id: true, name: true, category: true } },
                tiers: true
            },
            orderBy: { name: 'asc' },
        });
    }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const addon = await prisma.addon.findUnique({
                where: { id: input.id },
                include: {
                    compatibleProducts: { select: { id: true } },
                    tiers: true
                },
            });
            if (!addon) throw new TRPCError({ code: 'NOT_FOUND' });
            return {
                ...addon,
                productIds: addon.compatibleProducts.map(p => p.id),
            };
        }),

    create: protectedProcedure
        .input(addonFormSchema.extend({
            productIds: z.array(z.string()),
            tiers: z.array(tierSchema)
        }))
        .mutation(async ({ input }) => {
            const { productIds, tiers, ...data } = input;

            return prisma.addon.create({
                data: {
                    ...data,
                    compatibleProducts: { connect: productIds.map(id => ({ id })) },
                    tiers: {
                        create: tiers.map(t => ({ name: t.name, price: t.price }))
                    }
                }
            });
        }),

    update: protectedProcedure
        .input(addonFormSchema.extend({
            id: z.string(),
            productIds: z.array(z.string()),
            tiers: z.array(tierSchema)
        }))
        .mutation(async ({ input }) => {
            const { id, productIds, tiers, ...data } = input;

            // Delete old tiers and recreate (simplest array update strategy for this usecase)
            await prisma.addonTier.deleteMany({
                where: { addonId: id }
            });

            return prisma.addon.update({
                where: { id },
                data: {
                    ...data,
                    compatibleProducts: { set: productIds.map(pid => ({ id: pid })) },
                    tiers: {
                        create: tiers.map(t => ({ name: t.name, price: t.price }))
                    }
                }
            });
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            return prisma.addon.delete({ where: { id: input.id } });
        }),
});
