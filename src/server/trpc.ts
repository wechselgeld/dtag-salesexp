import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
import { prisma } from '@/lib/prisma';

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.session) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
        ctx: {
            session: ctx.session,
        },
    });
});

export const protectedProcedure = t.procedure.use(isAuthed);
