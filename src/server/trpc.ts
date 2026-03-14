import {
	initTRPC, TRPCError,
} from '@trpc/server';
import type {
	Context,
} from './context';

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({
	ctx, next,
}) => {
	if (!ctx.session || !ctx.session.sub) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
		});
	}

	// ctx.session already contains the JWT payload with id, role, and permission IDs.
	// We no longer need to fetch the user from DB on every request.
	return next({
		ctx: {
			session: {
				...ctx.session,
				id: ctx.session.sub as string,
			},
		},
	});
});

export const protectedProcedure = t.procedure.use(isAuthed);
