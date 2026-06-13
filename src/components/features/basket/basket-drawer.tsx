'use client';

/* eslint-disable @typescript-eslint/no-use-before-define */


import {
	generateOfferPdf,
} from '@/lib/pdf-generator';
import {
	useOpenPanel,
} from '@openpanel/nextjs';
import {
	useBasketLogic,
} from '@/hooks/use-basket-logic';

import type {
	BasketItem,
	Basket,
} from '@/lib/store/basket-store';
import {
	useBasketStore,
} from '@/lib/store/basket-store';
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
	Plus,
	X,
	Columns,
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
	useState, useEffect, useRef, useMemo, useCallback, memo,
} from 'react';
import {
	motion, AnimatePresence, LayoutGroup,
} from 'framer-motion';
import {
	useSettingsStore,
} from '@/lib/store/settings-store';
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

function TabCard({
	basket,
	isActive,
	isComparison,
	onMakeActive,
	editingId,
	setEditingId,
	editName,
	setEditName,
	renameBasket,
	removeBasket,
	basketsCount,
	catColor,
}: {
	basket: Basket;
	isActive: boolean;
	isComparison: boolean;
	onMakeActive: () => void;
	editingId: string | null;
	setEditingId: (id: string | null) => void;
	editName: string;
	setEditName: (name: string) => void;
	renameBasket: (id: string, name: string) => void;
	removeBasket: (id: string) => void;
	basketsCount: number;
	catColor: string;
}) {
	const isEditing = editingId === basket.id;

	if (isEditing) {
		return (
			<motion.div
				layoutId={`tab-card-${basket.id}`}
				layout
				transition={{
					type: 'spring',
					stiffness: 300,
					damping: 32,
					delay: isComparison ? 0.15 : 0,
				}}
				className="text-[0.72rem] flex items-center justify-between transition-colors duration-300 border shadow-sm w-full px-3 py-1.5 rounded-xl border-[#eaedf0] gap-1.5 shrink-0"
				style={{
					backgroundColor: '#ffffff',
					borderColor: catColor,
					color: '#1a1a2e',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<input
					type="text"
					value={editName}
					onChange={(e) => setEditName(e.target.value)}
					onBlur={() => {
						renameBasket(basket.id, editName);
						setEditingId(null);
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							renameBasket(basket.id, editName);
							setEditingId(null);
						}
						else if (e.key === 'Escape') {
							setEditingId(null);
						}
					}}
					className="w-full text-left text-[0.72rem] font-bold text-[#1a1a2e] border-none outline-none p-0 bg-transparent flex-1 min-w-0"
					autoFocus
					maxLength={25}
				/>
				{basketsCount > 1 && (
					<div className="w-3.5 h-3.5 shrink-0 opacity-0 pointer-events-none" />
				)}
			</motion.div>
		);
	}

	return (
		<motion.div
			layoutId={`tab-card-${basket.id}`}
			layout
			transition={{
				type: 'spring',
				stiffness: 300,
				damping: 32,
				delay: isComparison ? 0.15 : 0,
			}}
			onClick={(e) => {
				e.stopPropagation();
				onMakeActive();
			}}
			onDoubleClick={(e) => {
				e.stopPropagation();
				setEditingId(basket.id);
				setEditName(basket.name);
			}}
			className="group/tab text-[0.72rem] flex items-center justify-between transition-colors duration-300 select-none border cursor-pointer font-semibold shadow-sm w-full px-3 py-1.5 rounded-xl border-[#eaedf0] gap-1.5 shrink-0"
			style={
				isActive
					? {
						backgroundColor: catColor,
						borderColor: catColor,
						color: '#ffffff',
					}
					: {
						backgroundColor: '#f7f8fa',
						borderColor: '#eaedf0',
						color: '#555555',
					}
			}
		>
			<span className={clsx('flex items-center gap-1 min-w-0 flex-1', !isComparison && 'max-w-[80px]')}>
				<span className="truncate flex-1" title={basket.name}>
					{basket.name}
				</span>
			</span>

			{basketsCount > 1 && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						removeBasket(basket.id);
					}}
					className={clsx(
						'w-3.5 h-3.5 rounded-full flex items-center justify-center p-0 transition-all border-none cursor-pointer shrink-0',
						isActive
							? 'text-white/70 hover:text-white hover:bg-white/20'
							: 'text-[#999] hover:text-[#dc2626] hover:bg-[#fee2e2]',
					)}
				>
					<X className="w-2.5 h-2.5" />
				</button>
			)}
		</motion.div>
	);
}

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
	const op = useOpenPanel();
	const {
		baskets,
		activeBasketId,
		isComparisonMode,
		setIsComparisonMode,
		addBasket,
		removeBasket,
		setActiveBasketId,
		renameBasket,
	} = useBasketStore();

	const handleAddBasket = () => {
		const newId = addBasket();
		op.track('basket_tab_created', {
			basketId: newId,
			totalTabs: baskets.length + 1,
		});
	};

	const showComparison = isComparisonMode && baskets.length > 1;

	const [
		editingId,
		setEditingId,
	] = useState<string | null>(null);
	const [
		editName,
		setEditName,
	] = useState('');
	const [
		showLeftFade,
		setShowLeftFade,
	] = useState(false);
	const [
		showRightFade,
		setShowRightFade,
	] = useState(false);

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
		activeLoadingIndex,
		setActiveLoadingIndex,
	] = useState(0);

	useEffect(() => {
		if (isComparisonMode) {
			setActiveLoadingIndex(0);
		}
	}, [
		isComparisonMode,
	]);

	// Auto-skip columns that have no items/timeline to load
	useEffect(() => {
		if (isComparisonMode && activeLoadingIndex < baskets.length) {
			const currentBasket = baskets[activeLoadingIndex];
			if (currentBasket && currentBasket.items.length === 0) {
				setActiveLoadingIndex((prev) => prev + 1);
			}
		}
	}, [
		activeLoadingIndex,
		baskets,
		isComparisonMode,
	]);

	const teamEmail = session?.team?.email || '0800 33 01000';
	const mailtoEmail = session?.team?.email || 'team06@telekom.de';
	const salesRepName = session
		? [
			session.firstName,
			session.lastName,
		].filter(Boolean).join(' ')
		: '';
	const locationName = session?.location?.name || '';


	const params = useParams();
	const pathname = usePathname();
	const categoryFromUrl = (params?.category as string) || (pathname.match(/\/products\/([^/]+)/)?.[1]);
	const catColor = categoryFromUrl
		? CATEGORY_COLORS[categoryFromUrl.toUpperCase()] || '#e20074'
		: '#e20074';

	const tabsRef = useRef<HTMLDivElement>(null);

	// Synchronized column scrolling refs and controller
	const scrollContainersRef = useRef<Map<string, HTMLDivElement>>(new Map());
	const isSyncScrolling = useRef(false);

	const registerScrollContainer = useCallback((id: string, el: HTMLDivElement | null) => {
		if (el) {
			scrollContainersRef.current.set(id, el);
		}
		else {
			scrollContainersRef.current.delete(id);
		}
	}, [
	]);

	const handleColumnScroll = useCallback((scrolledId: string, scrollTop: number) => {
		if (isSyncScrolling.current) return;
		isSyncScrolling.current = true;

		scrollContainersRef.current.forEach((el, id) => {
			if (id !== scrolledId && el) {
				el.scrollTop = scrollTop;
			}
		});

		requestAnimationFrame(() => {
			isSyncScrolling.current = false;
		});
	}, [
	]);

	const handleLoadFinished = useCallback(() => {
		setActiveLoadingIndex((prev) => prev + 1);
	}, [
	]);


	useEffect(() => {
		setIsMounted(true);
	}, [
	]);

	useEffect(() => {
		const el = tabsRef.current;
		if (!el) return;

		const handleScroll = () => {
			const scrollLeft = el.scrollLeft;
			const maxScroll = el.scrollWidth - el.clientWidth;
			setShowLeftFade(scrollLeft > 2);
			setShowRightFade(scrollLeft < maxScroll - 2);
		};

		// Run initially
		handleScroll();
		// Run shortly after to allow Next.js / DOM elements to render and size
		const timeoutId = setTimeout(handleScroll, 100);

		el.addEventListener('scroll', handleScroll);
		window.addEventListener('resize', handleScroll);

		return () => {
			el.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleScroll);
			clearTimeout(timeoutId);
		};
	}, [
		baskets,
		activeBasketId,
		showComparison,
	]);

	useEffect(() => {
		const el = tabsRef.current;
		if (!el) return;

		const timeoutId = setTimeout(() => {
			const activeTabEl = el.querySelector('[data-active="true"]') as HTMLElement;
			if (activeTabEl) {
				const containerWidth = el.clientWidth;
				const tabLeft = activeTabEl.offsetLeft;
				const tabWidth = activeTabEl.offsetWidth;
				const scrollLeft = el.scrollLeft;

				// Ensure active tab is outside the 48px (w-12) fade boundaries
				const padding = 52;

				if (tabLeft < scrollLeft + padding) {
					el.scrollTo({
						left: Math.max(0, tabLeft - padding),
						behavior: 'smooth',
					});
				}
				else if (tabLeft + tabWidth > scrollLeft + containerWidth - padding) {
					el.scrollTo({
						left: Math.min(el.scrollWidth - containerWidth, tabLeft + tabWidth - containerWidth + padding),
						behavior: 'smooth',
					});
				}
			}
		}, 50);

		return () => clearTimeout(timeoutId);
	}, [
		activeBasketId,
		showComparison,
	]);

	useEffect(() => {
		const el = tabsRef.current;
		if (!el) return;

		let targetScrollLeft = el.scrollLeft;
		let currentScrollLeft = el.scrollLeft;
		let animationFrameId: number | null = null;

		const updateScroll = () => {
			const diff = targetScrollLeft - currentScrollLeft;
			if (Math.abs(diff) > 0.5) {
				currentScrollLeft += diff * 0.15;
				el.scrollLeft = currentScrollLeft;
				animationFrameId = requestAnimationFrame(updateScroll);
			}
			else {
				el.scrollLeft = targetScrollLeft;
				currentScrollLeft = targetScrollLeft;
				animationFrameId = null;
			}
		};

		const handleWheel = (e: WheelEvent) => {
			const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
			if (delta === 0) return;
			e.preventDefault();

			if (animationFrameId === null) {
				currentScrollLeft = el.scrollLeft;
				targetScrollLeft = el.scrollLeft;
			}

			const maxScroll = el.scrollWidth - el.clientWidth;
			targetScrollLeft = Math.max(0, Math.min(maxScroll, targetScrollLeft + delta));

			if (animationFrameId === null) {
				animationFrameId = requestAnimationFrame(updateScroll);
			}
		};

		el.addEventListener('wheel', handleWheel, {
			passive: false,
		});
		return () => {
			el.removeEventListener('wheel', handleWheel);
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	}, [
		baskets,
		activeBasketId,
		showComparison,
	]);

	const activeBasket = baskets.find((b) => b.id === activeBasketId) || baskets[0];

	return (
		<aside
			id="tour-basket"
			className="bg-white border-l border-[#eaedf0] flex flex-col z-10 overflow-hidden h-full relative"
		>
			{/* Header */}
			<div className={clsx('py-4 shrink-0', showComparison ? 'px-4' : 'px-5')}>
				<div className="flex items-center justify-between">
					<h2 className="m-0 text-[0.88rem] text-[#1a1a2e] font-bold tracking-tight">
						Zusammenfassung
					</h2>
					{!showComparison && activeBasket && (
						<span
							className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full transition-all duration-500"
							style={{
								color: catColor,
								backgroundColor: `${catColor}10`,
							}}
						>
							{activeBasket.items.length} {activeBasket.items.length === 1 ? 'Produkt' : 'Produkte'}
						</span>
					)}
				</div>

				{/* Header Actions Row */}
				<div className={clsx('flex items-center mt-3', showComparison ? 'gap-4 w-full' : 'justify-between gap-2')}>
					<div className={clsx('flex items-center flex-1', showComparison ? 'gap-4' : 'gap-1.5 overflow-hidden')}>
						<div className="relative flex-1 overflow-hidden">
							<LayoutGroup id="basket-tabs">
								<motion.div
									id="tour-basket-tabs"
									layout
									ref={tabsRef}
									className={clsx(
										'relative flex items-center scrollbar-none py-1 flex-1 pr-1',
										showComparison ? 'gap-4' : 'gap-1.5 overflow-x-auto',
									)}
									style={{
										scrollbarWidth: 'none',
										msOverflowStyle: 'none',
									}}
								>
									{baskets.map((basket) => (
										<motion.div
											layout
											key={basket.id}
											className={clsx(
												showComparison ? 'flex-1 min-w-[310px] max-w-[330px]' : 'shrink-0 w-[120px]',
											)}
											transition={{
												type: 'spring',
												stiffness: 300,
												damping: 32,
												delay: showComparison ? 0.15 : 0,
											}}
										>
											<TabCard
												basket={basket}
												isActive={basket.id === activeBasketId}
												isComparison={showComparison}
												onMakeActive={() => setActiveBasketId(basket.id)}
												editingId={editingId}
												setEditingId={setEditingId}
												editName={editName}
												setEditName={setEditName}
												renameBasket={renameBasket}
												removeBasket={removeBasket}
												basketsCount={baskets.length}
												catColor={catColor}
											/>
										</motion.div>
									))}
								</motion.div>
							</LayoutGroup>

							{/* Gradient fade-out overlay on the left */}
							<div
								className={clsx(
									'absolute left-0 top-0 bottom-0 w-12 pointer-events-none z-10 transition-opacity duration-300',
									showLeftFade && !showComparison ? 'opacity-100' : 'opacity-0',
								)}
								style={{
									background: 'linear-gradient(to right, #ffffff 0%, rgba(255, 255, 255, 0) 100%)',
								}}
							/>

							{/* Gradient fade-out overlay on the right */}
							<div
								className={clsx(
									'absolute right-0 top-0 bottom-0 w-12 pointer-events-none z-10 transition-opacity duration-300',
									showRightFade && !showComparison ? 'opacity-100' : 'opacity-0',
								)}
								style={{
									background: 'linear-gradient(to left, #ffffff 0%, rgba(255, 255, 255, 0) 100%)',
								}}
							/>
						</div>

						{!showComparison && baskets.length < 3 && (
							<button
								id="tour-basket-add-tab"
								onClick={handleAddBasket}
								className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#f7f8fa] hover:bg-[#eaeaea] text-[#888] transition-all border border-[#eaedf0] shrink-0 cursor-pointer active:scale-90"
								title="Neue Konfiguration hinzufügen"
							>
								<Plus className="w-4 h-4" />
							</button>
						)}
					</div>

					{/* Action Buttons (Plus & Columns Toggle) */}
					{showComparison ? (
						<div className="w-[80px] flex items-center justify-end gap-1.5 shrink-0 ml-auto pr-1">
							{baskets.length < 3 && (
								<button
									id="tour-basket-add-tab"
									onClick={handleAddBasket}
									className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f7f8fa] hover:bg-[#eaeaea] text-[#888] transition-all border border-[#eaedf0] shrink-0 cursor-pointer active:scale-90"
									title="Neue Konfiguration hinzufügen"
								>
									<Plus className="w-4 h-4" />
								</button>
							)}
							{baskets.length > 1 && (
								<button
									id="tour-basket-compare"
									onClick={() => setIsComparisonMode(!isComparisonMode)}
									className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 cursor-pointer active:scale-95 border bg-[#e20074] text-white border-[#e20074] shadow-sm hover:opacity-90"
									style={{
										backgroundColor: catColor,
										borderColor: catColor,
									}}
									title="Vergleichsmodus beenden"
								>
									<Columns className="w-4 h-4" />
								</button>
							)}
						</div>
					) : (
						baskets.length > 1 && (
							<button
								id="tour-basket-compare"
								onClick={() => setIsComparisonMode(!isComparisonMode)}
								className={clsx(
									'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 cursor-pointer active:scale-95 border',
									isComparisonMode
										? 'bg-[#e20074] text-white border-[#e20074] shadow-sm hover:opacity-90'
										: 'bg-[#f7f8fa] text-[#555] border-[#eaedf0] hover:bg-[#eaeaea]',
								)}
								style={isComparisonMode ? {
									backgroundColor: catColor,
									borderColor: catColor,
								} : {
								}}
								title={isComparisonMode ? 'Vergleichsmodus beenden' : 'Vergleichsmodus aktivieren'}
							>
								<Columns className="w-4 h-4" />
							</button>
						)
					)}
				</div>
			</div>

			{/* Rounded fluent divider line below header */}
			<div className="px-4 shrink-0">
				<div className="h-[2px] bg-[#eaedf0] rounded-full w-full" />
			</div>

			{/* Columns Content Grid */}
			<div className="flex-1 flex overflow-hidden">
				{!isMounted ? (
					<div className="flex-1 px-4 py-4 flex flex-col gap-4">
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
					<motion.div
						layout
						className={clsx(
							'flex-1 flex overflow-x-auto scrollbar-none bg-[#f7f8fa] h-full relative',
							showComparison ? 'px-4 py-4' : '',
						)}
						transition={{
							type: 'spring',
							stiffness: 300,
							damping: 32,
						}}
					>
						{baskets.map((basket, index) => {
							const isColumnActive = basket.id === activeBasketId;
							const isVisible = showComparison || isColumnActive;
							const hasMargin = showComparison && index < baskets.length - 1;

							return (
								<motion.div
									key={basket.id}
									layout
									initial={false}
									animate={{
										opacity: isVisible ? (showComparison && !isColumnActive ? 0.7 : 1) : 0,
										scale: isVisible ? 1 : 0.95,
										width: isVisible ? (showComparison ? '320px' : '100%') : '0px',
										marginRight: isVisible && hasMargin ? '16px' : '0px',
									}}
									transition={{
										type: 'spring',
										stiffness: 300,
										damping: 32,
									}}
									className={clsx(
										'h-full shrink-0 flex flex-col overflow-hidden',
										!isVisible && 'pointer-events-none',
									)}
								>
									<BasketColumn
										basket={basket}
										isActive={isColumnActive}
										setActiveBasketId={setActiveBasketId}
										catColor={catColor}
										teamEmail={teamEmail}
										mailtoEmail={mailtoEmail}
										salesRepName={salesRepName}
										locationName={locationName}
										offerTemplateText={offerTemplateText}
										clearAfterExport={clearAfterExport}
										isComparisonMode={showComparison}
										basketsCount={baskets.length}
										registerScrollContainer={registerScrollContainer}
										onColumnScroll={handleColumnScroll}
										columnIndex={index}
										activeLoadingIndex={activeLoadingIndex}
										onLoadFinished={handleLoadFinished}
									/>
								</motion.div>
							);
						})}
						{/* Extra trailing space to match the header action buttons and ensure perfect vertical alignment */}
						{showComparison && <div className="w-[80px] shrink-0" />}
					</motion.div>
				)}
			</div>
		</aside>
	);
}

const BasketColumn = memo(function BasketColumn({
	basket,
	isActive,
	setActiveBasketId,
	catColor,
	teamEmail,
	mailtoEmail,
	salesRepName,
	locationName,
	offerTemplateText,
	clearAfterExport,
	isComparisonMode,
	basketsCount,
	registerScrollContainer,
	onColumnScroll,
	columnIndex = 0,
	activeLoadingIndex = 0,
	onLoadFinished,
}: {
	basket: Basket;
	isActive: boolean;
	setActiveBasketId: (id: string) => void;
	catColor: string;
	teamEmail: string;
	mailtoEmail: string;
	salesRepName: string;
	locationName: string;
	offerTemplateText: string;
	clearAfterExport: boolean;
	isComparisonMode: boolean;
	basketsCount: number;
	registerScrollContainer?: (id: string, el: HTMLDivElement | null) => void;
	onColumnScroll?: (id: string, scrollTop: number) => void;
	columnIndex?: number;
	activeLoadingIndex?: number;
	onLoadFinished?: () => void;
}) {
	const op = useOpenPanel();
	const {
		clearBasketForId,
		setBasketCreditsForId,
	} = useBasketStore();

	const [
		creditsOpen,
		setCreditsOpen,
	] = useState(false);
	const [
		oneTimeOpen,
		setOneTimeOpen,
	] = useState(false);
	const [
		isGenerating,
		setIsGenerating,
	] = useState<'idle' | 'generating' | 'success'>('idle');
	const [
		randomNotice,
		setRandomNotice,
	] = useState('');

	useEffect(() => {
		setRandomNotice(EMPTY_NOTICES[Math.floor(Math.random() * EMPTY_NOTICES.length)]);
	}, [
	]);

	const {
		totals,
		combinedSteps,
		groupedOneTimeCosts,
		totalOneTime,
		totalCredits,
		settings,
	} = useBasketLogic(basket.id);

	const items = basket.items || [
];
	const basketCredits = basket.basketCredits || [
];
	const totalMonthly = totals.monthly;

	const isMultiColumn = isComparisonMode && basketsCount > 1;

	return (
		<div
			className={clsx(
				'flex flex-col h-full overflow-hidden bg-transparent relative w-full h-full',
				isMultiColumn ? 'gap-4' : 'bg-[#f7f8fa]',
			)}
		>


			{/* Product / Content Card */}
			<div
				className={clsx(
					'flex-1 flex flex-col overflow-hidden bg-white relative transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
					isMultiColumn ? 'shadow-sm rounded-2xl border' : 'rounded-none border-0',
					isMultiColumn && isActive && 'z-10',
					isMultiColumn && !isActive && 'opacity-70 hover:opacity-95 cursor-pointer bg-slate-50/20',
				)}
				style={
					isActive && isMultiColumn
						? {
							borderColor: catColor,
							boxShadow: `0 4px 12px rgba(0,0,0,0.05), inset 0 0 0 1.5px ${catColor}`,
						}
						: isMultiColumn
							? {
								borderColor: '#eaedf0',
							}
							: {
							}
				}
				onClick={() => {
					if (isMultiColumn && !isActive) {
						setActiveBasketId(basket.id);
					}
				}}
			>
				{/* Inner Scrollable Container */}
				<div
					ref={(el) => {
						if (isMultiColumn && registerScrollContainer) {
							registerScrollContainer(basket.id, el);
						}
					}}
					onScroll={(e) => {
						if (isMultiColumn && onColumnScroll) {
							onColumnScroll(basket.id, e.currentTarget.scrollTop);
						}
					}}
					className={clsx(
						'flex-1 overflow-y-auto scrollbar-none',
						isMultiColumn ? 'px-4 py-4' : 'px-5 py-4',
					)}
				>
					{/* Chart */}
					{items.length > 0 && (
						<div className="mb-4 bg-[#f7f8fa] rounded-xl p-3.5">
							<CombinedTimeline
								items={items}
								catColor={catColor}
								columnIndex={columnIndex}
								activeLoadingIndex={activeLoadingIndex}
								onLoadFinished={onLoadFinished}
							/>
						</div>
					)}

					{/* Credits */}
					{items.length > 0 && (
						<div className="mb-4">
							<button
								className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#eaedf0] rounded-xl text-left transition-all duration-200 hover:border-[#ddd] cursor-pointer"
								onClick={(e) => {
									e.stopPropagation();
									setCreditsOpen(!creditsOpen);
								}}
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
							<AnimatePresence initial={false}>
								{creditsOpen && (
									<motion.div
										initial={{
											height: 0,
											opacity: 0,
											marginTop: 0,
										}}
										animate={{
											height: 'auto',
											opacity: 1,
											marginTop: 8,
										}}
										exit={{
											height: 0,
											opacity: 0,
											marginTop: 0,
										}}
										transition={{
											duration: 0.2,
											ease: 'easeInOut',
										}}
										className="pl-1"
										style={{
 overflow: creditsOpen ? 'visible' : 'hidden',
}}
									>
										<CreditSelector
											basketCredits={basketCredits}
											setBasketCredits={(credits) => setBasketCreditsForId(basket.id, credits)}
										/>
									</motion.div>
								)}
							</AnimatePresence>
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
									className="bg-white min-h-[220px] flex flex-col items-center justify-center p-6 text-center"
								>
									<div
										className="w-14 h-16 rounded-[1.2rem] flex items-center justify-center mb-4 border transition-all duration-500"
										style={{
											backgroundColor: `${catColor}10`,
											borderColor: `${catColor}20`,
										}}
									>
										<ShoppingBag
											className="w-6 h-6 transition-colors duration-500"
											color={catColor}
											strokeWidth={2}
										/>
									</div>
									<h3 className="text-[0.95rem] font-extrabold text-[#1a1a2e] m-0 mb-2 leading-tight tracking-tight">
										Warenkorb leer
									</h3>
									<p className="text-[0.8rem] text-[#888] font-medium leading-relaxed max-w-[200px] m-0">
										{randomNotice}
									</p>
								</motion.div>
							) : (
								items.map((item) => (
									<BasketItemCard
										key={item.id}
										item={item}
										basketId={basket.id}
										settings={settings}
									/>
								))
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>

			{/* Bottom Cost Summary Card */}
			{items.length > 0 && (
				<div
					className={clsx(
						'bg-white shrink-0 rounded-2xl border border-[#eaedf0] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
						isMultiColumn
							? 'w-full p-4'
							: 'p-4 mx-4 mb-4 mt-2 w-[calc(100%-32px)]',
					)}
				>
					{/* Costs */}
					<div className="space-y-1.5 mb-3">
						<div
							className={clsx(
								'flex justify-between items-center select-none',
								Object.keys(groupedOneTimeCosts).length > 0 ? 'cursor-pointer group/onetime' : '',
							)}
							onClick={() => {
								if (Object.keys(groupedOneTimeCosts).length > 0) {
									setOneTimeOpen(!oneTimeOpen);
								}
							}}
						>
							<span className="text-[0.72rem] text-[#aaa] flex items-center gap-1 group-hover/onetime:text-[#777] transition-colors">
								Einmalige Kosten insg.
								{Object.keys(groupedOneTimeCosts).length > 0 && (
									<ChevronDown
										className={clsx(
											'w-3 h-3 text-[#bbb] transition-transform duration-200 group-hover/onetime:text-[#999]',
											oneTimeOpen && 'rotate-180',
										)}
									/>
								)}
							</span>
							<span
								className={clsx(
									'text-[0.78rem] font-semibold flex items-center overflow-hidden h-[1.2rem]',
									totalOneTime < 0 ? 'text-[#00a878]' : 'text-[#1a1a2e]',
								)}
							>
								{totalOneTime < 0 && (
									<span className="mr-[2px] text-[0.7rem]">Gutschrift i. H. v.</span>
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
								<span className="ml-[3px]">€</span>
							</span>
						</div>

						<AnimatePresence initial={false}>
							{oneTimeOpen && Object.keys(groupedOneTimeCosts).length > 0 && (
								<motion.div
									initial={{
										height: 0,
										opacity: 0,
										marginTop: 0,
									}}
									animate={{
										height: 'auto',
										opacity: 1,
										marginTop: 4,
									}}
									exit={{
										height: 0,
										opacity: 0,
										marginTop: 0,
									}}
									transition={{
										duration: 0.2,
										ease: 'easeInOut',
									}}
									className="overflow-hidden space-y-1 pl-1"
								>
									{Object.entries(groupedOneTimeCosts).map(([
										name,
										cost ]: [string, number
										]) => (
										<div
											key={name}
											className="flex justify-between items-center text-[0.72rem] text-[#aaa] pr-1.5"
										>
											<span className="truncate max-w-[190px]">{name}</span>
											<span>{cost.toFixed(2)} €</span>
										</div>
									))}
								</motion.div>
							)}
						</AnimatePresence>

						{totalCredits > 0 && (
							<div className="flex justify-between items-center text-[0.72rem] text-[#00a878] mt-1 pr-1.5">
								<span>Gutschrift</span>
								<span>
									−<AnimatedNumber value={totalCredits} /> €
								</span>
							</div>
						)}
					</div>

					{/* Monthly total */}
					<div className="bg-[#f7f8fa] border border-[#eaedf0] px-3.5 py-2.5 rounded-xl flex flex-col gap-1.5 mb-3">
						<div className="flex justify-between items-center mb-0.5">
							<span className="text-[0.6rem] uppercase tracking-wider text-[#999] font-medium">
								Kostenübersicht (24 Monate)
							</span>
						</div>
						{combinedSteps.map((step: { start: number; end: number; total: number }, idx: number) => (
							<div key={idx} className="flex justify-between items-center">
								<span className="text-[0.72rem] text-[#888]">
									{step.start === step.end
										? `Monat ${step.start}`
										: `Monat ${step.start} - ${step.end}`}
								</span>
								<span className="text-[0.88rem] font-bold tracking-tight text-[#1a1a2e] flex items-center">
									<AnimatedNumber value={step.total} />
									<span className="ml-[3px] text-[0.72rem] font-normal text-[#aaa]">
										€
									</span>
								</span>
							</div>
						))}

						{/* Custom rounded divider line */}
						<div className="h-[2px] bg-slate-200/50 rounded-full w-full mt-1 shrink-0" />

						<div className="pt-1.5 flex justify-between items-center">
							<div className="flex flex-col">
								<span className="text-[0.6rem] uppercase tracking-wider text-[#999] font-medium">
									Ø Monatlich
								</span>
								<span className="text-[0.55rem] text-[#bbb] font-medium">
									ca.{' '}
									<AnimatedNumber
										value={items.length > 0 ? totals.daily : 0}
									/>{' '}
									€ am Tag
								</span>
							</div>
							<span
								className="text-[1.2rem] font-extrabold tracking-tight flex items-center leading-none transition-colors duration-500"
								style={{
									color: catColor,
								}}
							>
								<AnimatedNumber value={totalMonthly} />
								<span
									className="ml-[3px] text-[0.75rem] font-normal transition-colors duration-500"
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
							onClick={() => clearBasketForId(basket.id)}
							className="px-3 py-2 rounded-xl bg-[#f7f8fa] text-[0.75rem] text-[#999] hover:bg-[#fee2e2] hover:text-[#dc2626] font-medium transition-all duration-200 border border-[#eaedf0] hover:border-[#fca5a5] cursor-pointer active:scale-95 text-center flex items-center justify-center"
						>
							Leeren
						</button>
						<button
							onClick={async () => {
								setIsGenerating('generating');
								op.track('offer_created', {
									basketId: basket.id,
									itemsCount: items.length,
									totalMonthly,
									totalOneTime,
									totalCredits,
									salesRepName,
									teamEmail,
								});
								await generateOfferPdf(
									items,
									basketCredits,
									settings,
									teamEmail,
									salesRepName,
									locationName,
								);

								const subject = encodeURIComponent('Ihr persönliches Angebot der Telekom');
								const bodyText = encodeURIComponent(
									offerTemplateText.replace(/\{\{salesRepName\}\}/g, salesRepName),
								);

								window.location.href = `mailto:${mailtoEmail}?subject=${subject}&body=${bodyText}`;

								setIsGenerating('success');
								if (clearAfterExport) {
									setTimeout(() => clearBasketForId(basket.id), 500);
								}
								setTimeout(() => setIsGenerating('idle'), 10000);
							}}
							disabled={isGenerating !== 'idle'}
							className={clsx(
								'flex-1 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 text-[0.78rem] cursor-pointer active:scale-95 border border-solid',
								isGenerating === 'idle' && (
									isMultiColumn && !isActive
										? 'bg-white hover:text-white hover:opacity-100 transition-colors hover:bg-[var(--btn-color)] hover:text-white'
										: 'text-white active:scale-95 hover:opacity-90 border-transparent'
								),
								isGenerating === 'generating' && 'bg-[#ff69b4] text-white border-transparent cursor-not-allowed',
								isGenerating === 'success' && 'bg-[#00a878] text-white border-transparent',
							)}
							style={
								isGenerating === 'idle'
									? isMultiColumn && !isActive
										? {
											borderColor: catColor,
											color: catColor,
											backgroundColor: '#ffffff',
											'--btn-color': catColor,
										} as React.CSSProperties
										: {
											backgroundColor: catColor,
											borderColor: 'transparent',
											'--btn-color': catColor,
										} as React.CSSProperties
									: {
									}
							}
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
			)}
		</div>
	);
});

const BasketItemCard = memo(function BasketItemCard({
	item,
	basketId,
	settings,
}: {
	item: BasketItem;
	basketId: string;
	settings: PricingSettings;
}) {
	const router = useRouter();
	const removeItemForId = useBasketStore((state) => state.removeItemForId);
	const [
		isBadgeHovered,
		setIsBadgeHovered,
	] = useState(false);
	const calculation = useMemo(() => {
		return calculateProductCosts({
			product: item.product,
			businessCase: item.config.businessCase,
			magentaTVPackage: item.config.magentaTVPackage,
			selectedSpecialPriceIds: item.config.selectedSpecialPriceIds,
			selectedAddonIds: item.config.selectedAddonIds,
			vouchers: item.config.vouchers,
			hardwarePurchaseType: item.config.hardwarePurchaseType,
			plusKartenCount: item.config.plusKartenCount,
			plusKarten: item.config.plusKarten,
			settings,
			customBasePrice: item.config.customBasePrice,
			isHybrid: (item.config as any).isHybrid,
		});
	}, [
		item,
		settings,
	]);

	const catColor = CATEGORY_COLORS[item.product.category] || '#e20074';
	const catLabel =
		CATEGORY_LABELS[item.product.category] || item.product.category;

	const itemSuffix = item.config.magentaTVPackage
		? ` mit ${MAGENTA_TV_PACKAGES[item.config.magentaTVPackage].name}`
		: item.config.hardwareTier && item.config.hardwareTier !== 'none'
			? ` mit ${{
				smartphone: 'Smartphone',
				top: 'Top-Smartphone',
				premium: 'Premium-Smartphone',
				premium_plus: 'Premium-Plus-Smartphone',
			}[item.config.hardwareTier] || 'Smartphone'}`
			: '';
	let baseName = item.product.name;
	if ((item.config as any).isHybrid) {
		if (baseName.includes('(DSL)')) {
			baseName = baseName.replace('(DSL)', 'Hybrid').trim();
		} else {
			baseName = `${baseName} Hybrid`;
		}
	}
	const fullItemTitle = `${baseName}${itemSuffix}`;

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
			className="bg-white border border-[#eaedf0] rounded-xl p-3.5 transition-colors duration-200 hover:border-[#ddd] group relative overflow-hidden cursor-pointer"
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
						<h4
							className="font-bold text-[0.85rem] text-[#1a1a2e] leading-tight m-0 mt-0.5 truncate max-w-full"
							title={fullItemTitle}
						>
							<span className="truncate">
								{fullItemTitle}
							</span>
						</h4>
					</div>

					{/* Delete */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							removeItemForId(basketId, item.id);
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
				{(() => {
					const hasNewConfig = item.config.plusKarten !== undefined;
					const pkNormal = hasNewConfig ? (item.config.plusKarten?.normal ?? 0) : (item.config.plusKartenCount ?? 0);
					const pkFlex = hasNewConfig ? (item.config.plusKarten?.flex ?? 0) : 0;
					const pkKids = hasNewConfig ? (item.config.plusKarten?.kidsTeens ?? 0) : 0;
					const totalCount = pkNormal + pkFlex + pkKids;

					if (totalCount === 0) return null;

					const normalCost = pkNormal > 0
						? (settings.plus_karte_first_price + Math.max(0, pkNormal - 1) * settings.plus_karte_following_price)
						: 0;
					const flexCost = pkFlex * settings.plus_karte_flex_price;
					const kidsCost = pkKids * settings.plus_karte_kids_price;

					return (
						<div className="flex flex-col gap-1.5 mb-3">
							{pkNormal > 0 && (
								<div className="flex items-center justify-between text-[0.72rem] font-medium">
									<div
										className="flex items-center gap-1.5"
										style={{
											color: catColor,
										}}
									>
										<UserPlus className="w-3.5 h-3.5" />
										<span>{pkNormal}x PlusKarte Normal</span>
									</div>
									<span className="opacity-70 font-semibold text-[#1a1a2e]">
										+{normalCost.toFixed(2).replace('.', ',')} €
									</span>
								</div>
							)}
							{pkFlex > 0 && (
								<div className="flex items-center justify-between text-[0.72rem] font-medium">
									<div
										className="flex items-center gap-1.5"
										style={{
											color: catColor,
										}}
									>
										<UserPlus className="w-3.5 h-3.5" />
										<span>{pkFlex}x PlusKarte Flex</span>
									</div>
									<span className="opacity-70 font-semibold text-[#1a1a2e]">
										+{flexCost.toFixed(2).replace('.', ',')} €
									</span>
								</div>
							)}
							{pkKids > 0 && (
								<div className="flex items-center justify-between text-[0.72rem] font-medium">
									<div
										className="flex items-center gap-1.5"
										style={{
											color: catColor,
										}}
									>
										<UserPlus className="w-3.5 h-3.5" />
										<span>{pkKids}x PlusKarte Kids & Teens</span>
									</div>
									<span className="opacity-70 font-semibold text-[#1a1a2e]">
										+{kidsCost.toFixed(2).replace('.', ',')} €
									</span>
								</div>
							)}
						</div>
					);
				})()}

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
										content={item.config.customBasePrice === item.product.basePrice ? "Als Bestandstarif markiert" : "Historischer Preis verwendet"}
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
});
