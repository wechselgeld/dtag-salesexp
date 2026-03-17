'use client';

import {
	BusinessCaseSelector,
} from '@/components/features/calculator/business-case-selector';
import {
	CostTimeline,
} from '@/components/features/calculator/cost-timeline';
import {
	SpecialPriceSelector,
} from '@/components/features/calculator/special-price-selector';
import {
	AddonSelector,
} from '@/components/features/calculator/addon-selector';
import type {
	MagentaTVPackageKey,
} from '@/hooks/use-cost-calculator';
import {
	useCostCalculator,
	type BusinessCase,
} from '@/hooks/use-cost-calculator';
import {
	MAGENTA_TV_PACKAGES,
} from '@/lib/constants/pricing';
import {
	trpc,
} from '@/lib/trpc';
import {
	AnimatedNumber,
} from '@/components/shared/animated-number';
import {
	Toast,
} from '@/components/shared/ui/toast';
import {
	useSystemAlertStore,
} from '@/lib/store/system-alert-store';
import {
	type Product,
} from '@/types/product';
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
	Sparkles,
	ChevronDown,
	ListTodo,
	ExternalLink,
	Edit2,
	AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import {
	useParams, useSearchParams, useRouter,
} from 'next/navigation';
import React, {
	useEffect, Suspense,
} from 'react';
import clsx from 'clsx';
import {
	useBasketStore,
} from '@/hooks/use-basket-store';
import {
	useAnalytics,
} from '@/hooks/use-analytics';
import {
	SearchBar,
} from '@/components/features/search/search-bar';
import {
	Skeleton,
} from '@/components/shared/skeleton';
import {
	motion, AnimatePresence,
} from 'framer-motion';

const CATEGORY_COLORS: Record<string, string> = {
	MOBILE: '#e20074',
	FIBER: '#0090d0',
	DSL: '#7b61ff',
	MAGENTA_TV_OTT: '#ff6b00',
	DEVICE: '#00a878',
};
const CATEGORY_NAMES: Record<string, string> = {
	MOBILE: 'Mobilfunk',
	FIBER: 'Glasfaser',
	DSL: 'DSL',
	MAGENTA_TV_OTT: 'MagentaTV',
	DEVICE: 'Geräte',
};

