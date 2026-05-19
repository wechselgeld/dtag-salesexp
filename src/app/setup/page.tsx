import type {
	Metadata,
} from 'next';
import SetupClient from './setup-client';
import {
	appRouter,
} from '@/server/routers/_app';
import {
	createContext,
} from '@/server/context';
import {
	headers,
} from 'next/headers';

export const metadata: Metadata = {
	title: 'Sitzung einrichten',
};

export default async function Page() {
	// Create tRPC caller for Server-Side prefetching
	const caller = appRouter.createCaller(
		await createContext({
			req: new Request('http://localhost', {
				headers: await headers(),
			}) as any,
		}),
	);

	let currentSession = null;
	try {
		currentSession = await caller.session.getCurrent();
	} catch (error: any) {
		if (error?.code === 'UNAUTHORIZED') {
			const { redirect } = await import('next/navigation');
			redirect('/api/auth/logout');
		}
	}

	// Prefetch the data the client components immediately need
	const [
		locations,
		isEmailRequired,
		ipCheck,
	] = await Promise.all([
		caller.location.list({
			search: undefined,
			limit: 6,
		}).catch(() => null),
		caller.session.getIsEmailRequired().catch(() => true),
		caller.session.verifyIp().catch((err) => ({
			error: err.message,
		})),
	]);

	const ipError = ipCheck && 'error' in ipCheck ? String(ipCheck.error) : null;

	return (
		<SetupClient
			initialLocations={locations}
			initialIsEmailRequired={isEmailRequired}
			initialIpError={ipError}
			initialSession={currentSession}
		/>
	);
}
