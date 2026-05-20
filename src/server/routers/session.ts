import {
    router, publicProcedure, protectedProcedure, requirePermission,
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
import bcrypt from 'bcryptjs';
import {
    getCached,
} from '@/lib/cache';
import {
    login, signDeviceId, verifyDeviceId,
    signSessionBinding, verifySessionBinding,
    hashPin, verifyPin,
} from '@/lib/auth';
import {
    getUserFilter,
} from '@/lib/rbac';
import {
    RedisRateLimiter,
} from '@/lib/rate-limit';

// 1 hour
const SETTINGS_TTL = 1000 * 60 * 60;

// Rate Limiters

// 15 minutes window, max 20 per IP
const registrationIpLimiter = new RedisRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    keyPrefix: 'rate_limit:registration:ip',
});

// 15 minutes window, max 5 per email
const registrationEmailLimiter = new RedisRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyPrefix: 'rate_limit:registration:email',
});

// 1 minute window, max 20 per IP
const loginIpLimiter = new RedisRateLimiter({
    windowMs: 60 * 1000,
    max: 20,
    keyPrefix: 'rate_limit:login:ip',
});

// 5 minutes window, max 5 per email
const loginEmailLimiter = new RedisRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 5,
    keyPrefix: 'rate_limit:login:email',
});

// 1 hour window, max 5 per IP
const pinResetRequestIpLimiter = new RedisRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    keyPrefix: 'rate_limit:pin_reset_request:ip',
});

// 15 minutes window, max 5 per email
const pinResetVerifyEmailLimiter = new RedisRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyPrefix: 'rate_limit:pin_reset_verify:email',
});

