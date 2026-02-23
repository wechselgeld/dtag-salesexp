import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { cookies } from "next/headers";
import { TRPCError } from "@trpc/server";

export const sessionRouter = router({
    create: publicProcedure
        .input(z.object({
            teamId: z.string(),
            acceptedTerms: z.literal(true),
        }))
        .mutation(async ({ ctx, input }) => {
            // Create session record
            const session = await ctx.prisma.salesSession.create({
                data: {
                    teamId: input.teamId,
                    acceptedTerms: input.acceptedTerms,
                    // IP and UserAgent could be extracted from request headers if available in context
                }
            });

            // Set cookie
            const { signSessionId } = await import('@/lib/auth');
            const token = await signSessionId(session.id);

            const cookieStore = await cookies();
            cookieStore.set('sales-session-id', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });

            return { success: true };
        }),

    getCurrent: publicProcedure.query(async ({ ctx }) => {
        const cookieStore = await cookies();
        const token = cookieStore.get('sales-session-id')?.value;

        if (!token) return null;

        const { verifySessionId } = await import('@/lib/auth');
        const sessionId = await verifySessionId(token);

        if (!sessionId) return null;

        const session = await ctx.prisma.salesSession.findUnique({
            where: { id: sessionId },
            include: {
                team: {
                    include: {
                        highlights: true
                    }
                }
            }
        });

        if (!session || !session.isActive) return null;

        return session;
    }),

    logout: publicProcedure.mutation(async () => {
        const cookieStore = await cookies();
        cookieStore.delete('sales-session-id');
        return true;
    })
});
