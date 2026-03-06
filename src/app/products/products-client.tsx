"use client";

import Link from "next/link";
import { Smartphone, Wifi, Zap, Tv, Router, Star } from "lucide-react";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/features/search/search-bar";
import { NewsCarousel } from "@/components/features/news/news-carousel";
import { trpc } from "@/lib/trpc";
import clsx from "clsx";
import { Skeleton } from "@/components/shared/skeleton";
import { useEffect, useState } from "react";

/* ──────────────────────────────────────────────
   Constants
   ────────────────────────────────────────────── */

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const LS_KEY_FIRST_NAME = "setup-user-firstName";

const CATEGORIES = [
	{
		id: "MOBILE",
		title: "Mobilfunk",
		icon: Smartphone,
		href: "/products/MOBILE",
		color: "#e20074",
		stats: "48 Tarife"
	},
	{
		id: "FIBER",
		title: "Glasfaser",
		icon: Zap,
		href: "/products/FIBER",
		color: "#0090d0",
		stats: "24 Tarife"
	},
	{
		id: "DSL",
		title: "Festnetz",
		icon: Wifi,
		href: "/products/DSL",
		color: "#7b61ff",
		stats: "36 Tarife"
	},
	{
		id: "MAGENTA_TV_OTT",
		title: "MagentaTV",
		icon: Tv,
		href: "/products/MAGENTA_TV_OTT",
		color: "#ff6b00",
		stats: "12 Pakete"
	},
	{
		id: "DEVICE",
		title: "Endgeräte",
		icon: Router,
		href: "/products/DEVICE",
		color: "#00a878",
		stats: "99+ Geräte"
	}
];

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */

function getGreeting(): string {
	const h = new Date().getHours();
	if (h < 12) return "Guten Morgen";
	if (h < 18) return "Guten Tag";
	return "Guten Abend";
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */

export default function ProductsPage() {
	const { data: session, isLoading: sessionLoading } =
		trpc.session.getCurrent.useQuery();
	const { data: allProducts, isLoading: productsLoading } =
		trpc.product.getAllProducts.useQuery();
	const isLoading = sessionLoading || productsLoading;
	const utils = trpc.useUtils();

	const [firstName, setFirstName] = useState("");

	// Load stored first name
	useEffect(() => {
		const stored = localStorage.getItem(LS_KEY_FIRST_NAME) ?? "";
		setFirstName(stored);
	}, []);

	// Prefetch all category products in background for "instant" load
	useEffect(() => {
		if (allProducts) {
			CATEGORIES.forEach((category) => {
				utils.product.getProductsByCategory.prefetch({
					category: category.id
				});
			});
		}
	}, [allProducts, utils]);

	const getStats = (categoryId: string, fallback: string) => {
		if (!allProducts) return fallback;
		const count = allProducts.filter((p) => p.category === categoryId).length;
		if (categoryId === "DEVICE") return `${count} Geräte`;
		if (categoryId === "MAGENTA_TV_OTT") return `${count} Pakete`;
		return `${count} Tarife`;
	};

	const highlightedCategories =
		session?.team?.highlights
			.filter((h) => h.category)
			.map((h) => h.category) || [];

	const greeting = getGreeting();

	return (
		<div className="min-h-full">
			{/* ─── Personalised Header ─── */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
				className="mb-10 pt-6"
			>
				{/* Greeting subtitle */}
				<motion.p
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.05, duration: 0.35, ease: EASE_OUT_EXPO }}
					className="text-[0.85rem] font-bold text-[#bbb] uppercase tracking-[0.12em] mb-2"
				>
					{greeting}
					{firstName ? `, ${firstName}` : ""}
				</motion.p>

				{/* Main heading */}
				<motion.h1
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.08, duration: 0.4, ease: EASE_OUT_EXPO }}
					className="text-[2.4rem] md:text-[3rem] font-extrabold text-[#1a1a2e] mb-0 tracking-tight leading-[1.1]"
				>
					Wähle eine <span className="text-[#e20074]">Kategorie</span>.
				</motion.h1>
			</motion.div>

			{/* ─── Search Bar ─── */}
			<motion.div
				initial={{ opacity: 0, y: 6 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.12, duration: 0.35, ease: EASE_OUT_EXPO }}
			>
				<SearchBar />
			</motion.div>

			{/* ─── Category Cards ─── */}
			{isLoading ? (
				<>
					<div className="grid grid-cols-3 gap-4 mb-4">
						{[1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-[120px] rounded-[20px]" />
						))}
					</div>
					<div className="grid grid-cols-2 gap-4">
						{[4, 5].map((i) => (
							<Skeleton key={i} className="h-[120px] rounded-[20px]" />
						))}
					</div>
				</>
			) : (
				<>
					{/* Row 1 (3 cards) */}
					<div className="grid grid-cols-3 gap-4 mb-4">
						{CATEGORIES.slice(0, 3).map((category, index) => (
							<CategoryCard
								key={category.id}
								category={category}
								index={index}
								isHighlighted={highlightedCategories.includes(category.id)}
								dynamicStats={getStats(category.id, category.stats)}
							/>
						))}
					</div>

					{/* Row 2 (2 cards, wider) */}
					<div className="grid grid-cols-2 gap-4">
						{CATEGORIES.slice(3).map((category, index) => (
							<CategoryCard
								key={category.id}
								category={category}
								index={index + 3}
								isHighlighted={highlightedCategories.includes(category.id)}
								dynamicStats={getStats(category.id, category.stats)}
							/>
						))}
					</div>
				</>
			)}

			{/* ─── News ─── */}
			<NewsCarousel />
		</div>
	);
}

