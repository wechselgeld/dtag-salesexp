import { router, publicProcedure, protectedProcedure } from '@/server/trpc';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { login, logout } from '@/lib/auth';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';

export const authRouter = router({
  me: protectedProcedure.query(({ ctx }) => ctx.session),

  login: publicProcedure
    .input(z.object({
      // toLowerCase here means the DB query uses an exact match on the @unique index.
      // Previously `mode: 'insensitive'` was used, which forces a sequential scan
      // because PostgreSQL can't use a B-tree index for case-insensitive LIKE/ILIKE.
      email: z.string().email().trim().toLowerCase(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      // findUnique instead of findFirst: email is @unique, so this hits the index
      // directly and returns in O(log N) instead of a full table scan.
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Deine Zugangsdaten sind ungültig. Wende Dich an den Entwickler, um Zugangsdaten zu bestellen.',
        });
      }

      const isValid = await bcrypt.compare(input.password, user.password);

      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Deine Zugangsdaten sind ungültig. Wende Dich an den Entwickler, um Zugangsdaten zu bestellen.',
        });
      }

      await login({
        id: user.id,
        email: user.email,
        role: user.role,
        isEditor: user.isEditor,
        odRegionId: user.odRegionId,
        locationId: user.locationId,
        teamId: user.teamId,
      });

      const passkeyCount = await prisma.passkey.count({
        where: { email: user.email },
      });

      return { success: true, suggestPasskey: passkeyCount === 0 };
    }),

  logout: publicProcedure.mutation(async () => {
    await logout();
    return { success: true };
  }),
});
