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
import { trpc } from "@/lib/trpc";
import clsx from "clsx";
import { useImageBrightness } from "@/hooks/use-image-brightness";

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

	const { data: designSettings } = trpc.settings.getDesignSettings.useQuery();
	const headerBg = designSettings?.header_background_image;
	const isDark = useImageBrightness(headerBg);

	const textPrimaryClass = headerBg
		? isDark
			? "text-white"
			: "text-[#1a1a2e]"
		: "text-[#1a1a2e]";
	const textSecondaryClass = headerBg
		? isDark
			? "text-[#e0e0e0]"
			: "text-[#555]"
		: "text-[#666]";

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
			color: "#e20074"
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
			color: "#e20074"
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
			color: "#e20074"
		}
	];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
			className={clsx(
				"relative min-h-[140px] mb-10 flex flex-col xl:flex-row xl:items-start justify-between gap-6 w-full rounded-2xl",
				headerBg ? "p-6 md:p-8" : "p-0"
			)}
		>
			{/* Optional Background Image */}
			{headerBg && (
				<div className="absolute inset-0 z-0 rounded-2xl overflow-hidden pointer-events-none transition-opacity duration-500 shadow-sm border border-[#e8e8e8]/50">
					<div
						className="absolute inset-0 bg-cover bg-center blur-xs scale-[1.05]"
						style={{ backgroundImage: `url(${headerBg})` }}
					/>
					<div
						className={clsx(
							"absolute inset-0 transition-colors duration-500",
							isDark ? "bg-[#1a1a2e]/40" : "bg-white/40"
						)}
					/>
				</div>
			)}

			{/* Left Content */}
			<div className="relative z-10 flex flex-col max-w-2xl mt-1">
				<motion.h1
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3, duration: 0.5 }}
					className={clsx(
						"text-4xl md:text-[3.2rem] font-extrabold mb-4 tracking-tight leading-[1.1] whitespace-nowrap flex items-center gap-4 transition-colors duration-500",
						textPrimaryClass
					)}
				>
					<GreetingIcon
						className="w-10 h-10 md:w-12 md:h-12 text-[#e20074]"
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
					className={clsx(
						"text-[1.1rem] leading-relaxed mb-0 font-medium whitespace-nowrap flex items-center transition-colors duration-500",
						textSecondaryClass
					)}
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
