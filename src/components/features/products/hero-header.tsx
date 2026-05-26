'use client';

import Image from 'next/image';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	Clock,
	CalendarDays,
	TrendingUp,
	Building2,
	Sunrise,
	Sun,
	Moon,
} from 'lucide-react';
import {
	useEffect, useState,
} from 'react';
import {
	trpc,
} from '@/lib/trpc';
import clsx from 'clsx';
import {
	useImageBrightness,
} from '@/hooks/use-image-brightness';
import {
	Skeleton,
} from '@/components/shared/skeleton';
import {
	useSettingsStore,
} from '@/lib/store/settings-store';

interface HeroHeaderProps {
	firstName: string;
	teamName?: string;
	productsCount?: number;
	categories?: { name: string; count: number; color?: string }[];
	showHeroImage: boolean;
}

function getTimeContext(date: Date): { label: string; Icon: any } {
	const h = date.getHours();
	if (h < 12) {
		return {
			label: 'Guten Morgen',
			Icon: Sunrise,
		};
	}
	if (h < 18) {
		return {
			label: 'Guten Tag',
			Icon: Sun,
		};
	}
	return {
		label: 'Guten Abend',
		Icon: Moon,
	};
}

export function HeroHeader({
	firstName,
	teamName,
	productsCount,
	categories,
	showHeroImage,
}: HeroHeaderProps) {
	const {
		reduceAnimations,
	} = useSettingsStore();
	const [
		hasHydrated,
		setHasHydrated,
	] = useState(false);
	const [
		time,
		setTime,
	] = useState<Date | null>(null);
	const [
		activeCategoryIdx,
		setActiveCategoryIdx,
	] = useState(0);

	useEffect(() => {
		// Use a macrotask to avoid synchronous state updates in the effect body,
		// which prevents the "cascading renders" lint error and runtime warning.
		const timerId = setTimeout(() => {
			setHasHydrated(true);
			setTime(new Date());
		}, 0);

		const interval = setInterval(() => setTime(new Date()), 60000);
		return () => {
			clearTimeout(timerId);
			clearInterval(interval);
		};
	}, [
	]);

	const dataReady = productsCount !== undefined && time !== null && hasHydrated;

	const {
		data: designSettings,
	} = trpc.settings.getDesignSettings.useQuery(
		undefined,
		{
			staleTime: 10 * 60 * 1000,
		},
	);

	const headerBg =
		hasHydrated && showHeroImage
			? designSettings?.header_background_image
			: undefined;

	const isDark = useImageBrightness(headerBg);

	const textPrimaryClass = headerBg
		? isDark
			? 'text-white'
			: 'text-[#1a1a2e]'
		: 'text-[#1a1a2e]';

	const textSecondaryClass = headerBg
		? isDark
			? 'text-[#e0e0e0]'
			: 'text-[#555]'
		: 'text-[#666]';

	useEffect(() => {
		if (!categories || categories.length === 0 || reduceAnimations) { return; }
		const timer = setInterval(() => {
			setActiveCategoryIdx((prev) => (prev + 1) % categories.length);
		}, 3500);
		return () => clearInterval(timer);
	}, [
		categories,
		reduceAnimations,
	]);

	const currentCategory = categories?.[activeCategoryIdx];
	const greetingData = time ? getTimeContext(time) : null;
	const greeting = greetingData?.label || 'Guten Tag';
	const GreetingIcon = greetingData?.Icon || Sun;

	const insights = [
		{
			icon: CalendarDays,
			label: 'Datum',
			value: time
				? new Intl.DateTimeFormat('de-DE', {
					weekday: 'short',
					day: '2-digit',
					month: 'short',
				}).format(time)
				: '...',
			color: '#e20074',
		},
		{
			icon: Clock,
			label: 'Uhrzeit',
			value: time
				? `${new Intl.DateTimeFormat('de-DE', {
					hour: '2-digit',
					minute: '2-digit',
				}).format(time) } Uhr`
				: '...',
			color: '#e20074',
		},
		{
			icon: Building2,
			label: 'Team',
			value: teamName || 'Sales Experience',
			color: '#e20074',
		},
		{
			icon: TrendingUp,
			label: 'Portfolio',
			value: productsCount ? `${productsCount} Produkte` : 'Lade...',
			color: '#e20074',
		},
	];

	return (
		<div
			className={clsx(
				'relative flex flex-col xl:flex-row xl:items-start justify-between gap-6 w-full rounded-2xl transition-all duration-500',
				headerBg ? 'min-h-[140px] mb-8 p-6 md:p-8' : 'min-h-0 mb-6 p-0',
			)}
		>
			{/* Optional Background Image */}
			{headerBg && (
				<div className="absolute inset-0 z-0 rounded-2xl overflow-hidden pointer-events-none transition-opacity duration-500 shadow-sm border border-[#e8e8e8]/50">
					<Image
						src={headerBg}
						alt="Header Hintergrund"
						fill
						priority
						sizes="100vw"
						className="object-cover blur-xs scale-[1.05]"
					/>
					<div
						className={clsx(
							'absolute inset-0 transition-colors duration-500',
							isDark ? 'bg-[#1a1a2e]/40' : 'bg-white/40',
						)}
					/>
				</div>
			)}

			{/* Left Content */}
			<div className="relative z-10 flex flex-col max-w-2xl mt-1">
				<h1
					className={clsx(
						'text-4xl md:text-[3.2rem] font-extrabold mb-4 tracking-tight leading-[1.1] whitespace-nowrap flex items-center gap-4 transition-colors duration-500',
						textPrimaryClass,
					)}
				>
					<GreetingIcon
						className="w-10 h-10 md:w-12 md:h-12 text-[#e20074]"
						strokeWidth={2.5}
					/>
					<span>
						{greeting},{' '}
						<span className="text-[#e20074]">
							{firstName ? (
								firstName
							) : (
								<Skeleton className="inline-block h-[0.8em] w-48 translate-y-[0.1em] rounded-xl" />
							)}
						</span>
						!
					</span>
				</h1>

				<div
					className={clsx(
						'text-[1.1rem] leading-relaxed mb-0 font-medium whitespace-nowrap flex items-center transition-colors duration-500',
						textSecondaryClass,
					)}
				>
					{!dataReady ? (
						<Skeleton className="h-6 w-48 rounded-lg" />
					) : (
						<>
							<span className="mr-1.5">Wähle zwischen</span>
							{categories && categories.length > 0 ? (
								<AnimatePresence mode="popLayout">
									<motion.span
										key={activeCategoryIdx}
										layout="position"
										initial={{
											opacity: 0,
											scale: 0.95,
										}}
										animate={{
											opacity: 1,
											scale: 1,
										}}
										exit={{
											opacity: 0,
											scale: 0.95,
										}}
										transition={{
											duration: 0.3,
											ease: 'easeInOut',
										}}
										className="font-bold inline-block mr-0.5"
										style={{
											color: currentCategory?.color || '#e20074',
										}}
									>
										{currentCategory?.count}{' '}
										{currentCategory?.name === 'Endgeräte'
											? 'Endgeräten'
											: currentCategory?.name?.replace(' — OTT', '')}
									</motion.span>
								</AnimatePresence>
							) : (
								<span className="text-[#e20074] font-bold">verschiedenen</span>
							)}
							<motion.span layout="position">
								{currentCategory?.name === 'Endgeräte' ? '.' : '-Produkten.'}
							</motion.span>
						</>
					)}
				</div>
			</div>

			{/* Right Content - Info Widgets */}
			<div className="relative z-10 grid grid-cols-2 gap-4 shrink-0 w-full xl:w-auto mt-6 xl:mt-0">
				{!dataReady
					? [
						1,
						2,
						3,
						4,
					].map((i) => (
						<Skeleton
							key={i}
							className="h-[88px] w-full xl:w-[180px] rounded-[20px]"
						/>
					))
					: insights.map((item, i) => (
						<div
							key={i}
							className="group relative bg-white border border-[#e8e8e8] rounded-[20px] h-[88px] flex flex-col justify-center px-5 py-3 overflow-hidden transition-all duration-400 ease-out hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:border-[#ddd] xl:min-w-[180px]"
							style={{
								'--card-color': item.color,
							} as React.CSSProperties}
						>
							{/* Hover gradient */}
							<div
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[20px]"
								style={{
									background: `linear-gradient(to right, transparent 20%, ${item.color}10 60%, ${item.color}18 100%)`,
								}}
							/>

							{/* Content row */}
							<div className="relative z-10 flex items-center justify-between gap-3">
								{/* Left: Text */}
								<div className="flex flex-col">
									<h3 className="text-[1.15rem] font-bold text-[#1a1a2e] m-0 leading-tight group-hover:text-(--card-color) transition-colors duration-300">
										{item.label}
									</h3>
									<span className="text-[0.72rem] text-[#b5b5b5] font-medium mt-1 tracking-wide">
										{item.value}
									</span>
								</div>

								{/* Right: Icon */}
								<item.icon
									className="w-8 h-8 transition-all duration-400 text-[#c8c8c8] group-hover:text-(--card-color) group-hover:scale-110 shrink-0"
									strokeWidth={1.5}
								/>
							</div>
						</div>
					))}
			</div>
		</div>
	);
}
