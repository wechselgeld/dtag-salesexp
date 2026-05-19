import {
	z,
} from 'zod';
import {
	router, publicProcedure,
} from '@/server/trpc';
import {
	sendFeedbackEmail,
} from '@/lib/email';
import {
	TRPCError,
} from '@trpc/server';

export const feedbackRouter = router({
	submit: publicProcedure
		.input(z.object({
			text: z.string().min(1, 'Bitte gib einen Feedback-Text ein.'),
			files: z.array(z.object({
				name: z.string(),
				content: z.string(),
			})).optional(),
		}))
		.mutation(async ({
			input, ctx,
		}) => {
			let userName = 'Unbekannt';
			let userEmail = 'Keine E-Mail';

			// 1. Try Admin Session (next-auth/auth-token)
			if (ctx.session) {
				const adminUser = ctx.session as { firstName?: string; lastName?: string; email?: string };
				userName = `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || adminUser.email || 'Admin';
				userEmail = adminUser.email || 'Admin';
			}

			try {
				await sendFeedbackEmail({
					text: input.text,
					userEmail,
					userName,
					files: input.files,
				});

				return {
					success: true,
				};
			}
			catch (error) {
				console.error('Feedback submission failed:', error);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Feedback konnte nicht gesendet werden.',
				});
			}
		}),
});
