import { router, publicProcedure } from '@/server/trpc';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { login, logout } from '@/lib/auth';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';

export const authRouter = router({
    login: publicProcedure
        .input(z.object({
            email: z.string().email(),
            password: z.string(),
        }))
        .mutation(async ({ input }) => {
            const user = await prisma.user.findUnique({
                where: { email: input.email },
            });

            if (!user) {
                // Mock default user if none exists (for dev simplicity)
                // In reality, we should seed this.
                if (input.email === 'admin@telekom.de' && input.password === 'admin123') {
                    // We allow this hardcoded login if no user is in DB yet for bootstrapping
                    // But better: Checking if DB is empty?
                    // Let's stick to standard flow: User must exist.
                    // Actually, let's create a seed user if not exists? No, security risk.
                    // We will rely on seeding.
                }
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid credentials',
                });
            }

            const isValid = await bcrypt.compare(input.password, user.password);

            if (!isValid) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid credentials',
                });
            }

            // Create session
            await login(user.id, user.role);

            return { success: true };
        }),

    logout: publicProcedure
        .mutation(async () => {
            await logout();
            return { success: true };
        }),
});
