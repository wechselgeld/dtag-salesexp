import {
    router, publicProcedure, protectedProcedure,
} from '../trpc';
import {
    z,
} from 'zod';
import {
    cookies,
} from 'next/headers';
import {
    TRPCError,
} from '@trpc/server';
import ipaddr from 'ipaddr.js';
import crypto from 'crypto';
import {
    getCached,
} from '@/lib/cache';

const SETTINGS_TTL = 1000 * 60 * 60; // 1 hour

function checkIpIsAllowed(ipString: string, allowedIpsString: string) {
    if (!allowedIpsString || allowedIpsString.trim() === '') { return true; } // Empty string means all IPs allowed

    const allowedIps = allowedIpsString.split('\n').map(ip => ip.trim()).filter(ip => ip !== '');
    if (allowedIps.length === 0) { return true; }

    try {
        const clientIp = ipaddr.parse(ipString);

        for (const allowed of allowedIps) {
            try {
                if (allowed.includes('/')) { // CIDR
                    const range = ipaddr.parseCIDR(allowed);
                    if (clientIp.match(range)) { return true; }
                }
                else { // Single IP
                    const allowedIp = ipaddr.parse(allowed);
                    if (clientIp.kind() === allowedIp.kind() && clientIp.toString() === allowedIp.toString()) { return true; }
                }
            }
            catch (error) {
                // Ignore invalid entries in allowed list
                console.error(error);
            }
        }
    }
    catch (error) {
        console.error(error);
        return false; // Invalid client IP
    }

    return false;
}

