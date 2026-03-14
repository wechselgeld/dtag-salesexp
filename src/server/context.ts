import {
	getSession,
} from '@/lib/auth';
import {
	prisma,
} from '@/lib/prisma';

export const createContext = async ({
	req,
}: { req?: Request }) => {
	const session = await getSession();

	// Attempt to extract IP from request headers if available
	let ip: string | undefined = undefined;
	if (req) {
		const forwardedFor = req.headers.get('x-forwarded-for');
		if (forwardedFor) {
			ip = forwardedFor.split(',')[0].trim();
		}
		else {
			ip = req.headers.get('x-real-ip') || undefined;
		}
	}

	return {
		session,
		prisma,
		req,
		ip,
	};
};
export type Context = Awaited<ReturnType<typeof createContext>>;
