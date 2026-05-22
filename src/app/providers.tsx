'use client';

import {
	QueryClient, QueryClientProvider, QueryCache, MutationCache,
} from '@tanstack/react-query';
import {
	httpBatchLink,
	splitLink,
	unstable_httpSubscriptionLink,
} from '@trpc/client';
import {
	useState, useEffect,
} from 'react';
import {
	trpc,
} from '@/lib/trpc';
import {
	MotionConfig,
} from 'framer-motion';
import {
	useSettingsStore,
} from '@/hooks/use-settings-store';
import {
	showErrorToast,
} from '@/components/shared/error-toast';

function SettingsWrapper({
	children,
}: { children: React.ReactNode }) {
	const {
		reduceAnimations,
	} = useSettingsStore();
	const [
		hydrated,
		setHydrated,
	] = useState(false);

	useEffect(() => {
		setHydrated(true);
		if (reduceAnimations) {
			document.body.classList.add('reduce-animations');
		}
		else {
			document.body.classList.remove('reduce-animations');
		}
	}, [
		reduceAnimations,
	]);

	return (
		<MotionConfig
			reducedMotion={hydrated && reduceAnimations ? 'always' : 'user'}
		>
			{children}
		</MotionConfig>
	);
}

export default function Providers({
	children,
}: { children: React.ReactNode }) {
	const [
		queryClient,
	] = useState(
		() => {
			const handleGlobalError = (error: any) => {
				const isUnauthorized =
					error?.data?.code === 'UNAUTHORIZED' ||
					error?.message === 'UNAUTHORIZED' ||
					error?.message?.includes('UNAUTHORIZED');

				if (isUnauthorized) {
					if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/setup')) {
						window.location.href = '/api/auth/logout';
					}
					return;
				}

				// Capture the traceId from the formatted tRPC server error
				const traceId = error?.data?.traceId || error?.shape?.data?.traceId;
				const message = error?.message || 'Ein unerwarteter Fehler ist aufgetreten.';

				// Trigger visual sliding error toast with separate traceId parameter
				showErrorToast('Systemfehler', message, traceId);
			};

			return new QueryClient({
				queryCache: new QueryCache({
					onError: handleGlobalError,
				}),
				mutationCache: new MutationCache({
					onError: handleGlobalError,
				}),
				defaultOptions: {
					queries: {
						staleTime: 5 * 60 * 1000, // 5 minutes caching before refetch
						gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
						refetchOnWindowFocus: false, // Don't refetch when switching tabs
						retry: 1,
					},
				},
			});
		},
	);
	const [
		trpcClient,
	] = useState(() =>
		trpc.createClient({
			links: [
				splitLink({
					condition(op) {
						return op.type === 'subscription';
					},
					true: unstable_httpSubscriptionLink({
						url: '/api/trpc',
					}),
					false: httpBatchLink({
						url: '/api/trpc',
					}),
				}),
			],
		}),
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<SettingsWrapper>{children}</SettingsWrapper>
			</QueryClientProvider>
		</trpc.Provider>
	);
}