export const sessionRouter = router({
    verifyIp: publicProcedure.query(async ({
        ctx,
    }) => {
        const clientIp = ctx.ip || '127.0.0.1';

        const setting = await getCached('systemSettings:allowed_ips', SETTINGS_TTL, () => {
            return ctx.prisma.systemSetting.findUnique({
                where: {
                    key: 'allowed_ips',
                },
            });
        });

        const isAllowed = checkIpIsAllowed(clientIp, setting?.value || '');

        if (!isAllowed) {
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: 'Dein Zugangsort (IP-Adresse) ist nicht zur Nutzung dieser Anwendung autorisiert. Wende Dich an einen Adminstrator, wenn Du glaubst, dass dies ein Fehler ist.',
            });
        }

        return {
            success: true,
        };
    }),

    getIsEmailRequired: publicProcedure.query(async ({
        ctx,
    }) => {
        const setting = await getCached('systemSettings:require_email_verification', SETTINGS_TTL, () => {
            return ctx.prisma.systemSetting.findUnique({
                where: {
                    key: 'require_email_verification',
                },
            });
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
        .mutation(async ({
            ctx, input,
        }) => {
            const clientIp = ctx.ip || '127.0.0.1';

            // Split cache to fix invalidation footgun
            const allowedIpsSetting = await getCached('systemSettings:allowed_ips', SETTINGS_TTL, () => {
                return ctx.prisma.systemSetting.findUnique({ where: { key: 'allowed_ips' } });
            });
            const allowedIpsValue = allowedIpsSetting?.value || '';

            const emailVerificationSetting = await getCached('systemSettings:require_email_verification', SETTINGS_TTL, () => {
                return ctx.prisma.systemSetting.findUnique({ where: { key: 'require_email_verification' } });
            });
            const isEmailRequiredSystemWide = emailVerificationSetting?.value !== 'false';

            if (!checkIpIsAllowed(clientIp, allowedIpsValue)) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'IP address not allowed',
                });
            }

            // Data Bloat Fix: Lazy background cleanup of old unverified sessions (older than 2 hours)
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
            ctx.prisma.salesSession.deleteMany({
                where: { isVerified: false, createdAt: { lt: twoHoursAgo } }
            }).catch(console.error); // Run in background

            // Rate-Limiting: Max 50 per IP, Max 3 per Email in the last 15 minutes (Fixes NAT trap)
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
            const [recentIpRequests, recentEmailRequests] = await Promise.all([
                ctx.prisma.salesSession.count({
                    where: { ip: clientIp, createdAt: { gte: fifteenMinutesAgo }, isVerified: false },
                }),
                ctx.prisma.salesSession.count({
                    where: { email: input.email, createdAt: { gte: fifteenMinutesAgo }, isVerified: false },
                })
            ]);

            if (recentIpRequests >= 50 || recentEmailRequests >= 3) {
                throw new TRPCError({
                    code: 'TOO_MANY_REQUESTS',
                    message: 'Zu viele Anfragen. Bitte versuche es später erneut.',
                });
            }

            let bypassEmailCheck = !isEmailRequiredSystemWide;
            let deviceId = crypto.randomBytes(16).toString('hex');

            // Implement Device Fingerprinting instead of Zero-Auth
            if (!bypassEmailCheck) {
                const cookieStore = await cookies();
                const deviceToken = cookieStore.get('sales-device-id')?.value;
                
                if (deviceToken) {
                    const { verifyDeviceId } = await import('@/lib/auth');
                    const verifiedDeviceId = await verifyDeviceId(deviceToken);
                    if (verifiedDeviceId) {
                        // Check if this device is associated with this email
                        const recognizedDevice = await ctx.prisma.salesSession.findFirst({
                            where: {
                                email: input.email,
                                deviceId: verifiedDeviceId,
                                isVerified: true,
                            }
                        });
                        if (recognizedDevice) {
                            bypassEmailCheck = true;
                            deviceId = verifiedDeviceId;
                        }
                    }
                }
            }

            const token = crypto.randomBytes(32).toString('hex');

            const session = await ctx.prisma.salesSession.create({
                data: {
                    teamId: input.teamId,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    email: input.email,
                    acceptedTerms: input.acceptedTerms,
                    ip: clientIp,
                    deviceId: deviceId,
                    userAgent: ctx.req?.headers.get('user-agent'),
                    isVerified: bypassEmailCheck,
                    verificationToken: bypassEmailCheck ? null : token,
                    verificationExpiresAt: bypassEmailCheck ? null : new Date(Date.now() + 60 * 60 * 1000), // 1 hour validity
                },
            });

            if (!bypassEmailCheck) {
                const {
                    sendVerificationEmail,
                } = await import('@/lib/email');
                await sendVerificationEmail(input.email, input.firstName, token);
            }

            return {
                sessionId: session.id,
                bypassed: bypassEmailCheck,
            };
        }),

    verifyEmail: publicProcedure
        .input(z.object({
            token: z.string(),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            const session = await ctx.prisma.salesSession.findUnique({
                where: {
                    verificationToken: input.token,
                },
            });

            if (!session) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Ungültiger oder abgelaufener Link',
                });
            }

            if (session.verificationExpiresAt && session.verificationExpiresAt < new Date()) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Der Link ist abgelaufen. Bitte fordere einen neuen an.',
                });
            }

            if (!session.isVerified) {
                await ctx.prisma.salesSession.update({
                    where: {
                        id: session.id,
                    },
                    data: {
                        isVerified: true,
                        verificationToken: null,
                    },
                });
            }

            const {
                signSessionId, signDeviceId
            } = await import('@/lib/auth');
            const signedToken = await signSessionId(session.id);

            const cookieStore = await cookies();
            cookieStore.set('sales-session-id', signedToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });

            if (session.deviceId) {
                const signedDeviceToken = await signDeviceId(session.deviceId);
                cookieStore.set('sales-device-id', signedDeviceToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 365, // 365 days
                });
            }

            return {
                success: true,
                firstName: session.firstName,
                lastName: session.lastName,
                email: session.email,
            };
        }),

    checkVerification: publicProcedure
        .input(z.object({
            sessionId: z.string(),
        }))
        .query(async ({
            ctx, input,
        }) => {
            const session = await ctx.prisma.salesSession.findUnique({
                where: {
                    id: input.sessionId,
                },
            });
            if (!session) {
                return {
                    verified: false,
                };
            }
            return {
                verified: session.isVerified,
            };
        }),

    finalizeLogin: publicProcedure
        .input(z.object({
            sessionId: z.string(),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            const session = await ctx.prisma.salesSession.findUnique({
                where: {
                    id: input.sessionId,
                },
            });

            if (!session || !session.isVerified) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Not verified',
                });
            }

            const {
                signSessionId, signDeviceId
            } = await import('@/lib/auth');
            const signedToken = await signSessionId(session.id);

            const cookieStore = await cookies();
            cookieStore.set('sales-session-id', signedToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });

            if (session.deviceId) {
                const signedDeviceToken = await signDeviceId(session.deviceId);
                cookieStore.set('sales-device-id', signedDeviceToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 365, // 365 days
                });
            }

            return {
                success: true,
                firstName: session.firstName,
                lastName: session.lastName,
                email: session.email,
            };
        }),

    getCurrent: publicProcedure.query(async ({
        ctx,
    }) => {
        const cookieStore = await cookies();
        const token = cookieStore.get('sales-session-id')?.value;

        if (!token) { return null; }

        const {
            verifySessionId,
        } = await import('@/lib/auth');
        const sessionId = await verifySessionId(token);

        if (!sessionId) { return null; }

        const session = await ctx.prisma.salesSession.findUnique({
            where: {
                id: sessionId,
            },
            include: {
                team: {
                    include: {
                        highlights: true,
                    },
                },
            },
        });

        if (!session || !session.isActive || !session.isVerified) { return null; }

        return session;
    }),

    updateTeam: publicProcedure
        .input(z.object({
            teamId: z.string(),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            const cookieStore = await cookies();
            const token = cookieStore.get('sales-session-id')?.value;
            if (!token) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                });
            }

            const {
                verifySessionId,
            } = await import('@/lib/auth');
            const sessionId = await verifySessionId(token);
            if (!sessionId) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                });
            }

            await ctx.prisma.salesSession.update({
                where: {
                    id: sessionId,
                },
                data: {
                    teamId: input.teamId,
                },
            });
            return {
                success: true,
            };
        }),

    reloginReturningUser: publicProcedure
        .input(z.object({
            email: z.string().email(),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            const clientIp = ctx.ip || '127.0.0.1';
            const allowedIpsSetting = await getCached('systemSettings:allowed_ips', SETTINGS_TTL, () => {
                return ctx.prisma.systemSetting.findUnique({ where: { key: 'allowed_ips' } });
            });

            if (!checkIpIsAllowed(clientIp, allowedIpsSetting?.value || '')) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'IP address not allowed',
                });
            }

            // verify if this email had a session previously
            const lastSession = await ctx.prisma.salesSession.findFirst({
                where: {
                    email: input.email,
                    isVerified: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            // If the user hasn't verified before, they must do full setup
            if (!lastSession) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'No prior verified session found.',
                });
            }

            const emailVerificationSetting = await getCached('systemSettings:require_email_verification', SETTINGS_TTL, () => {
                return ctx.prisma.systemSetting.findUnique({ where: { key: 'require_email_verification' } });
            });
            const isEmailRequiredSystemWide = emailVerificationSetting?.value !== 'false';

            let canInstantlyRelogin = !isEmailRequiredSystemWide;
            let deviceId = crypto.randomBytes(16).toString('hex');

            // Device fingerprinting check
            if (isEmailRequiredSystemWide) {
                const cookieStore = await cookies();
                const deviceToken = cookieStore.get('sales-device-id')?.value;
                if (deviceToken) {
                    const { verifyDeviceId } = await import('@/lib/auth');
                    const verifiedDeviceId = await verifyDeviceId(deviceToken);
                    if (verifiedDeviceId) {
                        const recognizedDevice = await ctx.prisma.salesSession.findFirst({
                            where: { email: input.email, deviceId: verifiedDeviceId, isVerified: true }
                        });
                        if (recognizedDevice) {
                            canInstantlyRelogin = true;
                            deviceId = verifiedDeviceId;
                        }
                    }
                }
            }

            if (!canInstantlyRelogin) {
                // Return requiresVerification instead of failing, and create a pending session with magic link
                const token = crypto.randomBytes(32).toString('hex');
                const session = await ctx.prisma.salesSession.create({
                    data: {
                        teamId: lastSession.teamId,
                        firstName: lastSession.firstName,
                        lastName: lastSession.lastName,
                        email: lastSession.email,
                        acceptedTerms: true,
                        ip: clientIp,
                        deviceId: deviceId,
                        userAgent: ctx.req?.headers.get('user-agent'),
                        isVerified: false,
                        verificationToken: token,
                        verificationExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
                    },
                });

                const { sendVerificationEmail } = await import('@/lib/email');
                await sendVerificationEmail(input.email, lastSession.firstName || '', token);

                return {
                    success: false,
                    requiresVerification: true,
                    sessionId: session.id,
                };
            }

            const newSession = await ctx.prisma.salesSession.create({
                data: {
                    teamId: lastSession.teamId,
                    firstName: lastSession.firstName,
                    lastName: lastSession.lastName,
                    email: lastSession.email,
                    acceptedTerms: true,
                    ip: clientIp,
                    deviceId: deviceId,
                    userAgent: ctx.req?.headers.get('user-agent'),
                    isVerified: true,
                },
            });

            const {
                signSessionId, signDeviceId
            } = await import('@/lib/auth');
            const signedToken = await signSessionId(newSession.id);

            const cookieStore = await cookies();
            cookieStore.set('sales-session-id', signedToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });

            if (deviceId) {
                const signedDeviceToken = await signDeviceId(deviceId);
                cookieStore.set('sales-device-id', signedDeviceToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 365, // 365 days
                });
            }

            return {
                success: true,
                requiresVerification: false,
                firstName: newSession.firstName,
                lastName: newSession.lastName,
                email: newSession.email,
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
        .query(async ({
            ctx, input,
        }) => {
            const limit = input?.limit ?? 50;
            const cursor = input?.cursor;
            const session = ctx.session as any;

            let where: any = {
            };
            if (session.role === 'OD_MANAGER' && session.odRegionId) {
                where = {
                    team: {
                        location: {
                            odRegionId: session.odRegionId,
                        },
                    },
                };
            }
            else if (session.role === 'LOCATION_MANAGER' && session.locationId) {
                where = {
                    team: {
                        locationId: session.locationId,
                    },
                };
            }
            else if (session.role === 'TEAM_LEADER' && session.teamId) {
                where = {
                    teamId: session.teamId,
                };
            }

            const items = await ctx.prisma.salesSession.findMany({
                take: limit + 1,
                cursor: cursor ? {
                    id: cursor,
                } : undefined,
                where,
                include: {
                    team: {
                        include: {
                            location: {
                                include: {
                                    odRegion: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }

            return {
                items,
                nextCursor,
            };
        }),
});
