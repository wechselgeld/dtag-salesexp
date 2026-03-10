import { router, publicProcedure, protectedProcedure } from "../trpc";
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

    getIsEmailRequired: publicProcedure.query(async ({ ctx }) => {
        const setting = await ctx.prisma.systemSetting.findUnique({
            where: { key: 'require_email_verification' }
        });
        return setting?.value !== 'false';
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

            // Rate-Limiting: Max 3 requests per IP in the last 15 minutes
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
            const recentRequests = await ctx.prisma.salesSession.count({
                where: {
                    ip: clientIp,
                    createdAt: { gte: fifteenMinutesAgo },
                    isVerified: false
                }
            });

            if (recentRequests >= 3) {
                throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Zu viele Anfragen. Bitte versuche es später erneut." });
            }

            const emailVerificationSetting = await ctx.prisma.systemSetting.findUnique({
                where: { key: 'require_email_verification' }
            });
            const isEmailRequiredSystemWide = emailVerificationSetting?.value !== 'false';

            let bypassEmailCheck = !isEmailRequiredSystemWide;

            if (!bypassEmailCheck) {
                const previousVerifiedSession = await ctx.prisma.salesSession.findFirst({
                    where: {
                        email: input.email,
                        isVerified: true
                    }
                });
                if (previousVerifiedSession) {
                    bypassEmailCheck = true;
                }
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
                    isVerified: bypassEmailCheck,
                    verificationToken: bypassEmailCheck ? null : token,
                    verificationExpiresAt: bypassEmailCheck ? null : new Date(Date.now() + 60 * 60 * 1000) // 1 hour validity
                }
            });

            if (!bypassEmailCheck) {
                const { sendVerificationEmail } = await import('@/lib/email');
                await sendVerificationEmail(input.email, input.firstName, token);
            }

            return { sessionId: session.id, bypassed: bypassEmailCheck };
        }),

    verifyEmail: publicProcedure
        .input(z.object({ token: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const session = await ctx.prisma.salesSession.findUnique({
                where: { verificationToken: input.token }
            });

            if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ungültiger oder abgelaufener Link' });

            if (session.verificationExpiresAt && session.verificationExpiresAt < new Date()) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Der Link ist abgelaufen. Bitte fordere einen neuen an.' });
            }

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

    reloginReturningUser: publicProcedure
        .input(z.object({
            email: z.string().email()
        }))
        .mutation(async ({ ctx, input }) => {
            const clientIp = ctx.ip || "127.0.0.1";
            const setting = await ctx.prisma.systemSetting.findUnique({
                where: { key: 'allowed_ips' }
            });

            if (!checkIpIsAllowed(clientIp, setting?.value || "")) {
                throw new TRPCError({ code: "FORBIDDEN", message: "IP address not allowed" });
            }

            // verify if this email had a session previously
            const lastSession = await ctx.prisma.salesSession.findFirst({
                where: { email: input.email, isVerified: true },
                orderBy: { createdAt: 'desc' }
            });

            // If the user hasn't verified before, they must do full setup
            if (!lastSession) {
                throw new TRPCError({ code: "NOT_FOUND", message: "No prior verified session found." });
            }

            const newSession = await ctx.prisma.salesSession.create({
                data: {
                    teamId: lastSession.teamId,
                    firstName: lastSession.firstName,
                    lastName: lastSession.lastName,
                    email: lastSession.email,
                    acceptedTerms: true,
                    ip: clientIp,
                    userAgent: ctx.req?.headers.get('user-agent'),
                    isVerified: true
                }
            });

            const { signSessionId } = await import('@/lib/auth');
            const signedToken = await signSessionId(newSession.id);

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
                firstName: newSession.firstName,
                lastName: newSession.lastName,
                email: newSession.email
            };
        }),

    logout: publicProcedure.mutation(async () => {
        const cookieStore = await cookies();
        cookieStore.delete('sales-session-id');
        return true;
    }),

    list: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(50),
            cursor: z.string().nullish(),
        }).optional())
        .query(async ({ ctx, input }) => {
            const limit = input?.limit ?? 50;
            const cursor = input?.cursor;
            const session = ctx.session as any;

            let where: any = {};
            if (session.role === 'OD_MANAGER' && session.odRegionId) {
                where = { team: { location: { odRegionId: session.odRegionId } } };
            } else if (session.role === 'LOCATION_MANAGER' && session.locationId) {
                where = { team: { locationId: session.locationId } };
            } else if (session.role === 'TEAM_LEADER' && session.teamId) {
                where = { teamId: session.teamId };
            }

            const items = await ctx.prisma.salesSession.findMany({
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
                where,
                include: {
                    team: {
                        include: {
                            location: {
                                include: {
                                    odRegion: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }

            return { items, nextCursor };
        }),
});
