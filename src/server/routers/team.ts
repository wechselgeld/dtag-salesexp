import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getTeamFilter, hasRole, canEditTeam } from '@/lib/rbac';

export const teamRouter = router({
	list: publicProcedure
		.input(z.object({
			locationId: z.string().optional(),
			odRegionId: z.string().optional(),
			limit: z.number().min(1).max(100).default(50),
			cursor: z.string().nullish(),
			search: z.string().optional(),
		}).optional())
		.query(async ({
			ctx, input,
		}) => {
			const limit = input?.limit ?? 50;
			const cursor = input?.cursor;
			const search = input?.search;
			const session = ctx.session as any;
			const { getTeamFilter, hasRole } = await import('@/lib/rbac');
			const securityFilter = getTeamFilter(session);
			
			// Unauthorized check
			if (securityFilter.id === 'UNAUTHORIZED') {
				throw new TRPCError({ code: 'UNAUTHORIZED' });
			}

			const where: any = {
				AND: [
					securityFilter,
				],
			};

			if (input?.locationId) {
				where.AND.push({ locationId: input.locationId });
			}

			if (input?.odRegionId) {
				where.AND.push({
					location: {
						odRegionId: input.odRegionId,
					},
				});
			}

			if (search) {
				where.AND.push({
					OR: [
						{
							name: {
								contains: search,
								mode: 'insensitive',
							},
						},
						{
							internalNote: {
								contains: search,
								mode: 'insensitive',
							},
						},
					],
				});
			}

			const items = await ctx.prisma.team.findMany({
				take: limit + 1,
				cursor: cursor ? {
					id: cursor,
				} : undefined,
				where,
				orderBy: {
					name: 'asc',
				},
				include: {
					location: true,
					highlights: {
						include: {
							product: true,
						},
					},
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

	getById: publicProcedure
		.input(z.object({
			id: z.string(),
		}))
		.query(({
			ctx, input,
		}) => {
			return ctx.prisma.team.findUnique({
				where: {
					id: input.id,
				},
				include: {
					location: true,
					highlights: {
						include: {
							product: true,
						},
					},
				},
			});
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				email: z.string().email().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
				locationId: z.string().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
			}),
		)
		.mutation(async ({
			ctx, input,
		}) => {
			const { hasRole, canManageLocation } = await import('@/lib/rbac');
			const session = ctx.session as any;

			if (!hasRole(session, 'LOCATION_MANAGER')) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Keine Berechtigung zum Erstellen von Teams.',
				});
			}

			if (input.locationId && session.role !== 'ADMIN') {
				const loc = await ctx.prisma.location.findUnique({ where: { id: input.locationId } });
				if (!loc || (session.role === 'OD_MANAGER' && loc.odRegionId !== session.odRegionId)) {
					throw new TRPCError({ code: 'FORBIDDEN', message: 'Keine Berechtigung für diesen Standort.' });
				}
				if (session.role === 'LOCATION_MANAGER' && session.locationId !== input.locationId) {
					throw new TRPCError({ code: 'FORBIDDEN', message: 'Keine Berechtigung für diesen Standort.' });
				}
			}

			return ctx.prisma.team.create({
				data: {
					name: input.name,
					email: input.email || 'team06@telekom.de',
					locationId: input.locationId,
				},
			});
		}),

	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			name: z.string().min(1).optional(),
			email: z.string().email().optional(),
			locationId: z.string().optional().nullable(),
		}))
		.mutation(async ({
			ctx, input,
		}) => {
			const { canEditTeam } = await import('@/lib/rbac');
			const session = ctx.session as any;

			const targetTeam = await ctx.prisma.team.findUnique({
				where: { id: input.id },
				include: { location: true },
			});

			if (!targetTeam) throw new TRPCError({ code: 'NOT_FOUND' });

			let isAllowed = canEditTeam(session, targetTeam.locationId, targetTeam.id);
			if (session.role === 'OD_MANAGER' && targetTeam.location?.odRegionId === session.odRegionId) {
				isAllowed = true;
			}

			if (!isAllowed) {
				throw new TRPCError({ code: 'FORBIDDEN', message: 'Keine Berechtigung für dieses Team.' });
			}

			const {
				id, ...dataToUpdate
			} = input;

			if (Object.keys(dataToUpdate).length === 0) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'No fields to update provided.',
				});
			}

			return ctx.prisma.team.update({
				where: {
					id,
				},
				data: dataToUpdate,
			});
		}),

	delete: protectedProcedure
		.input(z.object({
			id: z.string(),
		}))
		.mutation(async ({
			ctx, input,
		}) => {
			const { canEditTeam } = await import('@/lib/rbac');
			const session = ctx.session as any;

			const targetTeam = await ctx.prisma.team.findUnique({
				where: { id: input.id },
				include: { location: true },
			});

			if (!targetTeam) throw new TRPCError({ code: 'NOT_FOUND' });

			let isAllowed = canEditTeam(session, targetTeam.locationId, targetTeam.id);
			if (session.role === 'OD_MANAGER' && targetTeam.location?.odRegionId === session.odRegionId) {
				isAllowed = true;
			}
			if (session.role === 'TEAM_LEADER') isAllowed = false; // Team Leaders cannot DELETE their team

			if (!isAllowed) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Keine Berechtigung zum Löschen dieses Teams.',
				});
			}

			try {
				return await ctx.prisma.team.delete({
					where: {
						id: input.id,
					},
				});
			}
			catch (error: any) {
				// Check for P2003 (Foreign key constraint failed) or P2025 (Record not found)
				if (error.code === 'P2003') {
					throw new TRPCError({
						code: 'CONFLICT',
						message: 'Dieses Team kann nicht gelöscht werden, da noch Verknüpfungen (z.B. Sessions) existieren. Bitte stelle sicher, dass alle Cascade-Regeln in der Datenbank aktiv sind.',
					});
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: error.message || 'Fehler beim Löschen des Teams',
				});
			}
		}),

	toggleFocus: protectedProcedure
		.input(z.object({
			teamId: z.string(),
			productId: z.string().nullish(),
			category: z.string().nullish(),
			businessCase: z.string().nullish(),
		}))
		.mutation(async ({
			ctx, input,
		}) => {
			const { canEditTeam } = await import('@/lib/rbac');
			const session = ctx.session as any;

			const targetTeam = await ctx.prisma.team.findUnique({
				where: { id: input.teamId },
				include: { location: true },
			});

			if (!targetTeam) throw new TRPCError({ code: 'NOT_FOUND' });

			let isAllowed = canEditTeam(session, targetTeam.locationId, targetTeam.id);
			if (session.role === 'OD_MANAGER' && targetTeam.location?.odRegionId === session.odRegionId) {
				isAllowed = true;
			}

			if (!isAllowed) {
				throw new TRPCError({ code: 'FORBIDDEN', message: 'Keine Berechtigung.' });
			}

			// At least one target must be provided
			if (!input.productId && !input.category && !input.businessCase) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Target missing',
				});
			}

			const existing = await ctx.prisma.teamHighlight.findFirst({
				where: {
					teamId: input.teamId,
					...(input.productId ? {
						productId: input.productId,
					} : {
					}),
					...(input.category ? {
						category: input.category,
					} : {
					}),
					...(input.businessCase ? {
						businessCase: input.businessCase,
					} : {
					}),
				},
			});

			if (existing) {
				await ctx.prisma.teamHighlight.delete({
					where: {
						id: existing.id,
					},
				});
				return {
					added: false,
				};
			}
			else {
				await ctx.prisma.teamHighlight.create({
					data: {
						teamId: input.teamId,
						productId: input.productId,
						category: input.category,
						businessCase: input.businessCase,
					},
				});
				return {
					added: true,
				};
			}
		}),
});
