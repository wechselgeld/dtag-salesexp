'use client';

import React, {
	useState, useEffect,
} from 'react';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	MonitorOff,
} from 'lucide-react';
import {
	TelekomLogo,
} from '@/components/shared/telekom-logo';
import {
	GlobalFooter,
} from '@/components/shared/global-footer';

const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;

// Toleranz für Browser-UI (Tabs, Adressleiste) und Taskleiste
const MIN_WIDTH = 1800;
const MIN_HEIGHT = 900;

export function ResolutionGuard({
	children,
}: { children: React.ReactNode }) {
	const [
		isTooSmall,
		setIsTooSmall,
	] = useState(false);
	const [
		windowSize,
		setWindowSize,
	] = useState({
		width: 0,
		height: 0,
	});
	const [
		mounted,
		setMounted,
	] = useState(false);

	useEffect(() => {
		setMounted(true);
		const checkResolution = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;
			setWindowSize({
				width,
				height,
			});
			setIsTooSmall(width < MIN_WIDTH || height < MIN_HEIGHT);
		};

		checkResolution();
		window.addEventListener('resize', checkResolution);
		return () =>
			window.removeEventListener('resize', checkResolution);
	}, [
	]);

	if (!mounted) {
		return <>{children}</>;
	}

	return (
		<>
			<AnimatePresence>
				{isTooSmall && (
					<motion.div
						initial={{
							opacity: 0,
						}}
						animate={{
							opacity: 1,
						}}
						exit={{
							opacity: 0,
						}}
						className="fixed inset-0 z-9999 bg-ds-bg flex flex-col items-center justify-start py-12 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074] overflow-y-auto"
					>
						<div className="max-w-3xl w-full mx-auto">
							{/* ─── Header / Branding ─── */}
							<motion.div
								initial={{
									opacity: 0,
									y: 12,
								}}
								animate={{
									opacity: 1,
									y: 0,
								}}
								transition={{
									duration: 0.5,
									ease: [
										0.16,
										1,
										0.3,
										1,
									],
								}}
								className="flex flex-col items-center mb-10 text-center"
							>
								<TelekomLogo className="w-12 h-12 text-[#e20074] mb-8" />
								<h1 className="text-3xl sm:text-[2.5rem] font-extrabold text-[#1a1a2e] tracking-tight mb-3 leading-none">
									Sales Experience @ DTS
								</h1>
								<p className="text-[1.05rem] text-[#888] font-normal leading-relaxed max-w-md mx-auto mt-1">
									Die Sales Expirience funktioniert aktuell nur mit einer Auflösung von 1920x1080 Pixeln.
								</p>
							</motion.div>

							{/* ─── Main Card ─── */}
							<motion.div
								initial={{
									opacity: 0,
									y: 15,
								}}
								animate={{
									opacity: 1,
									y: 0,
								}}
								transition={{
									duration: 0.5,
									delay: 0.1,
									ease: [
										0.16,
										1,
										0.3,
										1,
									],
								}}
								className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] overflow-hidden"
							>
								<div className="p-8 sm:p-12">
									<div className="flex flex-col items-center text-center gap-5 py-4">
										<div className="w-16 h-16 bg-[#fdf2f8] rounded-full flex items-center justify-center relative">
											<div className="absolute inset-0 rounded-full border-2 border-[#e20074]/10 animate-ping opacity-20" />
											<MonitorOff className="w-8 h-8 text-[#e20074]" />
										</div>
										<div>
											<h3 className="text-[1.1rem] font-extrabold text-[#1a1a2e] mb-2 tracking-tight">
												Auflösung zu gering
											</h3>
											<p className="text-[0.9rem] text-[#888] leading-relaxed max-w-md mx-auto">
												Die Sales Experience ist für eine optimale Darstellung ab einer Auflösung von{' '}
												<span className="font-bold text-[#1a1a2e]">
													{TARGET_WIDTH} x {TARGET_HEIGHT} Pixeln
												</span>{' '}
												optimiert.
											</p>
											<p className="text-[0.75rem] text-[#aaa] mt-3 italic">
												Deine aktuelle Auflösung: {windowSize.width} x {windowSize.height} Pixel
											</p>
										</div>

										<div className="mt-4 flex flex-col gap-4 w-full max-w-xs mx-auto">
											<div className="h-1 w-full bg-[#f7f8fa] rounded-full overflow-hidden">
												<motion.div
													className="h-full bg-[#e20074]"
													initial={{
														width: '0%',
													}}
													animate={{
														width: `${Math.min(100, (windowSize.width / MIN_WIDTH) * 100)}%`,
													}}
													transition={{
														duration: 0.8,
														ease: 'easeOut',
													}}
												/>
											</div>
											<p className="text-[0.8rem] text-[#888]">
												Bitte vergrößere dein Browserfenster oder nutze den Vollbildmodus (F11), um fortzufahren.
											</p>
										</div>
									</div>
								</div>
							</motion.div>

							{/* ─── Footer / Branding ─── */}
							<motion.div
								initial={{
									opacity: 0,
									y: 12,
								}}
								animate={{
									opacity: 1,
									y: 0,
								}}
								transition={{
									duration: 0.5,
									delay: 0.2,
									ease: [
										0.16,
										1,
										0.3,
										1,
									],
								}}
								className="flex flex-col items-center mt-5 text-center"
							>
							</motion.div>

							<GlobalFooter
								className="pt-8 pb-0 mt-4 text-[#bbb]"
								linkColor="text-[#bbb]"
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
			<div className={isTooSmall ? 'sr-only pointer-events-none overflow-hidden h-0' : 'contents'}>
				{children}
			</div>
		</>
	);
}
