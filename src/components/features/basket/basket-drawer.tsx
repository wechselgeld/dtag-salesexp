"use client";

import { generateOfferPdf } from "@/lib/pdf-generator";
import { useBasketLogic } from "@/hooks/use-basket-logic";

import { useBasketStore, BasketItem } from "@/hooks/use-basket-store";
import { calculateProductCosts } from "@/hooks/use-cost-calculator";
import { MAGENTA_TV_PACKAGES } from "@/lib/constants/pricing";
import {
	Trash2,
	ShoppingBag,
	ChevronRight,
	ChevronDown,
	Percent,
	Receipt,
	ArrowRight,
	Package,
	Check,
	UserPlus,
	Sparkles,
	Settings2,
	RotateCcw
} from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { CombinedTimeline } from "./combined-timeline";
import { CreditSelector } from "../calculator/credit-selector";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/shared/skeleton";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNewsNotificationStore } from "@/lib/store/news-notification-store";
import { useSettingsStore } from "@/hooks/use-settings-store";

const CATEGORY_COLORS: Record<string, string> = {
	MOBILE: "#e20074",
	FIBER: "#0090d0",
	DSL: "#7b61ff",
	MAGENTA_TV_OTT: "#ff6b00",
	DEVICE: "#00a878",
	ADDON: "#e67e22"
};

const CATEGORY_LABELS: Record<string, string> = {
	MOBILE: "Mobilfunk",
	FIBER: "Glasfaser",
	DSL: "Festnetz",
	MAGENTA_TV_OTT: "MagentaTV",
	ADDON: "Option",
	DEVICE: "Gerät"
};

