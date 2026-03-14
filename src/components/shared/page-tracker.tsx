'use client';

import {
	useEffect,
} from 'react';
import {
	useAnalytics,
} from '@/hooks/use-analytics';

export function PageTracker({
	path,
	category,
}: {
	path: string;
	category?: string;
}) {
	const {
		trackPageView,
	} = useAnalytics();

	useEffect(() => {
		trackPageView(path, category);
	}, [
		path,
		category,
		trackPageView,
	]);

	return null;
}
