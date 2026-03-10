"use client";

import { Search, Wifi, Zap, ChevronRight, X, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface SearchBarProps {
	compact?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
	MOBILE: "#e20074",
	FIBER: "#0090d0",
	DSL: "#7b61ff",
	MAGENTA_TV_OTT: "#ff6b00",
	DEVICE: "#00a878",
	ADDON: "#e67e22"
};

const CATEGORY_NAMES: Record<string, string> = {
	MOBILE: "Mobilfunk",
	FIBER: "Glasfaser",
	DSL: "Festnetz",
	MAGENTA_TV_OTT: "MagentaTV",
	DEVICE: "Endgeräte",
	ADDON: "Zubuchoptionen"
};

const CATEGORY_LIST = [
	{ id: "MOBILE", icon: "📱" },
	{ id: "FIBER", icon: "🌐" },
	{ id: "DSL", icon: "🏠" },
	{ id: "MAGENTA_TV_OTT", icon: "📺" },
	{ id: "DEVICE", icon: "💻" }
];

export function SearchBar({ compact = false }: SearchBarProps) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	const { data: productsData } = trpc.product.getAllProducts.useQuery();
	const products = productsData?.items;

	// Filter results
	const filteredCategories = useMemo(() => {
		if (!query.trim()) return CATEGORY_LIST;
		const q = query.toLowerCase();
		return CATEGORY_LIST.filter(
			(c) =>
				CATEGORY_NAMES[c.id]?.toLowerCase().includes(q) ||
				c.id.toLowerCase().includes(q)
		);
	}, [query]);

	const filteredProducts = useMemo(() => {
		if (!products) return [];
		if (!query.trim()) return products.slice(0, 6);
		const q = query.toLowerCase();
		return products.filter(
			(p) =>
				p.name.toLowerCase().includes(q) ||
				p.category.toLowerCase().includes(q) ||
				CATEGORY_NAMES[p.category]?.toLowerCase().includes(q)
		);
	}, [products, query]);

	// Close on click outside
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setOpen(false);
			}
		};
		if (open) document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [open]);

	// Close on Escape
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		if (open) document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [open]);

	// Open via Ctrl+K
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen(true);
				setTimeout(() => inputRef.current?.focus(), 50);
			}
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []);

	const navigate = (path: string) => {
		setOpen(false);
		setQuery("");
		router.push(path);
	};

	const hasResults =
		filteredCategories.length > 0 || filteredProducts.length > 0;

	return (
		<div
			ref={containerRef as any}
			id="tour-search"
			className={`relative z-30 ${compact ? "mb-6" : "mb-14"}`}
		>
			{/* Search input container */}
			<motion.div
				initial={false}
				animate={{
					backgroundColor: open ? "#ffffff" : "#f7f8fa",
					borderColor: open ? "rgba(226, 0, 116, 0.3)" : "#e5e7eb",
					boxShadow: open
						? "0 0 0 3px rgba(226, 0, 116, 0.06), 0 8px 32px rgba(0, 0, 0, 0.12)"
						: "0 1px 3px rgba(0, 0, 0, 0.04)"
				}}
				transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
				className={clsx(
					"relative flex items-center border px-5 z-50 transition-all duration-300",
					compact ? "rounded-xl" : "rounded-2xl",
					open && "rounded-b-none",
					compact ? "py-2.5" : "py-3.5"
				)}
				onClick={() => {
					setOpen(true);
					setTimeout(() => inputRef.current?.focus(), 50);
				}}
			>
				<Search
					className={`mr-3 shrink-0 transition-colors duration-400 ${
						open ? "text-[#e20074]" : "text-[#b0b0b0]"
					} ${compact ? "w-4 h-4" : "w-5 h-5"}`}
				/>
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => setOpen(true)}
					placeholder="Tarif, Produkt oder Kategorie suchen..."
					className={`border-none outline-none w-full font-sans text-[#1a1a2e] bg-transparent placeholder:text-[#b0b0b0] placeholder:font-normal ${
						compact ? "text-[0.9rem]" : "text-[1rem]"
					}`}
				/>
				{open && query && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							setQuery("");
							inputRef.current?.focus();
						}}
						className="p-1 rounded-lg hover:bg-[#f0f0f0] text-[#ccc] hover:text-[#999] transition-colors cursor-pointer border-none bg-transparent"
					>
						<X className="w-4 h-4" />
					</button>
				)}
				{!open && (
					<kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[0.7rem] font-medium text-[#b0b0b0] bg-white border border-[#e5e7eb] rounded-lg ml-3 shrink-0 whitespace-nowrap">
						⌘ K
					</kbd>
				)}
			</motion.div>

			{/* Results dropdown */}
			<AnimatePresence>
				{open && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 z-40 bg-black/10"
							onClick={() => setOpen(false)}
						/>

						{/* Dropdown Content */}
						<motion.div
							initial={{ opacity: 0, y: -6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -6 }}
							transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
							className={`
								absolute left-0 right-0 top-full z-50 bg-white border border-t-0 border-[#e20074]/30
								shadow-[0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden max-h-[420px] overflow-y-auto scrollbar-none
								${compact ? "rounded-b-xl" : "rounded-b-2xl"}
							`}
						>
							{!hasResults && (
								<div className="py-10 text-center">
									<p className="text-[0.85rem] text-[#bbb] m-0">
										Keine Ergebnisse für „{query}"
									</p>
								</div>
							)}

							{/* Categories */}
							{filteredCategories.length > 0 && (
								<div className="p-3 pb-1">
									<div className="text-[0.6rem] uppercase tracking-[0.15em] text-[#ccc] font-semibold px-2 mb-2">
										Kategorien
									</div>
									<div className="flex flex-wrap gap-1.5 px-1">
										{filteredCategories.map((cat) => (
											<button
												key={cat.id}
												onClick={() => navigate(`/products/${cat.id}`)}
												className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f7f8fa] border border-[#eaedf0] hover:border-[#ddd] transition-all duration-150 cursor-pointer text-[0.78rem] font-medium text-[#888] hover:text-[#1a1a2e]"
											>
												<span>{cat.icon}</span>
												<span>{CATEGORY_NAMES[cat.id]}</span>
											</button>
										))}
									</div>
								</div>
							)}

							{/* Products */}
							{filteredProducts.length > 0 && (
								<div className="p-3 pt-2">
									<div className="text-[0.6rem] uppercase tracking-[0.15em] text-[#ccc] font-semibold px-2 mb-2">
										Tarife{" "}
										{query && (
											<span className="normal-case tracking-normal text-[#ddd]">
												· {filteredProducts.length} Ergebnis
												{filteredProducts.length !== 1 ? "se" : ""}
											</span>
										)}
									</div>
									<div className="space-y-0.5">
										{filteredProducts.map((product) => {
											const catColor =
												CATEGORY_COLORS[product.category] || "#e20074";
											return (
												<button
													key={product.id}
													onClick={() =>
														navigate(
															`/products/${product.category}/${product.id}`
														)
													}
													className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f7f8fa] transition-all duration-150 cursor-pointer text-left border-none bg-transparent group"
												>
													{/* Category dot */}
													<div
														className="w-2 h-2 rounded-full shrink-0"
														style={{ backgroundColor: catColor }}
													/>

													{/* Product info */}
													<div className="flex-1 min-w-0">
														<div
															className="text-[0.82rem] font-semibold text-[#1a1a2e] truncate group-hover:text-(--cat-color) transition-colors"
															style={
																{
																	"--cat-color": catColor
																} as React.CSSProperties
															}
														>
															{product.name}
														</div>
														<div className="flex items-center gap-3 mt-0.5">
															<span
																className="text-[0.65rem] font-semibold uppercase tracking-wider"
																style={{ color: catColor }}
															>
																{CATEGORY_NAMES[product.category]}
															</span>
															{product.downloadSpeed && (
																<span className="text-[0.65rem] text-[#bbb] flex items-center gap-1">
																	<Zap className="w-3 h-3" />
																	{product.downloadSpeed} Mbit/s
																</span>
															)}
															{product.dataVolume && (
																<span className="text-[0.65rem] text-[#bbb] flex items-center gap-1">
																	<Wifi className="w-3 h-3" />
																	{product.dataVolume}
																</span>
															)}
														</div>
													</div>

													{/* Price */}
													<div className="text-right shrink-0 ml-2">
														<div className="text-[0.88rem] font-bold text-[#1a1a2e]">
															{product.basePrice.toFixed(2)} €
														</div>
														<div className="text-[0.6rem] text-[#ccc]">
															/Monat
														</div>
													</div>

													<ChevronRight className="w-3.5 h-3.5 text-[#ddd] group-hover:text-[#999] shrink-0 transition-colors" />
												</button>
											);
										})}
									</div>
								</div>
							)}
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
