import {
    router, protectedProcedure, requirePermission, withHierarchicalScope,
} from '@/server/trpc';
import {
    z,
} from 'zod';
import {
    prisma,
} from '@/lib/prisma';
import {
    TRPCError,
} from '@trpc/server';
import bcrypt from 'bcryptjs';
import {
    sendWelcomeEmail, sendGoodbyeEmail,
} from '@/lib/email';
import {
    getUserFilter, canManageUser,
} from '@/lib/rbac';
import {
    invalidateCache,
} from '@/lib/cache';

export const adminUsersRouter = router({
    list: protectedProcedure.use(requirePermission('users:read'))
        .input(z.object({
            limit: z.number().min(1).max(1000).default(50),
            cursor: z.string().nullish(),
            search: z.string().optional(),
            role: z.string().optional(),
            teamId: z.string().optional(),
            locationId: z.string().optional(),
            odRegionId: z.string().optional(),
            isVerified: z.boolean().optional(),
            isActive: z.boolean().optional(),
        }))
        .query(async ({
            ctx, input,
        }) => {
            const limit = input.limit ?? 50;
            const {
                cursor,
            } = input;
            const session = ctx.session as any;
            const where: any = getUserFilter(session);
            if (where.id === 'UNAUTHORIZED') {
                return {
                    items: [
                    ],
                    nextCursor: undefined,
                };
            }

            if (input.search) {
                where.OR = [
                    { email: { contains: input.search, mode: 'insensitive' } },
                    { firstName: { contains: input.search, mode: 'insensitive' } },
                    { lastName: { contains: input.search, mode: 'insensitive' } },
                ];
            }

            if (input.role) where.role = input.role;
            if (input.teamId) where.teamId = input.teamId;
            if (input.locationId) where.locationId = input.locationId;
            if (input.odRegionId) where.odRegionId = input.odRegionId;
            if (input.isVerified !== undefined) where.isVerified = input.isVerified;
            if (input.isActive !== undefined) where.isActive = input.isActive;

            const items = await prisma.user.findMany({
                take: limit + 1,
                cursor: cursor ? {
                    id: cursor,
                } : undefined,
                where,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isEditor: true,
                    createdAt: true,
                    isActive: true,
                    isVerified: true,
                    odRegionId: true,
                    odRegion: {
                        select: {
                            name: true,
                        },
                    },
                    locationId: true,
                    location: {
                        select: {
                            name: true,
                            address: true,
                        },
                    },
                    teamId: true,
                    team: {
                        select: {
                            name: true,
                            location: {
                                select: {
                                    name: true,
                                    address: true,
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



    update: protectedProcedure.use(requirePermission('users:write')).use(withHierarchicalScope('user'))
        .input(z.object({
            id: z.string(),
            email: z.string().email('Ungültige E-Mail Adresse').optional(),
            password: z.string().min(6, 'Das Passwort muss mindestens 6 Zeichen lang sein').optional().or(z.literal('')),
            role: z.enum([
                'ADMIN',
                'OD_MANAGER',
                'LOCATION_MANAGER',
                'TEAM_LEADER',
            ]).optional(),
            isEditor: z.boolean().optional(),
            isActive: z.boolean().optional(),
            odRegionId: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
            locationId: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
            teamId: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
        }))
        .mutation(async ({
            input, ctx,
        }) => {
            const session = ctx.session as any;
            const targetUser = await prisma.user.findUnique({
                where: {
                    id: input.id,
                },
            });
            if (!targetUser) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                });
            }

            if (session.id !== targetUser.id && !canManageUser(session, targetUser.role, targetUser.odRegionId, targetUser.locationId)) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Dieser Nutzer gehört nicht zu deinem Bereich.',
                });
            }
            if (input.role && !canManageUser(session, input.role, targetUser.odRegionId, targetUser.locationId)) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Du kannst diese Rolle nicht vergeben.',
                });
            }

            const updateProps: Record<string, any> = {
            };
            if (input.email) {
                const existing = await prisma.user.findUnique({
                    where: {
                        email: input.email,
                    },
                });
                if (existing && existing.id !== input.id) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'Ein Benutzer mit dieser E-Mail existiert bereits.',
                    });
                }
                updateProps.email = input.email;
            }
            if (input.password && input.password.length > 0) {
                updateProps.password = await bcrypt.hash(input.password, 10);
                updateProps.sessionVersion = {
                    increment: 1,
                };
            }

            if (input.role) {
                updateProps.role = input.role;
                updateProps.sessionVersion = {
                    increment: 1,
                };
                // Field cleanup logic: If the role changes, irrelevant hierarchy fields must be cleared
                if (input.role === 'ADMIN') {
                    updateProps.odRegionId = null;
                    updateProps.locationId = null;
                    updateProps.teamId = null;
                }
                else if (input.role === 'OD_MANAGER') {
                    updateProps.locationId = null;
                    updateProps.teamId = null;
                }
                else if (input.role === 'LOCATION_MANAGER') {
                    updateProps.odRegionId = null;
                    updateProps.teamId = null;
                }
                else if (input.role === 'TEAM_LEADER') {
                    updateProps.odRegionId = null;
                    updateProps.locationId = null;
                }
            }

            if (input.isEditor !== undefined) {
                if (session.id === input.id && session.role !== 'ADMIN') {
                    // Prevent user from changing their own editor status
                }
                else {
                    updateProps.isEditor = input.isEditor;
                }
            }

            if (input.isActive !== undefined) {
                if (session.id === input.id) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Du kannst deinen eigenen Status nicht ändern.',
                    });
                }
                updateProps.isActive = input.isActive;
            }

            // Only update hierarchy fields if provided AND they aren't cleared by the role-switch logic above
            if (input.odRegionId !== undefined && updateProps.odRegionId !== null) { updateProps.odRegionId = input.odRegionId; }
            if (input.locationId !== undefined && updateProps.locationId !== null) { updateProps.locationId = input.locationId; }
            if (input.teamId !== undefined && updateProps.teamId !== null) { updateProps.teamId = input.teamId; }

            const updated = await prisma.user.update({
                where: {
                    id: input.id,
                },
                data: updateProps,
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    isEditor: true,
                },
            });
            invalidateCache(`session:user:${input.id}`);
            return updated;
        }),

    delete: protectedProcedure.use(requirePermission('users:delete')).use(withHierarchicalScope('user'))
        .input(z.object({
            id: z.string(),
            sudoPassword: z.string().optional(),
        }))
        .mutation(async ({
            input, ctx,
        }) => {
            const session = ctx.session as any;
            if (!session.password) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Sicherheitsbestätigung (Passwort) fehlgeschlagen.',
                });
            }
            const isSudoValid = await bcrypt.compare(input.sudoPassword || '', session.password);
            if (!isSudoValid) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Sicherheitsbestätigung (Passwort) fehlgeschlagen.',
                });
            }

            if (session.sub === input.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Du kannst deinen eigenen Account nicht löschen.',
                });
            }

            const target = await prisma.user.findUnique({
                where: {
                    id: input.id,
                },
            });
            if (!target) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                });
            }
            if (!canManageUser(ctx.session as any, target.role, target.odRegionId, target.locationId)) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Du hast keine Berechtigung, diesen Account zu löschen.',
                });
            }

            if (target.role === 'ADMIN') {
                const adminCount = await prisma.user.count({
                    where: {
                        role: 'ADMIN',
                    },
                });
                if (adminCount <= 1) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Der letzte Administrator-Account kann nicht gelöscht werden.',
                    });
                }
            }

            const deletedUser = await prisma.user.delete({
                where: {
                    id: input.id,
                },
                select: {
                    id: true,
                    email: true,
                },
            });

            // Sende Auf Wiedersehen E-Mail
            sendGoodbyeEmail(deletedUser.email).catch(console.error);

            invalidateCache(`session:user:${input.id}`);

            return {
                id: deletedUser.id,
            };
        }),

    revokeSessions: protectedProcedure.use(requirePermission('users:write')).use(withHierarchicalScope('user'))
        .input(z.object({
            id: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
            const session = ctx.session as any;
            
            await prisma.userSession.deleteMany({
                where: { userId: input.id },
            });
            
            await prisma.user.update({
                where: { id: input.id },
                data: { sessionVersion: { increment: 1 } },
            });

            invalidateCache(`session:user:${input.id}`);

            return { success: true };
        }),

    removePassword: protectedProcedure.use(requirePermission('users:write')).use(withHierarchicalScope('user'))
        .input(z.object({
            id: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
            const session = ctx.session as any;
            
            await prisma.user.update({
                where: { id: input.id },
                data: { 
                    password: null,
                    sessionVersion: { increment: 1 }
                },
            });

            invalidateCache(`session:user:${input.id}`);

            return { success: true };
        }),

    triggerPinReset: protectedProcedure.use(requirePermission('users:write')).use(withHierarchicalScope('user'))
        .input(z.object({
            id: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
            const targetUser = await prisma.user.findUnique({
                where: { id: input.id },
            });
            if (!targetUser) {
                throw new TRPCError({ code: 'NOT_FOUND' });
            }
            
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            await prisma.user.update({
                where: { id: input.id },
                data: {
                    verificationToken: otpCode,
                    verificationExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                },
            });

            // Avoid import issues here by dynamically requiring or assume it works
            const { sendPinResetEmail } = await import('@/lib/email');
            await sendPinResetEmail(targetUser.email, targetUser.firstName || 'Nutzer', otpCode);

            return { success: true };
        }),
});