function ProductPageContent() {
	const params = useParams();
	const id = params.id as string;
	const category = params.category as string;
	const router = useRouter();

	const searchParams = useSearchParams();
	const basketItemId = searchParams.get('basketItemId');

	const {
		items, updateItem, addItem, setIsOpen,
	} = useBasketStore();
	const {
		trackProductView, trackBasketAdd, trackPageView,
	} = useAnalytics();

	const catColor = CATEGORY_COLORS[category] || '#e20074';
	const catName = CATEGORY_NAMES[category] || category;

	const {
		data: productData, isLoading,
	} = trpc.product.getProductById.useQuery(
		{
			id,
		},
	);
	const product = productData as any;
	const {
		data: session,
	} = trpc.session.getCurrent.useQuery();
	const {
		data: designSettings,
	} = trpc.settings.getDesignSettings.useQuery(
		undefined,
		{
			staleTime: 10 * 60 * 1000, // 10min – design settings rarely change
		},
	);

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
		setPlusKartenCount,
		settings,
		customBasePrice,
		setCustomBasePrice,
		hardwareTier,
		setHardwareTier,
	} = useCostCalculator(product);

	const {
		addAlert, removeAlert,
	} = useSystemAlertStore();

	const [
		salesScriptOpen,
		setSalesScriptOpen,
	] = React.useState(false);

	const [
		isHistoryWarningAccepted,
		setIsHistoryWarningAccepted,
	] =
		React.useState(false);
	const [
		priceDropdownOpen,
		setPriceDropdownOpen,
	] = React.useState(false);

	const handleSelectHistoryPrice = (price: number) => {
		setCustomBasePrice(price);
		setIsHistoryWarningAccepted(false);
		setPriceDropdownOpen(false);
		setSelectedSpecialPriceIds([
		]);
		setMagentaTVPackage(null);
		setSelectedAddonIds([
		]);
	};

	const existingBasketItem = basketItemId
		? items.find((i) => i.id === basketItemId)
		: undefined;

	const isSameConfig = !!(
		existingBasketItem &&
		existingBasketItem.config.businessCase === businessCase &&
		existingBasketItem.config.magentaTVPackage === magentaTVPackage &&
		JSON.stringify(
			[
				...(existingBasketItem.config.selectedSpecialPriceIds || [
				]),
			].sort(),
		) === JSON.stringify([
			...(selectedSpecialPriceIds || [
			]),
		].sort()) &&
		JSON.stringify(
			[
				...(existingBasketItem.config.selectedAddonIds || [
				]),
			].sort(),
		) === JSON.stringify([
			...(selectedAddonIds || [
			]),
		].sort()) &&
		existingBasketItem.config.hardwarePurchaseType === hardwarePurchaseType &&
		existingBasketItem.config.plusKartenCount === plusKartenCount &&
		existingBasketItem.config.customBasePrice === customBasePrice &&
		(existingBasketItem.config.hardwareTier || 'none') === hardwareTier
	);

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
				if (item.config.customBasePrice !== undefined) {
					setCustomBasePrice(item.config.customBasePrice);
				}
				if (item.config.hardwareTier) {
					setHardwareTier(item.config.hardwareTier);
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
		setHardwarePurchaseType,
		setCustomBasePrice,
		setHardwareTier,
	]);

	// Persistent Alert Management
	useEffect(() => {
		const alertId = 'history-price-warning';
		if (customBasePrice !== undefined && !isHistoryWarningAccepted) {
			addAlert({
				id: alertId,
				content: (
					<Toast
						key={alertId}
						duration={0}
						color="#f59e0b"
						onDismiss={() => setCustomBasePrice(undefined)}
						className="bg-amber-50/70 border-2 border-amber-500/20 text-[#1a1a2e]"
						style={{
							borderColor: '#f59e0b40',
						}}
					>
						<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-500/10 to-transparent blur-xl pointer-events-none rounded-full" />

						<div className="flex gap-3 align-start">
							<div
								className="shrink-0 flex items-center justify-center text-white mt-0.5 p-2 rounded-xl shadow-lg shadow-amber-500/20"
								style={{
									backgroundColor: '#f59e0b',
								}}
							>
								<AlertTriangle className="w-5 h-5 text-amber-50" />
							</div>

							<div>
								<div className="flex items-center gap-2 mb-1">
									<h4 className="font-bold text-[0.95rem] m-0 text-amber-900">
										Preis ist nicht aktuell
									</h4>
								</div>
								<p className="text-[0.8rem] text-amber-900/70 m-0 leading-relaxed max-w-[400px]">
									Du hast einen{' '}
									<span className="font-bold">historischen Preis</span>{' '}
									ausgewählt. Sonderpreise und Optionen sind eventuell nicht
									korrekt. Bitte überprüfe diese sorgfältig.
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2 mt-3 ml-12">
							<button
								type="button"
								onClick={() => setIsHistoryWarningAccepted(true)}
								className="px-4 py-2 bg-[#f59e0b] hover:bg-amber-700 text-amber-50 text-[0.78rem] font-bold rounded-lg transition-all shadow-lg shadow-amber-500/20 outline-none cursor-pointer border-none active:scale-95 flex items-center gap-1.5 backdrop-blur-sm"
							>
								<Check className="w-4 h-4" />
								Akzeptieren
							</button>
							<button
								type="button"
								onClick={() => setCustomBasePrice(undefined)}
								className="px-4 py-2 text-[0.78rem] font-bold text-amber-800 hover:bg-black/5 rounded-lg transition-all outline-none cursor-pointer bg-transparent border-none active:scale-95"
							>
								Preis zurücksetzen
							</button>
						</div>
					</Toast>
				),
			});
		}
		else {
			removeAlert(alertId);
		}

		return () => removeAlert(alertId);
	}, [
		customBasePrice,
		isHistoryWarningAccepted,
		addAlert,
		removeAlert,
		setCustomBasePrice,
		setIsHistoryWarningAccepted,
	]);

	// Track product view (deduplicated per component lifecycle)
	// Must be before early return to follow Rules of Hooks
	useEffect(() => {
		if (product && id) {
			trackProductView(id, category);
			trackPageView(`/products/${category}/${id}`, category);
		}
	}, [
		product,
		id,
		category,
		trackProductView,
		trackPageView,
	]);

	if (isLoading || !product) {
		return (
			<div className="min-h-full">
				<div className="pt-2 mb-6">
					<Skeleton className="h-10 w-full max-w-xl rounded-full" />
				</div>
				<Skeleton className="h-4 w-32 mb-6" />

				<div className="bg-linear-to-br from-white to-[#fcfafc] rounded-2xl border border-[#eaedf0] p-7 mb-6">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<Skeleton className="h-10 w-3/4 max-w-lg mb-4" />
							<Skeleton className="h-4 w-full max-w-xl mb-2" />
							<Skeleton className="h-4 w-4/5 max-w-lg mb-6" />
							<div className="flex gap-4">
								<Skeleton className="h-6 w-20" />
								<Skeleton className="h-6 w-24" />
								<Skeleton className="h-6 w-32" />
							</div>
						</div>
						<div className="flex flex-col items-end">
							<Skeleton className="h-4 w-12 mb-2" />
							<Skeleton className="h-12 w-32 mb-2" />
							<Skeleton className="h-3 w-20" />
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start pb-10">
					<div className="space-y-4">
						<Skeleton className="h-32 w-full rounded-2xl" />
						<Skeleton className="h-48 w-full rounded-2xl" />
						<Skeleton className="h-40 w-full rounded-2xl" />
					</div>
					<div className="space-y-4">
						<Skeleton className="h-64 w-full rounded-2xl" />
						<Skeleton className="h-40 w-full rounded-2xl" />
						<Skeleton className="h-14 w-full rounded-2xl" />
					</div>
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
			vouchers: existingBasketItem?.config.vouchers || [
			],
			credits: existingBasketItem?.config.credits || [
			],
			hardwarePurchaseType,
			plusKartenCount,
			customBasePrice,
			hardwareTier,
		};

		if (existingBasketItem) {
			updateItem(existingBasketItem.id, config);
			setIsOpen(true);
		}
		else {
			const newId = addItem(product, config);
			router.replace(`?basketItemId=${newId}`, {
				scroll: false,
			});
		}

		// Track basket add
		trackBasketAdd(product.id, product.category);
	};

	// Merged product name
	const displayName = magentaTVPackage
		? `${product.name} mit ${MAGENTA_TV_PACKAGES[magentaTVPackage].name}`
		: product.name;

	return (
		<div
			className="min-h-full"
			style={{
				'--cat-color': catColor,
			} as React.CSSProperties}
		>
			{/* Search Bar */}
			<div className="pt-2">
				<SearchBar compact />
			</div>

			{/* Breadcrumb-style back */}
			<Link
				href={`/products/${category}`}
				className="inline-flex items-center gap-1.5 text-[#999] hover:text-(--cat-color) transition-colors mb-6 text-[0.8rem] font-semibold uppercase tracking-wider"
			>
				<ArrowLeft className="w-4 h-4" />
				<span className="mt-0.5" style={{
					color: catColor,
				}}>
					{catName}
				</span>
			</Link>

			{/* ── Product Hero Card ── */}
			<motion.div
				initial={{
					opacity: 0,
					y: 8,
				}}
				animate={{
					opacity: 1,
					y: 0,
				}}
				transition={{
					delay: 0.05,
					duration: 0.35,
				}}
				className="bg-linear-to-br from-white to-[#fcfafc] rounded-xl border border-[#eaedf0] p-7 mb-6 relative z-40 overflow-visible"
			>
				{/* Category gradient */}
				<div
					className="absolute inset-0 pointer-events-none rounded-xl"
					style={{
						background: `linear-gradient(to right, transparent 40%, ${catColor}08 70%, ${catColor}14 100%)`,
					}}
				/>

				<div className="relative z-20 flex items-start justify-between">
					{/* Left: Product info */}
					<div>
						<div className="flex flex-col gap-2 mb-4">
							{session?.team?.highlights.some(
								(h) =>
									h.productId === product.id || h.category === product.category,
							) && (
								<div className="w-fit bg-[rgba(255,213,79,0.15)] text-[#b78900] px-3 py-1 rounded-md text-[0.7rem] font-bold tracking-widest uppercase flex items-center gap-1.5 border border-[rgba(255,213,79,0.3)] shadow-sm whitespace-nowrap">
									<Star className="w-3.5 h-3.5 fill-current" />
									TEAM-FOKUS
								</div>
							)}
							<h1 className="text-[1.8rem] md:text-[2.2rem] font-extrabold text-[#1a1a2e] tracking-tight leading-[1.1] m-0">
								{displayName}
							</h1>
							{product.description && (
								<p className="text-[0.9rem] text-[#555] leading-relaxed mt-2 max-w-[90%]">
									{product.description}
								</p>
							)}
						</div>

						<div className="flex flex-wrap items-center gap-5">
							{product.category === 'DEVICE'
								? (product as any).deviceManufacturer && (
									<div className="flex items-center gap-2">
										<Smartphone
											className="w-4 h-4"
											style={{
												color: catColor,
											}}
										/>
										<span className="text-[0.85rem] font-semibold text-[#555]">
											{(product as any).deviceManufacturer}
										</span>
									</div>
								)
								: product.dataVolume && (
									<div className="flex items-center gap-2">
										<Wifi className="w-4 h-4" style={{
											color: catColor,
										}} />
										<span className="text-[0.85rem] font-semibold text-[#555]">
											{product.dataVolume}
										</span>
									</div>
								)}
							{(product.downloadSpeed ?? 0) > 0 &&
								product.category !== 'DEVICE' && (
								<div className="flex items-center gap-2">
									<Zap className="w-4 h-4" style={{
										color: catColor,
									}} />
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
							<div className="flex flex-wrap gap-x-2.5 gap-y-2 mt-5">
								{product.salesArguments.map((arg: any) => (
									<div
										key={arg.id}
										className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f7f8fa] border border-[#eaedf0] text-[0.78rem] font-semibold text-[#555] shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-default transition-all hover:bg-white hover:border-[#d1d5db]"
									>
										<Sparkles
											className="w-3.5 h-3.5 shrink-0"
											style={{
												color: catColor,
											}}
										/>
										<span className="leading-tight">{arg.text}</span>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Right: Price highlight & Actions */}
					<div className="shrink-0 ml-6 flex items-start gap-4">
						{/* MagentaInfos Link (Left of price) */}
						{product.magentaInfosUrl && (
							<a
								href={product.magentaInfosUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1.5 px-3.5 h-[46px] rounded-xl border transition-colors group/link shrink-0"
								style={{
									backgroundColor: `${catColor}0d`,
									borderColor: `${catColor}26`,
								}}
							>
								<ExternalLink
									className="w-4 h-4 group-hover/link:scale-110 transition-transform"
									style={{
										color: catColor,
									}}
									strokeWidth={2.5}
								/>
							</a>
						)}

						{/* Price Card */}
						<div className="relative z-50">
							<button
								type="button"
								onClick={() =>
									product.priceHistory?.length
										? setPriceDropdownOpen(!priceDropdownOpen)
										: undefined
								}
								className={clsx(
									'bg-[#f7f8fa] border border-[#eaedf0] rounded-xl px-4 h-[46px] flex items-center shadow-sm w-full outline-none',
									product.priceHistory?.length &&
										'cursor-pointer hover:bg-[#f0f2f5] transition-colors',
								)}
							>
								{product.category === 'DEVICE' ? (
									<div className="flex items-center gap-2">
										<span className="text-[0.7rem] font-semibold text-[#aaa] uppercase tracking-wider mt-0.5">
											Ab
										</span>
										<div className="flex items-center gap-3">
											{(product as any).purchasePrice > 0 && (
												<div className="flex items-baseline gap-1.5">
													<span
														className={clsx(
															'font-extrabold tracking-tight leading-none',
															((product as any).rentalPrice ||
																product.basePrice) > 0
																? 'text-[1.2rem]'
																: 'text-[1.4rem]',
														)}
														style={{
															color: catColor,
														}}
													>
														<AnimatedNumber
															value={(product as any).purchasePrice}
														/>{' '}
														€
													</span>
													<span className="text-[0.75rem] text-[#b0b0b0] font-bold uppercase tracking-wider">
														Kauf
													</span>
												</div>
											)}
											{((product as any).rentalPrice || product.basePrice) >
												0 && (
												<div className="flex items-baseline gap-1.5">
													<span
														className={clsx(
															'font-extrabold tracking-tight leading-none',
															(product as any).purchasePrice > 0
																? 'text-[1.2rem]'
																: 'text-[1.4rem]',
														)}
														style={{
															color: catColor,
														}}
													>
														<AnimatedNumber
															value={
																(product as any).rentalPrice ||
																product.basePrice
															}
														/>{' '}
														€
													</span>
													<span className="text-[0.75rem] text-[#b0b0b0] font-bold uppercase tracking-wider">
														Miete
													</span>
												</div>
											)}
										</div>
									</div>
								) : (
									<div className="flex items-baseline gap-1.5">
										<span className="text-[1.4rem] text-[#b0b0b0] font-medium">
											Ab
										</span>
										<span
											className="text-[1.5rem] font-extrabold tracking-tight"
											style={{
												color: catColor,
											}}
										>
											<AnimatedNumber
												value={
													customBasePrice !== undefined
														? customBasePrice
														: product.basePrice
												}
											/>{' '}
											€
										</span>
										<span className="text-[1.4rem] text-[#b0b0b0] font-medium">
											/Monat
										</span>
										{product.priceHistory &&
											product.priceHistory.length > 0 && (
											<ChevronDown
												className={clsx(
													'w-4 h-4 ml-1.5 transition-transform',
													priceDropdownOpen && 'rotate-180',
												)}
												style={{
													color: catColor,
												}}
											/>
										)}
									</div>
								)}
							</button>

							{/* History Popover */}
							<AnimatePresence>
								{priceDropdownOpen &&
									product.priceHistory &&
									product.priceHistory.length > 0 && (
									<>
										<div
											className="fixed inset-0 z-40"
											onClick={() => setPriceDropdownOpen(false)}
										/>
										<motion.div
											initial={{
												opacity: 0,
												y: -4,
												scale: 0.98,
											}}
											animate={{
												opacity: 1,
												y: 0,
												scale: 1,
											}}
											exit={{
												opacity: 0,
												y: -4,
												scale: 0.98,
											}}
											transition={{
												duration: 0.2,
												ease: [
													0.23,
													1,
													0.32,
													1,
												],
											}}
											className="absolute top-[calc(100%+12px)] w-[300px] md:w-[340px] right-0 bg-white border border-[#eaedf0] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.12)] z-1000 overflow-hidden backdrop-blur-xl"
										>
											<div className="px-4 py-3 border-b border-amber-100 bg-amber-50/80">
												<div className="flex items-start gap-2.5">
													<div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-1 shadow-sm border border-amber-200/50">
														<AlertTriangle className="w-6 h-6 text-amber-700" />
													</div>
													<p className="text-[0.75rem] leading-snug font-bold text-amber-900 m-0">
															Historische Preise
														<span className="block font-medium text-amber-800/70 mt-0.6">
																Nicht für Neubereitstellungen empfohlen.
																Sonderpreise & Optionen könnten nicht dazu
																passen.
														</span>
													</p>
												</div>
											</div>
											<div className="p-2 flex flex-col gap-1 max-h-[300px] overflow-y-auto scrollbar-none">
												<button
													type="button"
													className={clsx(
														'w-full text-left px-3.5 py-3 rounded-xl text-[0.85rem] transition-all flex justify-between items-center outline-none group/item',
														customBasePrice === undefined
															? 'font-bold'
															: 'font-medium hover:bg-[#f7f8fa] text-[#444] active:scale-[0.98]',
													)}
													style={{
														color:
																customBasePrice === undefined
																	? catColor
																	: undefined,
														...(customBasePrice === undefined
															? {
																backgroundColor: `${catColor}12`,
															}
															: {
															}),
													}}
													onClick={() => {
														setCustomBasePrice(undefined);
														setPriceDropdownOpen(false);
													}}
												>
													<span className="tracking-tight">
															Aktueller Preis
													</span>
													<span className="font-bold opacity-90">
														{product.basePrice.toFixed(2).replace('.', ',')} €
													</span>
												</button>
												<div className="h-px bg-[#f0f2f5] my-1.5 mx-3" />
												{product.priceHistory.map((ph: any) => (
													<button
														key={ph.id}
														type="button"
														className={clsx(
															'w-full text-left px-3.5 py-3 rounded-xl text-[0.85rem] transition-all flex justify-between items-center outline-none group/item',
															customBasePrice === ph.price
																? 'font-bold'
																: 'font-medium hover:bg-[#f7f8fa] text-[#444] active:scale-[0.98]',
														)}
														style={{
															color:
																	customBasePrice === ph.price
																		? catColor
																		: undefined,
															...(customBasePrice === ph.price
																? {
																	backgroundColor: `${catColor}12`,
																}
																: {
																}),
														}}
														onClick={() => handleSelectHistoryPrice(ph.price)}
													>
														<span className="tracking-tight">
															{ph.label || 'Historischer Preis'}
														</span>
														<span className="font-bold opacity-90">
															{ph.price.toFixed(2).replace('.', ',')} €
														</span>
													</button>
												))}
											</div>
										</motion.div>
									</>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</motion.div>

			{/* ── Configuration + Summary ── */}
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start pb-10">
				{/* LEFT: Configuration Flow */}
				<div className="space-y-4">
					{/* Sales Script Assistant */}
					{(product as any)?.salesScript && (
						<ConfigSection
							title="Überleitung & Tipps"
							catColor={catColor}
							index={0}
						>
							<div className="rounded-xl border border-[#eaedf0] bg-[#fafafa] overflow-hidden transition-all duration-300">
								<button
									onClick={() => setSalesScriptOpen(!salesScriptOpen)}
									className="w-full flex items-center justify-between p-4 cursor-pointer outline-none hover:bg-[#f0f0f0]/50 transition-colors"
								>
									<div className="flex items-center gap-3">
										<div
											className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200"
											style={{
												backgroundColor: salesScriptOpen ? catColor : 'white',
												color: salesScriptOpen ? 'white' : catColor,
												border: salesScriptOpen
													? 'none'
													: `1px solid ${catColor}30`,
												boxShadow: salesScriptOpen
													? `0 4px 12px ${catColor}40`
													: 'none',
											}}
										>
											<ListTodo
												className="w-5 h-5"
												strokeWidth={salesScriptOpen ? 2 : 1.5}
											/>
										</div>
										<div className="text-left">
											<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] mb-0.5 tracking-tight flex items-center gap-1.5">
												Gesprächsleitfaden
											</h3>
											<p className="text-[0.75rem] text-[#888] font-medium m-0">
												Empfohlene Argumentation
											</p>
										</div>
									</div>
									<div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#eaedf0] shadow-sm">
										<ChevronDown
											className={clsx(
												'w-4 h-4 text-[#888] transition-transform duration-300',
												salesScriptOpen ? 'rotate-180' : '',
											)}
										/>
									</div>
								</button>
								<motion.div
									initial={false}
									animate={{
										height: salesScriptOpen ? 'auto' : 0,
										opacity: salesScriptOpen ? 1 : 0,
									}}
									transition={{
										duration: 0.3,
										ease: [
											0.32,
											0.72,
											0,
											1,
										],
									}}
									className="overflow-hidden"
								>
									<div className="px-4 pb-4 pt-1">
										<div className="bg-white rounded-xl p-4 border border-[#eaedf0] shadow-sm relative">
											<div className="absolute top-0 right-10 w-px h-full bg-linear-to-b from-transparent via-[#e20074]/10 to-transparent pointer-events-none" />
											<p className="text-[0.9rem] leading-relaxed text-[#444] whitespace-pre-wrap m-0 font-medium font-serif italic relative z-10">
												{(product as any).salesScript}
											</p>
										</div>
									</div>
								</motion.div>
							</div>
						</ConfigSection>
					)}

					{/* Hardware Kaufart (Only for DEVICE) */}
					{product.category === 'DEVICE' && (
						<ConfigSection
							title="Kaufoption wählen"
							catColor={catColor}
							index={0}
						>
							{!items.some(
								(i) => i.product.category === 'DEVICE' && i.id !== basketItemId,
							) && (
								<div className="mb-4 bg-[#00a8781c] border border-[#00a8787c] text-[#00a878] px-4 py-3 rounded-xl text-[1.3rem] flex items-start gap-3">
									<Info
										className="w-8 h-8 transition-all duration-400 text-[#00a878] group-hover:text-(--card-color) group-hover:scale-110"
										strokeWidth={1.5}
									/>
									<div className="leading-snug mt-0.5">
										Für Hardware fällt einmalig eine{' '}
										<strong>
											Bereitstellungspauschale i. H. v.{' '}
											<AnimatedNumber value={settings.shipping_hardware_fee} />{' '}
											€
										</strong>{' '}
										an.
									</div>
								</div>
							)}
							<div
								className={clsx(
									'grid gap-3',
									(product as any).rentalPrice > 0 &&
										(product as any).purchasePrice > 0
										? 'grid-cols-2'
										: 'grid-cols-1',
								)}
							>
								{((product as any).rentalPrice || product.basePrice) > 0 && (
									<motion.button
										whileTap={{
											scale: 0.98,
										}}
										onClick={() => setHardwarePurchaseType('RENT')}
										className={clsx(
											'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer outline-none',
											hardwarePurchaseType === 'RENT'
												? 'bg-white shadow-sm'
												: 'bg-[#f7f8fa] hover:bg-white hover:border-[#ddd]',
										)}
										style={{
											borderColor:
												hardwarePurchaseType === 'RENT' ? catColor : '#eaedf0',
										}}
									>
										<span className="text-[0.8rem] font-bold text-[#1a1a2e] mb-1">
											Mieten
										</span>
										<span className="text-[0.7rem] text-[#999]">
											<AnimatedNumber
												value={
													(product as any).rentalPrice || product.basePrice
												}
											/>{' '}
											€ mtl.
										</span>
									</motion.button>
								)}
								{(product as any).purchasePrice > 0 && (
									<motion.button
										whileTap={{
											scale: 0.98,
										}}
										onClick={() => setHardwarePurchaseType('BUY')}
										className={clsx(
											'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer outline-none',
											hardwarePurchaseType === 'BUY'
												? 'bg-white shadow-sm'
												: 'bg-[#f7f8fa] hover:bg-white hover:border-[#ddd]',
										)}
										style={{
											borderColor:
												hardwarePurchaseType === 'BUY' ? catColor : '#eaedf0',
										}}
									>
										<span className="text-[0.8rem] font-bold text-[#1a1a2e] mb-1">
											Einmalzahlung
										</span>
										<span className="text-[0.7rem] text-[#999]">
											<AnimatedNumber value={(product as any).purchasePrice} />{' '}
											€
										</span>
									</motion.button>
								)}
							</div>
						</ConfigSection>
					)}

					{/* Business Case (Hide for DEVICE) */}
					{product.category !== 'DEVICE' && (
						<ConfigSection
							id="tour-config-business-case"
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
										.map((h) => h.businessCase as BusinessCase) || [
									]
								}
							/>
						</ConfigSection>
					)}

					{/* Hardware Tier (Only for products with allowHardwareTiers) */}
					{product.allowHardwareTiers && (
						<ConfigSection
							title="Smartphone-Option"
							catColor={catColor}
							index={0.5}
						>
							<p className="text-[0.75rem] text-[#888] mb-4 -mt-3.5 leading-relaxed">
								Beachte, dass Smartphone-Preise je nach Modell und Aktionen abweichen können! Verbindliche Preisauskünfte können <span className="font-bold">ausschließlich über T-VPP oder MagentaView</span> eingeholt werden. Aus diesem Grund sind die Endgeräte in der Sales Experience nicht buchbar.
							</p>
							<HardwareTierSelector
								selected={hardwareTier}
								onChange={setHardwareTier}
								accentColor={catColor}
								settings={settings}
								designSettings={designSettings}
							/>
						</ConfigSection>
					)}

					{/* MagentaTV Option — Toggle + Package Selector */}
					{product.allowMagentaTV && (
						<ConfigSection
							id="tour-config-entertainment"
							title="Entertainment"
							catColor={catColor}
							index={1}
						>
							<div
								className={clsx(
									customBasePrice !== undefined &&
										!isHistoryWarningAccepted &&
										'opacity-40 pointer-events-none transition-opacity duration-300',
								)}
							>
								{/* Main Toggle */}
								<motion.div
									whileTap={{
										scale: 0.98,
									}}
									onClick={() => {
										if (isMagentaTVSelected) {
											setMagentaTVPackage(null);
										}
										else {
											setMagentaTVPackage('smart');
										}
									}}
									className={clsx(
										'relative rounded-xl p-4 border-2 cursor-pointer transition-all duration-200 flex items-center gap-4 group overflow-hidden',
										session?.team?.highlights.some(
											(h) => h.category === 'MAGENTA_TV_OTT',
										) &&
											!isMagentaTVSelected &&
											'highlight-glow bg-white',
										isMagentaTVSelected &&
											!designSettings?.magentatv_background_image
											? 'bg-white'
											: '',
									)}
									style={{
										borderColor: isMagentaTVSelected
											? catColor
											: session?.team?.highlights.some(
												(h) => h.category === 'MAGENTA_TV_OTT',
												  )
												? catColor
												: '#eaedf0',
										backgroundColor:
											isMagentaTVSelected &&
											!designSettings?.magentatv_background_image
												? `${catColor}06`
												: 'white',
									}}
								>
									{/* Background Image Overlay */}
									{designSettings?.magentatv_background_image && (
										<div
											className={clsx(
												'absolute -inset-0.5 z-0 transition-opacity duration-300 pointer-events-none',
												isMagentaTVSelected
													? 'opacity-100'
													: 'opacity-0 group-hover:opacity-100',
											)}
										>
											<div
												className="absolute inset-0 bg-cover bg-center blur-[2px] scale-110"
												style={{
													backgroundImage: `url(${designSettings.magentatv_background_image})`,
												}}
											/>
											<div className="absolute inset-0 bg-[#1a1a2e]/40" />
										</div>
									)}

									{/* TV+ Icon */}
									<div
										className={clsx(
											'relative z-10 w-25 h-10 rounded-lg shrink-0 font-extrabold flex items-center justify-center text-[0.85rem] transition-all duration-200 border-2',
											isMagentaTVSelected
												? 'bg-(--cat-color) text-white border-transparent'
												: 'bg-transparent text-(--cat-color) border-(--cat-color) group-hover:text-white group-hover:border-white',
										)}
									>
										MAGENTATV
									</div>

									<div className="flex-1 flex flex-col justify-center items-start relative z-10">
										<div className="flex items-center gap-2 mb-0.5">
											<h3
												className={clsx(
													'text-[0.95rem] font-bold m-0 transition-colors',
													designSettings?.magentatv_background_image
														? isMagentaTVSelected
															? 'text-white'
															: 'text-[#1a1a2e] group-hover:text-white'
														: isMagentaTVSelected
															? 'text-(--cat-color)'
															: 'text-[#1a1a2e]',
												)}
											>
												MagentaTV dazubuchen
											</h3>
											{session?.team?.highlights.some(
												(h) => h.category === 'MAGENTA_TV_OTT',
											) &&
												!isMagentaTVSelected && (
												<div className="bg-[#fffcf0] text-[#b78900] px-1.5 py-0.5 rounded text-[0.55rem] font-bold tracking-widest uppercase flex items-center gap-0.5 border border-[#fde68a] shadow-sm whitespace-nowrap">
													<Star className="w-2.5 h-2.5 fill-[#fde047]" />
														TEAM-FOKUS
												</div>
											)}
										</div>
										<p
											className={clsx(
												'text-[0.78rem] m-0 transition-colors',
												designSettings?.magentatv_background_image
													? isMagentaTVSelected
														? 'text-white/70'
														: 'text-[#999] group-hover:text-white/70'
													: 'text-[#999]',
											)}
										>
											ab{' '}
											{settings.magentatv_smart_price
												.toFixed(2)
												.replace('.', ',')}{' '}
											€ mtl.
										</p>
									</div>

									{/* Toggle checkbox circle */}
									<div
										className="relative z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
										style={{
											borderColor: isMagentaTVSelected ? catColor : '#ddd',
											backgroundColor: isMagentaTVSelected
												? catColor
												: 'transparent',
										}}
									>
										{isMagentaTVSelected && (
											<Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
										)}
									</div>
								</motion.div>

								{/* Package Options (shown when toggled on) */}
								{isMagentaTVSelected && (
									<motion.div
										initial={{
											opacity: 0,
											height: 0,
										}}
										animate={{
											opacity: 1,
											height: 'auto',
										}}
										transition={{
											duration: 0.25,
										}}
										className="mt-3 space-y-2"
									>
										{(
											Object.entries(MAGENTA_TV_PACKAGES) as [
												MagentaTVPackageKey,
												(typeof MAGENTA_TV_PACKAGES)[MagentaTVPackageKey]
											][]
										).map(([
											key,
											pkg,
										]) => {
											const isSelected = magentaTVPackage === key;
											return (
												<motion.div
													key={key}
													whileTap={{
														scale: 0.98,
													}}
													onClick={() => setMagentaTVPackage(key)}
													className="rounded-xl p-3.5 border-2 cursor-pointer transition-all duration-200"
													style={{
														borderColor: isSelected ? catColor : '#eaedf0',
														backgroundColor: isSelected
															? `${catColor}08`
															: '#fafafa',
													}}
												>
													<div className="flex items-center gap-3">
														{/* Radio circle with Check */}
														<div
															className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
															style={{
																borderColor: isSelected ? catColor : '#ccc',
																backgroundColor: isSelected
																	? catColor
																	: 'transparent',
															}}
														>
															{isSelected && (
																<Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
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
																color: isSelected ? catColor : '#888',
															}}
														>
															+
															<AnimatedNumber
																value={
																	key === 'smart'
																		? settings.magentatv_smart_price
																		: key === 'smartstream'
																			? settings.magentatv_smartstream_price
																			: settings.magentatv_megastream_price
																}
															/>{' '}
															€
														</span>
													</div>

													{/* Features (shown when selected) */}
													{isSelected && (
														<motion.div
															initial={{
																opacity: 0,
															}}
															animate={{
																opacity: 1,
															}}
															transition={{
																duration: 0.15,
															}}
															className="mt-2.5 pt-2.5 border-t border-dashed"
															style={{
																borderColor: `${catColor}25`,
															}}
														>
															<ul className="space-y-1 m-0 p-0 list-none">
																{pkg.features.map(
																	(feature: string, i: number) => (
																		<li
																			key={i}
																			className="flex items-start gap-2 text-[0.75rem] text-[#666]"
																		>
																			<Check
																				className="w-3 h-3 shrink-0 mt-0.5"
																				style={{
																					color: catColor,
																				}}
																				strokeWidth={2.5}
																			/>
																			{feature}
																		</li>
																	),
																)}
															</ul>
														</motion.div>
													)}
												</motion.div>
											);
										})}
									</motion.div>
								)}
							</div>
						</ConfigSection>
					)}

					{/* Special Prices */}
					<ConfigSection
						id="tour-config-special-prices"
						title="Aktionen & Rabatte"
						catColor={catColor}
						index={2}
					>
						<div
							className={clsx(
								customBasePrice !== undefined &&
									!isHistoryWarningAccepted &&
									'opacity-40 pointer-events-none transition-opacity duration-300',
							)}
						>
							<SpecialPriceSelector
								specialPrices={product.specialPrices}
								selectedIds={selectedSpecialPriceIds}
								onChange={setSelectedSpecialPriceIds}
								isMagentaTVSelected={isMagentaTVSelected}
								businessCase={businessCase}
								accentColor={catColor}
								basePrice={product.basePrice}
								tvBasePrice={
									isMagentaTVSelected
										? magentaTVPackage === 'smart'
											? settings.magentatv_smart_price
											: magentaTVPackage === 'smartstream'
												? settings.magentatv_smartstream_price
												: magentaTVPackage === 'megastream'
													? settings.magentatv_megastream_price
													: 0
										: 0
								}
							/>
						</div>
					</ConfigSection>

					{/* Add-ons */}
					{product.compatibleAddons && product.compatibleAddons.length > 0 && (
						<ConfigSection
							id="tour-config-addons"
							title="Zusatzoptionen"
							catColor={catColor}
							index={3}
						>
							<div
								className={clsx(
									customBasePrice !== undefined &&
										!isHistoryWarningAccepted &&
										'opacity-40 pointer-events-none transition-opacity duration-300',
								)}
							>
								<AddonSelector
									addons={product.compatibleAddons}
									selectedIds={selectedAddonIds}
									onChange={setSelectedAddonIds}
									isMagentaTVSelected={isMagentaTVSelected}
									catColor={catColor}
								/>
							</div>
						</ConfigSection>
					)}
				</div>

				{/* RIGHT: Sticky Summary */}
				<div className="lg:sticky lg:top-6 space-y-4">
					{/* Cost Summary */}
					<motion.div
						id="tour-config-timeline"
						initial={{
							opacity: 0,
							y: 8,
						}}
						animate={{
							opacity: 1,
							y: 0,
						}}
						transition={{
							delay: 0.3,
							duration: 0.35,
						}}
						className="bg-white rounded-xl border border-[#eaedf0] p-5 hidden lg:block"
					>
						<CostTimeline calculation={calculation} accentColor={catColor} />
					</motion.div>

					{/* CTA Button */}
					<motion.button
						id="tour-config-action"
						initial={{
							opacity: 0,
							y: 8,
						}}
						animate={{
							opacity: 1,
							y: 0,
						}}
						transition={{
							delay: 0.35,
							duration: 0.35,
						}}
						disabled={
							(existingBasketItem && isSameConfig) ||
							(customBasePrice !== undefined && !isHistoryWarningAccepted)
						}
						onClick={handleAddToBasket}
						className={clsx(
							'w-full py-3.5 rounded-xl font-bold text-[0.95rem] transition-all duration-300 flex items-center justify-center gap-2.5 outline-none relative overflow-hidden',
							((existingBasketItem && isSameConfig) ||
								(customBasePrice !== undefined && !isHistoryWarningAccepted))
								? 'bg-[#e5e7eb] text-[#9ca3af] shadow-none cursor-not-allowed'
								: 'text-white cursor-pointer hover:brightness-110 hover:shadow-lg active:scale-[0.98]',
						)}
						style={
							existingBasketItem && isSameConfig
								? undefined
								: {
									background: `linear-gradient(30deg, color-mix(in srgb, ${catColor}, white 25%) 0%, color-mix(in srgb, ${catColor}, black 6%) 100%)`,
									boxShadow: `0 4px 14px -3px ${catColor}40`,
								}
						}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.div
								key={
									existingBasketItem
										? isSameConfig
											? 'update-disabled'
											: 'update-active'
										: 'add'
								}
								initial={{
									opacity: 0,
									y: -20,
								}}
								animate={{
									opacity: 1,
									y: 0,
								}}
								exit={{
									opacity: 0,
									y: 20,
								}}
								transition={{
									type: 'spring',
									stiffness: 300,
									damping: 25,
								}}
								className="flex items-center gap-2.5"
							>
								{existingBasketItem ? (
									<>
										{isSameConfig ? (
											<Edit2 className="w-4.5 h-4.5" />
										) : (
											<Check className="w-4.5 h-4.5" />
										)}
										Konfiguration aktualisieren
									</>
								) : (
									<>
										<ShoppingCart className="w-4.5 h-4.5" />
										In den Warenkorb
									</>
								)}
								{!existingBasketItem && (
									<ChevronRight className="w-4 h-4 opacity-60" />
								)}
							</motion.div>
						</AnimatePresence>
					</motion.button>

					<p className="text-[0.7rem] text-center text-[#c0c0c0]">
						{existingBasketItem
							? 'Konfiguration wird im Warenkorb aktualisiert.'
							: 'Produkt konfigurieren und zum Angebot hinzufügen.'}
					</p>

					{/* Unlimited Advantage Toast */}
					{calculation.hasUnlimitedAdvantage && (
						<motion.div
							initial={{
								opacity: 0,
								y: 8,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							className="mt-4 w-full py-3.5 rounded-xl text-white font-bold text-[0.95rem] flex items-center justify-center gap-2.5 relative overflow-hidden shadow-[0_10px_25px_-5px_rgba(226,0,116,0.4)]"
							style={{
								backgroundColor: '#e20074',
							}}
						>
							<div className="absolute inset-0 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
							<Sparkles className="w-4.5 h-4.5 shrink-0" />
							<span>Der PlusKarten-Vorteil wurde aktiviert.</span>
						</motion.div>
					)}

					{/* Nudges */}
					{category === 'MOBILE' && (
						<motion.div
							id="tour-config-pluskarte"
							initial={{
								opacity: 0,
								y: 8,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							transition={{
								delay: 0.4,
								duration: 0.35,
							}}
							className="mt-4 border rounded-xl p-4 flex gap-4 items-start relative overflow-hidden"
							style={{
								backgroundColor: `${catColor}0D`,
								borderColor: `${catColor}33`,
							}}
						>
							<div
								className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
								style={{
									backgroundColor: `${catColor}1A`,
								}}
							/>
							<div
								className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
								style={{
									backgroundColor: `${catColor}1A`,
								}}
							>
								<UserPlus className="w-4 h-4" style={{
									color: catColor,
								}} />
							</div>
							<div className="flex-1">
								<h4
									className="text-[0.85rem] font-bold mb-1 leading-tight"
									style={{
										color: catColor,
									}}
								>
									Biete eine PlusKarte an.
								</h4>
								<p className="text-[0.75rem] text-[#1a1a2e]/70 leading-relaxed m-0 mb-3">
									Jede weitere Person surft für nur einen Bruchteil des Preises!{' '}
									<br />
									<strong>
										1. Karte{' '}
										<AnimatedNumber value={settings.plus_karte_first_price} />{' '}
										€; ab 2. Karte{' '}
										<AnimatedNumber
											value={settings.plus_karte_following_price}
										/>{' '}
										€
									</strong>
								</p>

								<div className="flex items-center gap-3">
									<button
										onClick={() =>
											setPlusKartenCount(Math.max(0, plusKartenCount - 1))
										}
										className="w-7 h-7 rounded-full bg-white border border-[#eaedf0] flex items-center justify-center hover:opacity-80 transition-opacity"
										style={{
											color: catColor,
										}}
									>
										<Minus className="w-3.5 h-3.5" />
									</button>
									<span className="font-extrabold text-[#1a1a2e] text-[0.95rem] w-4 text-center">
										{plusKartenCount}
									</span>
									<button
										onClick={() => setPlusKartenCount(plusKartenCount + 1)}
										className="w-7 h-7 rounded-full bg-white border border-[#eaedf0] flex items-center justify-center hover:opacity-80 transition-opacity"
										style={{
											color: catColor,
										}}
									>
										<Plus className="w-3.5 h-3.5" />
									</button>
								</div>
							</div>
						</motion.div>
					)}

					{(category === 'FIBER' || category === 'DSL') && (
						<motion.div
							initial={{
								opacity: 0,
								y: 8,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							transition={{
								delay: 0.4,
								duration: 0.35,
							}}
							className="mt-4 border rounded-xl p-4 flex gap-4 items-start relative overflow-hidden"
							style={{
								backgroundColor: `${catColor}0D`,
								borderColor: `${catColor}33`,
							}}
						>
							<div
								className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
								style={{
									backgroundColor: `${catColor}1A`,
								}}
							/>
							<div
								className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
								style={{
									backgroundColor: `${catColor}1A`,
								}}
							>
								<Smartphone className="w-4 h-4" style={{
									color: catColor,
								}} />
							</div>
							<div>
								<h4
									className="text-[0.85rem] font-bold mb-1 leading-tight"
									style={{
										color: catColor,
									}}
								>
									Biete Mobilfunk an.
								</h4>
								<p className="text-[0.75rem] text-[#1a1a2e]/70 leading-relaxed m-0 mb-3">
									Nutzt der Kunde schon Mobilfunk? Sprich ihn aktiv darauf an.
								</p>
								<Link
									href="/products/MOBILE"
									className="inline-flex items-center gap-1.5 text-[0.75rem] font-bold transition-opacity hover:opacity-80"
									style={{
										color: catColor,
									}}
								>
									Mobilfunktarif finden <ChevronRight className="w-3.5 h-3.5" />
								</Link>
							</div>
						</motion.div>
					)}

					{/* Cross-Sell: Hardware */}
					{(category === 'MOBILE' ||
						category === 'FIBER' ||
						category === 'DSL') && (
						<motion.div
							initial={{
								opacity: 0,
								y: 8,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							transition={{
								delay: 0.45,
								duration: 0.35,
							}}
							className="mt-4 border rounded-xl p-4 flex gap-4 items-start relative overflow-hidden"
							style={{
								backgroundColor: `${catColor}0D`,
								borderColor: `${catColor}33`,
							}}
						>
							<div
								className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
								style={{
									backgroundColor: `${catColor}1A`,
								}}
							/>
							<div
								className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
								style={{
									backgroundColor: `${catColor}1A`,
								}}
							>
								<Smartphone className="w-4 h-4" style={{
									color: catColor,
								}} />
							</div>
							<div>
								<h4
									className="text-[0.85rem] font-bold mb-1 leading-tight"
									style={{
										color: catColor,
									}}
								>
									Neues Endgerät dazu?
								</h4>
								<p className="text-[0.75rem] text-[#1a1a2e]/70 leading-relaxed m-0 mb-3">
									Perfektioniere den Tarif mit einem neuen Smartphone oder
									Router.
								</p>
								<Link
									href="/products/DEVICE"
									className="inline-flex items-center gap-1.5 text-[0.75rem] font-bold transition-opacity hover:opacity-80"
									style={{
										color: catColor,
									}}
								>
									Zu den Geräten <ChevronRight className="w-3.5 h-3.5" />
								</Link>
							</div>
						</motion.div>
					)}

					{/* Cross-Sell: Tarif for Devices */}
					{category === 'DEVICE' && (
						<motion.div
							initial={{
								opacity: 0,
								y: 8,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							transition={{
								delay: 0.45,
								duration: 0.35,
							}}
							className="mt-4 border rounded-xl p-4 flex gap-4 items-start relative overflow-hidden"
							style={{
								backgroundColor: `${catColor}0D`,
								borderColor: `${catColor}33`,
							}}
						>
							<div
								className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
								style={{
									backgroundColor: `${catColor}1A`,
								}}
							/>
							<div
								className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
								style={{
									backgroundColor: `${catColor}1A`,
								}}
							>
								<Wifi className="w-4 h-4" style={{
									color: catColor,
								}} />
							</div>
							<div>
								<h4
									className="text-[0.85rem] font-bold mb-1 leading-tight"
									style={{
										color: catColor,
									}}
								>
									Den passenden Tarif dazu?
								</h4>
								<p className="text-[0.75rem] text-[#1a1a2e]/70 leading-relaxed m-0 mb-3">
									Neues Endgerät, aber noch kein passender Tarif am Laufen?
								</p>
								<Link
									href="/products"
									className="inline-flex items-center gap-1.5 text-[0.75rem] font-bold transition-opacity hover:opacity-80"
									style={{
										color: catColor,
									}}
								>
									Zu den Tarifen <ChevronRight className="w-3.5 h-3.5" />
								</Link>
							</div>
						</motion.div>
					)}
				</div>
			</div>

			{/* The toast warning is now rendered via GlobalNewsNotification + useSystemAlertStore for correct stacking and glassmorphism */}
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
	children,
	id,
}: {
	title: string;
	catColor: string;
	index: number;
	children: React.ReactNode;
	id?: string;
}) {
	return (
		<motion.section
			id={id}
			initial={{
				opacity: 0,
				y: 8,
			}}
			animate={{
				opacity: 1,
				y: 0,
			}}
			transition={{
				delay: 0.1 + index * 0.08,
				duration: 0.35,
			}}
			className="bg-white rounded-xl p-5 border border-[#eaedf0] relative"
		>
			{/* Subtle gradient */}
			<div
				className="absolute inset-0 pointer-events-none rounded-xl"
				style={{
					background: `linear-gradient(to right, transparent 50%, ${catColor}05 80%, ${catColor}0a 100%)`,
				}}
			/>

			<div className="relative z-10">
				<h2 className="text-[1rem] font-bold text-[#1a1a2e] mb-4">{title}</h2>
				{children}
			</div>
		</motion.section>
	);
}

/* ── Hardware Tier Selector (MOBILE) ── */
const HARDWARE_TIERS = [
	{
		id: 'none' as const,
		label: 'SIM Only',
		sublabel: 'Ohne Smartphone',
		surchargeKey: null,
	},
	{
		id: 'smartphone' as const,
		label: 'Smartphone',
		sublabel: 'Standard-Geräte',
		surchargeKey: 'mobile_tier_smartphone' as const,
	},
	{
		id: 'top' as const,
		label: 'Top-Smartphone',
		sublabel: 'z. B. Galaxy S, iPhone',
		surchargeKey: 'mobile_tier_top' as const,
	},
	{
		id: 'premium' as const,
		label: 'Premium-Smartphone',
		sublabel: 'z. B. iPhone Pro',
		surchargeKey: 'mobile_tier_premium' as const,
	},
	{
		id: 'premium_plus' as const,
		label: 'Premium-Plus',
		sublabel: 'z. B. iPhone Pro Max, Fold',
		surchargeKey: 'mobile_tier_premium_plus' as const,
	},
];

function HardwareTierSelector({
	selected,
	onChange,
	accentColor,
	settings,
	designSettings,
}: any) {
	const isEnabled = selected !== 'none';
	const smartphoneTiers = HARDWARE_TIERS.filter((t) => t.id !== 'none');

	return (
		<div>
			{/* Main Toggle */}
			<motion.div
				whileTap={{
					scale: 0.98,
				}}
				onClick={() => {
					if (isEnabled) {
						onChange('none');
					}
					else {
						onChange('smartphone');
					}
				}}
				className={clsx(
					'relative rounded-xl p-4 border-2 cursor-pointer transition-all duration-200 flex items-center gap-4 group overflow-hidden',
					isEnabled && !designSettings?.smartphone_background_image
						? 'bg-white'
						: '',
				)}
				style={{
					borderColor: isEnabled ? accentColor : '#eaedf0',
					backgroundColor:
						isEnabled && !designSettings?.smartphone_background_image
							? `${accentColor}06`
							: 'white',
				}}
			>
				{/* Background Image Overlay */}
				{designSettings?.smartphone_background_image && (
					<div
						className={clsx(
							'absolute -inset-0.5 z-0 transition-opacity duration-300 pointer-events-none',
							isEnabled ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
						)}
					>
						<div
							className="absolute inset-0 bg-cover bg-center blur-[2px] scale-110"
							style={{
								backgroundImage: `url(${designSettings.smartphone_background_image})`,
							}}
						/>
						<div className="absolute inset-0 bg-[#1a1a2e]/40" />
					</div>
				)}

				{/* Icon */}
				<div
					className={clsx(
						'relative z-10 w-26 h-10 rounded-lg shrink-0 font-extrabold flex items-center justify-center text-[0.85rem] transition-all duration-200 border-2',
						isEnabled
							? 'text-white border-transparent'
							: 'bg-transparent border-current group-hover:text-white group-hover:border-white',
					)}
					style={{
						color:
							isEnabled || designSettings?.smartphone_background_image
								? undefined
								: accentColor,
						backgroundColor: isEnabled ? accentColor : 'transparent',
						borderColor: isEnabled
							? 'transparent'
							: designSettings?.smartphone_background_image
								? undefined
								: accentColor,
					}}
				>
					SMARTPHONE
				</div>

				<div className="flex-1 flex flex-col justify-center items-start relative z-10">
					<div className="flex items-center gap-2 mb-0.5">
						<h3
							className={clsx(
								'text-[0.95rem] font-bold m-0 transition-colors',
								designSettings?.smartphone_background_image
									? isEnabled
										? 'text-white'
										: 'text-[#1a1a2e] group-hover:text-white'
									: '',
							)}
							style={{
								color:
									isEnabled || designSettings?.smartphone_background_image
										? undefined
										: accentColor,
							}}
						>
							Mit Smartphone buchen
						</h3>
					</div>
					<p
						className={clsx(
							'text-[0.78rem] m-0 transition-colors',
							designSettings?.smartphone_background_image
								? isEnabled
									? 'text-white/80'
									: 'text-[#999] group-hover:text-white/80'
								: 'text-[#999]',
						)}
					>
						ab{' '}
						{settings.mobile_tier_smartphone.toFixed(2).replace('.', ',')} €
						mtl. Aufpreis
					</p>
				</div>

				{/* Toggle checkbox circle */}
				<div
					className={clsx(
						'relative z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200',
						designSettings?.smartphone_background_image && !isEnabled
							? 'border-white/30 group-hover:border-white/60'
							: '',
					)}
					style={{
						borderColor: isEnabled
							? accentColor
							: designSettings?.smartphone_background_image
								? undefined
								: '#ddd',
						backgroundColor: isEnabled ? accentColor : 'transparent',
					}}
				>
					{isEnabled && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
				</div>
			</motion.div>

			{/* Tier Options (shown when toggled on) */}
			{isEnabled && (
				<motion.div
					initial={{
						opacity: 0,
						height: 0,
					}}
					animate={{
						opacity: 1,
						height: 'auto',
					}}
					transition={{
						duration: 0.25,
					}}
					className="mt-3 space-y-2"
				>
					{smartphoneTiers.map((tier) => {
						const isSelected = selected === tier.id;
						const surcharge = tier.surchargeKey ? settings[tier.surchargeKey] : 0;

						return (
							<motion.div
								key={tier.id}
								whileTap={{
									scale: 0.98,
								}}
								onClick={() => onChange(tier.id)}
								className="rounded-xl p-3.5 border-2 cursor-pointer transition-all duration-200"
								style={{
									borderColor: isSelected ? accentColor : '#eaedf0',
									backgroundColor: isSelected ? `${accentColor}08` : '#fafafa',
								}}
							>
								<div className="flex items-center gap-3">
									{/* Radio circle with Check */}
									<div
										className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
										style={{
											borderColor: isSelected ? accentColor : '#ccc',
											backgroundColor: isSelected ? accentColor : 'transparent',
										}}
									>
										{isSelected && (
											<Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
										)}
									</div>

									<div className="flex-1 min-w-0">
										<span className="text-[0.85rem] font-semibold text-[#1a1a2e]">
											{tier.label}
										</span>
									</div>

									<span
										className="text-[0.82rem] font-bold shrink-0"
										style={{
											color: isSelected ? accentColor : '#888',
										}}
									>
										+{surcharge.toFixed(2).replace('.', ',')} €
									</span>
								</div>
							</motion.div>
						);
					})}
				</motion.div>
			)}
		</div>
	);
}
