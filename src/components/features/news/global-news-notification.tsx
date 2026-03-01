"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNewsNotificationStore } from "@/lib/store/news-notification-store";
import {
	Info,
	AlertCircle,
	AlertTriangle,
	X,
	Sparkles,
	TrendingUp
} from "lucide-react";
import clsx from "clsx";
import { trpc } from "@/lib/trpc";

const PRIORITY_CONFIG: Record<
	string,
	{ color: string; icon: React.ElementType }
> = {
	INFO: { color: "#00a878", icon: Info }, // Green
	UPDATE: { color: "#0090d0", icon: Info }, // Blue
	IMPORTANT: { color: "#ff6b00", icon: AlertCircle }, // Orange
	CRITICAL: { color: "#dc2626", icon: AlertTriangle }, // Red
	SALES: { color: "#e20074", icon: Sparkles } // Magenta
};

export function GlobalNewsNotification() {
	const notifications = useNewsNotificationStore(
		(state) => state.notifications
	);
	const removeNotification = useNewsNotificationStore(
		(state) => state.removeNotification
	);

	const addNotification = useNewsNotificationStore(
		(state) => state.addNotification
	);

	// Poll for new news every 10 seconds.
	// If a news item's createdAt is within the last 15 seconds, trigger a notification.
	const { data } = trpc.news.listActive.useQuery(undefined, {
		refetchInterval: 10000
	});

	useEffect(() => {
		if (!data) return;
		const now = new Date().getTime();
		data.forEach((news: any) => {
			const createdTime = new Date(news.createdAt).getTime();
			// Check if the news is new (created within the last 15 seconds)
			if (now - createdTime < 15000) {
				// Prevent duplicate notifications in store
				if (!notifications.some((n) => n.id === news.id)) {
					addNotification({
						id: news.id,
						title: news.title,
						content: news.content,
						priority: news.priority as any
					});
				}
			}
		});
	}, [data, notifications, addNotification]);

	return (
		<div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-9999 flex flex-col gap-4 w-[500px] pointer-events-none">
			<AnimatePresence>
				{notifications.map((notification) => (
					<NotificationItem
						key={notification.id}
						notification={notification}
						onDismiss={() => removeNotification(notification.id)}
					/>
				))}
			</AnimatePresence>
		</div>
	);
}

function NotificationItem({
	notification,
	onDismiss
}: {
	notification: { priority: string; title: string; content: string };
	onDismiss: () => void;
}) {
	const config = PRIORITY_CONFIG[notification.priority] || PRIORITY_CONFIG.INFO;
	const Icon = config.icon;
	const isCritical = notification.priority === "CRITICAL";
	const isImportant = notification.priority === "IMPORTANT";
	const isSales = notification.priority === "SALES";

	const [progress, setProgress] = useState(0);
	const accumulatedTimeRef = useRef(0);
	const [isPaused, setIsPaused] = useState(false);
	const isPausedRef = useRef(isPaused);

	// Sync ref with state
	useEffect(() => {
		isPausedRef.current = isPaused;
	}, [isPaused]);

	useEffect(() => {
		let animationFrame: number;
		let lastTime = performance.now();
		const DURATION = 10000; // 10 seconds visible

		const tick = (currentTime: number) => {
			const delta = currentTime - lastTime;
			lastTime = currentTime;

			if (!isPausedRef.current) {
				accumulatedTimeRef.current += delta;
				const p = Math.min((accumulatedTimeRef.current / DURATION) * 100, 100);
				setProgress(p);

				if (accumulatedTimeRef.current >= DURATION) {
					onDismiss();
					return;
				}
			}
			animationFrame = requestAnimationFrame(tick);
		};

		animationFrame = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(animationFrame);
	}, [onDismiss]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 50, scale: 0.9 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 20, scale: 0.95 }}
			transition={{ type: "spring", stiffness: 400, damping: 25 }}
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
			className={clsx(
				"relative pointer-events-auto rounded-2xl p-4 shadow-2xl overflow-hidden backdrop-blur-sm bg-white/95",
				isCritical || isSales
					? "border-[3px]"
					: isImportant
						? "border-2"
						: "border border-black/5"
			)}
			style={{
				borderColor:
					isCritical || isSales
						? config.color
						: isImportant
							? config.color
							: undefined
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
						background: `radial-gradient(circle, ${config.color}33 0%, transparent 70%)`
					}}
				/>
			)}

			<div className="absolute top-3 right-3 flex items-center gap-2 z-10">
				{/* Progress Circle Timer */}
				<div
					className="relative w-5 h-5 flex items-center justify-center transition-opacity duration-300"
					title={isPaused ? "Pausiert" : "Schließt in kürze..."}
				>
					<svg
						className="w-full h-full -rotate-90"
						style={{ color: config.color }}
					>
						<circle
							cx="10"
							cy="10"
							r="8"
							stroke="currentColor"
							strokeWidth="2.5"
							fill="none"
							className="opacity-20"
						/>
						<circle
							cx="10"
							cy="10"
							r="8"
							stroke="currentColor"
							strokeWidth="2.5"
							fill="none"
							strokeDasharray={2 * Math.PI * 8}
							strokeDashoffset={
								2 * Math.PI * 8 - (2 * Math.PI * 8 * progress) / 100
							}
							className="transition-none"
						/>
					</svg>
				</div>

				<button
					onClick={onDismiss}
					className="p-1 rounded-full bg-black/5 hover:bg-black/10 transition-colors text-[#1a1a2e]/60 hover:text-[#1a1a2e] cursor-pointer"
				>
					<X className="w-4 h-4" />
				</button>
			</div>

			<div className="flex gap-3 align-start relative z-10 pr-14">
				<div
					className={clsx(
						"shrink-0 flex items-center justify-center text-white mt-0.5",
						isCritical ? "p-2 rounded-xl" : "p-2 rounded-lg"
					)}
					style={{ backgroundColor: config.color }}
				>
					<Icon className={isCritical || isSales ? "w-5 h-5" : "w-4 h-4"} />
				</div>

				<div>
					<div className="flex items-center gap-2 mb-1">
						<h4
							className="font-bold text-[0.95rem] m-0"
							style={{
								color: isCritical || isSales ? "#1a1a2e" : config.color
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
					</div>
					<p className="text-[0.8rem] text-[#1a1a2e]/70 m-0 line-clamp-2 leading-relaxed">
						{notification.content}
					</p>
				</div>
			</div>
		</motion.div>
	);
}
