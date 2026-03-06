"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TelekomLogo } from "@/components/shared/telekom-logo";

/* ──────────────────────────────────────────────
   Constants & helpers
   ────────────────────────────────────────────── */

const SPLASH_COOLDOWN_HOURS = 10;
const LS_KEY_SPLASH = "splash-timestamp";
const LS_KEY_FIRST_NAME = "setup-user-firstName";

/** Premium easing curve – identical to the one used on the setup screen */
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

function formatDate(): string {
	return new Date().toLocaleDateString("de-DE", {
		day: "numeric",
		month: "long",
		year: "numeric"
	});
}

function getGreeting(): string {
	const h = new Date().getHours();
	if (h < 12) return "Guten Morgen";
	if (h < 18) return "Guten Tag";
	return "Guten Abend";
}

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */

export function IntroSplash({ children }: { children: React.ReactNode }) {
	const [showSplash, setShowSplash] = useState(false);
	const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
	const [firstName, setFirstName] = useState("");

	// Decide whether to show splash (cooldown-based)
	useEffect(() => {
		const now = Date.now();
		const lastSeenStr = localStorage.getItem(LS_KEY_SPLASH);
		const lastSeen = lastSeenStr ? parseInt(lastSeenStr, 10) : 0;
		const hoursPassed = (now - lastSeen) / (1000 * 60 * 60);

		// Read stored first name for personalised greeting
		const storedName = localStorage.getItem(LS_KEY_FIRST_NAME) ?? "";
		setFirstName(storedName);

		if (hoursPassed >= SPLASH_COOLDOWN_HOURS) {
			setShowSplash(true);
			localStorage.setItem(LS_KEY_SPLASH, now.toString());
		}
	}, []);

	// Phase sequencing
	useEffect(() => {
		if (!showSplash) return;

		const t1 = setTimeout(() => setPhase("hold"), 1000);
		const t2 = setTimeout(() => setPhase("exit"), 3200);
		const t3 = setTimeout(() => setShowSplash(false), 4000);

		return () => {
			clearTimeout(t1);
			clearTimeout(t2);
			clearTimeout(t3);
		};
	}, [showSplash]);

	const handleSkip = () => {
		setPhase("exit");
		setTimeout(() => setShowSplash(false), 800);
	};

	const greeting = firstName
		? `${getGreeting()}, ${firstName}.`
		: `${getGreeting()}.`;

	return (
		<>
			{children}

			<AnimatePresence>
				{showSplash && (
					<motion.div
						className="fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer bg-white selection:bg-[#e20074]/20"
						onClick={handleSkip}
						initial={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
					>
						{/* ─── Centered content ─── */}
						<div className="flex flex-col items-center px-6">
							{/* Logo */}
							<motion.div
								initial={{ opacity: 0, scale: 0.85, y: 12 }}
								animate={{
									opacity: phase === "exit" ? 0 : 1,
									scale: phase === "exit" ? 0.92 : 1,
									y: phase === "exit" ? -8 : 0
								}}
								transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
								className="mb-10"
							>
								<TelekomLogo className="w-14 h-14 text-[#e20074]" />
							</motion.div>

							{/* Heading – personalised greeting */}
							<motion.h1
								className="text-3xl sm:text-[2.2rem] font-extrabold text-[#1a1a2e] tracking-tight mb-3 text-center leading-tight"
								initial={{ opacity: 0, y: 16 }}
								animate={{
									opacity: phase === "enter" ? 0 : phase === "exit" ? 0 : 1,
									y: phase === "enter" ? 16 : phase === "exit" ? -10 : 0
								}}
								transition={{
									duration: 0.8,
									ease: EASE_OUT_EXPO,
									delay: phase === "hold" ? 0 : 0
								}}
							>
								{greeting}
							</motion.h1>

							{/* Subtitle */}
							<motion.p
								className="text-[1rem] text-[#888] font-normal text-center max-w-sm leading-relaxed"
								initial={{ opacity: 0, y: 12 }}
								animate={{
									opacity: phase === "enter" ? 0 : phase === "exit" ? 0 : 1,
									y: phase === "enter" ? 12 : phase === "exit" ? -8 : 0
								}}
								transition={{
									duration: 0.7,
									ease: EASE_OUT_EXPO,
									delay: phase === "hold" ? 0.1 : 0
								}}
							>
								Willkommen bei der Sales Experience.
							</motion.p>

							{/* Meta line – location · date */}
							<motion.div
								className="flex items-center gap-2.5 mt-6 text-[0.75rem] font-bold text-[#bbb] uppercase tracking-[0.15em]"
								initial={{ opacity: 0 }}
								animate={{
									opacity: phase === "enter" ? 0 : phase === "exit" ? 0 : 0.7
								}}
								transition={{
									duration: 0.6,
									ease: EASE_OUT_EXPO,
									delay: phase === "hold" ? 0.25 : 0
								}}
							>
								<span>Chemnitz</span>
								<span className="w-1 h-1 rounded-full bg-[#e20074]/50" />
								<span>{formatDate()}</span>
							</motion.div>
						</div>

						{/* ─── Ambient glow ─── */}
						<motion.div
							className="absolute w-full h-[35vh] bottom-0 pointer-events-none"
							initial={{ opacity: 0 }}
							animate={{ opacity: phase === "exit" ? 0 : 0.15 }}
							transition={{ duration: 1.5, ease: EASE_OUT_EXPO }}
							style={{
								background:
									"radial-gradient(ellipse at 50% 100%, rgba(226,0,116,0.2) 0%, transparent 70%)"
							}}
						/>

						{/* ─── Skip hint ─── */}
						<motion.div
							className="absolute bottom-8 text-[0.7rem] font-medium text-[#ccc] tracking-wide"
							initial={{ opacity: 0 }}
							animate={{
								opacity: phase === "hold" ? 0.6 : 0
							}}
							transition={{
								duration: 0.5,
								ease: EASE_OUT_EXPO,
								delay: phase === "hold" ? 0.6 : 0
							}}
						>
							Zum Überspringen klicken
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
