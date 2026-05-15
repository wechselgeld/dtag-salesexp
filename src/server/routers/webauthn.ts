import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
    RegistrationResponseJSON,
    AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const rpName = 'Sales Experience Platform';

function getRpIdAndOrigin(req?: Request | null) {
    let appUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    if (req) {
        const host = req.headers.get('host');
        const proto = req.headers.get('x-forwarded-proto') || 'https';
        if (host) {
            appUrl = `${proto}://${host}`;
        }
    }

    if (!appUrl) {
        appUrl = 'http://localhost:3000';
    }

    try {
        const url = new URL(appUrl);
        return {
            rpID: url.hostname,
            origin: url.origin,
        };
    } catch (e) {
        return {
            rpID: 'localhost',
            origin: 'http://localhost:3000',
        };
    }
}

// Store challenges temporarily in DB or a dedicated memory store. 
// For simplicity in serverless, we can use a temporary model, but since we don't have it,
// we will store it in the SalesSession itself if we are updating it, but actually, 
// a registration challenge is created BEFORE the session is verified? No, they must be logged in to register.
// So we can use the user's current session or cookies.
// Wait, we can't easily store challenges on the stateless edge without DB or Redis. 
// We will use Redis or Prisma since the project uses Redis for cache.
import { redis } from '@/lib/redis';

