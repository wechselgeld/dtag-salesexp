'use client';

import {
	useCallback, useRef,
} from 'react';
import {
	trpc,
} from '@/lib/trpc';

/**
 * Fire-and-forget analytics tracking hook.
 * Events are sent in the background without blocking the UI.
 */
export function useAnalytics() {
	const trackMutation = trpc.analytics.track.useMutation();
	// Deduplicate: track each unique event only once per component lifecycle
	const trackedRef = useRef<Set<string>>(new Set());

	const trackPageView = useCallback((path: string, category?: string) => {
		const key = `PAGE_VIEW:${path}`;
		if (trackedRef.current.has(key)) { return; }
		trackedRef.current.add(key);

		// Always track general page view
		trackMutation.mutate({
			eventType: 'PAGE_VIEW',
			path,
			category,
		});

		// Track "Unique Page View" per browsing session (GDPR anonymized)
		// using sessionStorage which clears when the tab/window is closed.
		if (typeof window !== 'undefined') {
			const uniqueKey = `tracked_unique_page:${path}`;
			if (!sessionStorage.getItem(uniqueKey)) {
				sessionStorage.setItem(uniqueKey, '1');
				trackMutation.mutate({
					eventType: 'UNIQUE_PAGE_VIEW',
					path,
					category,
				});
			}
		}
	}, [
		trackMutation,
	]);

	const trackProductView = useCallback((productId: string, category?: string) => {
		const key = `PRODUCT_VIEW:${productId}`;
		if (trackedRef.current.has(key)) { return; }
		trackedRef.current.add(key);

		trackMutation.mutate({
			eventType: 'PRODUCT_VIEW',
			productId,
			category,
		});
	}, [
		trackMutation,
	]);

	const trackBasketAdd = useCallback((productId: string, category?: string) => {
		// Don't deduplicate basket adds – user may add same product multiple times
		trackMutation.mutate({
			eventType: 'BASKET_ADD',
			productId,
			category,
		});
	}, [
		trackMutation,
	]);

	return {
		trackPageView,
		trackProductView,
		trackBasketAdd,
	};
}
