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

	// Prefetch the data the client components immediately need
	const [
		session,
		allProducts,
		designSettings,
	] = await Promise.all([
		caller.session.getCurrent().catch(() => null),
		caller.product.getAllProducts().catch(() => ({
			items: [
			],
		})),
		caller.settings.getDesignSettings().catch(() => ({
		})),
	]);

	const Client = ProductsClient as any;

	return (
		<Client
			initialSession={session}
			initialProducts={allProducts}
			initialSettings={designSettings}
		/>
	);
}
