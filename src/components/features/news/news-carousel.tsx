'use client';

import {
	useState, useEffect, useRef,
} from 'react';
import {
	trpc,
} from '@/lib/trpc';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	Info,
	AlertCircle,
	AlertTriangle,
	ChevronRight,
	ChevronLeft,
} from 'lucide-react';
import clsx from 'clsx';
import {
	Skeleton,
} from '@/components/shared/skeleton';

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
};

export function NewsCarousel() {
	const {
		data: newsItems, isLoading,
	} = trpc.news.listActive.useQuery();
	const [
		currentIndex,
		setCurrentIndex,
	] = useState(0);
	const [
		isPaused,
		setIsPaused,
	] = useState(false);
	const [
		progress,
		setProgress,
	] = useState(0);
	const accumulatedTimeRef = useRef(0);
	const [
		mounted,
		setMounted,
	] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, [
	]);

	// Custom animation loop to manage both the time skipping and progress percentage smoothly with pause support
	useEffect(() => {
		if (!newsItems || newsItems.length <= 1) {
			setProgress(0);
			return;
		}

		let animationFrame: number;
		let lastTime = performance.now();
		const DURATION = 6000;

		const tick = (currentTime: number) => {
			if (!isPaused) {
				const delta = currentTime - lastTime;
				accumulatedTimeRef.current += delta;
				const p = Math.min((accumulatedTimeRef.current / DURATION) * 100, 100);
				setProgress(p);

				if (accumulatedTimeRef.current >= DURATION) {
					accumulatedTimeRef.current = 0;
					setCurrentIndex((prev) => (prev + 1) % newsItems.length);
				}
			}
			lastTime = currentTime;
			animationFrame = requestAnimationFrame(tick);
		};

		animationFrame = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(animationFrame);
	}, [
		newsItems,
		isPaused,
	]);

	if (!mounted || isLoading) {
		return (
			<div className="mt-8 mb-6">
				<div className="rounded-2xl border border-[#eaedf0] bg-white p-5 flex items-start gap-4 h-[100px]">
					<Skeleton className="w-[42px] h-[42px] rounded-xl shrink-0" />
					<div className="flex-1 w-full">
						<Skeleton className="h-5 w-1/3 mb-3" />
						<Skeleton className="h-4 w-3/4 mb-2" />
						<Skeleton className="h-4 w-2/3" />
					</div>
				</div>
			</div>
		);
	}

	if (!newsItems || newsItems.length === 0) {
		return null;
	}

	const currentItem = newsItems[currentIndex] as any;
	const config = PRIORITY_CONFIG[currentItem.priority] || PRIORITY_CONFIG.INFO;
	const Icon = config.icon;

	const handleNext = () => {
		accumulatedTimeRef.current = 0;
		setProgress(0);
		setCurrentIndex((prev) => (prev + 1) % newsItems.length);
	};

	const handlePrev = () => {
		accumulatedTimeRef.current = 0;
		setProgress(0);
		setCurrentIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length);
	};

	const isCritical = currentItem.priority === 'CRITICAL';
	const isImportant = currentItem.priority === 'IMPORTANT';
	const circumference = 2 * Math.PI * 10; // r=10

	let targetLabel = 'Global';
	if (currentItem.team) {
		targetLabel = `Für Dein Team (${currentItem.team.name})`;
	}
	else if (currentItem.location) {
		targetLabel = `Für Deinen Standort (${currentItem.location.name})`;
	}
	else if (currentItem.odRegion) {
		targetLabel = `Für Deinen OD-Bereich (${currentItem.odRegion.name})`;
	}

	return (
		<div
			className="mt-8 mb-6 relative group"
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
		>
			{/* Controls overlaid globally for the carousel */}
			{newsItems.length > 1 && (
				<div className="absolute right-4 top-4 z-30 flex items-center gap-3">
					{/* Navigation Arrows */}
					<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						<button
							onClick={handlePrev}
							className="p-1.5 rounded-full bg-black/5 hover:bg-black/10 transition-colors text-[#1a1a2e]/60 hover:text-[#1a1a2e] cursor-pointer"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						<button
							onClick={handleNext}
							className="p-1.5 rounded-full bg-black/5 hover:bg-black/10 transition-colors text-[#1a1a2e]/60 hover:text-[#1a1a2e] cursor-pointer"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>

					{/* Progress Circle Timer */}
					<div
						className="relative w-6 h-6 flex items-center justify-center transition-opacity duration-300"
						title={isPaused ? 'Pausiert' : 'Nächste Neuigkeit in...'}
					>
						<svg
							className="w-full h-full -rotate-90"
							style={{
								color: config.color,
							}}
						>
							<circle
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="2.5"
								fill="none"
								className="opacity-20"
							/>
							<circle
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="2.5"
								fill="none"
								strokeDasharray={circumference}
								strokeDashoffset={
									circumference - (circumference * progress) / 100
								}
								className="transition-none"
							/>
						</svg>
					</div>
				</div>
			)}

			<div
				className={clsx(
					'relative overflow-hidden rounded-2xl transition-all duration-300',
					isCritical
						? 'border-[3px] shadow-[0_6px_25px_rgba(220,38,38,0.15)]'
						: isImportant
							? 'border-2 shadow-[0_4px_15px_rgba(255,107,0,0.1)]'
							: 'border',
				)}
				style={{
					borderColor: isCritical ? config.color : `${config.color}30`,
					backgroundColor: isCritical
						? `${config.color}0c`
						: `${config.color}06`,
				}}
			>
				{/* Background Glow for Critical */}
				{isCritical && (
					<div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-red-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
				)}
				{isImportant && (
					<div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-orange-500/10 to-transparent blur-2xl pointer-events-none rounded-full" />
				)}

				<AnimatePresence mode="wait">
					<motion.div
						key={currentItem.id}
						initial={{
							opacity: 0,
							scale: 0.98,
						}}
						animate={{
							opacity: 1,
							scale: 1,
						}}
						exit={{
							opacity: 0,
							scale: 0.98,
						}}
						transition={{
							duration: 0.3,
						}}
						className={clsx(
							'flex items-start gap-4 p-5 z-10 relative',
							isCritical ? 'py-6 px-6' : '',
						)}
					>
						<div
							className={clsx(
								'shrink-0 flex items-center justify-center text-white',
								isCritical
									? 'p-3 rounded-[14px] mt-0.5'
									: 'p-2.5 rounded-xl mt-1',
							)}
							style={{
								backgroundColor: config.color,
							}}
						>
							<Icon className={isCritical ? 'w-6 h-6' : 'w-5 h-5'} />
						</div>

						<div className="flex-1 min-w-0 pr-16 md:pr-32">
							<div className="flex items-center gap-2 mb-1.5">
								<h3
									className={clsx(
										'font-extrabold m-0 tracking-tight',
										isCritical ? 'text-[1.1rem]' : 'text-[0.95rem]',
									)}
									style={{
										color: isCritical ? '#1a1a2e' : config.color,
									}}
								>
									{currentItem.title}
								</h3>
								{isCritical && (
									<span className="px-2.5 py-0.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider bg-[#dc2626] text-white shadow-sm ring-2 ring-red-500/20">
										Kritisch
									</span>
								)}
								{isImportant && (
									<span className="px-2 py-0.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider bg-[#ff6b00]/10 text-[#ff6b00]">
										Wichtig
									</span>
								)}
								<span className="px-2 py-0.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider bg-black/5 text-[#1a1a2e]/60">
									{targetLabel}
								</span>
							</div>
							<p
								className={clsx(
									'm-0 leading-relaxed',
									isCritical
										? 'text-[0.9rem] text-[#1a1a2e] font-semibold'
										: 'text-[0.85rem] text-[#1a1a2e]/80 font-medium',
								)}
							>
								{currentItem.content}
							</p>
						</div>
					</motion.div>
				</AnimatePresence>

				{/* Progress dots - Clickable! */}
				{newsItems.length > 1 && (
					<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
						{newsItems.map((_: any, i: number) => (
							<button
								key={i}
								onClick={() => {
									accumulatedTimeRef.current = 0;
									setProgress(0);
									setCurrentIndex(i);
								}}
								className={clsx(
									'h-1.5 rounded-full transition-all duration-300 cursor-pointer border-none outline-none',
									i === currentIndex
										? 'w-5 opacity-100 hover:opacity-80'
										: 'w-1.5 opacity-30 hover:opacity-100 hover:w-3',
								)}
								style={{
									backgroundColor: config.color,
								}}
								title={`Zu Meldung ${i + 1} springen`}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
