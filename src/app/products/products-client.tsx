"use client";

import Link from "next/link";
import { Smartphone, Wifi, Zap, Tv, Router, Star } from "lucide-react";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/features/search/search-bar";
import { HeroHeader } from "@/components/features/products/hero-header";
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
   Main Component
   ────────────────────────────────────────────── */

export default function ProductsPage() {
	const { data: session, isLoading: sessionLoading } =
		trpc.session.getCurrent.useQuery();
	const { data: allProductsData, isLoading: productsLoading } =
		trpc.product.getAllProducts.useQuery();
	const allProducts = allProductsData?.items || [];
	const { data: designSettings } = trpc.settings.getDesignSettings.useQuery();
	const isLoading = sessionLoading || productsLoading;
	const utils = trpc.useUtils();

	const [firstName, setFirstName] = useState("");
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
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

	const categoryStats = CATEGORIES.map((c) => ({
		name: c.title,
		count: allProducts
			? allProducts.filter((p) => p.category === c.id).length
			: parseInt(c.stats) || 0,
		color: c.color
	}));

	return (
		<div className="min-h-full">
			{/* ─── Hero Header ─── */}
			<HeroHeader
				firstName={isMounted ? firstName : ""}
				teamName={session?.team?.name}
				productsCount={allProducts?.length}
				categories={categoryStats}
			/>

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
								backgroundImage={
									designSettings?.[`category_image_${category.id}`] || null
								}
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
								backgroundImage={
									designSettings?.[`category_image_${category.id}`] || null
								}
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
	dynamicStats,
	backgroundImage
}: {
	category: (typeof CATEGORIES)[number];
	index: number;
	isHighlighted?: boolean;
	dynamicStats: string;
	backgroundImage?: string | null;
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
					"group relative bg-linear-to-br from-white to-[#fcfafc] border rounded-[20px] h-full flex flex-col justify-center",
					"px-7 py-5 cursor-pointer overflow-hidden",
					"transition-all duration-400 ease-out",
					"hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:border-[#ddd]",
					isHighlighted ? "highlight-glow" : "border-[#e8e8e8]"
				)}
				style={
					{
						"--card-color": category.color,
						borderColor: isHighlighted ? category.color : undefined
					} as React.CSSProperties
				}
			>
				{/* Hover gradient - fallback if no image */}
				{!backgroundImage && (
					<div
						className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[20px]"
						style={{
							background: `linear-gradient(to right, transparent 20%, ${category.color}10 60%, ${category.color}18 100%)`
						}}
					/>
				)}

				{/* Hover Background Image Overlay */}
				{backgroundImage && (
					<div className="absolute -inset-0.5 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[20px] overflow-hidden">
						<div
							className="absolute inset-0 bg-cover bg-center blur-[1.5px] scale-110"
							style={{ backgroundImage: `url(${backgroundImage})` }}
						/>
						<div className="absolute inset-0 bg-[#1a1a2e]/30" />
					</div>
				)}

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
						<h3
							className={clsx(
								"text-[1.15rem] font-bold m-0 leading-tight transition-colors duration-300",
								backgroundImage
									? "text-[#1a1a2e] group-hover:text-white"
									: "text-[#1a1a2e] group-hover:text-(--card-color)"
							)}
						>
							{category.title}
						</h3>
						<span
							className={clsx(
								"text-[0.72rem] font-medium mt-1 tracking-wide transition-colors duration-300",
								backgroundImage
									? "text-[#b5b5b5] group-hover:text-[#eee]"
									: "text-[#b5b5b5]"
							)}
						>
							{dynamicStats}
						</span>
					</div>

					{/* Right: Icon */}
					<category.icon
						className={clsx(
							"w-8 h-8 transition-all duration-400 group-hover:scale-110",
							backgroundImage
								? "text-[#c8c8c8] group-hover:text-white"
								: "text-[#c8c8c8] group-hover:text-(--card-color)"
						)}
						strokeWidth={1.5}
					/>
				</div>
			</motion.div>
		</Link>
	);
}
