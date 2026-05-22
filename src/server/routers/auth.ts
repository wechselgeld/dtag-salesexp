import {
  router, publicProcedure, protectedProcedure,
} from '@/server/trpc';
import {
  z,
} from 'zod';
import {
  prisma,
} from '@/lib/prisma';
import {
  login, logout,
} from '@/lib/auth';
import {
  TRPCError,
} from '@trpc/server';
import bcrypt from 'bcryptjs';

import crypto from 'crypto';
import {
  invalidateCache,
} from '@/lib/cache';

export const authRouter = router({
  me: publicProcedure.query(async ({
    ctx,
  }) => {
    if (!ctx.session || !ctx.session.sub) {
      return null;
    }
    const sub = ctx.session.sub as string;
    const user = await prisma.user.findUnique({
      where: {
        id: sub,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isEditor: true,
        odRegionId: true,
        locationId: true,
        teamId: true,
        firstName: true,
        lastName: true,
        sessionVersion: true,
        password: true,
        team: {
          select: {
            locationId: true,
            location: {
              select: {
                odRegionId: true,
              },
            },
          },
        },
        location: {
          select: {
            odRegionId: true,
          },
        },
      },
    });

    if (!user) return null;

    const effectiveLocationId = user.locationId || user.team?.locationId || null;
    const effectiveOdRegionId = user.odRegionId || user.location?.odRegionId || user.team?.location?.odRegionId || null;

    return {
      ...ctx.session,
      id: user.id,
      email: user.email,
      role: ctx.session.role === 'USER' ? 'USER' : user.role,
      isEditor: ctx.session.role === 'USER' ? false : user.isEditor,
      odRegionId: user.odRegionId,
      locationId: user.locationId,
      teamId: user.teamId,
      effectiveLocationId,
      effectiveOdRegionId,
      firstName: user.firstName,
      lastName: user.lastName,
      sessionVersion: user.sessionVersion,
      password: user.password,
    };
  }),

  login: publicProcedure
    .input(z.object({
      // toLowerCase here means the DB query uses an exact match on the @unique index.
      // Previously `mode: 'insensitive'` was used, which forces a sequential scan
      // because PostgreSQL can't use a B-tree index for case-insensitive LIKE/ILIKE.
      email: z.string().email().trim().toLowerCase(),
      password: z.string(),
    }))
    .mutation(async ({
      input, ctx,
    }) => {
      // findUnique instead of findFirst: email is @unique, so this hits the index
      // directly and returns in O(log N) instead of a full table scan.
      const user = await prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Deine Zugangsdaten sind ungültig. Wende Dich an den Entwickler, um Zugangsdaten zu bestellen.',
        });
      }

      if (user.role === 'USER') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Deine Rolle hat keine Berechtigung für administrative Aktionen.',
        });
      }

      if (!user.password) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Es wurde noch kein Passwort für dieses Konto festgelegt. Bitte melde Dich mit Deiner PIN oder Deinem Passkey an und richte ein Passwort ein.',
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
        sessionVersion: user.sessionVersion,
      });

      const clientIp = ctx.ip || '127.0.0.1';
      let deviceId = user.deviceId;

      if (!deviceId) {
        deviceId = crypto.randomBytes(16).toString('hex');
      }

      await prisma.userSession.deleteMany({
        where: {
          deviceId,
        },
      });

      await prisma.userSession.create({
        data: {
          userId: user.id,
          deviceId,
          ip: clientIp,
          userAgent: ctx.req?.headers.get('user-agent'),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4 hours for admin password login
        },
      });

      const {
          writeAuditLog,
      } = await import('@/lib/audit-logger');
      await writeAuditLog({
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        message: `Erfolgreiche Anmeldung für Administrator "${user.firstName || ''} ${user.lastName || ''}".`,
        details: {
            email: user.email,
            role: user.role,
        },
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        clientIp,
      });

      const passkeyCount = await prisma.passkey.count({
        where: {
          email: user.email,
        },
      });

      return {
        success: true,
        suggestPasskey: passkeyCount === 0,
      };
    }),

  checkAdminPasswordSetup: protectedProcedure.query(async ({
    ctx,
  }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.session.sub as string,
      },
      select: {
        password: true,
        role: true,
      },
    });
    if (!user) {
      return {
        needsPassword: false,
        role: 'USER',
        hasPassword: false,
      };
    }
    return {
      needsPassword: user.role !== 'USER' && (!user.password || user.password.trim() === ''),
      role: user.role,
      hasPassword: !!user.password && user.password.trim() !== '',
    };
  }),

  setPassword: protectedProcedure
    .input(z.object({
      password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.'),
    }))
    .mutation(async ({
      ctx, input,
    }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      await prisma.user.update({
        where: {
          id: ctx.session.sub as string,
        },
        data: {
          password: hashedPassword,
          sessionVersion: {
            increment: 1,
          },
        },
      });
      invalidateCache(`session:user:${ctx.session.sub}`);
      return {
        success: true,
      };
    }),

  setupAdminPassword: publicProcedure
    .input(z.object({
      email: z.string().email().trim().toLowerCase(),
      pin: z.string().length(6),
      password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.'),
    }))
    .mutation(async ({
      input, ctx,
    }) => {
      const user = await prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Kein Konto mit dieser E-Mail-Adresse gefunden.',
        });
      }

      if (user.role === 'USER') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Dein Konto hat keine Administrator-Berechtigungen. Du benötigst kein Passwort.',
        });
      }

      if (user.password && user.password.trim() !== '') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Für dieses Konto existiert bereits ein Passwort. Bitte nutze den normalen Login.',
        });
      }

      if (!user.pin) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Es wurde noch keine PIN für dieses Konto eingerichtet.',
        });
      }

      const isPinValid = await bcrypt.compare(input.pin, user.pin);

      if (!isPinValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Die eingegebene PIN ist falsch.',
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
          sessionVersion: {
            increment: 1,
          },
        },
      });
      invalidateCache(`session:user:${updatedUser.id}`);

      await login({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        isEditor: updatedUser.isEditor,
        odRegionId: updatedUser.odRegionId,
        locationId: updatedUser.locationId,
        teamId: updatedUser.teamId,
        sessionVersion: updatedUser.sessionVersion,
      });

      const clientIp = ctx.ip || '127.0.0.1';
      let deviceId = updatedUser.deviceId;

      if (!deviceId) {
        deviceId = crypto.randomBytes(16).toString('hex');
      }

      await prisma.userSession.deleteMany({
        where: {
          deviceId,
        },
      });

      // 4 hours for admin login
      await prisma.userSession.create({
        data: {
          userId: updatedUser.id,
          deviceId,
          ip: clientIp,
          userAgent: ctx.req?.headers.get('user-agent'),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 4),
        },
      });

      const {
          writeAuditLog,
      } = await import('@/lib/audit-logger');
      await writeAuditLog({
        action: 'LOGIN',
        entityType: 'User',
        entityId: updatedUser.id,
        message: `Administrator-Konto eingerichtet und angemeldet für "${updatedUser.firstName || ''} ${updatedUser.lastName || ''}".`,
        details: {
            email: updatedUser.email,
            role: updatedUser.role,
        },
        userId: updatedUser.id,
        userEmail: updatedUser.email,
        userRole: updatedUser.role,
        clientIp,
      });

      const passkeyCount = await prisma.passkey.count({
        where: {
          email: user.email,
        },
      });

      return {
        success: true,
        suggestPasskey: passkeyCount === 0,
      };
    }),

  logout: publicProcedure.mutation(async () => {
    try {
      const {
          writeAuditLog,
      } = await import('@/lib/audit-logger');
      await writeAuditLog({
        action: 'LOGOUT',
        message: 'Administrator hat sich erfolgreich abgemeldet.',
      });
    }
    catch (err) {
      console.error('[Logout Log Error]', err);
    }
    await logout();
    return {
      success: true,
    };
  }),
});
