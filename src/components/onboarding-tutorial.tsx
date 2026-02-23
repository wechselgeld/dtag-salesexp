"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	ChevronRight,
	ChevronLeft,
	Sparkles,
	LayoutGrid,
	Search,
	Calculator,
	ShoppingBag,
	ShieldCheck,
	MousePointer2
} from "lucide-react";

interface Step {
	targetId: string;
	title: string;
	content: string;
	icon: React.ElementType;
	position: "right" | "left" | "top" | "bottom" | "center";
}

const STEPS: Step[] = [
	{
		targetId: "welcome",
		title: "Willkommen beim Sales Tool",
		content:
			"Lass uns gemeinsam die wichtigsten Funktionen entdecken, damit Du Deine Kunden perfekt beraten kannst.",
		icon: Sparkles,
		position: "center"
	},
	{
		targetId: "tour-sidebar",
		title: "Workflow-Navigation",
		content:
			'Hier behältst Du den Überblick über den Beratungsprozess. Du kannst von jeder Seite aus auf "Auswahl" klicken, um zur Startseite zu gelangen.',
		icon: LayoutGrid,
		position: "right"
	},
	{
		targetId: "tour-search",
		title: "Schnellsuche",
		content:
			"Suche blitzschnell nach Tarifen, Hardware oder Kategorien. Mit Strg + K öffnest Du die Suche von überall.",
		icon: Search,
		position: "bottom"
	},
	{
		targetId: "tour-categories",
		title: "Produktauswahl",
		content:
			"Wähle hier die passende Kategorie für Deinen Kunden aus. Im Team-Fokus siehst Du die aktuellen Empfehlungen.",
		icon: LayoutGrid,
		position: "top"
	},
	{
		targetId: "tour-calculator",
		title: "Sparvorteil-Rechner",
		content:
			"Hier kannst Du prüfen, ob und wie viel Dein Kunde spart, wenn er bereits Streamingdienste oder HD-Fernsehen nutzt.",
		icon: Calculator,
		position: "right"
	},
	{
		targetId: "tour-basket",
		title: "Der Warenkorb",
		content:
			"Hier siehst Du die Preisentwicklung über 24 Monate und kannst direkt ein PDF-Angebot für Deinen Kunden erstellen und es direkt per E-Mail versenden.",
		icon: ShoppingBag,
		position: "left"
	},
	{
		targetId: "tour-admin",
		title: "Verwaltung",
		content:
			"Wenn Du Admin-Rechte hast, kannst Du hier Produkte, Preise und Team-Highlights pflegen.",
		icon: ShieldCheck,
		position: "top"
	},
	{
		targetId: "welcome",
		title: "Viel Spaß",
		content:
			"Dieses Tool entwickelt sich kontinuierlich weiter. Feedback ist immer willkommen! Schreib mir direkt auf Teams: @Felix Kinze. Und jetzt: Viel Spaß!",
		icon: Sparkles,
		position: "center"
	}
];

