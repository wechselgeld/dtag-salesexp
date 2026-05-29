import type {
	Metadata,
} from 'next';
import ProductsClient from './products-client';
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
	title: 'Produktauswahl',
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

	let session = null;
	try {
		session = await caller.session.getCurrent();
	}
 catch (error: any) {
		if (error?.code === 'UNAUTHORIZED') {
			const traceId = error?.data?.traceId || error?.shape?.data?.traceId;
			const queryStr = traceId ? `?error_id=${encodeURIComponent(traceId)}` : '';
			const {
 redirect,
} = await import('next/navigation');
			redirect(`/api/auth/logout${queryStr}`);
		}
	}

	// Prefetch the data the client components immediately need
	const [
		allProducts,
		designSettings,
		news,
	] = await Promise.all([
		caller.product.getAllProducts().catch(() => ({
			items: [
			],
		})),
		caller.settings.getDesignSettings().catch(() => ({
		})),
		caller.news.listActive().catch(() => [
		]),
	]);

	const Client = ProductsClient as any;

	return (
		<Client
			initialSession={session}
			initialProducts={allProducts}
			initialSettings={designSettings}
			initialNews={news}
		/>
	);
}
