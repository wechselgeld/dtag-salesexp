'use client';

import {
	generateOfferPdf,
} from '@/lib/pdf-generator';
import {
	useBasketLogic,
} from '@/hooks/use-basket-logic';

import type {
	BasketItem,
} from '@/hooks/use-basket-store';
import {
	useBasketStore,
} from '@/hooks/use-basket-store';
import {
	calculateProductCosts,
} from '@/hooks/use-cost-calculator';
import {
	MAGENTA_TV_PACKAGES,
} from '@/lib/constants/pricing';
import type {
	PricingSettings,
} from '@/types/product';
import {
	Trash2,
	ShoppingBag,
	ChevronDown,
	Percent,
	ArrowRight,
	Package,
	Check,
	UserPlus,
	Sparkles,
	Edit2,
	Tag,
	AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';
import {
	useRouter, useParams, usePathname,
} from 'next/navigation';
import {
	CombinedTimeline,
} from './combined-timeline';
import {
	AnimatedNumber,
} from '@/components/shared/animated-number';
import {
	CreditSelector,
} from '../calculator/credit-selector';
import {
	trpc,
} from '@/lib/trpc';
import {
	Skeleton,
} from '@/components/shared/skeleton';
import {
	useState, useEffect,
} from 'react';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	useSettingsStore,
} from '@/hooks/use-settings-store';
import {
	Tooltip,
} from '@/components/shared/ui/tooltip';

const CATEGORY_COLORS: Record<string, string> = {
	MOBILE: '#e20074',
	FIBER: '#0090d0',
	DSL: '#7b61ff',
	MAGENTA_TV_OTT: '#ff6b00',
	DEVICE: '#00a878',
	ADDON: '#e67e22',
};

const CATEGORY_LABELS: Record<string, string> = {
	MOBILE: 'Mobilfunk',
	FIBER: 'Glasfaser',
	DSL: 'Festnetz',
	MAGENTA_TV_OTT: 'MagentaTV',
	ADDON: 'Option',
	DEVICE: 'Gerät',
};

const EMPTY_NOTICES = [
	'Hier drin herrscht gähnende Leere. Lass uns das ändern!',
	'Dein Warenkorb wartet auf Gesellschaft – er ist einsam.',
	'Stille... zu viel Stille hier im Warenkorb.',
	'Der Warenkorb hat Hunger. Füttere ihn mit Tarifen!',
	'Bist Du nur zum Gucken hier? Pack was rein!',
	'Noch ist hier viel Platz für tolle Angebote.',
	'Einsamer Warenkorb bietet liebevolles Zuhause für kleine Tarife.',
	'Suchst Du noch oder klickst Du schon?',
	'Hier drin ist es so weiß, man braucht fast eine Sonnenbrille. Füg ein paar Produkte hinzu!',
	'Hier ist noch ganz viel Luft nach oben (und nach unten).',
];