/* ──────────────────────────────────────────────
   CategoryCard
   ────────────────────────────────────────────── */

function CategoryCard({
	category,
	index,
	isHighlighted,
	dynamicStats
}: {
	category: (typeof CATEGORIES)[number];
	index: number;
	isHighlighted?: boolean;
	dynamicStats: string;
}) {
	const utils = trpc.useUtils();

	const handlePrefetch = () => {
		utils.product.getProductsByCategory.prefetch({ category: category.id });
	};

	return (
		<Link
			href={category.href}
			className="no-underline block h-full"
			onMouseEnter={handlePrefetch}
			onFocus={handlePrefetch}
		>
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{
					opacity: 0,
					scale: 0.98,
					transition: { duration: 0.1, delay: 0 }
				}}
				transition={{
					delay: 0.15 + index * 0.04,
					duration: 0.35,
					ease: EASE_OUT_EXPO
				}}
				className={clsx(
					"group relative bg-white border rounded-[20px] h-full flex flex-col justify-center",
					"px-7 py-5 cursor-pointer overflow-hidden",
					"transition-all duration-400 ease-out",
					"hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:border-[#ddd]",
					isHighlighted ? "highlight-glow" : "border-[#e8e8e8]"
				)}
				style={
					{
						"--card-color": category.color
					} as React.CSSProperties
				}
			>
				{/* Hover gradient */}
				<div
					className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[20px]"
					style={{
						background: `linear-gradient(to right, transparent 20%, ${category.color}10 60%, ${category.color}18 100%)`
					}}
				/>

				{/* Content row */}
				<div className="relative z-10 flex items-center justify-between">
					{/* Left: Text */}
					<div className="flex flex-col">
						{isHighlighted && (
							<div className="mb-1 bg-[rgba(255,213,79,0.15)] w-fit text-[#b78900] px-2 py-0.5 rounded text-[0.6rem] font-bold tracking-widest uppercase flex items-center gap-1 border border-[rgba(255,213,79,0.3)] shadow-sm whitespace-nowrap">
								<Star className="w-2.5 h-2.5 fill-current" />
								TEAM-FOKUS
							</div>
						)}
						<h3 className="text-[1.15rem] font-bold text-[#1a1a2e] m-0 leading-tight group-hover:text-(--card-color) transition-colors duration-300">
							{category.title}
						</h3>
						<span className="text-[0.72rem] text-[#b5b5b5] font-medium mt-1 tracking-wide">
							{dynamicStats}
						</span>
					</div>

					{/* Right: Icon */}
					<category.icon
						className="w-8 h-8 transition-all duration-400 text-[#c8c8c8] group-hover:text-(--card-color) group-hover:scale-110"
						strokeWidth={1.5}
					/>
				</div>
			</motion.div>
		</Link>
	);
}
