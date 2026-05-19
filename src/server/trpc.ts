import {
  initTRPC, TRPCError,
} from '@trpc/server';
import type {
  Context,
} from './context';
import {
  httpLogger, formatDuration,
} from '../lib/logger';
import {
  prisma,
} from '@/lib/prisma';
import {
  login,
} from '@/lib/auth';
import {
  getCached,
} from '@/lib/cache';
import pc from 'picocolors';

const t = initTRPC.context<Context>().create();

const loggerMiddleware = t.middleware(async (opts) => {
  const start = Date.now();
  const {
    path, type,
  } = opts;
  const result = await opts.next();
  const duration = Date.now() - start;
  const typeStr = pc.bold(pc.magenta(type.toUpperCase()));

  if (result.ok) {
    httpLogger.info(`${typeStr} ${pc.white(path)} ${pc.green('200')} ${pc.gray(`in ${formatDuration(duration)}`)}`);
  }
  else {
    httpLogger.error(`${typeStr} ${pc.white(path)} ${pc.red(result.error.code)} ${pc.gray(`in ${formatDuration(duration)}`)}`);
  }
  return result;
});

export const router = t.router;
export const publicProcedure = t.procedure.use(loggerMiddleware);

const isAuthed = t.middleware(async ({
  ctx, next, type,
}) => {
  if (!ctx.session || !ctx.session.sub) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }

  const sub = ctx.session.sub as string;

  // Always re-fetch the user from DB on every protected request. This is the
  // revocation check: a deleted or demoted user will be caught here immediately
  // rather than waiting for the JWT to expire.
  const user = await getCached(`session:user:${sub}`, 60 * 1000, () => {
    return prisma.user.findUnique({
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
      },
    });
  });

  if (!user || (ctx.session.sessionVersion && user.sessionVersion !== ctx.session.sessionVersion)) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Session revoked or user credentials modified.',
    });
  }

  // Rolling token refresh: if the token was issued more than 2h ago, silently
  // re-issue it with fresh claims from the DB. This keeps an active session alive
  // across the 4h expiry window without requiring re-login during a work day.
  const iat = (ctx.session as any).iat as number | undefined;
  if (type === 'mutation' && iat && Date.now() / 1000 - iat > 2 * 60 * 60) {
    // Fire-and-forget — setting the cookie is a side effect that doesn't block
    // the actual request. If it fails, the user just re-logs in at the 4h mark.
    login({
      ...user,
      role: ctx.session.role === 'USER' ? 'USER' : user.role,
      isEditor: ctx.session.role === 'USER' ? false : user.isEditor,
    }).catch((e) => {
      console.warn('Silent token refresh failed:', e);
    });
  }

  return next({
    ctx: {
      session: {
        ...ctx.session,
        id: user.id,
        email: user.email,
        role: ctx.session.role === 'USER' ? 'USER' : user.role,
        isEditor: ctx.session.role === 'USER' ? false : user.isEditor,
        odRegionId: user.odRegionId,
        locationId: user.locationId,
        teamId: user.teamId,
        firstName: user.firstName,
        lastName: user.lastName,
        sessionVersion: user.sessionVersion,
        password: user.password,
      },
    },
  });
});

export const protectedProcedure = t.procedure.use(loggerMiddleware).use(isAuthed);

import type {
  Permission,
} from '@/lib/permissions';
import {
  hasPermission,
} from '@/lib/permissions';
import type {
  HierarchicalEntity,
} from './middlewares/scope-engine';
import {
  withHierarchicalScope,
} from './middlewares/scope-engine';

export const requirePermission = (permission: Permission) =>
  t.middleware(({
    ctx, next,
  }) => {
    const role = (ctx.session as any)?.role;
    const isEditor = (ctx.session as any)?.isEditor;
    if (!hasPermission(role, permission, isEditor)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Du hast keine Berechtigung für diese Aktion (${permission}).`,
      });
    }
    return next({
      ctx,
    });
  });

export {
  withHierarchicalScope,
};
export type {
  HierarchicalEntity,
};
