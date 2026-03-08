"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
	Clock,
	CalendarDays,
	TrendingUp,
	Building2,
	Sunrise,
	Sun,
	Moon
} from "lucide-react";
import { useEffect, useState } from "react";

interface HeroHeaderProps {
	firstName: string;
	teamName?: string;
	productsCount?: number;
	categories?: { name: string; count: number; color?: string }[];
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function getTimeContext(): { label: string; Icon: any } {
	const h = new Date().getHours();
	if (h < 12) return { label: "Guten Morgen", Icon: Sunrise };
	if (h < 18) return { label: "Guten Tag", Icon: Sun };
	return { label: "Guten Abend", Icon: Moon };
}

export function HeroHeader({
	firstName,
	teamName,
	productsCount,
	categories
}: HeroHeaderProps) {
	const [time, setTime] = useState<Date | null>(null);
	const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);

	// Client-side only time to avoid hydration mismatch
	useEffect(() => {
		setTime(new Date());
		const timer = setInterval(() => setTime(new Date()), 60000); // update every minute
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		if (!categories || categories.length === 0) return;
		const timer = setInterval(() => {
			setActiveCategoryIdx((prev) => (prev + 1) % categories.length);
		}, 3500);
		return () => clearInterval(timer);
	}, [categories]);

	const currentCategory = categories?.[activeCategoryIdx];
	const { label: greeting, Icon: GreetingIcon } = getTimeContext();

	const insights = [
		{
			icon: CalendarDays,
			label: "Datum",
			value: time
				? new Intl.DateTimeFormat("de-DE", {
						weekday: "short",
						day: "2-digit",
						month: "short"
					}).format(time)
				: "...",
			color: "#0090d0"
		},
		{
			icon: Clock,
			label: "Uhrzeit",
			value: time
				? new Intl.DateTimeFormat("de-DE", {
						hour: "2-digit",
						minute: "2-digit"
					}).format(time) + " Uhr"
				: "...",
			color: "#7b61ff"
		},
		{
			icon: Building2,
			label: "Team",
			value: teamName || "Sales Experience",
			color: "#e20074"
		},
		{
			icon: TrendingUp,
			label: "Portfolio",
			value: productsCount ? `${productsCount} Produkte` : "Lade...",
			color: "#00a878"
		}
	];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
			className="relative mb-10 flex flex-col xl:flex-row xl:items-start justify-between gap-6 w-full"
		>
			{/* Left Content */}
			<div className="relative z-10 flex flex-col max-w-2xl">
				<motion.h1
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3, duration: 0.5 }}
					className="text-4xl md:text-[3.2rem] font-extrabold text-[#1a1a2e] mb-4 tracking-tight leading-[1.1] whitespace-nowrap flex items-center gap-4"
				>
					<GreetingIcon
						className="w-10 h-10 md:w-14 md:h-14 text-[#e20074]"
						strokeWidth={2.5}
					/>
					<span>
						{greeting},{" "}
						<span className="text-[#e20074]">{firstName || "Agent"}</span>!
					</span>
				</motion.h1>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4, duration: 0.5 }}
					className="text-[1.1rem] text-[#666] leading-relaxed mb-0 font-medium whitespace-nowrap flex items-center"
				>
					<span className="mr-1.5">Wähle zwischen</span>
					{categories && categories.length > 0 ? (
						<AnimatePresence mode="popLayout">
							<motion.span
								key={activeCategoryIdx}
								layout="position"
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ duration: 0.3, ease: "easeInOut" }}
								className="font-bold inline-block mr-0.5"
								style={{ color: currentCategory?.color || "#e20074" }}
							>
								{currentCategory?.count}{" "}
								{currentCategory?.name === "Endgeräte"
									? "Endgeräten"
									: currentCategory?.name}
							</motion.span>
						</AnimatePresence>
					) : (
						<span className="text-[#e20074] font-bold">verschiedenen</span>
					)}
					<motion.span layout="position">
						{currentCategory?.name === "Endgeräte" ? "." : "-Produkten."}
					</motion.span>
				</motion.div>
			</div>

			{/* Right Content - Info Widgets */}
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.4, duration: 0.5 }}
				className="relative z-10 grid grid-cols-2 gap-4 shrink-0 w-full xl:w-auto mt-6 xl:mt-0"
			>
				{insights.map((item, i) => (
					<div
						key={i}
						className="group relative bg-white border border-[#e8e8e8] rounded-[20px] h-[88px] flex flex-col justify-center px-5 py-3 overflow-hidden transition-all duration-400 ease-out hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:border-[#ddd] xl:min-w-[180px]"
						style={{ "--card-color": item.color } as React.CSSProperties}
					>
						{/* Hover gradient */}
						<div
							className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[20px]"
							style={{
								background: `linear-gradient(to right, transparent 20%, ${item.color}10 60%, ${item.color}18 100%)`
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
			</motion.div>
		</motion.div>
	);
}