export const webauthnRouter = router({
    generateRegistrationOptions: publicProcedure
        .input(z.object({
            email: z.string().email(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Must have a verified session OR we verify the user is logged in
            // Check for Sales Session OR Admin Session
            const cookieStore = await cookies();
            const { verifySessionId, getSession } = await import('@/lib/auth');
            const salesToken = cookieStore.get('sales-session-id')?.value;
            const adminSession = await getSession();

            let sessionEmail = '';
            let displayName = '';

            if (salesToken) {
                const sessionId = await verifySessionId(salesToken);
                if (sessionId) {
                    const session = await ctx.prisma.salesSession.findUnique({
                        where: { id: sessionId },
                    });
                    if (session && session.isVerified && session.email === input.email) {
                        sessionEmail = session.email;
                        displayName = `${session.firstName} ${session.lastName}`;
                    }
                }
            }

            if (!sessionEmail && adminSession && adminSession.sub) {
                const user = await ctx.prisma.user.findUnique({
                    where: { id: adminSession.sub as string },
                });
                if (user && user.email === input.email) {
                    sessionEmail = user.email;
                    displayName = user.email; // Admins don't have first/last name in schema
                }
            }

            if (!sessionEmail) {
                throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in to register a passkey.' });
            }

            const userPasskeys = await ctx.prisma.passkey.findMany({
                where: { email: input.email },
            });

            const { rpID, origin } = getRpIdAndOrigin(ctx.req);

            // We need a stable user ID for the authenticator. 
            // Since we don't have a SalesUser model, we'll hash the email.
            const userIdent = crypto.createHash('sha256').update(input.email).digest();

            const options = await generateRegistrationOptions({
                rpName,
                rpID,
                userID: new Uint8Array(userIdent),
                userName: input.email,
                userDisplayName: displayName,
                attestationType: 'none',
                excludeCredentials: userPasskeys.map(passkey => ({
                    id: passkey.id,
                    type: 'public-key',
                    transports: passkey.transports ? passkey.transports.split(',') as any[] : undefined,
                })),
                authenticatorSelection: {
                    residentKey: 'required',
                    userVerification: 'preferred',
                },
            });

            // Store the challenge in Redis for 5 minutes
            await redis.set(`webauthn_challenge:reg:${input.email}`, options.challenge, 'EX', 300);

            return options;
        }),

    verifyRegistration: publicProcedure
        .input(z.object({
            email: z.string().email(),
            response: z.any(), // RegistrationResponseJSON
        }))
        .mutation(async ({ ctx, input }) => {
            const expectedChallenge = await redis.get(`webauthn_challenge:reg:${input.email}`);
            if (!expectedChallenge) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Challenge expired or invalid' });
            }

            const { rpID, origin } = getRpIdAndOrigin(ctx.req);

            let verification;
            try {
                verification = await verifyRegistrationResponse({
                    response: input.response as RegistrationResponseJSON,
                    expectedChallenge,
                    expectedOrigin: origin,
                    expectedRPID: rpID,
                });
            } catch (error: any) {
                console.error('Registration verification failed:', error);
                throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
            }

            const { verified, registrationInfo } = verification;

            if (verified && registrationInfo) {
                const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;

                await ctx.prisma.passkey.create({
                    data: {
                        id: credential.id,
                        email: input.email,
                        publicKey: Buffer.from(credential.publicKey),
                        counter: BigInt(0),
                        transports: input.response.response.transports?.join(',') || '',
                    },
                });

                // Clear challenge
                await redis.del(`webauthn_challenge:reg:${input.email}`);

                return { success: true };
            }

            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Failed to verify registration' });
        }),

    generateAuthenticationOptions: publicProcedure
        .input(z.object({
            email: z.string().email().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            let userPasskeys: any[] = [];
            if (input.email) {
                userPasskeys = await ctx.prisma.passkey.findMany({
                    where: { email: input.email },
                });
                if (userPasskeys.length === 0) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: 'No passkeys registered for this email' });
                }
            }

            const { rpID } = getRpIdAndOrigin(ctx.req);

            const options = await generateAuthenticationOptions({
                rpID,
                allowCredentials: input.email ? userPasskeys.map(passkey => ({
                    id: passkey.id,
                    type: 'public-key',
                    transports: passkey.transports ? passkey.transports.split(',') as any[] : undefined,
                })) : [],
                userVerification: 'preferred',
            });

            const challengeId = crypto.randomBytes(16).toString('hex');
            await redis.set(`webauthn_challenge:auth:${challengeId}`, options.challenge, 'EX', 300);

            if (input.email) {
                await redis.set(`webauthn_challenge:auth:${input.email}`, options.challenge, 'EX', 300);
            }

            return { options, challengeId };
        }),

    verifyAuthentication: publicProcedure
        .input(z.object({
            email: z.string().email().optional(),
            challengeId: z.string().optional(),
            response: z.any(), // AuthenticationResponseJSON
        }))
        .mutation(async ({ ctx, input }) => {
            let expectedChallenge: string | null = null;
            if (input.challengeId) {
                expectedChallenge = await redis.get(`webauthn_challenge:auth:${input.challengeId}`);
            } else if (input.email) {
                expectedChallenge = await redis.get(`webauthn_challenge:auth:${input.email}`);
            }

            if (!expectedChallenge) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Challenge expired or invalid' });
            }

            const { rpID, origin } = getRpIdAndOrigin(ctx.req);

            const passkey = await ctx.prisma.passkey.findUnique({
                where: { id: input.response.id },
            });

            if (!passkey) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Passkey not found' });
            }
            if (input.email && passkey.email !== input.email) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Passkey does not match email' });
            }

            const userEmail = passkey.email;

            let verification;
            try {
                verification = await verifyAuthenticationResponse({
                    response: input.response as AuthenticationResponseJSON,
                    expectedChallenge,
                    expectedOrigin: origin,
                    expectedRPID: rpID,
                    credential: {
                        id: passkey.id,
                        publicKey: new Uint8Array(passkey.publicKey),
                        counter: Number(passkey.counter),
                        transports: passkey.transports ? passkey.transports.split(',') as any[] : undefined,
                    },
                });
            } catch (error: any) {
                console.error('Authentication verification failed:', error);
                throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
            }

            const { verified, authenticationInfo } = verification;

            if (verified && authenticationInfo) {
                // Update counter
                await ctx.prisma.passkey.update({
                    where: { id: passkey.id },
                    data: {
                        counter: BigInt(authenticationInfo.newCounter),
                        lastUsedAt: new Date(),
                    },
                });

                // Clear challenges
                if (input.challengeId) await redis.del(`webauthn_challenge:auth:${input.challengeId}`);
                if (input.email) await redis.del(`webauthn_challenge:auth:${input.email}`);
                await redis.del(`webauthn_challenge:auth:${userEmail}`);

                // Proceed to login the user via Passkey! 
                const clientIp = ctx.ip || '127.0.0.1';

                // Check if user is an Admin
                const adminUser = await ctx.prisma.user.findFirst({
                    where: { email: { equals: userEmail, mode: 'insensitive' } },
                });

                if (adminUser) {
                    const { login: adminLogin } = await import('@/lib/auth');
                    await adminLogin({
                        id: adminUser.id,
                        email: adminUser.email,
                        role: adminUser.role,
                        isEditor: adminUser.isEditor,
                        odRegionId: adminUser.odRegionId,
                        locationId: adminUser.locationId,
                        teamId: adminUser.teamId,
                    });

                    return {
                        success: true,
                        isAdmin: true,
                        email: adminUser.email,
                    };
                }

                // If not admin, fall back to Sales Session login
                // Fetch last session details to clone team details
                const lastSession = await ctx.prisma.salesSession.findFirst({
                    where: { email: userEmail, isVerified: true },
                    orderBy: { createdAt: 'desc' },
                });

                if (!lastSession) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: 'No prior session found to clone.' });
                }

                let deviceId = crypto.randomBytes(16).toString('hex');
                const cookieStore = await cookies();
                const deviceToken = cookieStore.get('sales-device-id')?.value;
                if (deviceToken) {
                    const { verifyDeviceId } = await import('@/lib/auth');
                    const verifiedDeviceId = await verifyDeviceId(deviceToken);
                    if (verifiedDeviceId) {
                        deviceId = verifiedDeviceId;
                    }
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

                const { signSessionId, signDeviceId } = await import('@/lib/auth');
                const signedToken = await signSessionId(newSession.id);

                cookieStore.set('sales-session-id', signedToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                });

                const signedDeviceToken = await signDeviceId(deviceId);
                cookieStore.set('sales-device-id', signedDeviceToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 365, // 365 days
                });

                return {
                    success: true,
                    firstName: newSession.firstName,
                    lastName: newSession.lastName,
                    email: newSession.email,
                };
            }

            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Failed to verify authentication' });
        }),
});