export function BasketDrawer() {
	const {
		items,
		removeItem,
		restoreItem,
		clearBasket,
		basketCredits,
		setBasketCredits
	} = useBasketStore();
	const router = useRouter();
	const [creditsOpen, setCreditsOpen] = useState(false);
	const [isGenerating, setIsGenerating] = useState<
		"idle" | "generating" | "success"
	>("idle");
	const [deletedItem, setDeletedItem] = useState<{
		item: BasketItem;
		timeoutId: NodeJS.Timeout;
	} | null>(null);

	const { data: availableCredits } = trpc.product.getOneTimeCredits.useQuery();
	const addNotification = useNewsNotificationStore(
		(state) => state.addNotification
	);
	const { clearAfterExport, offerTemplateText } = useSettingsStore();
	const lastNudgeRef = useRef<string | null>(null);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleRemoveItem = (itemToRemove: BasketItem) => {
		removeItem(itemToRemove.id);
		if (deletedItem?.timeoutId) clearTimeout(deletedItem.timeoutId);

		const timeoutId = setTimeout(() => {
			setDeletedItem(null);
		}, 5000);

		setDeletedItem({ item: itemToRemove, timeoutId });
	};

	const handleRestore = () => {
		if (deletedItem) {
			restoreItem(deletedItem.item);
			clearTimeout(deletedItem.timeoutId);
			setDeletedItem(null);
		}
	};

	// Cross-Sell Detector (Fixed + Mobile Advantage)
	useEffect(() => {
		if (items.length === 0) {
			lastNudgeRef.current = null;
			return;
		}

		const hasMobile = items.some((i) => i.product.category === "MOBILE");
		const hasFixed = items.some(
			(i) => i.product.category === "FIBER" || i.product.category === "DSL"
		);

		let nudgeId = null;
		let title = "";
		let content = "";

		if (hasMobile && !hasFixed) {
			nudgeId = "nudge-fixed-missing";
			title = "Preisvorteil durch Festnetz";
			content = "Dein Kunde nutzt Mobilfunk. Biete ihm zusätzlich Festnetz an.";
		} else if (hasFixed && !hasMobile) {
			nudgeId = "nudge-mobile-missing";
			title = "Preisvorteil durch Mobilfunk";
			content = "Dein Kunde nutzt Festnetz. Biete ihm zusätzlich Mobilfunk an.";
		}

		if (nudgeId && lastNudgeRef.current !== nudgeId) {
			addNotification({
				id: nudgeId + Date.now(), // Unique ID for the toast instance
				title,
				content,
				priority: "SALES"
			});
			lastNudgeRef.current = nudgeId;
		} else if (!nudgeId) {
			lastNudgeRef.current = null;
		}
	}, [items, addNotification]);

	const {
		totals,
		combinedSteps,
		groupedOneTimeCosts,
		totalOneTime,
		totalCredits,
		hasDevice,
		deviceShippingCost,
		settings
	} = useBasketLogic();

	const totalMonthly = totals.monthly;

	const handleCreditChange = (ids: string[]) => {
		if (!availableCredits) return;
		const selected = availableCredits.filter((c) => ids.includes(c.id));
		setBasketCredits(
			selected.map((c) => ({ id: c.id, name: c.name, value: c.value }))
		);
	};

	return (
		<aside
			id="tour-basket"
			className="bg-white border-l border-[#eaedf0] flex flex-col z-10 overflow-hidden h-full relative"
		>
			{/* Header */}
			<div className="px-5 py-4 border-b border-[#eaedf0]">
				<div className="flex items-center justify-between">
					<h2 className="m-0 text-[0.88rem] text-[#1a1a2e] font-bold tracking-tight">
						Zusammenfassung
					</h2>
					{items.length > 0 && (
						<span className="text-[0.65rem] font-semibold text-[#e20074] bg-[#e20074]/[0.06] px-2 py-0.5 rounded-full">
							{items.length} {items.length === 1 ? "Produkt" : "Produkte"}
						</span>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 px-4 py-4 overflow-y-auto scrollbar-none">
				{!isMounted ? (
					<div className="flex flex-col gap-4">
						<Skeleton className="h-[120px] rounded-xl" />
						<Skeleton className="h-10 rounded-xl" />
						<div className="flex flex-col gap-3">
							{[1, 2].map((i) => (
								<Skeleton key={i} className="h-28 rounded-xl" />
							))}
						</div>
					</div>
				) : (
					<>
						{/* Chart */}
						{items.length > 0 && (
							<div className="mb-4 bg-[#f7f8fa] rounded-xl p-3.5">
								<CombinedTimeline />
							</div>
						)}

						{/* Credits */}
						<div className="mb-4">
							<button
								className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#eaedf0] rounded-xl text-left transition-all duration-200 hover:border-[#ddd] cursor-pointer"
								onClick={() => setCreditsOpen(!creditsOpen)}
							>
								<Percent className="w-3.5 h-3.5 text-[#00a878]" />
								<span className="flex-1 text-[0.78rem] font-semibold text-[#1a1a2e]">
									Gutschriften
								</span>
								{totalCredits > 0 && (
									<span className="text-[0.72rem] text-[#00a878] font-semibold mr-1">
										−{totalCredits.toFixed(2)} €
									</span>
								)}
								<ChevronDown
									className={clsx(
										"w-3.5 h-3.5 text-[#bbb] transition-transform duration-200",
										creditsOpen && "rotate-180"
									)}
								/>
							</button>
							{creditsOpen && (
								<div className="mt-2 pl-1">
									<CreditSelector
										basketCredits={basketCredits}
										setBasketCredits={setBasketCredits}
									/>
								</div>
							)}
						</div>

						{/* Items */}
						<div className="flex flex-col gap-3">
							<AnimatePresence mode="popLayout">
								{items.length === 0 ? (
									<motion.div
										key="empty"
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ duration: 0.2 }}
										className="text-center py-14 flex flex-col items-center gap-2.5"
									>
										<div className="w-12 h-12 rounded-2xl bg-[#f7f8fa] flex items-center justify-center">
											<ShoppingBag className="w-5 h-5 text-[#ddd]" />
										</div>
										<div>
											<p className="text-[0.82rem] font-medium text-[#bbb] m-0">
												Noch keine Produkte
											</p>
											<p className="text-[0.72rem] text-[#ddd] m-0 mt-0.5">
												Tarife aus den Kategorien wählen
											</p>
										</div>
									</motion.div>
								) : (
									items.map((item) => (
										<BasketItemCard
											key={item.id}
											item={item}
											removeItem={() => handleRemoveItem(item)}
										/>
									))
								)}
							</AnimatePresence>
						</div>
					</>
				)}
			</div>

			{/* Footer */}
			<div className="w-full bg-white border-t border-[#eaedf0] z-20 shrink-0">
				{!isMounted ? (
					<div className="p-4 flex flex-col gap-3">
						<Skeleton className="h-24 w-full rounded-xl" />
						<Skeleton className="h-12 w-full rounded-xl" />
					</div>
				) : items.length > 0 ? (
					<div className="p-4">
						{/* Costs */}
						<div className="space-y-1.5 mb-3">
							<div className="flex justify-between items-center">
								<span className="text-[0.75rem] text-[#aaa]">Einmalig</span>
								<span
									className={clsx(
										"text-[0.8rem] font-semibold flex items-center overflow-hidden h-[1.2rem]",
										totalOneTime < 0 ? "text-[#00a878]" : "text-[#1a1a2e]"
									)}
								>
									{totalOneTime < 0 && (
										<span className="mr-[2px]">Gutschrift i. H. v.</span>
									)}
									<AnimatePresence mode="popLayout">
										<motion.span
											key={totalOneTime}
											initial={{ opacity: 0, y: -15 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 15 }}
											transition={{
												duration: 0.2,
												type: "spring",
												stiffness: 300,
												damping: 25
											}}
											className="inline-block"
										>
											{Math.abs(totalOneTime).toFixed(2)}
										</motion.span>
									</AnimatePresence>
									<span className="ml-[3px]">
										€
										{Object.keys(groupedOneTimeCosts).length > 0 ||
										hasDevice ||
										totalCredits > 0
											? ", aus:"
											: ""}
									</span>
								</span>
							</div>

							{Object.entries(groupedOneTimeCosts).map(
								([name, cost]: [string, number]) => (
									<div
										key={name}
										className="flex justify-between items-center text-[0.75rem] text-[#aaa] mt-1 pr-1.5"
									>
										<span>{name}</span>
										<span>{cost.toFixed(2)} €</span>
									</div>
								)
							)}

							{totalCredits > 0 && (
								<div className="flex justify-between items-center text-[0.75rem] text-[#00a878] mt-1 pr-1.5">
									<span>Gutschrift</span>
									<span>−{totalCredits.toFixed(2)} €</span>
								</div>
							)}
						</div>

						{/* Monthly total */}
						<div className="bg-[#1a1a2e] text-white px-4 py-3 rounded-xl flex flex-col gap-2 mb-3">
							<div className="flex justify-between items-center mb-1">
								<span className="text-[0.65rem] uppercase tracking-wider text-white/50 font-medium">
									Kostenübersicht (24 Monate)
								</span>
							</div>
							{combinedSteps.map(
								(
									step: { start: number; end: number; total: number },
									idx: number
								) => (
									<div key={idx} className="flex justify-between items-center">
										<span className="text-[0.75rem] text-white/80">
											{step.start === step.end
												? `Monat ${step.start}`
												: `Monat ${step.start} - ${step.end}`}
										</span>
										<span className="text-[0.95rem] font-bold tracking-tight flex items-center">
											{step.total.toFixed(2)}
											<span className="ml-[3px] text-[0.75rem] font-normal text-white/70">
												€
											</span>
										</span>
									</div>
								)
							)}

							<div className="border-t border-white/10 mt-1 pt-2 flex justify-between items-center">
								<div className="flex flex-col">
									<span className="text-[0.65rem] uppercase tracking-wider text-white/50 font-medium">
										Ø Monatlich
									</span>
									<span className="text-[0.6rem] text-white/40 font-medium">
										ca. {items.length > 0 ? totals.daily.toFixed(2) : "0.00"} €
										am Tag
									</span>
								</div>
								<span className="text-[1.1rem] font-extrabold tracking-tight flex items-center leading-none">
									{totalMonthly.toFixed(2)}
									<span className="ml-[3px] text-[0.8rem] font-normal text-white/70">
										€
									</span>
								</span>
							</div>
						</div>

						{/* Actions */}
						<div className="flex gap-2">
							<button
								onClick={clearBasket}
								className="px-3.5 py-2.5 rounded-xl bg-[#f7f8fa] text-[0.78rem] text-[#999] hover:bg-[#fee2e2] hover:text-[#dc2626] font-medium transition-all duration-200 border border-[#eaedf0] hover:border-[#fca5a5] cursor-pointer active:scale-95"
							>
								Leeren
							</button>
							<button
								onClick={async () => {
									setIsGenerating("generating");
									await generateOfferPdf(items, basketCredits);

									const subject = encodeURIComponent(
										"Ihr persönliches Angebot der Telekom"
									);
									const bodyText = encodeURIComponent(offerTemplateText);

									window.location.href = `mailto:Kunden-E-Mail hier einfügen?subject=${subject}&body=${bodyText}`;

									setIsGenerating("success");
									if (clearAfterExport) {
										setTimeout(() => clearBasket(), 500);
									}
									setTimeout(() => setIsGenerating("idle"), 10000);
								}}
								disabled={isGenerating !== "idle"}
								className={clsx(
									"flex-1 py-2.5 rounded-xl text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-[0.82rem] cursor-pointer active:scale-95",
									isGenerating === "idle" && "bg-[#e20074] hover:bg-[#c70066]",
									isGenerating === "generating" &&
										"bg-[#ff69b4] cursor-not-allowed",
									isGenerating === "success" && "bg-[#00a878]"
								)}
							>
								{isGenerating === "idle" && (
									<>
										Angebot erstellen
										<ArrowRight className="w-3.5 h-3.5" />
									</>
								)}
								{isGenerating === "generating" && <>Wird generiert...</>}
								{isGenerating === "success" && (
									<>
										Outlook geöffnet
										<Check className="w-3.5 h-3.5" />
									</>
								)}
							</button>
						</div>
					</div>
				) : (
					<div className="p-4 text-center">
						<p className="text-[0.75rem] text-[#ccc] m-0">
							Produkte hinzufügen, um ein Angebot zu erstellen.
						</p>
					</div>
				)}

				{/* Undo Toast */}
				<AnimatePresence>
					{deletedItem && (
						<motion.div
							initial={{ opacity: 0, y: 50, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 20, scale: 0.95 }}
							className="absolute bottom-20 left-4 right-4 bg-[#1a1a2e] text-white p-3 rounded-xl shadow-xl border border-white/10 flex items-center justify-between z-50"
						>
							<div className="flex flex-col">
								<span className="text-[0.7rem] text-white/60 font-medium">
									Gelöscht
								</span>
								<span className="text-[0.85rem] font-bold line-clamp-1">
									{deletedItem.item.product.name}
								</span>
							</div>
							<button
								onClick={handleRestore}
								className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-[0.8rem] font-semibold active:scale-95 cursor-pointer"
							>
								<RotateCcw className="w-3.5 h-3.5" />
								Rückgängig
							</button>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</aside>
	);
}

function BasketItemCard({
	item,
	removeItem
}: {
	item: BasketItem;
	removeItem: (id: string) => void;
}) {
	const router = useRouter();
	const calculation = calculateProductCosts({
		product: item.product,
		businessCase: item.config.businessCase,
		magentaTVPackage: item.config.magentaTVPackage,
		selectedSpecialPriceIds: item.config.selectedSpecialPriceIds,
		selectedAddonIds: item.config.selectedAddonIds,
		vouchers: item.config.vouchers,
		hardwarePurchaseType: item.config.hardwarePurchaseType,
		plusKartenCount: item.config.plusKartenCount
	});

	const catColor = CATEGORY_COLORS[item.product.category] || "#e20074";
	const catLabel =
		CATEGORY_LABELS[item.product.category] || item.product.category;

	return (
		<motion.div
			layout
			initial={{ opacity: 0, scale: 0.9, y: 10 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.9, y: -10 }}
			transition={{ type: "spring", damping: 25, stiffness: 300 }}
			className="bg-white border border-[#eaedf0] rounded-xl p-3.5 transition-all duration-200 hover:border-[#ddd] group relative overflow-hidden cursor-pointer"
			onClick={() =>
				router.push(
					`/products/${item.product.category}/${item.product.id}?basketItemId=${item.id}`
				)
			}
		>
			{/* Category gradient */}
			<div
				className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
				style={{
					background: `linear-gradient(to right, transparent 40%, ${catColor}08 70%, ${catColor}12 100%)`
				}}
			/>

			<div className="relative z-10">
				{/* Header */}
				<div className="flex items-start justify-between mb-2">
					<div className="flex-1 min-w-0">
						<span
							className="text-[0.6rem] font-semibold uppercase tracking-wider"
							style={{ color: catColor }}
						>
							{catLabel}
						</span>
						<h4 className="font-bold text-[0.85rem] text-[#1a1a2e] leading-tight m-0 mt-0.5">
							{item.product.name}
							{item.config.magentaTVPackage
								? ` mit ${MAGENTA_TV_PACKAGES[item.config.magentaTVPackage].name}`
								: ""}
						</h4>
					</div>

					{/* Delete */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							removeItem(item.id);
						}}
						className="w-6 h-6 rounded-lg flex items-center justify-center bg-transparent hover:bg-[#fee2e2] text-[#ccc] hover:text-[#dc2626] transition-all duration-150 border-none cursor-pointer p-0 opacity-0 group-hover:opacity-100 shrink-0 ml-2 active:scale-95"
						title="Entfernen"
					>
						<Trash2 className="w-3 h-3" />
					</button>
				</div>

				{/* Unlimited Badge */}
				{calculation.hasUnlimitedAdvantage && (
					<div className="mb-3 inline-flex items-center gap-1 bg-[#e20074]/10 text-[#e20074] px-2 py-0.5 rounded-md text-[0.65rem] font-bold uppercase tracking-wider">
						<Sparkles className="w-2.5 h-2.5" />
						Kombivorteil: Unlimited GB
					</div>
				)}

				{/* Selected Addons */}
				{item.config.selectedAddonIds?.length > 0 &&
					item.product.compatibleAddons && (
						<div className="flex flex-col gap-1.5 mb-3">
							{item.config.selectedAddonIds.map((tierId) => {
								const addon = item.product.compatibleAddons?.find((a) =>
									(a.tiers || []).some((t) => t.id === tierId)
								);
								if (!addon) return null;
								const tier = (addon.tiers || []).find((t) => t.id === tierId);
								if (!tier) return null;
								return (
									<div
										key={tierId}
										className="flex items-center justify-between text-[0.72rem] font-medium"
									>
										<div
											className="flex items-center gap-1.5"
											style={{ color: catColor }}
										>
											<Package className="w-3.5 h-3.5" />
											<span>
												{addon.name}
												{addon.tiers.length > 1 ? ` - ${tier.name}` : ""}
											</span>
										</div>
										<span className="opacity-70 font-semibold text-[#1a1a2e]">
											+{tier.price.toFixed(2)} €
										</span>
									</div>
								);
							})}
						</div>
					)}

				{/* PlusKarten */}
				{item.config.plusKartenCount !== undefined &&
					item.config.plusKartenCount > 0 && (
						<div className="flex flex-col gap-1.5 mb-3">
							<div className="flex items-center justify-between text-[0.72rem] font-medium">
								<div
									className="flex items-center gap-1.5"
									style={{ color: catColor }}
								>
									<UserPlus className="w-3.5 h-3.5" />
									<span>{item.config.plusKartenCount}x PlusKarte</span>
								</div>
								<span className="opacity-70 font-semibold text-[#1a1a2e]">
									+{calculation.plusKartenCost.toFixed(2)} €
								</span>
							</div>
						</div>
					)}

				{/* Price config */}
				<div className="flex items-center gap-3">
					<div className="flex-1 flex items-baseline gap-1">
						{item.product.category === "DEVICE" ? (
							item.config.hardwarePurchaseType === "BUY" ? (
								<>
									<span className="text-[1.1rem] font-extrabold text-[#1a1a2e] leading-none tracking-tight">
										{(item.product as any).purchasePrice?.toFixed(2) || "0.00"}
									</span>
									<span className="text-[0.65rem] font-semibold text-[#888] leading-none">
										€ Kauf
									</span>
								</>
							) : (
								<>
									<span className="text-[1.1rem] font-extrabold text-[#1a1a2e] leading-none tracking-tight">
										{(item.product as any).rentalPrice?.toFixed(2) ||
											item.product.basePrice.toFixed(2)}
									</span>
									<span className="text-[0.65rem] font-semibold text-[#888] leading-none">
										€/mtl. (Miete)
									</span>
								</>
							)
						) : (
							<>
								<span className="text-[1.1rem] font-extrabold text-[#1a1a2e] leading-none tracking-tight">
									Ø {calculation.averageMonthlyCost.toFixed(2)}
								</span>
								<span className="text-[0.65rem] font-semibold text-[#888] leading-none">
									€/mtl.
								</span>
							</>
						)}
					</div>
					{(calculation.basePrice !== calculation.averageMonthlyCost ||
						item.config.selectedAddonIds?.length > 0 ||
						item.config.selectedSpecialPriceIds?.length > 0 ||
						item.config.vouchers?.length > 0 ||
						item.config.magentaTVPackage) && (
						<div className="flex items-center gap-1.5 px-2 py-1 rounded-[6px] bg-[#f7f8fa] border border-[#eaedf0]/60">
							<Settings2 className="w-[10px] h-[10px] text-[#aaa]" />
							<span className="text-[0.62rem] font-medium text-[#888] uppercase tracking-wide">
								Konfiguriert
							</span>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
}
