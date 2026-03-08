import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { cookies } from "next/headers";
import { TRPCError } from "@trpc/server";
import ipaddr from "ipaddr.js";

function checkIpIsAllowed(ipString: string, allowedIpsString: string) {
    if (!allowedIpsString || allowedIpsString.trim() === "") return true; // Empty string means all IPs allowed

    const allowedIps = allowedIpsString.split("\n").map(ip => ip.trim()).filter(ip => ip !== "");
    if (allowedIps.length === 0) return true;

    try {
        const clientIp = ipaddr.parse(ipString);

        for (const allowed of allowedIps) {
            try {
                if (allowed.includes("/")) { // CIDR
                    const range = ipaddr.parseCIDR(allowed);
                    if (clientIp.match(range)) return true;
                } else { // Single IP
                    const allowedIp = ipaddr.parse(allowed);
                    if (clientIp.kind() === allowedIp.kind() && clientIp.toString() === allowedIp.toString()) return true;
                }
            } catch (e) {
                // Ignore invalid entries in allowed list
            }
        }
    } catch (e) {
        return false; // Invalid client IP
    }

    return false;
}

export const sessionRouter = router({
    verifyIp: publicProcedure.query(async ({ ctx }) => {
        const clientIp = ctx.ip || "127.0.0.1";

        const setting = await ctx.prisma.systemSetting.findUnique({
            where: { key: 'allowed_ips' }
        });

        const isAllowed = checkIpIsAllowed(clientIp, setting?.value || "");

        if (!isAllowed) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Dein Zugangsort (IP-Adresse) ist nicht zur Nutzung dieser Anwendung autorisiert. Wende Dich an einen Adminstrator, wenn Du glaubst, dass dies ein Fehler ist."
            });
        }

        return { success: true };
    }),

    requestVerification: publicProcedure
        .input(z.object({
            teamId: z.string(),
            firstName: z.string().min(1),
            lastName: z.string().min(1),
            email: z.string().email(),
            acceptedTerms: z.literal(true),
        }))
        .mutation(async ({ ctx, input }) => {
            const clientIp = ctx.ip || "127.0.0.1";
            const setting = await ctx.prisma.systemSetting.findUnique({
                where: { key: 'allowed_ips' }
            });

            if (!checkIpIsAllowed(clientIp, setting?.value || "")) {
                throw new TRPCError({ code: "FORBIDDEN", message: "IP address not allowed" });
            }

            const crypto = require('crypto');
            const token = crypto.randomBytes(32).toString('hex');

            const session = await ctx.prisma.salesSession.create({
                data: {
                    teamId: input.teamId,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    email: input.email,
                    acceptedTerms: input.acceptedTerms,
                    ip: clientIp,
                    userAgent: ctx.req?.headers.get('user-agent'),
                    isVerified: false,
                    verificationToken: token
                }
            });

            const { sendVerificationEmail } = await import('@/lib/email');
            await sendVerificationEmail(input.email, input.firstName, token);

            return { sessionId: session.id };
        }),

    verifyEmail: publicProcedure
        .input(z.object({ token: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const session = await ctx.prisma.salesSession.findUnique({
                where: { verificationToken: input.token }
            });

            if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ungültiger oder abgelaufener Link' });

            if (!session.isVerified) {
                await ctx.prisma.salesSession.update({
                    where: { id: session.id },
                    data: { isVerified: true, verificationToken: null }
                });
            }

            const { signSessionId } = await import('@/lib/auth');
            const signedToken = await signSessionId(session.id);

            const cookieStore = await cookies();
            cookieStore.set('sales-session-id', signedToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });

            return {
                success: true,
                firstName: session.firstName,
                lastName: session.lastName,
                email: session.email
            };
        }),

    checkVerification: publicProcedure
        .input(z.object({ sessionId: z.string() }))
        .query(async ({ ctx, input }) => {
            const session = await ctx.prisma.salesSession.findUnique({
                where: { id: input.sessionId }
            });
            if (!session) return { verified: false };
            return { verified: session.isVerified };
        }),

    finalizeLogin: publicProcedure
        .input(z.object({ sessionId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const session = await ctx.prisma.salesSession.findUnique({
                where: { id: input.sessionId }
            });

            if (!session || !session.isVerified) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Not verified' });
            }

            const { signSessionId } = await import('@/lib/auth');
            const signedToken = await signSessionId(session.id);

            const cookieStore = await cookies();
            cookieStore.set('sales-session-id', signedToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });

            return {
                success: true,
                firstName: session.firstName,
                lastName: session.lastName,
                email: session.email
            };
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

        if (!session || !session.isActive || !session.isVerified) return null;

        return session;
    }),

    updateTeam: publicProcedure
        .input(z.object({ teamId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const cookieStore = await cookies();
            const token = cookieStore.get('sales-session-id')?.value;
            if (!token) throw new TRPCError({ code: 'UNAUTHORIZED' });

            const { verifySessionId } = await import('@/lib/auth');
            const sessionId = await verifySessionId(token);
            if (!sessionId) throw new TRPCError({ code: 'UNAUTHORIZED' });

            await ctx.prisma.salesSession.update({
                where: { id: sessionId },
                data: { teamId: input.teamId }
            });
            return { success: true };
        }),

    logout: publicProcedure.mutation(async () => {
        const cookieStore = await cookies();
        cookieStore.delete('sales-session-id');
        return true;
    })
});
