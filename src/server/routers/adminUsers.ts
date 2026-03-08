import { router, protectedProcedure } from '@/server/trpc';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail, sendGoodbyeEmail } from '@/lib/email';

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
    if ((ctx.session as any)?.role !== 'ADMIN') {
        throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Nur Administratoren haben Berechtigung für diese Aktion.'
        });
    }
    return next({ ctx });
});

export const adminUsersRouter = router({
    list: protectedProcedure
        .query(async () => {
            return prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' }
            });
        }),

    create: adminProcedure
        .input(z.object({
            email: z.string().email("Ungültige E-Mail Adresse"),
            password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
            role: z.enum(["ADMIN", "TEAM_LEADER"])
        }))
        .mutation(async ({ input }) => {
            const existing = await prisma.user.findUnique({
                where: { email: input.email }
            });
            if (existing) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'Ein Benutzer mit dieser E-Mail existiert bereits.'
                });
            }

            const hash = await bcrypt.hash(input.password, 10);
            const newUser = await prisma.user.create({
                data: {
                    email: input.email,
                    password: hash,
                    role: input.role
                },
                select: { id: true, email: true, role: true, createdAt: true }
            });

            // E-Mail synchron/asynchron versenden (hier fire-and-forget, um Response nicht zu verzögern)
            sendWelcomeEmail(input.email, input.role, input.password).catch(console.error);

            return newUser;
        }),

    update: adminProcedure
        .input(z.object({
            id: z.string(),
            email: z.string().email("Ungültige E-Mail Adresse").optional(),
            password: z.string().min(6, "Das Passwort muss mindestens 6 Zeichen lang sein").optional().or(z.literal('')),
            role: z.enum(["ADMIN", "TEAM_LEADER"]).optional()
        }))
        .mutation(async ({ input }) => {
            const updateProps: Record<string, any> = {};
            if (input.email) {
                // Check if another user has this email
                const existing = await prisma.user.findUnique({ where: { email: input.email } });
                if (existing && existing.id !== input.id) {
                    throw new TRPCError({ code: 'CONFLICT', message: 'Ein Benutzer mit dieser E-Mail existiert bereits.' });
                }
                updateProps.email = input.email;
            }
            if (input.password && input.password.length > 0) {
                updateProps.password = await bcrypt.hash(input.password, 10);
            }
            if (input.role) {
                updateProps.role = input.role;
            }

            return prisma.user.update({
                where: { id: input.id },
                data: updateProps,
                select: { id: true, email: true, role: true, createdAt: true }
            });
        }),

    delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            if ((ctx.session as any)?.sub === input.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Du kannst deinen eigenen Account nicht löschen.'
                });
            }

            const target = await prisma.user.findUnique({ where: { id: input.id } });
            if (!target) throw new TRPCError({ code: 'NOT_FOUND' });

            if (target.role === 'ADMIN') {
                const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
                if (adminCount <= 1) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Der letzte Administrator-Account kann nicht gelöscht werden.'
                    });
                }
            }

            const deletedUser = await prisma.user.delete({
                where: { id: input.id },
                select: { id: true, email: true }
            });

            // Sende Auf Wiedersehen E-Mail
            sendGoodbyeEmail(deletedUser.email).catch(console.error);

            return { id: deletedUser.id };
        })
});
