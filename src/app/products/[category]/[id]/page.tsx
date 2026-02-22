"use client";

import { BusinessCaseSelector } from "@/components/calculator/business-case-selector";
import { CostTimeline } from "@/components/calculator/cost-timeline";
import { SpecialPriceSelector } from "@/components/calculator/special-price-selector";
import { AddonSelector } from "@/components/calculator/addon-selector";
import {
	useCostCalculator,
	MAGENTA_TV_PACKAGES,
	MagentaTVPackageKey,
	type BusinessCase
} from "@/hooks/use-cost-calculator";
import { trpc } from "@/lib/trpc";
import {
	ArrowLeft,
	Check,
	Wifi,
	Zap,
	Star,
	ShoppingCart,
	ChevronRight,
	Info,
	UserPlus,
	Smartphone,
	Plus,
	Minus,
	Sparkles
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, Suspense } from "react";
import clsx from "clsx";
import { useBasketStore } from "@/hooks/use-basket-store";
import { SearchBar } from "@/components/search-bar";
import { motion } from "framer-motion";

const CATEGORY_COLORS: Record<string, string> = {
	MOBILE: "#e20074",
	FIBER: "#0090d0",
	DSL: "#7b61ff",
	MAGENTA_TV_OTT: "#ff6b00",
	DEVICE: "#00a878"
};
const CATEGORY_NAMES: Record<string, string> = {
	MOBILE: "Mobilfunk",
	FIBER: "Glasfaser",
	DSL: "DSL",
	MAGENTA_TV_OTT: "MagentaTV",
	DEVICE: "Geräte"
};

