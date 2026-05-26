'use client';

import {
	useState, useEffect, useRef, useId,
} from 'react';
import {
	motion,
} from 'framer-motion';
import {
	X,
} from 'lucide-react';
import clsx from 'clsx';

export interface ToastProps {
	duration?: number;
	color?: string;
	onDismiss: () => void;
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}

export function Toast({
	duration = 5000,
	color = '#1a1a2e',
	onDismiss,
	children,
	className,
	style,
}: ToastProps) {
	const uniqueId = useId().replace(/:/g, '');
	const [
 isPaused,
setIsPaused,
] = useState(false);

	const [
 remainingTime,
setRemainingTime,
] = useState(duration);
	const startTimeRef = useRef(0);
	const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (duration <= 0) return;

		if (!isPaused) {
			startTimeRef.current = Date.now();
			timeoutIdRef.current = setTimeout(() => {
				onDismiss();
			}, remainingTime);
		}

		return () => {
			if (timeoutIdRef.current) {
				clearTimeout(timeoutIdRef.current);
			}
			if (!isPaused) {
				const elapsed = Date.now() - startTimeRef.current;
				setRemainingTime((prev) => Math.max(0, prev - elapsed));
			}
		};
	}, [
		isPaused,
		duration,
		onDismiss,
		remainingTime,
	]);

	const circumference = 2 * Math.PI * 8; // ~50.265
	const currentProgressPercent = duration > 0 ? (duration - remainingTime) / duration : 0;
	const currentOffset = circumference * currentProgressPercent;
	const animationName = `toast-progress-${uniqueId}`;

	return (
		<motion.div
			initial={{
				opacity: 0,
				y: 50,
				scale: 0.9,
			}}
			animate={{
				opacity: 1,
				y: 0,
				scale: 1,
			}}
			exit={{
				opacity: 0,
				y: 20,
				scale: 0.95,
			}}
			transition={{
				type: 'spring',
				stiffness: 400,
				damping: 25,
			}}
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
			className={clsx(
				'relative pointer-events-auto rounded-3xl p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden backdrop-blur-xl border border-white/40',
				className || 'bg-white/80',
			)}
			style={style}
		>
			<div className="absolute top-2 right-2 flex items-center gap-2 z-50 text-inherit">
				{duration > 0 && (
					<div
						className="relative w-5 h-5 flex items-center justify-center transition-opacity duration-300"
						title={isPaused ? 'Pausiert' : 'Schließt in kürze...'}
					>
						<style>{`
							@keyframes ${animationName} {
								from {
									stroke-dashoffset: ${circumference - currentOffset};
								}
								to {
									stroke-dashoffset: ${circumference};
								}
							}
						`}</style>
						<svg className="w-full h-full -rotate-90" style={{
							color,
						}}>
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
								strokeDasharray={circumference}
								style={{
									animation: isPaused ? 'none' : `${animationName} ${remainingTime}ms linear forwards`,
									strokeDashoffset: isPaused ? circumference - currentOffset : undefined,
								}}
								className="transition-none"
							/>
						</svg>
					</div>
				)}
				<button
					onClick={onDismiss}
					className="p-1 rounded-full cursor-pointer border-none transition-colors relative z-20"
					style={{
						backgroundColor: 'rgba(0,0,0,0.05)',
						color: 'inherit',
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
					}}
				>
					<X className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" />
				</button>
			</div>

			<div className="relative z-10 pr-16 flex flex-col">{children}</div>
		</motion.div>
	);
}
