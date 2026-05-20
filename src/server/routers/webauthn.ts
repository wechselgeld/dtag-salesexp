import {
    router, publicProcedure,
} from '../trpc';
import {
    z,
} from 'zod';
import {
    TRPCError,
} from '@trpc/server';
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
import {
    cookies,
} from 'next/headers';
import crypto from 'crypto';
import {
    redis,
} from '@/lib/redis';
import {
    getSession, login, signDeviceId, verifyDeviceId,
} from '@/lib/auth';

const rpName = 'Sales Experience-Plattform';

function getRpIdAndOrigin() {
    if (process.env.NODE_ENV === 'development') {
        return {
            rpID: 'localhost',
            origin: 'http://localhost:3000',
        };
    }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
        throw new Error('NEXT_PUBLIC_APP_URL must be set for WebAuthn to work in production');
    }
    try {
        const url = new URL(appUrl);
        return {
            rpID: url.hostname,
            origin: url.origin,
        };
    }
    catch {
        throw new Error(`NEXT_PUBLIC_APP_URL is not a valid URL: "${appUrl}"`);
    }
}

export const webauthnRouter = router({
    generateRegistrationOptions: publicProcedure
        .input(z.object({
            email: z.string().email(),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            const session = await getSession();
            let sessionEmail = '';
            let displayName = '';

            if (session && session.sub) {
                const user = await ctx.prisma.user.findUnique({
                    where: {
                        id: session.sub as string,
                    },
                });
                if (user && user.email.toLowerCase() === input.email.toLowerCase()) {
                    sessionEmail = user.email;
                    displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
                }
            }

            if (!sessionEmail) {
                const user = await ctx.prisma.user.findUnique({
                    where: {
                        email: input.email,
                    },
                });
                if (user) {
                    displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
                }
                else {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Benutzer nicht gefunden. Bitte registriere Dich zuerst.',
                    });
                }
            }

            const userPasskeys = await ctx.prisma.passkey.findMany({
                where: {
                    email: input.email,
                },
            });

            const {
                rpID,
            } = getRpIdAndOrigin();
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

            await redis.set(`webauthn_challenge:reg:${input.email}`, options.challenge, 'EX', 300);

            return options;
        }),

    verifyRegistration: publicProcedure
        .input(z.object({
            email: z.string().email(),
            response: z.any(),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            const expectedChallenge = await redis.get(`webauthn_challenge:reg:${input.email}`);
            if (!expectedChallenge) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Challenge expired or invalid',
                });
            }

            // Strict Single-Use: delete challenge immediately upon retrieval
            await redis.del(`webauthn_challenge:reg:${input.email}`);

            const {
                rpID, origin,
            } = getRpIdAndOrigin();

            let verification;
            try {
                verification = await verifyRegistrationResponse({
                    response: input.response as RegistrationResponseJSON,
                    expectedChallenge,
                    expectedOrigin: origin,
                    expectedRPID: rpID,
                });
            }
            catch (error: any) {
                console.error('Registration verification failed:', error);
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: error.message,
                });
            }

            const {
                verified, registrationInfo,
            } = verification;

            if (verified && registrationInfo) {
                const {
                    credential,
                } = registrationInfo;

                await ctx.prisma.passkey.create({
                    data: {
                        id: credential.id,
                        email: input.email,
                        publicKey: Buffer.from(credential.publicKey),
                        counter: BigInt(0),
                        transports: input.response.response.transports?.join(',') || '',
                    },
                });

                return {
                    success: true,
                };
            }

            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Failed to verify registration',
            });
        }),

    generateAuthenticationOptions: publicProcedure
        .input(z.object({
            email: z.string().email().optional(),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            let userPasskeys: any[] = [
            ];
            if (input.email) {
                userPasskeys = await ctx.prisma.passkey.findMany({
                    where: {
                        email: input.email,
                    },
                });
                if (userPasskeys.length === 0) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'No passkeys registered for this email',
                    });
                }
            }

            const {
                rpID,
            } = getRpIdAndOrigin();

            const options = await generateAuthenticationOptions({
                rpID,
                allowCredentials: input.email ? userPasskeys.map(passkey => ({
                    id: passkey.id,
                    type: 'public-key',
                    transports: passkey.transports ? passkey.transports.split(',') as any[] : undefined,
                })) : [
                ],
                userVerification: 'preferred',
            });

            const challengeId = crypto.randomBytes(16).toString('hex');
            await redis.set(`webauthn_challenge:auth:${challengeId}`, options.challenge, 'EX', 300);

            if (input.email) {
                await redis.set(`webauthn_challenge:auth:${input.email}`, options.challenge, 'EX', 300);
            }

            return {
                options,
                challengeId,
            };
        }),

    verifyAuthentication: publicProcedure
        .input(z.object({
            email: z.string().email().optional(),
            challengeId: z.string().optional(),
            response: z.any(),
        }))
        .mutation(async ({
            ctx, input,
        }) => {
            let expectedChallenge: string | null = null;
            if (input.challengeId) {
                expectedChallenge = await redis.get(`webauthn_challenge:auth:${input.challengeId}`);
                if (expectedChallenge) {
                    await redis.del(`webauthn_challenge:auth:${input.challengeId}`);
                }
            }
            else if (input.email) {
                expectedChallenge = await redis.get(`webauthn_challenge:auth:${input.email}`);
                if (expectedChallenge) {
                    await redis.del(`webauthn_challenge:auth:${input.email}`);
                }
            }

            if (!expectedChallenge) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Challenge expired or invalid',
                });
            }

            const {
                rpID, origin,
            } = getRpIdAndOrigin();

            const passkey = await ctx.prisma.passkey.findUnique({
                where: {
                    id: input.response.id,
                },
            });

            if (!passkey) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Passkey not found',
                });
            }
            if (input.email && passkey.email.toLowerCase() !== input.email.toLowerCase()) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Passkey does not match email',
                });
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
            }
            catch (error: any) {
                console.error('Authentication verification failed:', error);
                if (passkey) {
                    try {
                        await ctx.prisma.passkey.delete({
                            where: {
                                id: passkey.id,
                            },
                        });
                        console.warn(`[Auto-Heal] Successfully deleted broken passkey ${passkey.id} for user ${passkey.email} due to verification failure.`);
                    }
                    catch (deleteError) {
                        console.error(`[Auto-Heal] Failed to delete broken passkey ${passkey.id}:`, deleteError);
                    }
                }
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: error.message,
                });
            }

            const {
                verified, authenticationInfo,
            } = verification;

            if (verified && authenticationInfo) {
                await ctx.prisma.passkey.update({
                    where: {
                        id: passkey.id,
                    },
                    data: {
                        counter: BigInt(authenticationInfo.newCounter),
                        lastUsedAt: new Date(),
                    },
                });

                const user = await ctx.prisma.user.findUnique({
                    where: {
                        email: userEmail,
                    },
                });

                if (!user) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Benutzerkonto nicht gefunden.',
                    });
                }

                const clientIp = ctx.ip || '127.0.0.1';
                let deviceId = crypto.randomBytes(16).toString('hex');
                const cookieStore = await cookies();
                const deviceToken = cookieStore.get('sales-device-id')?.value;
                if (deviceToken) {
                    const verifiedDeviceId = await verifyDeviceId(deviceToken);
                    if (verifiedDeviceId) {
                        deviceId = verifiedDeviceId;
                    }
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
                    role: user.role,
                    isEditor: user.isEditor,
                    odRegionId: user.odRegionId,
                    locationId: user.locationId,
                    teamId: user.teamId,
                    sessionVersion: user.sessionVersion,
                });

                const signedDeviceToken = await signDeviceId(deviceId);
                cookieStore.set('sales-device-id', signedDeviceToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 365,
                });

                return {
                    success: true,
                    isAdmin: user.role !== 'USER',
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                };
            }

            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Failed to verify authentication',
            });
        }),
});
