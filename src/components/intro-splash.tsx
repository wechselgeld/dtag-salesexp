"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TelekomLogo } from "./telekom-logo";

export function IntroSplash({ children }: { children: React.ReactNode }) {
	const [showSplash, setShowSplash] = useState(false);
	const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

	useEffect(() => {
		const today = new Date().toISOString().split("T")[0];
		const lastSeen = localStorage.getItem("dts-splash-date");

		if (lastSeen !== today) {
			setShowSplash(true);
			localStorage.setItem("dts-splash-date", today);
		}
	}, []);

	useEffect(() => {
		if (showSplash) {
			const t1 = setTimeout(() => setPhase("hold"), 1200);
			const t2 = setTimeout(() => setPhase("exit"), 2800);
			const t3 = setTimeout(() => setShowSplash(false), 3600);

			return () => {
				clearTimeout(t1);
				clearTimeout(t2);
				clearTimeout(t3);
			};
		}
	}, [showSplash]);

	const handleSkip = () => {
		setPhase("exit");
		setTimeout(() => setShowSplash(false), 800);
	};

	if (!showSplash) return <>{children}</>;

	return (
		<>
			{/* Main content behind */}
			<div className="opacity-0 pointer-events-none absolute inset-0">
				{children}
			</div>

			<AnimatePresence>
				{showSplash && (
					<motion.div
						className="fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer bg-white"
						onClick={handleSkip}
						initial={{ opacity: 1 }}
						exit={{ opacity: 0, scale: 1.02 }}
						transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
					>
						<div className="flex flex-col items-center">
							{/* Premium Logo Reveal */}
							<motion.div
								initial={{
									opacity: 0,
									scale: 0.9,
									filter: "blur(10px)",
									y: 10
								}}
								animate={{
									opacity: phase === "exit" ? 0 : 1,
									scale: phase === "exit" ? 0.95 : 1,
									filter: phase === "exit" ? "blur(4px)" : "blur(0px)",
									y: phase === "exit" ? -10 : 0
								}}
								transition={{
									duration: 1.2,
									ease: [0.16, 1, 0.3, 1]
								}}
								className="mb-8"
							>
								<TelekomLogo className="w-16 h-16 text-[#e20074]" />
							</motion.div>

							{/* Elegant Typography Reveal */}
							<motion.div
								className="flex flex-col items-center"
								initial={{ opacity: 0, y: 10 }}
								animate={{
									opacity: phase === "enter" ? 0 : phase === "exit" ? 0 : 1,
									y: phase === "enter" ? 10 : phase === "exit" ? -10 : 0
								}}
								transition={{
									duration: 0.8,
									ease: [0.16, 1, 0.3, 1]
								}}
							>
								<h1 className="text-[1.8rem] font-medium text-[#1a1a2e] tracking-tight mb-2">
									Willkommen zurück.
								</h1>
								<div className="flex items-center gap-2 text-[0.8rem] font-medium text-[#888] tracking-widest uppercase">
									<span>Chemnitz</span>
									<span className="w-1 h-1 rounded-full bg-[#e20074]/40" />
									<span>{formatDate()}</span>
								</div>
							</motion.div>
						</div>

						{/* Extremely subtle ambient glow at bottom */}
						<div
							className="absolute w-full h-[30vh] bottom-0 pointer-events-none opacity-20"
							style={{
								background:
									"radial-gradient(ellipse at bottom, rgba(226,0,116,0.15) 0%, transparent 70%)"
							}}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

function formatDate(): string {
	return new Date().toLocaleDateString("de-DE", {
		month: "long",
		year: "numeric"
	});
}
