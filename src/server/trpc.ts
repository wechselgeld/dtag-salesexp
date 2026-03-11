import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
import { prisma } from '@/lib/prisma';

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.sub) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    // Lazy load the full user record only for procedures that use this middleware
    const user = await prisma.user.findUnique({
        where: { id: ctx.session.sub as string },
        include: { location: true, odRegion: true, team: true }
    });

    return next({
        ctx: {
            session: user ? { ...user, sub: user.id } : ctx.session,
        },
    });
});

export const protectedProcedure = t.procedure.use(isAuthed);
