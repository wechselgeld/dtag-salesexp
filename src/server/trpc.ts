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
import pc from 'picocolors';

const t = initTRPC.context<Context>().create();

// Global Logger Middleware
const loggerMiddleware = t.middleware(async (opts) => {
	const start = Date.now();
	const {
		path, type,
	} = opts;

	const result = await opts.next();

	const duration = Date.now() - start;
	const durationStr = formatDuration(duration);
	const typeStr = pc.bold(pc.magenta(type.toUpperCase()));

	if (result.ok) {
		httpLogger.info(`${typeStr} ${pc.white(path)} ${pc.green('200')} ${pc.gray(`in ${durationStr}`)}`);
	}
	else {
		const errorCode = result.error.code;
		httpLogger.error(`${typeStr} ${pc.white(path)} ${pc.red(errorCode)} ${pc.gray(`in ${durationStr}`)}`);
	}

	return result;
});

export const router = t.router;
export const publicProcedure = t.procedure.use(loggerMiddleware); // Apply to all public procedures

const isAuthed = t.middleware(async ({
	ctx, next,
}) => {
	if (!ctx.session || !ctx.session.sub) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
		});
	}

	const user = await prisma.user.findUnique({
		where: {
			id: ctx.session.sub as string,
		},
		select: {
			id: true,
			email: true,
			role: true,
			isEditor: true,
			odRegionId: true,
			locationId: true,
			teamId: true,
		},
	});

	if (!user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'Session revoked or user deleted.',
		});
	}

	return next({
		ctx: {
			session: {
				...ctx.session,
				id: user.id,
				email: user.email,
				role: user.role,
				isEditor: user.isEditor,
				odRegionId: user.odRegionId,
				locationId: user.locationId,
				teamId: user.teamId,
			},
		},
	});
});

export const protectedProcedure = t.procedure.use(loggerMiddleware).use(isAuthed); // Apply to protected as well
