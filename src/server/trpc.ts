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

async function logErrorToDatabase(params: {
  traceId: string;
  path?: string;
  type?: string;
  message: string;
  stack?: string;
  details?: any;
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  clientIp?: string;
}) {
  try {
    await prisma.errorLog.create({
      data: {
        traceId: params.traceId,
        path: params.path || null,
        type: params.type || null,
        message: params.message,
        stack: params.stack || null,
        details: params.details || null,
        userId: params.userId || null,
        userEmail: params.userEmail || null,
        userRole: params.userRole || null,
        clientIp: params.clientIp || null,
      },
    });
  }
  catch (dbErr) {
    console.error('Failed to write to ErrorLog database table:', dbErr);
  }
}

function sanitizeErrorInput(val: any): any {
  if (val === null || val === undefined) {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeErrorInput);
  }
  if (typeof val === 'object') {
    const sanitized: Record<string, any> = {
};
    for (const key of Object.keys(val)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('password') ||
        lowerKey.includes('pin') ||
        lowerKey.includes('token') ||
        lowerKey.includes('otp') ||
        lowerKey.includes('code') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('credential') ||
        lowerKey.includes('auth')
      ) {
        sanitized[key] = '[GEFILTERT]';
      }
 else {
        sanitized[key] = sanitizeErrorInput(val[key]);
      }
    }
    return sanitized;
  }
  return val;
}

function shouldLogErrorToDb(params: {
  path?: string;
  code: string;
  cause?: any;
}): boolean {
  const {
 path, code,
} = params;

  if (path) {
    if (path === 'webauthn.generateAuthenticationOptions' && code === 'NOT_FOUND') {
      return false;
    }
    if (path === 'webauthn.verifyRegistration' && code === 'BAD_REQUEST') {
      return false;
    }
    if (path === 'webauthn.verifyAuthentication' && (code === 'BAD_REQUEST' || code === 'NOT_FOUND')) {
      return false;
    }
    if (path === 'session.reloginReturningUser' && (code === 'NOT_FOUND' || code === 'UNAUTHORIZED')) {
      return false;
    }
    if (path === 'auth.login' && (code === 'UNAUTHORIZED' || code === 'FORBIDDEN')) {
      return false;
    }
  }

  return true;
}

const t = initTRPC.context<Context>().create({
  errorFormatter({
    shape, error, ctx, path, input,
  }) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isAdmin = ctx?.session?.role === 'ADMIN';

    const cause = error.cause && typeof error.cause === 'object' ? (error.cause as Record<string, any>) : null;
    const errorType = cause?.type || error.code || 'UNKNOWN';

    const shouldLog = shouldLogErrorToDb({
      path,
      code: error.code,
      cause,
    });

    if (ctx?.traceId && shouldLog) {
      const sanitizedInput = sanitizeErrorInput(input);
      const mergedDetails = cause
        ? {
 ...cause,
input: sanitizedInput,
}
        : {
 input: sanitizedInput,
};

      logErrorToDatabase({
        traceId: ctx.traceId,
        path: shape.data.path,
        type: errorType,
        message: error.message,
        stack: error.stack,
        details: mergedDetails,
        userId: (ctx.session as any)?.id || ctx.session?.sub || null,
        userEmail: ctx.session?.email || null,
        userRole: ctx.session?.role || null,
        clientIp: ctx.ip,
      }).catch(console.error);
    }

    const sanitizedDiagnosticsInput = sanitizeErrorInput(input);
    const diagnosticsDetails = cause
      ? {
 ...cause,
input: sanitizedDiagnosticsInput,
}
      : {
 input: sanitizedDiagnosticsInput,
};

    const diagnostics = {
      traceId: ctx?.traceId || 'tr_unknown',
      path: shape.data.path,
      timestamp: new Date().toISOString(),
      user: ctx?.session ? {
        id: (ctx.session as any)?.id || ctx.session.sub,
        role: ctx.session.role,
        email: ctx.session.email,
      } : null,
      clientIp: ctx?.ip,
      details: diagnosticsDetails,
    };

    return {
      ...shape,
      data: {
        ...shape.data,
        traceId: ctx?.traceId,
        diagnostics: (isDevelopment || isAdmin) ? diagnostics : {
          traceId: ctx?.traceId,
          message: 'An error occurred. Please contact support with this Trace ID.',
        },
        stack: (isDevelopment && error.stack) ? error.stack : undefined,
      },
    };
  },
});

import {
	auditContextStorage,
} from '@/lib/audit-context';

const auditContextMiddleware = t.middleware(({
	ctx,
	next,
}) => {
	const session = ctx.session;
	const context = {
		userId: session?.sub || (session as any)?.id || null,
		userEmail: session?.email || null,
		userRole: session?.role || null,
		clientIp: ctx.ip || null,
	};
	return auditContextStorage.run(context, () => next());
});

const loggerMiddleware = t.middleware(async (opts) => {
  const start = Date.now();
  const {
    path, type, ctx,
  } = opts;
  const result = await opts.next();
  const duration = Date.now() - start;
  const typeStr = pc.bold(pc.magenta(type.toUpperCase()));
  const traceId = (ctx as any).traceId || 'tr_unknown';
  const traceStr = pc.gray(`[${traceId}]`);

  if (result.ok) {
    httpLogger.info(`${traceStr} ${typeStr} ${pc.white(path)} ${pc.green('200')} ${pc.gray(`in ${formatDuration(duration)}`)}`);
  }
  else {
    httpLogger.error(`${traceStr} ${typeStr} ${pc.white(path)} ${pc.red(result.error.code)} ${pc.gray(`in ${formatDuration(duration)}`)}`);
  }
  return result;
});

export const router = t.router;
export const publicProcedure = t.procedure.use(auditContextMiddleware).use(loggerMiddleware);

const isAuthed = t.middleware(async ({
  ctx, next, type,
}) => {
  if (!ctx.session || !ctx.session.sub) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }

  const sub = ctx.session.sub as string;

  const user = await getCached(`session:user:${sub}`, 60 * 1000, () => {
    if (sub === 'master-owner') {
      return {
        id: 'master-owner',
        email: 'owner@sxp.internal',
        role: 'ADMIN',
        isEditor: true,
        odRegionId: null,
        locationId: null,
        teamId: null,
        firstName: 'Owner',
        lastName: 'SXP',
        sessionVersion: 1,
        password: null,
        team: null,
        location: null,
      };
    }
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

  const effectiveLocationId = user.locationId || user.team?.locationId || null;
  const effectiveOdRegionId = user.odRegionId || user.location?.odRegionId || user.team?.location?.odRegionId || null;

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
        effectiveLocationId,
        effectiveOdRegionId,
        firstName: user.firstName,
        lastName: user.lastName,
        sessionVersion: user.sessionVersion,
        password: user.password,
      },
    },
  });
});

export const protectedProcedure = t.procedure.use(auditContextMiddleware).use(loggerMiddleware).use(isAuthed);

import type {
  Permission,
} from '@/lib/permissions';
import {
  hasPermission,
} from '@/lib/permissions';
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
        cause: {
          type: 'PERMISSION_DENIED',
          permission,
          role,
          isEditor,
        },
      });
    }
    return next({
      ctx,
    });
  });

export {
  withHierarchicalScope,
};