export function BasketDrawer() {
	const {
		items, removeItem, clearBasket, basketCredits, setBasketCredits,
	} =
		useBasketStore();
	const [
		creditsOpen,
		setCreditsOpen,
	] = useState(false);
	const [
		isGenerating,
		setIsGenerating,
	] = useState<
		'idle' | 'generating' | 'success'
	>('idle');

	/* const {
		data: availableCredits,
	} = trpc.product.getOneTimeCredits.useQuery(); */
	const {
		data: session,
	} = trpc.session.getCurrent.useQuery();
	const {
		clearAfterExport, offerTemplateText,
	} = useSettingsStore();
	const [
		isMounted,
		setIsMounted,
	] = useState(false);
	const [
		randomNotice,
		setRandomNotice,
	] = useState('');

	const teamEmail = session?.team?.email || 'team06@telekom.de';
	const salesRepName = session
		? [
 session.firstName,
session.lastName,
].filter(Boolean).join(' ')
		: '';

	const params = useParams();
	const pathname = usePathname();
	const categoryFromUrl = (params?.category as string) || (pathname.match(/\/products\/([^/]+)/)?.[1]);
	const catColor = categoryFromUrl
		? CATEGORY_COLORS[categoryFromUrl.toUpperCase()] || '#e20074'
		: '#e20074';


	useEffect(() => {
		const timer = setTimeout(() => {
			setIsMounted(true);
			setRandomNotice(
				EMPTY_NOTICES[Math.floor(Math.random() * EMPTY_NOTICES.length)],
			);
		}, 0);
		return () => clearTimeout(timer);
	}, [
	]);

	const {
		totals,
		combinedSteps,
		groupedOneTimeCosts,
		totalOneTime,
		totalCredits,
		hasDevice,
		settings,
	} = useBasketLogic();

	const totalMonthly = totals.monthly;

	return (
		<aside
			id="tour-basket"
			className="bg-white border-l border-[#eaedf0] flex flex-col z-10 overflow-hidden h-full relative"
		>
			{/* Header */}
			{items.length > 0 && (
				<div className="px-5 py-4 border-b border-[#eaedf0]">
					<div className="flex items-center justify-between">
						<h2 className="m-0 text-[0.88rem] text-[#1a1a2e] font-bold tracking-tight">
							Zusammenfassung
						</h2>
						<span
							className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full transition-all duration-500"
							style={{
								color: catColor,
								backgroundColor: `${catColor}10`,
							}}
						>
							{items.length} {items.length === 1 ? 'Produkt' : 'Produkte'}
						</span>
					</div>
				</div>
			)}

			{/* Content */}
			<div className="flex-1 px-4 py-4 overflow-y-auto scrollbar-none">
				{!isMounted ? (
					<div className="flex flex-col gap-4">
						<Skeleton className="h-[120px] rounded-xl" />
						<Skeleton className="h-10 rounded-xl" />
						<div className="flex flex-col gap-3">
							{[
								1,
								2,
							].map((i) => (
								<Skeleton key={i} className="h-28 rounded-xl" />
							))}
						</div>
					</div>
				) : (
					<>
						{/* Chart */}
						{items.length > 0 && (
							<div className="mb-4 bg-[#f7f8fa] rounded-xl p-3.5">
								<CombinedTimeline catColor={catColor} />
							</div>
						)}

						{/* Credits - Only show if items exist */}
						{items.length > 0 && (
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
											'w-3.5 h-3.5 text-[#bbb] transition-transform duration-200',
											creditsOpen && 'rotate-180',
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
						)}

						{/* Items */}
						<div className="flex flex-col gap-3">
							<AnimatePresence mode="popLayout">
								{items.length === 0 ? (
									<motion.div
										key="empty"
										initial={{
											opacity: 0,
											y: 10,
										}}
										animate={{
											opacity: 1,
											y: 0,
										}}
										exit={{
											opacity: 0,
											y: -10,
										}}
										transition={{
											duration: 0.4,
											ease: [
												0.16,
												1,
												0.3,
												1,
											],
										}}
										className="bg-white min-h-[300px] flex flex-col items-center justify-center p-8 text-center"
									>
										<div
											className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm border transition-all duration-500"
											style={{
												backgroundColor: `${catColor}10`,
												borderColor: `${catColor}20`,
											}}
										>
											<ShoppingBag
												className="w-9 h-9 transition-colors duration-500"
												color={catColor}
												strokeWidth={2}
											/>
										</div>
										<h3 className="text-[1.2rem] font-extrabold text-[#1a1a2e] m-0 mb-3 leading-tight tracking-tight">
											Warenkorb leer
										</h3>
										<p className="text-[0.95rem] text-[#888] font-medium leading-relaxed max-w-[240px] m-0">
											{randomNotice}
										</p>
									</motion.div>
								) : (
									items.map((item) => (
										<BasketItemCard
											key={item.id}
											item={item}
											removeItem={() => removeItem(item.id)}
											settings={settings}
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
								<span className="text-[0.75rem] text-[#aaa]">Einmalige Kosten insg.</span>
								<span
									className={clsx(
										'text-[0.8rem] font-semibold flex items-center overflow-hidden h-[1.2rem]',
										totalOneTime < 0 ? 'text-[#00a878]' : 'text-[#1a1a2e]',
									)}
								>
									{totalOneTime < 0 && (
										<span className="mr-[2px]">Gutschrift i. H. v.</span>
									)}
									<AnimatePresence mode="popLayout">
										<motion.span
											key={totalOneTime}
											initial={{
												opacity: 0,
												y: -15,
											}}
											animate={{
												opacity: 1,
												y: 0,
											}}
											exit={{
												opacity: 0,
												y: 15,
											}}
											transition={{
												duration: 0.2,
												type: 'spring',
												stiffness: 300,
												damping: 25,
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
											? ', aus:'
											: ''}
									</span>
								</span>
							</div>

							{Object.entries(groupedOneTimeCosts).map(
								([
									name,
									cost ]: [string, number
]) => (
									<div
										key={name}
										className="flex justify-between items-center text-[0.75rem] text-[#aaa] mt-1 pr-1.5"
									>
										<span>{name}</span>
										<span>{cost.toFixed(2)} €</span>
									</div>
								),
							)}

							{totalCredits > 0 && (
								<div className="flex justify-between items-center text-[0.75rem] text-[#00a878] mt-1 pr-1.5">
									<span>Gutschrift</span>
									<span>
										−<AnimatedNumber value={totalCredits} /> €
									</span>
								</div>
							)}
						</div>

						{/* Monthly total */}
						<div className="bg-[#f7f8fa] border border-[#eaedf0] px-4 py-3 rounded-xl flex flex-col gap-2 mb-3">
							<div className="flex justify-between items-center mb-1">
								<span className="text-[0.65rem] uppercase tracking-wider text-[#999] font-medium">
									Kostenübersicht (24 Monate)
								</span>
							</div>
							{combinedSteps.map(
								(
									step: { start: number; end: number; total: number },
									idx: number,
								) => (
									<div key={idx} className="flex justify-between items-center">
										<span className="text-[0.75rem] text-[#888]">
											{step.start === step.end
												? `Monat ${step.start}`
												: `Monat ${step.start} - ${step.end}`}
										</span>
										<span className="text-[0.95rem] font-bold tracking-tight text-[#1a1a2e] flex items-center">
											<AnimatedNumber value={step.total} />
											<span className="ml-[3px] text-[0.75rem] font-normal text-[#aaa]">
												€
											</span>
										</span>
									</div>
								),
							)}

							<div className="border-t border-ds-border mt-1 pt-2 flex justify-between items-center">
								<div className="flex flex-col">
									<span className="text-[0.65rem] uppercase tracking-wider text-[#999] font-medium">
										Ø Monatlich
									</span>
									<span className="text-[0.6rem] text-[#bbb] font-medium">
										ca.{' '}
										<AnimatedNumber
											value={items.length > 0 ? totals.daily : 0}
										/>{' '}
										€ am Tag
									</span>
								</div>
								<span
									className="text-[1.3rem] font-extrabold tracking-tight flex items-center leading-none transition-colors duration-500"
									style={{
										color: catColor,
									}}
								>
									<AnimatedNumber value={totalMonthly} />
									<span
										className="ml-[3px] text-[0.8rem] font-normal transition-colors duration-500"
										style={{
											color: `${catColor}99`,
										}}
									>
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
								id="tour-offer-action"
								onClick={async () => {
									setIsGenerating('generating');
									await generateOfferPdf(
										items,
										basketCredits,
										settings,
										teamEmail,
										salesRepName,
									);

									const subject = encodeURIComponent(
										'Ihr persönliches Angebot der Telekom',
									);
									const bodyText = encodeURIComponent(
										offerTemplateText.replace(
											/\{\{salesRepName\}\}/g,
											salesRepName,
										),
									);

									window.location.href = `mailto:${teamEmail}?subject=${subject}&body=${bodyText}`;

									setIsGenerating('success');
									if (clearAfterExport) {
										setTimeout(() => clearBasket(), 500);
									}
									setTimeout(() => setIsGenerating('idle'), 10000);
								}}
								disabled={isGenerating !== 'idle'}
								className={clsx(
									'flex-1 py-2.5 rounded-xl text-white font-semibold transition-all duration-500 flex items-center justify-center gap-2 text-[0.82rem] cursor-pointer active:scale-95',
									isGenerating === 'idle' && 'text-white active:scale-95 hover:opacity-90',
									isGenerating === 'generating' &&
										'bg-[#ff69b4] cursor-not-allowed',
									isGenerating === 'success' && 'bg-[#00a878]',
								)}
								style={isGenerating === 'idle' ? {
									backgroundColor: catColor,
								} : {
								}}
							>
								{isGenerating === 'idle' && (
									<>
										Angebot erstellen
										<ArrowRight className="w-3.5 h-3.5" />
									</>
								)}
								{isGenerating === 'generating' && <>Wird generiert...</>}
								{isGenerating === 'success' && (
									<>
										Outlook geöffnet
										<Check className="w-3.5 h-3.5" />
									</>
								)}
							</button>
						</div>
					</div>
				) : (
					<div className="h-0 overflow-hidden" />
				)}
			</div>
		</aside>
	);
}

function BasketItemCard({
	item,
	removeItem,
	settings,
}: {
	item: BasketItem;
	removeItem: (id: string) => void;
	settings: PricingSettings;
}) {
	const router = useRouter();
	const [
		isBadgeHovered,
		setIsBadgeHovered,
	] = useState(false);
	const calculation = calculateProductCosts({
		product: item.product,
		businessCase: item.config.businessCase,
		magentaTVPackage: item.config.magentaTVPackage,
		selectedSpecialPriceIds: item.config.selectedSpecialPriceIds,
		selectedAddonIds: item.config.selectedAddonIds,
		vouchers: item.config.vouchers,
		hardwarePurchaseType: item.config.hardwarePurchaseType,
		plusKartenCount: item.config.plusKartenCount,
		settings,
		customBasePrice: item.config.customBasePrice,
	});

	const catColor = CATEGORY_COLORS[item.product.category] || '#e20074';
	const catLabel =
		CATEGORY_LABELS[item.product.category] || item.product.category;

	return (
		<motion.div
			layout
			initial={{
				opacity: 0,
				scale: 0.9,
				y: 10,
			}}
			animate={{
				opacity: 1,
				scale: 1,
				y: 0,
			}}
			exit={{
				opacity: 0,
				scale: 0.9,
				y: -10,
			}}
			transition={{
				type: 'spring',
				damping: 25,
				stiffness: 300,
			}}
			className="bg-white border border-[#eaedf0] rounded-xl p-3.5 transition-all duration-200 hover:border-[#ddd] group relative overflow-hidden cursor-pointer"
			onClick={() =>
				router.push(
					`/products/${item.product.category}/${item.product.id}?basketItemId=${item.id}`,
				)
			}
		>
			{/* Category gradient */}
			<div
				className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
				style={{
					background: `linear-gradient(to right, transparent 40%, ${catColor}08 70%, ${catColor}12 100%)`,
				}}
			/>

			<div className="relative z-10">
				{/* Header */}
				<div className="flex items-start justify-between mb-2">
					<div className="flex-1 min-w-0">
						<span
							className="text-[0.6rem] font-semibold uppercase tracking-wider"
							style={{
								color: catColor,
							}}
						>
							{catLabel}
						</span>
						<h4 className="font-bold text-[0.85rem] text-[#1a1a2e] leading-tight m-0 mt-0.5">
							{item.product.name}
							{item.config.magentaTVPackage
								? ` mit ${MAGENTA_TV_PACKAGES[item.config.magentaTVPackage].name}`
								: item.config.hardwareTier && item.config.hardwareTier !== 'none'
									? ` mit ${{
										smartphone: 'Smartphone',
										top: 'Top-Smartphone',
										premium: 'Premium-Smartphone',
										premium_plus: 'Premium-Plus-Smartphone',
									}[item.config.hardwareTier] || 'Smartphone'}`
									: ''}
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
					<div className="mb-3 inline-flex items-center gap-1 bg-[#e20074]/6 text-[#e20074] px-2 py-0.5 rounded-md text-[0.65rem] font-bold uppercase tracking-wider">
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
								(a.tiers || [
								]).some((t) => t.id === tierId),
							);
							if (!addon) { return null; }
							const tier = (addon.tiers || [
							]).find((t) => t.id === tierId);
							if (!tier) { return null; }
							return (
								<div
									key={tierId}
									className="flex items-center justify-between text-[0.72rem] font-medium"
								>
									<div
										className="flex items-center gap-1.5"
										style={{
											color: catColor,
										}}
									>
										<Package className="w-3.5 h-3.5" />
										<span>
											{addon.name}
											{addon.tiers.length > 1 ? ` - ${tier.name}` : ''}
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

				{/* Selected Special Prices */}
				{item.config.selectedSpecialPriceIds?.length > 0 &&
					item.product.specialPrices && (
					<div className="flex flex-col gap-1.5 mb-3">
						{item.config.selectedSpecialPriceIds.map((spId) => {
							const sp = item.product.specialPrices.find(
								(p) => p.id === spId,
							);
							if (!sp) { return null; }
							return (
								<div
									key={spId}
									className="flex items-center justify-between text-[0.72rem] font-medium"
								>
									<div
										className="flex items-center gap-1.5"
										style={{
											color: catColor,
										}}
									>
										<Tag className="w-3.5 h-3.5" />
										<span className="truncate max-w-[150px]">{sp.name}</span>
									</div>
									<span className="text-[#00a878] font-bold">Aktion</span>
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
								style={{
									color: catColor,
								}}
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
						{item.product.category === 'DEVICE' ? (
							item.config.hardwarePurchaseType === 'BUY' ? (
								<>
									<span className="text-[1.1rem] font-extrabold text-[#1a1a2e] leading-none tracking-tight">
										{(item.product as any).purchasePrice?.toFixed(2) || '0.00'}
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
								{item.config.customBasePrice !== undefined && (
									<Tooltip
										content="Historischer Preis verwendet"
										position="right"
										className="mr-1"
									>
										<div className="w-[26px] h-[26px] flex items-center justify-center rounded-[6px] bg-[#fff7ed] border border-[#fed7aa] text-[#ea580c] cursor-help transition-transform active:scale-95">
											<AlertTriangle className="w-3.5 h-3.5" />
										</div>
									</Tooltip>
								)}
								<span className="text-[1.1rem] font-extrabold text-[#1a1a2e] leading-none tracking-tight">
									Ø {calculation.averageMonthlyCost.toFixed(2)}
								</span>
								<span className="text-[0.65rem] font-semibold text-[#888] leading-none">
									€/mtl.
								</span>
							</>
						)}
					</div>
					<div className="flex items-center gap-2">
						{(calculation.basePrice !== calculation.averageMonthlyCost ||
							item.config.selectedAddonIds?.length > 0 ||
							item.config.selectedSpecialPriceIds?.length > 0 ||
							item.config.vouchers?.length > 0 ||
							item.config.magentaTVPackage) && (
							<motion.div
								layout
								onHoverStart={() => setIsBadgeHovered(true)}
								onHoverEnd={() => setIsBadgeHovered(false)}
								className={clsx(
									'overflow-hidden flex items-center h-[26px] px-2 rounded-[6px] border transition-colors duration-300 cursor-pointer',
									isBadgeHovered
										? 'bg-[#fff7ed] border-[#fed7aa]'
										: 'bg-[#f0fdf4] border-[#bbf7d0]',
								)}
							>
								<AnimatePresence mode="popLayout" initial={false}>
									{!isBadgeHovered ? (
										<motion.div
											key="erledigt"
											initial={{
												opacity: 0,
											}}
											animate={{
												opacity: 1,
											}}
											exit={{
												opacity: 0,
											}}
											transition={{
												type: 'tween',
												ease: 'easeInOut',
												duration: 0.2,
											}}
											className="flex items-center gap-1.5 whitespace-nowrap"
										>
											<Check className="w-[11px] h-[11px] text-[#16a34a] stroke-3" />
											<span className="text-[0.62rem] font-bold text-[#16a34a] tracking-wide">
												Erledigt
											</span>
										</motion.div>
									) : (
										<motion.div
											key="editieren"
											initial={{
												opacity: 0,
											}}
											animate={{
												opacity: 1,
											}}
											exit={{
												opacity: 0,
											}}
											transition={{
												type: 'tween',
												ease: 'easeInOut',
												duration: 0.2,
											}}
											className="flex items-center gap-1.5 whitespace-nowrap"
										>
											<Edit2 className="w-[11px] h-[11px] text-[#ea580c] stroke-[2.5]" />
											<span className="text-[0.62rem] font-bold text-[#ea580c] tracking-wide">
												Editieren?
											</span>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						)}
					</div>
				</div>
			</div>
		</motion.div>
	);
}
