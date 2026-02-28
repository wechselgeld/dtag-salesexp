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

    create: publicProcedure
        .input(z.object({
            teamId: z.string(),
            acceptedTerms: z.literal(true),
        }))
        .mutation(async ({ ctx, input }) => {
            // Verify IP before creating session
            const clientIp = ctx.ip || "127.0.0.1";
            const setting = await ctx.prisma.systemSetting.findUnique({
                where: { key: 'allowed_ips' }
            });

            if (!checkIpIsAllowed(clientIp, setting?.value || "")) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "IP address not allowed"
                });
            }

            // Create session record
            const session = await ctx.prisma.salesSession.create({
                data: {
                    teamId: input.teamId,
                    acceptedTerms: input.acceptedTerms,
                    ip: clientIp,
                    userAgent: ctx.req?.headers.get('user-agent'),
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