function ProductPageContent() {
	const params = useParams();
	const id = params.id as string;
	const category = params.category as string;

	const searchParams = useSearchParams();
	const basketItemId = searchParams.get("basketItemId");

	const { items, updateItem, addItem, setIsOpen } = useBasketStore();

	const catColor = CATEGORY_COLORS[category] || "#e20074";
	const catName = CATEGORY_NAMES[category] || category;

	const { data: product, isLoading } = trpc.product.getProductById.useQuery({
		id
	});
	const { data: session } = trpc.session.getCurrent.useQuery();

	const {
		businessCase,
		setBusinessCase,
		selectedSpecialPriceIds,
		setSelectedSpecialPriceIds,
		isMagentaTVSelected,
		magentaTVPackage,
		setMagentaTVPackage,
		selectedAddonIds,
		setSelectedAddonIds,
		calculation,
		hardwarePurchaseType,
		setHardwarePurchaseType,
		plusKartenCount,
		setPlusKartenCount
	} = useCostCalculator(product);

	useEffect(() => {
		if (basketItemId && product && items) {
			const item = items.find((i) => i.id === basketItemId);
			if (item) {
				setBusinessCase(item.config.businessCase);
				setSelectedSpecialPriceIds(item.config.selectedSpecialPriceIds);
				setMagentaTVPackage(item.config.magentaTVPackage);
				setSelectedAddonIds(item.config.selectedAddonIds);
				if (item.config.hardwarePurchaseType) {
					setHardwarePurchaseType(item.config.hardwarePurchaseType);
				}
				if (item.config.plusKartenCount !== undefined) {
					setPlusKartenCount(item.config.plusKartenCount);
				}
			}
		}
	}, [
		basketItemId,
		product,
		items,
		setBusinessCase,
		setSelectedSpecialPriceIds,
		setMagentaTVPackage,
		setSelectedAddonIds,
		setPlusKartenCount,
		setHardwarePurchaseType
	]);

	if (isLoading || !product) {
		return (
			<div className="min-h-full flex items-center justify-center">
				<div className="animate-pulse flex flex-col items-center gap-4">
					<div className="h-8 w-64 bg-[#f0f0f0] rounded-xl" />
					<div className="h-4 w-32 bg-[#f0f0f0] rounded-lg" />
				</div>
			</div>
		);
	}

	const handleAddToBasket = () => {
		const config = {
			businessCase,
			selectedSpecialPriceIds,
			magentaTVPackage,
			selectedAddonIds,
			vouchers: [],
			credits: [],
			hardwarePurchaseType,
			plusKartenCount
		};

		if (basketItemId) {
			updateItem(basketItemId, config);
			setIsOpen(true);
		} else {
			addItem(product, config);
		}
	};

	// Merged product name
	const displayName = magentaTVPackage
		? `${product.name} mit ${MAGENTA_TV_PACKAGES[magentaTVPackage].name}`
		: product.name;

	return (
		<div className="min-h-full">
			{/* Search Bar */}
			<div className="pt-2">
				<SearchBar compact />
			</div>

			{/* Breadcrumb-style back */}
			<Link
				href={`/products/${category}`}
				className="inline-flex items-center gap-1.5 text-[#999] hover:text-[#e20074] transition-colors mb-6 text-[0.8rem] font-semibold uppercase tracking-wider"
			>
				<ArrowLeft className="w-4 h-4" />
				<span style={{ color: catColor }}>{catName} Tarife</span>
			</Link>

			{/* ── Product Hero Card ── */}
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.05, duration: 0.35 }}
				className="bg-white rounded-2xl border border-[#eaedf0] p-7 mb-6 relative overflow-hidden"
			>
				{/* Category gradient */}
				<div
					className="absolute inset-0 pointer-events-none rounded-2xl"
					style={{
						background: `linear-gradient(to right, transparent 40%, ${catColor}08 70%, ${catColor}14 100%)`
					}}
				/>

				<div className="relative z-10 flex items-start justify-between">
					{/* Left: Product info */}
					<div>
						<div className="flex flex-col gap-2 mb-4">
							{session?.team?.highlights.some(
								(h) =>
									h.productId === product.id || h.category === product.category
							) && (
								<div className="w-fit bg-[rgba(255,213,79,0.15)] text-[#b78900] px-3 py-1 rounded-md text-[0.7rem] font-bold tracking-widest uppercase flex items-center gap-1.5 border border-[rgba(255,213,79,0.3)] shadow-sm whitespace-nowrap">
									<Star className="w-3.5 h-3.5 fill-current" />
									TEAM-FOKUS
								</div>
							)}
							<h1 className="text-[1.8rem] md:text-[2.2rem] font-extrabold text-[#1a1a2e] tracking-tight leading-[1.1] m-0">
								{displayName}
							</h1>
						</div>

						{/* Specs */}
						<div className="flex flex-wrap items-center gap-5">
							{product.dataVolume && (
								<div className="flex items-center gap-2">
									<Wifi className="w-4 h-4" style={{ color: catColor }} />
									<span className="text-[0.85rem] font-semibold text-[#555]">
										{product.dataVolume}
									</span>
								</div>
							)}
							{product.downloadSpeed && (
								<div className="flex items-center gap-2">
									<Zap className="w-4 h-4" style={{ color: catColor }} />
									<span className="text-[0.85rem] font-semibold text-[#555]">
										{product.downloadSpeed} Mbit/s
									</span>
								</div>
							)}
							{product.contractDuration && (
								<span className="text-[0.72rem] font-medium text-[#b0b0b0] uppercase tracking-wider">
									{product.contractDuration}M Laufzeit
								</span>
							)}
						</div>

						{/* Sales Arguments */}
						{product.salesArguments && product.salesArguments.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-5">
								{product.salesArguments.map((arg: any) => (
									<div
										key={arg.id}
										className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.75rem] font-medium border"
										style={{
											borderColor: `${catColor}30`,
											backgroundColor: `${catColor}08`,
											color: catColor
										}}
									>
										<span
											className="w-1.5 h-1.5 rounded-full"
											style={{ backgroundColor: catColor }}
										/>
										{arg.text}
									</div>
								))}
							</div>
						)}
					</div>

					{/* Right: Price highlight */}
					<div className="text-right shrink-0 ml-6 flex flex-col items-end">
						<div className="text-[0.65rem] font-semibold text-[#aaa] uppercase tracking-wider mb-1">
							Ab
						</div>
						{product.category === "DEVICE" ? (
							<>
								{(product as any).purchasePrice > 0 && (
									<div className="text-[0.85rem] font-bold text-[#1a1a2e] mb-1">
										Kauf: {(product as any).purchasePrice.toFixed(2)} €
									</div>
								)}
								{((product as any).rentalPrice || product.basePrice) > 0 && (
									<div className="flex flex-col items-end">
										<div
											className="text-[1.8rem] font-extrabold tracking-tight leading-none"
											style={{ color: catColor }}
										>
											{(
												(product as any).rentalPrice || product.basePrice
											).toFixed(2)}{" "}
											€
										</div>
										<div className="text-[0.72rem] text-[#b0b0b0] font-medium mt-0.5">
											/Monat (Miete)
										</div>
									</div>
								)}
							</>
						) : (
							<>
								<div
									className="text-[2rem] font-extrabold tracking-tight leading-none"
									style={{ color: catColor }}
								>
									{product.basePrice.toFixed(2)} €
								</div>
								<div className="text-[0.72rem] text-[#b0b0b0] font-medium mt-0.5">
									/Monat
								</div>
							</>
						)}
					</div>
				</div>
			</motion.div>

			{/* ── Configuration + Summary ── */}
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start pb-10">
				{/* LEFT: Configuration Flow */}
				<div className="space-y-4">
					{/* Hardware Kaufart (Only for DEVICE) */}
					{product.category === "DEVICE" && (
						<ConfigSection
							title="Kaufoption wählen"
							catColor={catColor}
							index={0}
						>
							{!items.some(
								(i) => i.product.category === "DEVICE" && i.id !== basketItemId
							) && (
								<div className="mb-4 bg-[#00a8781c] border border-[#00a8787c] text-[#00a878] px-4 py-3 rounded-xl text-[1.3rem] flex items-start gap-3">
									<Info
										className="w-8 h-8 transition-all duration-400 text-[#00a878] group-hover:text-[var(--card-color)] group-hover:scale-110"
										strokeWidth={1.5}
									/>
									<div className="leading-snug mt-0.5">
										Für Hardware fällt einmalig eine{" "}
										<strong>Bereitstellungspauschale i. H. v. 6,95 €</strong>{" "}
										an.
									</div>
								</div>
							)}
							<div className="grid grid-cols-2 gap-3">
								<button
									onClick={() => setHardwarePurchaseType("RENT")}
									className={clsx(
										"flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer",
										hardwarePurchaseType === "RENT"
											? "bg-white shadow-sm"
											: "bg-[#f7f8fa] hover:bg-white hover:border-[#ddd]"
									)}
									style={{
										borderColor:
											hardwarePurchaseType === "RENT" ? catColor : "#eaedf0"
									}}
								>
									<span className="text-[0.8rem] font-bold text-[#1a1a2e] mb-1">
										Mieten
									</span>
									<span className="text-[0.7rem] text-[#999]">
										{product.rentalPrice?.toFixed(2) ||
											product.basePrice.toFixed(2)}{" "}
										€ mtl.
									</span>
								</button>
								<button
									onClick={() => setHardwarePurchaseType("BUY")}
									className={clsx(
										"flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer",
										hardwarePurchaseType === "BUY"
											? "bg-white shadow-sm"
											: "bg-[#f7f8fa] hover:bg-white hover:border-[#ddd]"
									)}
									style={{
										borderColor:
											hardwarePurchaseType === "BUY" ? catColor : "#eaedf0"
									}}
								>
									<span className="text-[0.8rem] font-bold text-[#1a1a2e] mb-1">
										Einmalzahlung
									</span>
									<span className="text-[0.7rem] text-[#999]">
										{product.purchasePrice?.toFixed(2) || "0.00"} €
									</span>
								</button>
							</div>
						</ConfigSection>
					)}

					{/* Business Case (Hide for DEVICE) */}
					{product.category !== "DEVICE" && (
						<ConfigSection
							title="Vertragsart wählen"
							catColor={catColor}
							index={0}
						>
							<BusinessCaseSelector
								product={product}
								selectedCase={businessCase}
								onChange={setBusinessCase}
								accentColor={catColor}
								highlightedCases={
									session?.team?.highlights
										.filter((h) => h.businessCase)
										.map((h) => h.businessCase as BusinessCase) || []
								}
							/>
						</ConfigSection>
					)}

					{/* MagentaTV Option — Toggle + Package Selector */}
					{product.allowMagentaTV && (
						<ConfigSection title="Entertainment" catColor={catColor} index={1}>
							{/* Main Toggle */}
							<div
								onClick={() => {
									if (isMagentaTVSelected) {
										setMagentaTVPackage(null);
									} else {
										setMagentaTVPackage("smart");
									}
								}}
								className={clsx(
									"rounded-xl p-4 border-2 cursor-pointer transition-all duration-200 flex items-center gap-4 group",
									session?.team?.highlights.some(
										(h) => h.category === "MAGENTA_TV_OTT"
									) &&
										!isMagentaTVSelected &&
										"highlight-glow bg-white"
								)}
								style={{
									borderColor: isMagentaTVSelected ? catColor : "#eaedf0",
									backgroundColor: isMagentaTVSelected
										? `${catColor}06`
										: "white"
								}}
							>
								{/* TV+ Icon */}
								<div
									className="w-10 h-10 rounded-lg shrink-0 font-extrabold flex items-center justify-center italic tracking-tighter text-[0.75rem] transition-all duration-200"
									style={{
										backgroundColor: isMagentaTVSelected
											? catColor
											: "transparent",
										color: isMagentaTVSelected ? "white" : catColor,
										border: isMagentaTVSelected
											? "none"
											: `2px solid ${catColor}`
									}}
								>
									M TV
								</div>

								<div className="flex-1 flex flex-col justify-center items-start">
									<div className="flex items-center gap-2 mb-0.5">
										<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] m-0">
											MagentaTV dazubuchen
										</h3>
										{session?.team?.highlights.some(
											(h) => h.category === "MAGENTA_TV_OTT"
										) &&
											!isMagentaTVSelected && (
												<div className="bg-[#fffcf0] text-[#b78900] px-1.5 py-0.5 rounded text-[0.55rem] font-bold tracking-widest uppercase flex items-center gap-0.5 border border-[#fde68a] shadow-sm whitespace-nowrap">
													<Star className="w-2.5 h-2.5 fill-[#fde047]" />
													TEAM-FOKUS
												</div>
											)}
									</div>
									<p className="text-[0.78rem] text-[#999] m-0">
										ab +10,00€ mtl. · Kombivorteil
									</p>
								</div>

								{/* Toggle circle */}
								<div
									className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
									style={{
										borderColor: isMagentaTVSelected ? catColor : "#ddd",
										backgroundColor: isMagentaTVSelected
											? catColor
											: "transparent"
									}}
								>
									{isMagentaTVSelected && (
										<Check className="w-3 h-3 text-white" strokeWidth={3} />
									)}
								</div>
							</div>

							{/* Package Options (shown when toggled on) */}
							{isMagentaTVSelected && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									transition={{ duration: 0.25 }}
									className="mt-3 space-y-2"
								>
									{(
										Object.entries(MAGENTA_TV_PACKAGES) as [
											MagentaTVPackageKey,
											(typeof MAGENTA_TV_PACKAGES)[MagentaTVPackageKey]
										][]
									).map(([key, pkg]) => {
										const isSelected = magentaTVPackage === key;
										return (
											<div
												key={key}
												onClick={() => setMagentaTVPackage(key)}
												className="rounded-xl p-3.5 border cursor-pointer transition-all duration-200"
												style={{
													borderColor: isSelected ? catColor : "#eaedf0",
													backgroundColor: isSelected
														? `${catColor}06`
														: "#fafafa"
												}}
											>
												<div className="flex items-center gap-3">
													{/* Radio */}
													<div
														className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
														style={{
															borderColor: isSelected ? catColor : "#ccc",
															backgroundColor: isSelected
																? catColor
																: "transparent"
														}}
													>
														{isSelected && (
															<div className="w-[8px] h-[8px] rounded-full bg-white" />
														)}
													</div>

													<div className="flex-1 min-w-0">
														<span className="text-[0.85rem] font-semibold text-[#1a1a2e]">
															{pkg.shortName}
														</span>
													</div>

													<span
														className="text-[0.82rem] font-bold shrink-0"
														style={{
															color: isSelected ? catColor : "#888"
														}}
													>
														+{pkg.price.toFixed(2)} €
													</span>
												</div>

												{/* Features (shown when selected) */}
												{isSelected && (
													<motion.div
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														transition={{ duration: 0.15 }}
														className="mt-2.5 pt-2.5 border-t border-dashed"
														style={{
															borderColor: `${catColor}25`
														}}
													>
														<ul className="space-y-1 m-0 p-0 list-none">
															{pkg.features.map((feature, i) => (
																<li
																	key={i}
																	className="flex items-start gap-2 text-[0.75rem] text-[#666]"
																>
																	<Check
																		className="w-3 h-3 shrink-0 mt-0.5"
																		style={{
																			color: catColor
																		}}
																		strokeWidth={2.5}
																	/>
																	{feature}
																</li>
															))}
														</ul>
													</motion.div>
												)}
											</div>
										);
									})}
								</motion.div>
							)}
						</ConfigSection>
					)}

					{/* Special Prices */}
					<ConfigSection
						title="Aktionen & Rabatte"
						catColor={catColor}
						index={2}
					>
						<SpecialPriceSelector
							specialPrices={product.specialPrices}
							selectedIds={selectedSpecialPriceIds}
							onChange={setSelectedSpecialPriceIds}
							isMagentaTVSelected={isMagentaTVSelected}
							businessCase={businessCase}
							accentColor={catColor}
						/>
					</ConfigSection>

					{/* Add-ons */}
					{product.compatibleAddons && product.compatibleAddons.length > 0 && (
						<ConfigSection title="Zusatzoptionen" catColor={catColor} index={3}>
							<AddonSelector
								addons={product.compatibleAddons}
								selectedIds={selectedAddonIds}
								onChange={setSelectedAddonIds}
								isMagentaTVSelected={isMagentaTVSelected}
								catColor={catColor}
							/>
						</ConfigSection>
					)}
				</div>

				{/* RIGHT: Sticky Summary */}
				<div className="lg:sticky lg:top-6 space-y-4">
					{/* Cost Summary */}
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.35 }}
						className="bg-white rounded-2xl border border-[#eaedf0] p-5 hidden lg:block"
					>
						<CostTimeline calculation={calculation} accentColor={catColor} />
					</motion.div>

					{/* Price Trivialization Card */}
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.32, duration: 0.35 }}
						className="bg-[#f7f8fa] rounded-2xl p-5 border border-[#eaedf0] flex flex-col items-center gap-1.5"
					>
						<span className="text-[0.65rem] text-[#999] uppercase font-bold tracking-widest">
							Täglicher Preis
						</span>
						<span
							className="text-[1.5rem] font-black tracking-tight"
							style={{ color: catColor }}
						>
							{calculation.dailyPriceTrivialization}
						</span>
						<p className="text-[0.7rem] text-[#888] font-medium text-center leading-relaxed m-0 px-2">
							Das sind weniger als die Kosten für einen Kaffee am Tag – für
							volles Entertainment.
						</p>
					</motion.div>

					{/* CTA Button */}
					<motion.button
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.35, duration: 0.35 }}
						onClick={handleAddToBasket}
						className="w-full py-3.5 rounded-2xl text-white font-bold text-[0.95rem] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] active:scale-[0.98]"
						style={{ backgroundColor: catColor }}
					>
						<ShoppingCart className="w-4.5 h-4.5" />
						{basketItemId ? "Konfiguration aktualisieren" : "In den Warenkorb"}
						<ChevronRight className="w-4 h-4 opacity-60" />
					</motion.button>

					<p className="text-[0.7rem] text-center text-[#c0c0c0]">
						{basketItemId
							? "Konfiguration wird im Warenkorb aktualisiert."
							: "Produkt konfigurieren und zum Angebot hinzufügen."}
					</p>

					{/* Unlimited Advantage Toast */}
					{calculation.hasUnlimitedAdvantage && (
						<motion.div
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							className="mt-4 w-full py-3.5 rounded-2xl text-white font-bold text-[0.95rem] flex items-center justify-center gap-2.5 relative overflow-hidden shadow-[0_10px_25px_-5px_rgba(226,0,116,0.4)]"
							style={{ backgroundColor: "#e20074" }}
						>
							<div className="absolute inset-0 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
							<Sparkles className="w-4.5 h-4.5 shrink-0" />
							<span>Der PlusKarten-Vorteil wurde aktiviert.</span>
						</motion.div>
					)}

					{/* Nudges */}
					{category === "MOBILE" && (
						<motion.div
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4, duration: 0.35 }}
							className="mt-4 bg-[#e20074]/5 border border-[#e20074]/20 rounded-2xl p-4 flex gap-4 items-start relative overflow-hidden"
						>
							<div className="absolute top-0 right-0 w-24 h-24 bg-[#e20074]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
							<div className="w-8 h-8 rounded-full bg-[#e20074]/10 flex items-center justify-center shrink-0 mt-0.5">
								<UserPlus className="w-4 h-4 text-[#e20074]" />
							</div>
							<div className="flex-1">
								<h4 className="text-[0.85rem] font-bold text-[#e20074] mb-1 leading-tight">
									Biete eine PlusKarte an.
								</h4>
								<p className="text-[0.75rem] text-[#1a1a2e]/70 leading-relaxed m-0 mb-3">
									Jede weitere Person surft für nur einen Bruchteil des Preises!{" "}
									<br />
									<strong>1. Karte 19,95 €; ab 2. Karte 9,95 €</strong>
								</p>

								<div className="flex items-center gap-3">
									<button
										onClick={() =>
											setPlusKartenCount(Math.max(0, plusKartenCount - 1))
										}
										className="w-7 h-7 rounded-full bg-white border border-[#eaedf0] flex items-center justify-center hover:border-[#e20074] hover:text-[#e20074] transition-colors"
									>
										<Minus className="w-3.5 h-3.5" />
									</button>
									<span className="font-extrabold text-[#1a1a2e] text-[0.95rem] w-4 text-center">
										{plusKartenCount}
									</span>
									<button
										onClick={() => setPlusKartenCount(plusKartenCount + 1)}
										className="w-7 h-7 rounded-full bg-white border border-[#eaedf0] flex items-center justify-center hover:border-[#e20074] hover:text-[#e20074] transition-colors"
									>
										<Plus className="w-3.5 h-3.5" />
									</button>
								</div>
							</div>
						</motion.div>
					)}

					{(category === "FIBER" || category === "DSL") && (
						<motion.div
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4, duration: 0.35 }}
							className="mt-4 bg-[#e20074]/5 border border-[#e20074]/20 rounded-2xl p-4 flex gap-4 items-start relative overflow-hidden"
						>
							<div className="absolute top-0 right-0 w-24 h-24 bg-[#e20074]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
							<div className="w-8 h-8 rounded-full bg-[#e20074]/10 flex items-center justify-center shrink-0 mt-0.5">
								<Smartphone className="w-4 h-4 text-[#e20074]" />
							</div>
							<div>
								<h4 className="text-[0.85rem] font-bold text-[#e20074] mb-1 leading-tight">
									Biete Mobilfunk an.
								</h4>
								<p className="text-[0.75rem] text-[#1a1a2e]/70 leading-relaxed m-0 mb-3">
									Nutzt der Kunde schon Mobilfunk? Sprich ihn aktiv darauf an.
								</p>
								<Link
									href="/products/MOBILE"
									className="inline-flex items-center gap-1.5 text-[0.75rem] font-bold text-[#e20074] hover:text-[#c70066] transition-colors"
								>
									Mobilfunktarif finden <ChevronRight className="w-3.5 h-3.5" />
								</Link>
							</div>
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
}

export default function ProductDetailPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-full flex items-center justify-center">
					<div className="animate-pulse flex flex-col items-center gap-4">
						<div className="h-8 w-64 bg-[#f0f0f0] rounded-xl" />
						<div className="h-4 w-32 bg-[#f0f0f0] rounded-lg" />
					</div>
				</div>
			}
		>
			<ProductPageContent />
		</Suspense>
	);
}

/* ── Reusable config section wrapper ── */
function ConfigSection({
	title,
	catColor,
	index,
	children
}: {
	title: string;
	catColor: string;
	index: number;
	children: React.ReactNode;
}) {
	return (
		<motion.section
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 + index * 0.08, duration: 0.35 }}
			className="bg-white rounded-2xl p-5 border border-[#eaedf0] relative overflow-hidden"
		>
			{/* Subtle gradient */}
			<div
				className="absolute inset-0 pointer-events-none rounded-2xl"
				style={{
					background: `linear-gradient(to right, transparent 50%, ${catColor}05 80%, ${catColor}0a 100%)`
				}}
			/>

			<div className="relative z-10">
				<h2 className="text-[1rem] font-bold text-[#1a1a2e] mb-4">{title}</h2>
				{children}
			</div>
		</motion.section>
	);
}