export function OnboardingTutorial() {
	const [currentStep, setCurrentStep] = useState<number | null>(null);
	const [coords, setCoords] = useState<{
		x: number;
		y: number;
		w: number;
		h: number;
	}>({ x: 0, y: 0, w: 0, h: 0 });
	const [isVisible, setIsVisible] = useState(false);
	const [retryCount, setRetryCount] = useState(0);

	useEffect(() => {
		const hasSeen = localStorage.getItem("onboarding_seen_v2");
		if (!hasSeen) {
			const timer = setTimeout(() => {
				setIsVisible(true);
				setCurrentStep(0);
			}, 1500);
			return () => clearTimeout(timer);
		}
	}, []);

	const updateCoords = useCallback(() => {
		if (currentStep === null || currentStep === 0) {
			setCoords({ x: 0, y: 0, w: 0, h: 0 });
			return;
		}

		const step = STEPS[currentStep];
		const el = document.getElementById(step.targetId);

		if (el) {
			const rect = el.getBoundingClientRect();
			// If element is in DOM but has no size yet, retry
			if (rect.width === 0 && retryCount < 5) {
				setTimeout(() => setRetryCount((prev) => prev + 1), 100);
				return;
			}

			setCoords({
				x: rect.left,
				y: rect.top,
				w: rect.width,
				h: rect.height
			});

			const isInViewport =
				rect.top >= 0 &&
				rect.left >= 0 &&
				rect.bottom <= window.innerHeight &&
				rect.right <= window.innerWidth;

			if (!isInViewport) {
				el.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		} else {
			// Reset coords if element is missing to avoid "stuck highlight" from previous step
			setCoords({ x: 0, y: 0, w: 0, h: 0 });

			// Retry a few times in case of route transition / rendering delay
			if (retryCount < 10) {
				setTimeout(() => setRetryCount((prev) => prev + 1), 150);
			}
		}
	}, [currentStep, retryCount]);

	useEffect(() => {
		updateCoords();
		window.addEventListener("resize", updateCoords);
		window.addEventListener("scroll", updateCoords, true);
		return () => {
			window.removeEventListener("resize", updateCoords);
			window.removeEventListener("scroll", updateCoords, true);
		};
	}, [updateCoords]);

	// Reset retry count when changing steps
	useEffect(() => {
		setRetryCount(0);
	}, [currentStep]);

	const handleNext = () => {
		if (currentStep !== null && currentStep < STEPS.length - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			handleEnd();
		}
	};

	const handleBack = () => {
		if (currentStep !== null && currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleEnd = () => {
		localStorage.setItem("onboarding_seen_v2", "true");
		setIsVisible(false);
		setCurrentStep(null);
	};

	if (!isVisible || currentStep === null) return null;

	const step = STEPS[currentStep];
	const Icon = step.icon;

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
			{/* Overlay Background */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="absolute inset-0 bg-black/60 pointer-events-auto"
				onClick={handleEnd}
			/>

			{/* Spotlight */}
			{currentStep > 0 && coords.w > 0 && (
				<motion.div
					initial={false}
					animate={{
						left: coords.x - 12,
						top: coords.y - 12,
						width: coords.w + 24,
						height: coords.h + 24,
						opacity: 1
					}}
					transition={{ type: "spring", damping: 30, stiffness: 200 }}
					className="absolute border-2 border-magenta-500 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-none z-[10000]"
				>
					<div className="absolute inset-0 bg-magenta-500/5 blur-2xl rounded-3xl" />
				</motion.div>
			)}

			{/* Content Card */}
			<motion.div
				initial={{ opacity: 0, scale: 0.9, y: 20 }}
				animate={{
					opacity: 1,
					scale: 1,
					y: 0,
					...(currentStep > 0 && coords.w > 0
						? getCardPosition(step.position, coords)
						: {
								left: "50%",
								top: "50%",
								x: "-50%",
								y: "-50%"
							})
				}}
				transition={{ type: "spring", damping: 25, stiffness: 200 }}
				className="fixed bg-white rounded-[32px] p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] w-[360px] pointer-events-auto z-[10001] border border-zinc-100"
			>
				{/* Progress dots */}
				<div className="flex justify-center gap-1.5 mb-6">
					{STEPS.map((_, i) => (
						<div
							key={i}
							className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? "w-6 bg-magenta-500" : "w-1.5 bg-zinc-100"}`}
						/>
					))}
				</div>

				<div className="flex flex-col items-center text-center gap-5">
					<div className="space-y-2">
						<h3 className="mb-3 mt-3 text-2xl font-extrabold text-[#1a1a2e] tracking-tight leading-tight m-0">
							{step.title}
						</h3>
						<p className="text-[#666] text-[0.9rem] leading-relaxed m-0 px-2 min-h-[3em]">
							{step.content}
						</p>
					</div>

					<div className="flex flex-col gap-3 w-full mt-2">
						<button
							onClick={handleNext}
							className="w-full bg-magenta-500 text-white font-extrabold py-3.5 px-6 rounded-2xl hover:bg-magenta-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-none cursor-pointer shadow-lg shadow-magenta-500/25"
						>
							{currentStep === STEPS.length - 1
								? "Alles klar, los geht's!"
								: "Nächster Schritt"}
							{currentStep < STEPS.length - 1 && (
								<ChevronRight className="w-5 h-5" />
							)}
						</button>

						<div className="flex items-center justify-between px-1">
							{currentStep > 0 ? (
								<button
									onClick={handleBack}
									className="flex items-center gap-1 text-[0.7rem] font-bold text-zinc-400 hover:text-magenta-500 transition-colors bg-transparent border-none cursor-pointer uppercase tracking-widest"
								>
									<ChevronLeft className="w-3.5 h-3.5" />
									Zurück
								</button>
							) : (
								<div />
							)}

							<button
								onClick={handleEnd}
								className="text-[0.7rem] font-bold text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-widest bg-transparent border-none cursor-pointer"
							>
								Tour beenden
							</button>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Mouse Hint */}
			{currentStep === 0 && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 flex items-center gap-2 text-[0.8rem] font-medium"
				>
					<MousePointer2 className="w-4 h-4" />
					<span>Klicke auf den Button um zu starten</span>
				</motion.div>
			)}
		</div>
	);
}

function getCardPosition(
	position: Step["position"],
	coords: { x: number; y: number; w: number; h: number }
) {
	const offset = 24;
	const cardWidth = 360;

	switch (position) {
		case "right":
			return {
				left: Math.min(
					coords.x + coords.w + offset,
					window.innerWidth - cardWidth - 20
				),
				top: Math.min(
					Math.max(coords.y + coords.h / 2, 200),
					window.innerHeight - 200
				),
				y: "-50%"
			};
		case "left":
			return {
				left: Math.max(coords.x - cardWidth - offset, 20),
				top: Math.min(
					Math.max(coords.y + coords.h / 2, 200),
					window.innerHeight - 200
				),
				y: "-50%"
			};
		case "bottom":
			return {
				top: Math.min(coords.y + coords.h + offset, window.innerHeight - 300),
				left: Math.min(
					Math.max(coords.x + coords.w / 2, cardWidth / 2 + 20),
					window.innerWidth - cardWidth / 2 - 20
				),
				x: "-50%"
			};
		case "top":
			return {
				top: Math.max(coords.y - offset, 20),
				left: Math.min(
					Math.max(coords.x + coords.w / 2, cardWidth / 2 + 20),
					window.innerWidth - cardWidth / 2 - 20
				),
				x: "-50%",
				y: "-100%"
			};
		default:
			return {
				left: "50%",
				top: "50%",
				x: "-50%",
				y: "-50%"
			};
	}
}
