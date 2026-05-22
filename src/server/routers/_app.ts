import {
	router, publicProcedure,
} from '@/server/trpc';
import {
	productRouter,
} from './product';
import {
	authRouter,
} from './auth';
import {
	adminRouter,
} from './admin';
import {
	teamRouter,
} from './team';
import {
	sessionRouter,
} from './session';
import {
	newsRouter,
} from './news';
import {
	addonRouter,
} from './addon';
import {
	settingsRouter,
} from './settings';
import {
	adminUsersRouter,
} from './adminUsers';
import {
	locationRouter,
} from './location';
import {
	odRegionRouter,
} from './odRegion';
import {
	feedbackRouter,
} from './feedback';
import {
	webauthnRouter,
} from './webauthn';
import {
	adminErrorsRouter,
} from './adminErrors';
import {
	adminAuditRouter,
} from './adminAudit';

export const appRouter = router({
	health: publicProcedure.query(() => {
		return 'ok';
	}),
	product: productRouter,
	auth: authRouter,
	admin: adminRouter,
	team: teamRouter,
	session: sessionRouter,
	news: newsRouter,
	addon: addonRouter,
	settings: settingsRouter,
	adminUsers: adminUsersRouter,
	adminErrors: adminErrorsRouter,
	adminAudit: adminAuditRouter,
	location: locationRouter,
	odRegion: odRegionRouter,
	feedback: feedbackRouter,
	webauthn: webauthnRouter,
	public: router({
		getActiveAnnouncements: publicProcedure.query(async () => {
			const {
				prisma,
			} = await import('@/lib/prisma');
			return prisma.maintenanceAnnouncement.findMany({
				where: {
					isActive: true,
				},
				orderBy: {
					priority: 'desc',
				},
			});
		}),
	}),
});

export type AppRouter = typeof appRouter;
