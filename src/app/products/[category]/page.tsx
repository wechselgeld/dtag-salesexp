"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
	ArrowLeft,
	Star,
	Wifi,
	Zap,
	ChevronDown,
	MessageSquareQuote,
	Users,
	GraduationCap,
	HeartHandshake,
	Gamepad2,
	Briefcase,
	Asterisk
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import clsx from "clsx";
import { SearchBar } from "@/components/search-bar";

export default function ProductListPage() {
	const params = useParams();
	const category = params.category as string;
	const [expandedArgId, setExpandedArgId] = useState<string | null>(null);
	const [activeFilterId, setActiveFilterId] = useState<string | null>(null);

	const utils = trpc.useUtils();

	const { data: session } = trpc.session.getCurrent.useQuery();

	const { data: products, isLoading } =
		trpc.product.getProductsByCategory.useQuery({
			category
		});

	const categoryNames: Record<string, string> = {
		MOBILE: "Mobilfunk",
		FIBER: "Glasfaser",
		DSL: "Festnetz",
		MAGENTA_TV_OTT: "MagentaTV",
		DEVICE: "Endgeräte",
		ADDON: "Zubuchoptionen"
	};

	const categoryColors: Record<string, string> = {
		MOBILE: "#e20074",
		FIBER: "#0090d0",
		DSL: "#7b61ff",
		MAGENTA_TV_OTT: "#ff6b00",
		DEVICE: "#00a878",
		ADDON: "#e67e22"
	};

	const catColor = categoryColors[category] || "#e20074";

	const FILTER_PRESETS = [
		{
			id: "student",
			label: "Student & Young",
			icon: GraduationCap,
			categories: ["MOBILE", "DSL", "FIBER"],
			pitch:
				"Perfekt für junge Leute: Viel Datenvolumen oder hohe Geschwindigkeiten zum kleinen Preis. Optimal für alle unter 28 Jahren. Nutze hierfür die Young-Konditionen!",
			predicate: (p: any) => p.targetGroups?.includes("student")
		},
		{
			id: "family",
			label: "Familie mit Kids",
			icon: Users,
			categories: ["MOBILE", "DSL", "FIBER"],
			pitch:
				"Hervorragendes Netz für alle Geräte, ideal für Streaming, Home-Schooling und günstige PlusKarten für die Kids. Geeignet für mehrere gleichzeitige Nutzer.",
			predicate: (p: any) => p.targetGroups?.includes("family")
		},
		{
			id: "senior",
			label: "Ältere Personen",
			icon: HeartHandshake,
			categories: ["MOBILE", "DSL", "FIBER"],
			pitch:
				"Einfach, sicher, verlässlich: Die Basis-Tarife ohne Schnickschnack. Perfekt für gelegentliches Surfen und Telefonate mit den Liebsten.",
			predicate: (p: any) => p.targetGroups?.includes("senior")
		},
		{
			id: "power",
			label: "Stream/Gaming",
			icon: Gamepad2,
			categories: ["DSL", "FIBER", "MOBILE"],
			pitch:
				"Viel Datenvolumen, maximale Geschwindigkeit und beste Latenz für grenzenloses Online-Gaming und 4K-Streaming.",
			predicate: (p: any) => p.targetGroups?.includes("power")
		},
		{
			id: "business",
			label: "Home-Office",
			icon: Briefcase,
			categories: ["DSL", "FIBER"],
			pitch:
				"Stabiles Netz für Video-Calls: Höchste Zuverlässigkeit und starker Upload für reibungsloses Arbeiten von Zuhause.",
			predicate: (p: any) => p.targetGroups?.includes("business")
		}
	];

	const visibleFilters = FILTER_PRESETS.filter((f) =>
		f.categories.some((c) => c.toUpperCase() === category?.toUpperCase())
	);
	const activeFilter = FILTER_PRESETS.find((f) => f.id === activeFilterId);

	const filteredProducts =
		products?.filter((p) => {
			if (!activeFilter) return true;
			return activeFilter.predicate(p);
		}) || [];

	return (
		<div className="min-h-full">
			{/* Search Bar */}
			<div className="pt-2">
				<SearchBar compact />
			</div>

			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
				className="bg-transparent pb-8"
			>
				<Link
					href="/products"
					className="inline-flex items-center gap-2 text-[#999] hover:text-[#e20074] transition-colors mb-5 text-[0.85rem] font-medium"
				>
					<ArrowLeft className="w-4 h-4" />
					<span className="text-[0.8rem] font-semibold uppercase tracking-wider text-[#e20074]">
						Kategorieauswahl
					</span>
				</Link>

				<h1 className="text-3xl font-extrabold text-[#262626] tracking-tight mb-2">
					{categoryNames[category] || category}
				</h1>
				<p className="text-[0.95rem] text-[#6a6a6a]">
					{filteredProducts.length || 0} verfügbare Tarife in dieser Kategorie.
				</p>
			</motion.div>

			{/* Filters */}
			{visibleFilters.length > 0 && (
				<div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
					<div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
						{visibleFilters.map((filter) => (
							<button
								key={filter.id}
								onClick={() =>
									setActiveFilterId(
										activeFilterId === filter.id ? null : filter.id
									)
								}
								className={clsx(
									"flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all duration-200 cursor-pointer outline-none",
									activeFilterId === filter.id
										? "text-white shadow-md"
										: "bg-white border-[#eaedf0] text-[#666] hover:bg-[#f7f8fa] hover:border-[#ddd]"
								)}
								style={{
									backgroundColor:
										activeFilterId === filter.id ? catColor : undefined,
									borderColor:
										activeFilterId === filter.id ? catColor : undefined
								}}
							>
								<filter.icon
									className={clsx(
										"w-4 h-4",
										activeFilterId === filter.id ? "opacity-100" : "opacity-60"
									)}
								/>
								<span className="font-semibold text-[0.8rem]">
									{filter.label}
								</span>
							</button>
						))}
					</div>

					<AnimatePresence mode="popLayout">
						{activeFilter && (
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: -10 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: -10 }}
								className="border px-5 py-4 rounded-2xl flex items-start gap-3 shadow-sm"
								style={{
									backgroundColor: `${catColor}1C`,
									borderColor: `${catColor}59`,
									color: catColor
								}}
							>
								<Asterisk
									className="w-10 h-10 mt-0.5 shrink-0"
									strokeWidth={1.5}
								/>
								<div>
									<h4 className="font-bold text-[0.85rem] mb-1">
										Empfehlung für: {activeFilter.label}
									</h4>
									<p className="text-[0.85rem] m-0 leading-relaxed opacity-90">
										{activeFilter.pitch}
									</p>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			)}

			{/* Product Grid */}
			<div className="pb-10">
				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-64 bg-white rounded-2xl border border-[#eaedf0] animate-pulse"
							/>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<AnimatePresence mode="popLayout">
							{filteredProducts.map((product) => {
								const isFocused = session?.team?.highlights.some(
									(h) => h.productId === product.id
								);

								return (
									<motion.div
										key={product.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										style={{ "--cat-color": catColor } as React.CSSProperties}
										className={clsx(
											"bg-white rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group border relative cursor-pointer overflow-hidden",
											isFocused ? "highlight-glow" : "border-[#eaedf0]"
										)}
									>
										{/* Gradient overlay - hover only */}
										<div
											className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
											style={{
												background: `linear-gradient(to right, transparent 20%, ${catColor}10 60%, ${catColor}18 100%)`
											}}
										/>

										{/* Top section */}
										<div className="relative z-10">
											{/* Empfehlung badge */}
											{isFocused && (
												<div className="mb-2">
													<div className="inline-flex bg-[rgba(255,213,79,0.15)] text-[#b78900] px-2 py-0.5 rounded text-[0.65rem] font-bold tracking-wide uppercase items-center gap-1 whitespace-nowrap">
														<Star className="w-3 h-3 fill-current" />
														TEAM-FOKUS
													</div>
												</div>
											)}

											{/* Title + Duration on same line */}
											<div className="flex items-baseline justify-between mb-3">
												<h3
													className={clsx(
														"text-[1.15rem] font-bold transition-colors duration-300 leading-tight m-0",
														isFocused
															? ""
															: "text-[#1a1a2e] group-hover:text-[var(--cat-color)]"
													)}
													style={isFocused ? { color: catColor } : undefined}
												>
													{product.name}
												</h3>
												{product.contractDuration && (
													<span className="text-[0.68rem] font-medium text-[#c0c0c0] uppercase tracking-wider ml-3 shrink-0">
														{product.contractDuration}M
													</span>
												)}
											</div>

											{/* Specs - compact inline */}
											<div className="flex items-center gap-4 text-[0.8rem] text-[#888]">
												{product.dataVolume && (
													<div className="flex items-center gap-1.5">
														<Wifi className="w-3.5 h-3.5 text-[#bbb]" />
														<span className="font-medium text-[#666]">
															{product.dataVolume}
														</span>
													</div>
												)}
												{product.downloadSpeed && (
													<div className="flex items-center gap-1.5">
														<Zap className="w-3.5 h-3.5 text-[#bbb]" />
														<span className="font-medium text-[#666]">
															{product.downloadSpeed} Mbit/s
														</span>
													</div>
												)}
											</div>

											{/* Sales Arguments (Collapsible) */}
											{(product as any).salesArguments &&
												(product as any).salesArguments.length > 0 && (
													<div className="mt-1 pt-1">
														<button
															onClick={(e) => {
																e.preventDefault();
																e.stopPropagation();
																setExpandedArgId(
																	expandedArgId === product.id
																		? null
																		: product.id
																);
															}}
															className="flex items-center justify-between w-full text-[0.8rem] font-medium transition-colors cursor-pointer group/args"
															style={{ color: catColor }}
														>
															<span className="flex items-center gap-1.5">
																<MessageSquareQuote className="w-3.5 h-3.5 opacity-80" />
																{(product as any).salesArguments.length}{" "}
																Verkaufsargument(e)
															</span>
															<ChevronDown
																className={clsx(
																	"w-3.5 h-3.5 transition-transform duration-300",
																	expandedArgId === product.id
																		? "rotate-180"
																		: ""
																)}
															/>
														</button>

														<AnimatePresence>
															{expandedArgId === product.id && (
																<motion.div
																	initial={{ height: 0, opacity: 0 }}
																	animate={{ height: "auto", opacity: 1 }}
																	exit={{ height: 0, opacity: 0 }}
																	transition={{ duration: 0.2 }}
																	className="overflow-hidden"
																>
																	<div className="pt-3 pb-1 flex flex-col gap-2">
																		{(product as any).salesArguments.map(
																			(arg: any) => (
																				<div
																					key={arg.id}
																					className="flex items-start gap-2 text-[0.75rem] bg-[#f7f8fa] p-2 rounded-lg border border-[#eaedf0] text-[#1a1a2e]"
																				>
																					<span
																						className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
																						style={{
																							backgroundColor: catColor
																						}}
																					/>
																					<span>{arg.text}</span>
																				</div>
																			)
																		)}
																	</div>
																</motion.div>
															)}
														</AnimatePresence>
													</div>
												)}
										</div>

										{/* Bottom: Price + CTA */}
										<div className="relative z-10 flex justify-between items-end mt-2 pt-2 border-t border-[#f0f0f0]">
											<div>
												{product.category === "DEVICE" ? (
													<div className="flex flex-col mb-1">
														{(product as any).purchasePrice > 0 && (
															<div className="text-[0.8rem] font-bold text-[#1a1a2e] leading-snug">
																Kauf:{" "}
																{(product as any).purchasePrice.toFixed(2)} €
															</div>
														)}
														{((product as any).rentalPrice ||
															product.basePrice) > 0 && (
															<div className="flex items-baseline mt-0.5">
																<span className="text-[1.35rem] font-extrabold text-[#1a1a2e] tracking-tight leading-none">
																	{(
																		(product as any).rentalPrice ||
																		product.basePrice
																	).toFixed(2)}{" "}
																	€
																</span>
																<span className="text-[0.7rem] text-[#b0b0b0] font-medium ml-1">
																	/Miete
																</span>
															</div>
														)}
													</div>
												) : (
													<>
														<span className="text-[1.8rem] font-extrabold text-[#1a1a2e] tracking-tight leading-none">
															{product.basePrice.toFixed(2)} €
														</span>
														<span className="text-[0.7rem] text-[#b0b0b0] font-medium ml-1">
															/Monat
														</span>
													</>
												)}
											</div>

											<Link
												href={`/products/${category}/${product.id}`}
												className="block"
												onMouseEnter={() =>
													utils.product.getProductById.prefetch({
														id: product.id
													})
												}
												onFocus={() =>
													utils.product.getProductById.prefetch({
														id: product.id
													})
												}
											>
												<button
													className={clsx(
														"px-4 py-2 rounded-xl font-semibold text-[0.85rem] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer",
														isFocused
															? "bg-[#e20074] text-white hover:bg-[#c2005c] hover:shadow-[0_4px_12px_rgba(226,0,116,0.2)]"
															: "bg-[#f7f8fa] border border-[#eaedf0] text-[#666] hover:bg-[#1a1a2e] hover:text-white hover:border-[#1a1a2e]"
													)}
												>
													Wählen
													<ArrowLeft className="w-3.5 h-3.5 rotate-180" />
												</button>
											</Link>
										</div>
									</motion.div>
								);
							})}
						</AnimatePresence>
					</div>
				)}
			</div>
		</div>
	);
}
