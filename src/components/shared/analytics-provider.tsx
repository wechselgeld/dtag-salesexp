'use client';

import {
	OpenPanelComponent,
} from '@openpanel/nextjs';
import {
	useSettingsStore,
} from '@/lib/store/settings-store';

export function AnalyticsProvider() {
	const acceptedTracking = useSettingsStore((state) => state.acceptedTracking);

	if (!acceptedTracking) {
		return null;
	}

	return (
		<OpenPanelComponent
			clientId="d077ad27-d43d-4edd-9b11-65d103aa66c4"
			trackScreenViews={true}
			apiUrl="https://track.serve.buffinteractive.net"
			scriptUrl="https://analytics.serve.buffinteractive.net/op1.js"
		/>
	);
}
