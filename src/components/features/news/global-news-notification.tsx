'use client';

import React from 'react';
import {
	AnimatePresence,
} from 'framer-motion';
import {
	useNewsNotificationStore,
} from '@/lib/store/news-notification-store';
import {
	Info,
	AlertCircle,
	AlertTriangle,
	Sparkles,
	TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';
import {
	Toast,
} from '@/components/shared/ui/toast';
import {
	trpc,
} from '@/lib/trpc';
import {
	useSystemAlertStore,
} from '@/lib/store/system-alert-store';

const PRIORITY_CONFIG: Record<
	string,
	{ color: string; icon: React.ElementType }
> = {
	INFO: {
		color: '#00a878',
		icon: Info,
	}, // Green
	UPDATE: {
		color: '#0090d0',
		icon: Info,
	}, // Blue
	IMPORTANT: {
		color: '#ff6b00',
		icon: AlertCircle,
	}, // Orange
	CRITICAL: {
		color: '#dc2626',
		icon: AlertTriangle,
	}, // Red
	SALES: {
		color: '#e20074',
		icon: Sparkles,
	}, // Magenta
};

export function GlobalNewsNotification() {
	const utils = trpc.useUtils();

	const notifications = useNewsNotificationStore(
		(state) => state.notifications,
	);
	const removeNotification = useNewsNotificationStore(
		(state) => state.removeNotification,
	);

	const addNotification = useNewsNotificationStore(
		(state) => state.addNotification,
	);
	const systemAlerts = useSystemAlertStore((state) => state.alerts);

	const [
		subscriptionEnabled,
		setSubscriptionEnabled,
	] = React.useState(false);

	// Defer subscription to reduce critical request chain length and improve TBT/LCP
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setSubscriptionEnabled(true);
		}, 3000);
		return () => clearTimeout(timer);
	}, [
	]);

	trpc.news.onAdd.useSubscription(undefined, {
		enabled: subscriptionEnabled,
		onData(news: any) {
			// Invalidate active news list so the carousel updates in real-time
			utils.news.listActive.invalidate();

			if (!notifications.some((n) => n.id === news.id)) {
				addNotification({
					id: news.id,
					title: news.title,
					content: news.content,
					priority: news.priority as any,
					team: news.team,
					location: news.location,
					odRegion: news.odRegion,
				});
			}
		},
		onError(err) {
			console.error('News subscription error:', err);
		},
	});

	return (
		<div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-9999 flex flex-col gap-4 w-full max-w-[500px] px-4 pointer-events-none">
			<AnimatePresence>
				{/* Regular Notifications */}
				{notifications.map((notification) => (
					<NotificationItem
						key={notification.id}
						notification={notification}
						onDismiss={() => removeNotification(notification.id)}
					/>
				))}

				{/* System Alerts (Persistent Warning) */}
				{systemAlerts.map((alert) => (
					<React.Fragment key={alert.id}>
						{alert.content}
					</React.Fragment>
				))}
			</AnimatePresence>
		</div>
	);
}

function NotificationItem({
	notification,
	onDismiss,
}: {
	notification: {
		priority: string;
		title: string;
		content: string;
		team?: { name: string };
		location?: { name: string };
		odRegion?: { name: string };
	};
	onDismiss: () => void;
}) {
	const config = PRIORITY_CONFIG[notification.priority] || PRIORITY_CONFIG.INFO;
	const Icon = config.icon;
	const isCritical = notification.priority === 'CRITICAL';
	const isImportant = notification.priority === 'IMPORTANT';
	const isSales = notification.priority === 'SALES';

	let targetLabel = 'Global';
	if (notification.team) {
		targetLabel = 'Für Dein Team';
	}
	else if (notification.location) {
		targetLabel = 'Für Deinen Standort';
	}
	else if (notification.odRegion) {
		targetLabel = 'Für Deinen OD-Bereich';
	}

	return (
		<Toast
			duration={10000}
			color={config.color}
			onDismiss={onDismiss}
			className={clsx(
				isCritical || isSales
					? 'border-[3px]'
					: isImportant
						? 'border-2'
						: 'border border-black/5',
			)}
			style={{
				borderColor:
					isCritical || isSales
						? config.color
						: isImportant
							? config.color
							: undefined,
			}}
		>
			{/* Background Glows */}
			{isCritical && (
				<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-red-500/10 to-transparent blur-xl pointer-events-none rounded-full" />
			)}
			{isImportant && (
				<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-orange-500/10 to-transparent blur-xl pointer-events-none rounded-full" />
			)}
			{isSales && (
				<div
					className="absolute top-0 right-0 w-32 h-32 blur-2xl pointer-events-none rounded-full animate-pulse"
					style={{
						background: `radial-gradient(circle, ${config.color}33 0%, transparent 70%)`,
					}}
				/>
			)}

			<div className="flex gap-3 align-start">
				<div
					className={clsx(
						'shrink-0 flex items-center justify-center text-white mt-0.5',
						isCritical ? 'p-2 rounded-xl' : 'p-2 rounded-lg',
					)}
					style={{
						backgroundColor: config.color,
					}}
				>
					<Icon className={isCritical || isSales ? 'w-5 h-5' : 'w-4 h-4'} />
				</div>

				<div>
					<div className="flex items-center gap-2 mb-1 flex-wrap">
						<h4
							className="font-bold text-[0.95rem] m-0"
							style={{
								color: isCritical || isSales ? '#1a1a2e' : config.color,
							}}
						>
							{notification.title}
						</h4>
						{isCritical && (
							<span className="px-2 py-0.5 rounded-md text-[0.6rem] font-bold uppercase tracking-wider bg-[#dc2626] text-white shadow-sm ring-1 ring-red-500/20">
								Neu
							</span>
						)}
						{isSales && (
							<span className="px-2 py-0.5 rounded-md text-[0.6rem] font-bold uppercase tracking-wider bg-[#e20074] text-white shadow-sm ring-1 ring-magenta-500/20 flex items-center gap-1">
								<TrendingUp className="w-2.5 h-2.5" />
								Umsatz-Boost
							</span>
						)}
						<span className="px-2 py-0.5 rounded-md text-[0.6rem] font-bold uppercase tracking-wider bg-black/5 text-[#1a1a2e]/60">
							{targetLabel}
						</span>
					</div>
					<p className="text-[0.8rem] text-[#1a1a2e]/70 m-0 line-clamp-2 leading-relaxed">
						{notification.content}
					</p>
				</div>
			</div>
		</Toast>
	);
}