function checkIpIsAllowed(ipString: string, allowedIpsString: string) {
    if (!allowedIpsString || allowedIpsString.trim() === '') { return true; }

    const allowedIps = allowedIpsString.split('\n').map(ip => ip.trim()).filter(ip => ip !== '');
    if (allowedIps.length === 0) { return true; }

    try {
        const clientIp = ipaddr.parse(ipString);

        for (const allowed of allowedIps) {
            try {
                if (allowed.includes('/')) {
                    const range = ipaddr.parseCIDR(allowed);
                    if (clientIp.match(range)) { return true; }
                }
                else {
                    const allowedIp = ipaddr.parse(allowed);
                    if (clientIp.kind() === allowedIp.kind() && clientIp.toString() === allowedIp.toString()) { return true; }
                }
            }
            catch (error) {
                console.error(error);
            }
        }
    }
    catch (error) {
        console.error(error);
        return false;
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
            locationId: z.string().min(1),
            teamId: z.string().min(1),
            firstName: z.string().min(1),
            lastName: z.string().min(1),
            email: z.string().email().trim().toLowerCase().refine(
                (email) => email.endsWith('@telekom.de'),
                {
                    message: 'Nur @telekom.de E-Mail-Adressen sind erlaubt.',
                },
            ),
            pin: z.string().length(6),
            acceptedTerms: z.literal(true),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            const clientIp = ctx.ip || '127.0.0.1';

            const allowedIpsSetting = await getCached('systemSettings:allowed_ips', SETTINGS_TTL, () => {
                return ctx.prisma.systemSetting.findUnique({
                    where: {
                        key: 'allowed_ips',
                    },
                });
            });
            const allowedIpsValue = allowedIpsSetting?.value || '';

            const emailVerificationSetting = await getCached('systemSettings:require_email_verification', SETTINGS_TTL, () => {
                return ctx.prisma.systemSetting.findUnique({
                    where: {
                        key: 'require_email_verification',
                    },
                });
            });
            const isEmailRequiredSystemWide = emailVerificationSetting?.value !== 'false';

            if (!checkIpIsAllowed(clientIp, allowedIpsValue)) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'IP address not allowed',
                });
            }

            const ipLimitRes = await registrationIpLimiter.limit(clientIp);
            if (!ipLimitRes.success) {
                throw new TRPCError({
                    code: 'TOO_MANY_REQUESTS',
                    message: 'Zu viele Registrierungsanfragen von dieser IP-Adresse. Bitte warte einen Moment.',
                });
            }

            const emailLimitRes = await registrationEmailLimiter.limit(input.email);
            if (!emailLimitRes.success) {
                throw new TRPCError({
                    code: 'TOO_MANY_REQUESTS',
                    message: 'Zu viele Registrierungsanfragen für diese E-Mail-Adresse. Bitte warte einen Moment.',
                });
            }

            let bypassEmailCheck = !isEmailRequiredSystemWide;
            let deviceId = crypto.randomBytes(16).toString('hex');

            if (!bypassEmailCheck) {
                const cookieStore = await cookies();
                const deviceToken = cookieStore.get('sales-device-id')?.value;
                if (deviceToken) {
                    const verifiedDeviceId = await verifyDeviceId(deviceToken);
                    if (verifiedDeviceId) {
                        const recognizedUser = await ctx.prisma.user.findFirst({
                            where: {
                                email: input.email,
                                deviceId: verifiedDeviceId,
                                isVerified: true,
                            },
                        });
                        if (recognizedUser) {
                            bypassEmailCheck = true;
                            deviceId = verifiedDeviceId;
                        }
                    }
                }
            }

            const token = crypto.randomBytes(32).toString('hex');
            const hashedPinValue = await hashPin(input.pin);

            const existingUser = await ctx.prisma.user.findUnique({
                where: {
                    email: input.email,
                },
            });

            if (existingUser) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'Diese E-Mail-Adresse ist bereits registriert. Bitte melde Dich über "Willkommen zurück" an.',
                });
            }

            const user = await ctx.prisma.user.create({
                data: {
                    email: input.email,
                    pin: hashedPinValue,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    role: 'USER',
                    locationId: input.locationId,
                    teamId: input.teamId,
                    acceptedTerms: true,
                    deviceId: deviceId,
                    isVerified: bypassEmailCheck,
                    verificationToken: bypassEmailCheck ? null : token,
                    verificationExpiresAt: bypassEmailCheck ? null : new Date(Date.now() + 60 * 60 * 1000),
                },
            });

            if (!bypassEmailCheck && !user.isVerified) {
                const {
                    sendVerificationEmail,
                } = await import('@/lib/email');
                await sendVerificationEmail(input.email, input.firstName, token);
            }

            const bindingToken = await signSessionBinding(user.id);

            return {
                bindingToken,
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
            const user = await ctx.prisma.user.findUnique({
                where: {
                    verificationToken: input.token,
                },
            });

            if (!user) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Ungültiger oder abgelaufener Link',
                });
            }

            if (user.verificationExpiresAt && user.verificationExpiresAt < new Date()) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Der Link ist abgelaufen. Bitte fordere einen neuen an.',
                });
            }

            if (!user.isVerified) {
                await ctx.prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        isVerified: true,
                        verificationToken: null,
                    },
                });
            }

            const clientIp = ctx.ip || '127.0.0.1';

            if (user.deviceId) {
                await ctx.prisma.userSession.deleteMany({
                    where: {
                        deviceId: user.deviceId,
                    },
                });
            }

            await ctx.prisma.userSession.create({
                data: {
                    userId: user.id,
                    deviceId: user.deviceId,
                    ip: clientIp,
                    userAgent: ctx.req?.headers.get('user-agent'),
                    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
                },
            });

            await login({
                id: user.id,
                email: user.email,
                role: 'USER',
                isEditor: false,
                odRegionId: user.odRegionId,
                locationId: user.locationId,
                teamId: user.teamId,
            });

            if (user.deviceId) {
                const cookieStore = await cookies();
                const signedDeviceToken = await signDeviceId(user.deviceId);
                cookieStore.set('sales-device-id', signedDeviceToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 365,
                });
            }

            return {
                success: true,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            };
        }),

    checkVerification: publicProcedure
        .input(z.object({
            bindingToken: z.string(),
        }))
        .query(async ({
            ctx, input,
        }) => {
            const userId = await verifySessionBinding(input.bindingToken);
            if (!userId) {
                return {
                    verified: false,
                };
            }

            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
            return {
                verified: user?.isVerified ?? false,
            };
        }),

    finalizeLogin: publicProcedure
        .input(z.object({
            bindingToken: z.string(),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            const userId = await verifySessionBinding(input.bindingToken);
            if (!userId) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Invalid or expired binding token.',
                });
            }

            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });

            if (!user || !user.isVerified) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Not verified',
                });
            }

            const clientIp = ctx.ip || '127.0.0.1';

            if (user.deviceId) {
                await ctx.prisma.userSession.deleteMany({
                    where: {
                        deviceId: user.deviceId,
                    },
                });
            }

            await ctx.prisma.userSession.create({
                data: {
                    userId: user.id,
                    deviceId: user.deviceId,
                    ip: clientIp,
                    userAgent: ctx.req?.headers.get('user-agent'),
                    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
                },
            });

            await login({
                id: user.id,
                email: user.email,
                role: 'USER',
                isEditor: false,
                odRegionId: user.odRegionId,
                locationId: user.locationId,
                teamId: user.teamId,
            });

            if (user.deviceId) {
                const cookieStore = await cookies();
                const signedDeviceToken = await signDeviceId(user.deviceId);
                cookieStore.set('sales-device-id', signedDeviceToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 365,
                });
            }

            return {
                success: true,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            };
        }),

    getCurrent: publicProcedure.query(async ({
        ctx,
    }) => {
        if (!ctx.session || !ctx.session.sub) return null;

        const user = await ctx.prisma.user.findUnique({
            where: {
                id: ctx.session.sub as string,
            },
            include: {
                team: {
                    include: {
                        highlights: true,
                    },
                },
                location: true,
            },
        });

        if (!user || !user.isVerified) return null;
        return user;
    }),

    checkUserExists: publicProcedure
        .input(z.object({
            email: z.string().email().trim().toLowerCase(),
        }))
        .query(async ({
            ctx, input,
        }) => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    email: input.email,
                },
                select: {
                    id: true,
                },
            });
            return {
                exists: !!user,
            };
        }),


    updateTeam: protectedProcedure
        .input(z.object({
            teamId: z.string(),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            const userId = ctx.session.sub as string;
            const team = await ctx.prisma.team.findUnique({
                where: {
                    id: input.teamId,
                },
                select: {
                    locationId: true,
                },
            });

            const updatedUser = await ctx.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    teamId: input.teamId,
                    locationId: team?.locationId ?? undefined,
                },
            });

            await login({
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
                isEditor: updatedUser.isEditor,
                odRegionId: updatedUser.odRegionId,
                locationId: updatedUser.locationId,
                teamId: updatedUser.teamId,
                sessionVersion: updatedUser.sessionVersion,
            });

            return {
                success: true,
            };
        }),

    reloginReturningUser: publicProcedure
        .input(z.object({
            email: z.string().email().trim().toLowerCase(),
            pin: z.string().length(6),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            const clientIp = ctx.ip || '127.0.0.1';
            const allowedIpsSetting = await getCached('systemSettings:allowed_ips', SETTINGS_TTL, () => {
                return ctx.prisma.systemSetting.findUnique({
                    where: {
                        key: 'allowed_ips',
                    },
                });
            });

            if (!checkIpIsAllowed(clientIp, allowedIpsSetting?.value || '')) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'IP address not allowed',
                });
            }

            // IP rate limit
            const ipLimitRes = await loginIpLimiter.limit(clientIp);
            if (!ipLimitRes.success) {
                throw new TRPCError({
                    code: 'TOO_MANY_REQUESTS',
                    message: 'Zu viele Login-Versuche von dieser IP-Adresse. Bitte warte einen Moment.',
                });
            }

            // Email rate limit
            const emailLimitRes = await loginEmailLimiter.limit(input.email);
            if (!emailLimitRes.success) {
                throw new TRPCError({
                    code: 'TOO_MANY_REQUESTS',
                    message: 'Dieses Konto wurde vorübergehend gesperrt. Bitte versuche es in 5 Minuten erneut.',
                });
            }

            const user = await ctx.prisma.user.findUnique({
                where: {
                    email: input.email,
                },
            });

            if (!user) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Kein Benutzer mit dieser E-Mail gefunden.',
                });
            }

            if (!user.pin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Es wurde noch keine PIN für dieses Konto eingerichtet.',
                });
            }
            const isPinValid = await verifyPin(input.pin, user.pin);
            if (!isPinValid) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Die eingegebene PIN ist falsch.',
                });
            }

            const emailVerificationSetting = await getCached('systemSettings:require_email_verification', SETTINGS_TTL, () => {
                return ctx.prisma.systemSetting.findUnique({
                    where: {
                        key: 'require_email_verification',
                    },
                });
            });
            const isEmailRequiredSystemWide = emailVerificationSetting?.value !== 'false';

            let canInstantlyRelogin = !isEmailRequiredSystemWide || user.isVerified;
            const deviceId = user.deviceId || crypto.randomBytes(16).toString('hex');

            if (isEmailRequiredSystemWide && !user.isVerified) {
                const cookieStore = await cookies();
                const deviceToken = cookieStore.get('sales-device-id')?.value;
                if (deviceToken) {
                    const verifiedDeviceId = await verifyDeviceId(deviceToken);
                    if (verifiedDeviceId && verifiedDeviceId === user.deviceId) {
                        canInstantlyRelogin = true;
                    }
                }
            }

            if (!canInstantlyRelogin) {
                const token = crypto.randomBytes(32).toString('hex');
                await ctx.prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        verificationToken: token,
                        verificationExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
                    },
                });

                const {
                    sendVerificationEmail,
                } = await import('@/lib/email');
                await sendVerificationEmail(input.email, user.firstName || '', token);

                const bindingToken = await signSessionBinding(user.id);

                return {
                    success: false,
                    requiresVerification: true,
                    bindingToken,
                };
            }

            if (deviceId) {
                await ctx.prisma.userSession.deleteMany({
                    where: {
                        deviceId,
                    },
                });
            }

            await ctx.prisma.userSession.create({
                data: {
                    userId: user.id,
                    deviceId: deviceId,
                    ip: clientIp,
                    userAgent: ctx.req?.headers.get('user-agent'),
                    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
                },
            });

            await login({
                id: user.id,
                email: user.email,
                role: 'USER',
                isEditor: false,
                odRegionId: user.odRegionId,
                locationId: user.locationId,
                teamId: user.teamId,
            });

            if (deviceId) {
                const cookieStore = await cookies();
                const signedDeviceToken = await signDeviceId(deviceId);
                cookieStore.set('sales-device-id', signedDeviceToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 365,
                });
            }

            return {
                success: true,
                requiresVerification: false,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            };
        }),

    requestPinResetCode: publicProcedure
        .input(z.object({
            email: z.string().email().trim().toLowerCase(),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            const clientIp = ctx.ip || '127.0.0.1';

            // IP rate limit for requesting reset codes
            const ipLimitRes = await pinResetRequestIpLimiter.limit(clientIp);
            if (!ipLimitRes.success) {
                throw new TRPCError({
                    code: 'TOO_MANY_REQUESTS',
                    message: 'Zu viele Anfragen von dieser IP-Adresse. Bitte versuche es später erneut.',
                });
            }

            const user = await ctx.prisma.user.findUnique({
                where: {
                    email: input.email,
                },
            });

            if (!user || !user.isVerified) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Kein verifizierter Benutzer mit dieser E-Mail gefunden.',
                });
            }

            // Generate 6-digit PIN reset code
            const otpCode = crypto.randomInt(100000, 1000000).toString();
            const otpHash = await bcrypt.hash(otpCode, 10);

            await ctx.prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    pinResetOtpHash: otpHash,
                    // 10 minutes expiry
                    pinResetExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
                },
            });

            const {
                sendPinResetEmail,
            } = await import('@/lib/email');
            await sendPinResetEmail(user.email, user.firstName || 'Nutzer', otpCode);

            return {
                success: true,
            };
        }),

    verifyPinResetCode: publicProcedure
        .input(z.object({
            email: z.string().email().trim().toLowerCase(),
            code: z.string().length(6),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            // Email-based rate limit against OTP guessing
            const limitRes = await pinResetVerifyEmailLimiter.limit(input.email);
            if (!limitRes.success) {
                throw new TRPCError({
                    code: 'TOO_MANY_REQUESTS',
                    message: 'Zu viele fehlerhafte Versuche. Bitte fordere einen neuen Code an oder warte 15 Minuten.',
                });
            }

            const user = await ctx.prisma.user.findUnique({
                where: {
                    email: input.email,
                },
            });

            if (!user || !user.pinResetOtpHash || !user.pinResetExpiresAt) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Der eingegebene Code ist falsch oder abgelaufen.',
                });
            }

            if (user.pinResetExpiresAt < new Date()) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Der Code ist abgelaufen. Bitte fordere einen neuen an.',
                });
            }

            const isOtpValid = await bcrypt.compare(input.code, user.pinResetOtpHash);
            if (!isOtpValid) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Der eingegebene Code ist falsch oder abgelaufen.',
                });
            }

            // Clear OTP fields
            await ctx.prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    pinResetOtpHash: null,
                    pinResetExpiresAt: null,
                    isVerified: true,
                },
            });

            const clientIp = ctx.ip || '127.0.0.1';
            const deviceId = user.deviceId || crypto.randomBytes(16).toString('hex');

            if (deviceId) {
                await ctx.prisma.userSession.deleteMany({
                    where: {
                        deviceId,
                    },
                });
            }

            await ctx.prisma.userSession.create({
                data: {
                    userId: user.id,
                    deviceId,
                    ip: clientIp,
                    userAgent: ctx.req?.headers.get('user-agent'),
                    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
                },
            });

            await login({
                id: user.id,
                email: user.email,
                role: user.role || 'USER',
                isEditor: user.isEditor || false,
                odRegionId: user.odRegionId,
                locationId: user.locationId,
                teamId: user.teamId,
            });

            if (deviceId) {
                const cookieStore = await cookies();
                const signedDeviceToken = await signDeviceId(deviceId);
                cookieStore.set('sales-device-id', signedDeviceToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 365,
                });
            }

            return {
                success: true,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            };
        }),

    updatePin: protectedProcedure
        .input(z.object({
            pin: z.string().length(6),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            const userId = ctx.session.sub as string;
            const hashedPin = await hashPin(input.pin);

            await ctx.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    pin: hashedPin,
                },
            });

            return {
                success: true,
            };
        }),

    logout: publicProcedure.mutation(async () => {
        const cookieStore = await cookies();
        cookieStore.delete('auth-token');
        cookieStore.delete('sales-session-id');
        return true;
    }),

    list: protectedProcedure
        .use(requirePermission('users:read'))
        .input(z.object({
            limit: z.number().min(1).max(1000).default(50),
            cursor: z.string().nullish(),
            search: z.string().optional(),
            locationId: z.string().optional(),
        }).optional())
        .query(async ({
            ctx, input,
        }) => {
            const limit = input?.limit ?? 50;
            const cursor = input?.cursor;
            const search = input?.search;
            const locationId = input?.locationId;
            const session = ctx.session as any;

            const userFilter = getUserFilter(session);
            const userWhere: any = {
                AND: [
                    userFilter,
                ],
            };
            if (locationId) {
                userWhere.AND.push({
                    locationId,
                });
            }
            const where: any = {
                AND: [
                    userFilter.id === 'UNAUTHORIZED' ? {
                        id: 'UNAUTHORIZED',
                    } : {
                        user: userWhere,
                    },
                ],
                isActive: true,
            };

            if (search) {
                where.AND.push({
                    OR: [
                        {
                            user: {
                                email: {
                                    contains: search,
                                    mode: 'insensitive',
                                },
                            },
                        },
                        {
                            user: {
                                firstName: {
                                    contains: search,
                                    mode: 'insensitive',
                                },
                            },
                        },
                        {
                            user: {
                                lastName: {
                                    contains: search,
                                    mode: 'insensitive',
                                },
                            },
                        },
                        {
                            user: {
                                team: {
                                    name: {
                                        contains: search,
                                        mode: 'insensitive',
                                    },
                                },
                            },
                        },
                    ],
                });
            }

            const items = await ctx.prisma.userSession.findMany({
                take: limit + 1,
                cursor: cursor ? {
                    id: cursor,
                } : undefined,
                where,
                include: {
                    user: {
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
