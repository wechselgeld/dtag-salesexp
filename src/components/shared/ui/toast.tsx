'use client';

import {
	useState, useEffect, useRef,
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
	const [
		progress,
		setProgress,
	] = useState(0);
	const accumulatedTimeRef = useRef(0);
	const [
		isPaused,
		setIsPaused,
	] = useState(false);
	const isPausedRef = useRef(isPaused);

	useEffect(() => {
		isPausedRef.current = isPaused;
	}, [
		isPaused,
	]);

	useEffect(() => {
		let animationFrame: number;
		let lastTime = performance.now();

		const tick = (currentTime: number) => {
			const delta = currentTime - lastTime;
			lastTime = currentTime;

			if (!isPausedRef.current && duration > 0) {
				accumulatedTimeRef.current += delta;
				const p = Math.min((accumulatedTimeRef.current / duration) * 100, 100);
				setProgress(p);

				if (accumulatedTimeRef.current >= duration) {
					onDismiss();
					return;
				}
			}
			animationFrame = requestAnimationFrame(tick);
		};

		animationFrame = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(animationFrame);
	}, [
		duration,
		onDismiss,
	]);

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
								strokeDasharray={2 * Math.PI * 8}
								strokeDashoffset={
									2 * Math.PI * 8 - (2 * Math.PI * 8 * progress) / 100
								}
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
