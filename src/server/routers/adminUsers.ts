import { router, protectedProcedure } from '@/server/trpc';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail, sendGoodbyeEmail } from '@/lib/email';

const permissionProcedure = protectedProcedure.use(({ ctx, next }) => {
    const role = (ctx.session as any)?.role;
    if (role !== 'ADMIN' && role !== 'OD_MANAGER' && role !== 'LOCATION_MANAGER' && role !== 'TEAM_LEADER') {
        throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Du hast keine Berechtigung für diese Aktion.'
        });
    }
    return next({ ctx });
});

export const adminUsersRouter = router({
    list: permissionProcedure
        .query(async ({ ctx }) => {
            const session = ctx.session as any;

            let where: any = {};
            if (session.role === 'OD_MANAGER' && session.odRegionId) {
                where = {
                    OR: [
                        { odRegionId: session.odRegionId },
                        { location: { odRegionId: session.odRegionId } },
                        { team: { location: { odRegionId: session.odRegionId } } }
                    ]
                };
            } else if (session.role === 'LOCATION_MANAGER' && session.locationId) {
                where = {
                    OR: [
                        { locationId: session.locationId },
                        { team: { locationId: session.locationId } }
                    ]
                };
            } else if (session.role === 'TEAM_LEADER' && session.teamId) {
                where = { teamId: session.teamId };
            }

            return prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isEditor: true,
                    createdAt: true,
                    odRegionId: true,
                    odRegion: { select: { name: true } },
                    locationId: true,
                    location: { select: { name: true } },
                    teamId: true,
                    team: { select: { name: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
        }),

    create: permissionProcedure
        .input(z.object({
            email: z.string().email("Ungültige E-Mail Adresse"),
            password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
            role: z.enum(["ADMIN", "OD_MANAGER", "LOCATION_MANAGER", "TEAM_LEADER"]),
            isEditor: z.boolean().optional().default(false),
            odRegionId: z.string().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
            locationId: z.string().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
            teamId: z.string().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v)
        }))
        .mutation(async ({ input, ctx }) => {
            const session = ctx.session as any;

            // Permission hierarchy checks
            if (session.role === 'OD_MANAGER' && input.role === 'ADMIN') {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Du kannst keine Admins erstellen.' });
            }
            if (session.role === 'LOCATION_MANAGER' && ['ADMIN', 'OD_MANAGER'].includes(input.role)) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Hierfür fehlen dir die Rechte.' });
            }
            if (session.role === 'TEAM_LEADER' && ['ADMIN', 'OD_MANAGER', 'LOCATION_MANAGER'].includes(input.role)) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Hierfür fehlen dir die Rechte.' });
            }

            // Enforce hierarchy based on creator's role
            let odRegionId = input.odRegionId;
            let locationId = input.locationId;
            let teamId = input.teamId;

            if (session.role === 'OD_MANAGER') {
                odRegionId = session.odRegionId; // Can only create users in their own region
            } else if (session.role === 'LOCATION_MANAGER') {
                odRegionId = null;
                locationId = session.locationId; // Can only create users in their own location
            } else if (session.role === 'TEAM_LEADER') {
                odRegionId = null;
                locationId = null;
                teamId = session.teamId; // Can only create users in their own team
            }

            const existing = await prisma.user.findUnique({
                where: { email: input.email }
            });
            if (existing) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'Ein Benutzer mit dieser E-Mail existiert bereits.'
                });
            }

            const hash = await bcrypt.hash(input.password, 10);
            const newUser = await prisma.user.create({
                data: {
                    email: input.email,
                    password: hash,
                    role: input.role,
                    isEditor: input.isEditor,
                    odRegionId,
                    locationId,
                    teamId
                },
                select: { id: true, email: true, role: true, createdAt: true, locationId: true }
            });

            // E-Mail synchron/asynchron versenden
            sendWelcomeEmail(input.email, input.role, input.password).catch(console.error);

            return newUser;
        }),

    update: permissionProcedure
        .input(z.object({
            id: z.string(),
            email: z.string().email("Ungültige E-Mail Adresse").optional(),
            password: z.string().min(6, "Das Passwort muss mindestens 6 Zeichen lang sein").optional().or(z.literal('')),
            role: z.enum(["ADMIN", "OD_MANAGER", "LOCATION_MANAGER", "TEAM_LEADER"]).optional(),
            isEditor: z.boolean().optional(),
            odRegionId: z.string().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
            locationId: z.string().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
            teamId: z.string().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v)
        }))
        .mutation(async ({ input, ctx }) => {
            const session = ctx.session as any;
            const targetUser = await prisma.user.findUnique({ where: { id: input.id } });
            if (!targetUser) throw new TRPCError({ code: 'NOT_FOUND' });

            // Ensure hierarchy permissions for non-admins
            if (session.role !== 'ADMIN') {
                if (session.role === 'OD_MANAGER' && targetUser.odRegionId !== session.odRegionId && targetUser.role !== 'OD_MANAGER') {
                    // Check if it's in a location within the OD
                    const loc = targetUser.locationId ? await prisma.location.findUnique({ where: { id: targetUser.locationId } }) : null;
                    if (loc?.odRegionId !== session.odRegionId) {
                        throw new TRPCError({ code: 'FORBIDDEN', message: 'Dieser Nutzer gehört nicht zu deinem Bereich.' });
                    }
                }
                // ... more complex checks could be added here for LOCATION_MANAGER etc.
            }

            const updateProps: Record<string, any> = {};
            if (input.email) {
                const existing = await prisma.user.findUnique({ where: { email: input.email } });
                if (existing && existing.id !== input.id) {
                    throw new TRPCError({ code: 'CONFLICT', message: 'Ein Benutzer mit dieser E-Mail existiert bereits.' });
                }
                updateProps.email = input.email;
            }
            if (input.password && input.password.length > 0) {
                updateProps.password = await bcrypt.hash(input.password, 10);
            }

            if (input.role) {
                updateProps.role = input.role;
                // Field cleanup logic: If the role changes, irrelevant hierarchy fields must be cleared
                if (input.role === 'ADMIN') {
                    updateProps.odRegionId = null;
                    updateProps.locationId = null;
                    updateProps.teamId = null;
                } else if (input.role === 'OD_MANAGER') {
                    updateProps.locationId = null;
                    updateProps.teamId = null;
                } else if (input.role === 'LOCATION_MANAGER') {
                    updateProps.odRegionId = null;
                    updateProps.teamId = null;
                } else if (input.role === 'TEAM_LEADER') {
                    updateProps.odRegionId = null;
                    updateProps.locationId = null;
                }
            }

            if (input.isEditor !== undefined) updateProps.isEditor = input.isEditor;

            // Only update hierarchy fields if provided AND they aren't cleared by the role-switch logic above
            if (input.odRegionId !== undefined && updateProps.odRegionId !== null) updateProps.odRegionId = input.odRegionId;
            if (input.locationId !== undefined && updateProps.locationId !== null) updateProps.locationId = input.locationId;
            if (input.teamId !== undefined && updateProps.teamId !== null) updateProps.teamId = input.teamId;

            return prisma.user.update({
                where: { id: input.id },
                data: updateProps,
                select: { id: true, email: true, role: true, createdAt: true, isEditor: true }
            });
        }),

    delete: permissionProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            if ((ctx.session as any)?.sub === input.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Du kannst deinen eigenen Account nicht löschen.'
                });
            }

            const target = await prisma.user.findUnique({ where: { id: input.id } });
            if (!target) throw new TRPCError({ code: 'NOT_FOUND' });

            if (target.role === 'ADMIN') {
                const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
                if (adminCount <= 1) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Der letzte Administrator-Account kann nicht gelöscht werden.'
                    });
                }
            }

            const deletedUser = await prisma.user.delete({
                where: { id: input.id },
                select: { id: true, email: true }
            });

            // Sende Auf Wiedersehen E-Mail
            sendGoodbyeEmail(deletedUser.email).catch(console.error);

            return { id: deletedUser.id };
        })
});
