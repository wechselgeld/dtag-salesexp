'use client';

import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	Calculator,
	Check,
	ChevronDown,
	Info,
	Coins,
	Coffee,
} from 'lucide-react';
import {
	useState, useMemo, useEffect, useRef, useCallback,
} from 'react';

import clsx from 'clsx';
import {
	trpc,
} from '@/lib/trpc';
import {
	DEFAULT_PRICING,
} from '@/hooks/use-cost-calculator';
import {
	AnimatedNumber,
} from '@/components/shared/animated-number';

interface StreamingComparisonProps {
	isVisible: boolean;
}

const STREAMING_SERVICES = [
	{
		id: 'hd-tv',
		name: 'HD-Fernsehen (Kabel, Waipu, etc.)',
		tierName: 'Kabel/Apps (HD)',
		price: 9.0,
		group: 'tv',
		groupName: 'HD-Fernsehen',
	},
	{
		id: 'netflix-ads',
		name: 'Netflix S. m. Werbung',
		tierName: 'Standard m. Werbung',
		price: 4.99,
		group: 'netflix',
		groupName: 'Netflix',
	},
	{
		id: 'netflix-std',
		name: 'Netflix Standard',
		tierName: 'Standard',
		price: 13.99,
		group: 'netflix',
		groupName: 'Netflix',
	},
	{
		id: 'netflix-prem',
		name: 'Netflix Premium',
		tierName: 'Premium',
		price: 19.99,
		group: 'netflix',
		groupName: 'Netflix',
	},
	{
		id: 'disney-ads',
		name: 'Disney+ S. m. Werbung',
		tierName: 'Standard m. Werbung',
		price: 5.99,
		group: 'disney',
		groupName: 'Disney+',
	},
	{
		id: 'disney-std',
		name: 'Disney+ Standard',
		tierName: 'Standard',
		price: 8.99,
		group: 'disney',
		groupName: 'Disney+',
	},
	{
		id: 'disney-prem',
		name: 'Disney+ Premium',
		tierName: 'Premium',
		price: 11.99,
		group: 'disney',
		groupName: 'Disney+',
	},
	{
		id: 'rtl-prem',
		name: 'RTL+ Premium',
		tierName: 'Premium',
		price: 8.99,
		group: 'rtl',
		groupName: 'RTL+',
	},
	{
		id: 'rtl-max',
		name: 'RTL+ Max',
		tierName: 'Max',
		price: 12.99,
		group: 'rtl',
		groupName: 'RTL+',
	},
	{
		id: 'apple-tv',
		name: 'AppleTV+',
		tierName: 'AppleTV+',
		price: 9.99,
		group: 'apple',
		groupName: 'AppleTV+',
	},
];


const STREAMING_SERVICES_BY_ID = new Map(
	STREAMING_SERVICES.map((s) => [
 s.id,
s,
]),
);

const MAGENTA_PLANS = [
	{
		id: 'mtv-smart',
		name: 'MagentaTV Smart',
		price: 10.0,
		includes: [
			{
				name: 'HD-Fernsehen',
				id: 'hd-tv',
				group: 'tv',
			},
			{
				name: 'MagentaTV+',
				id: null,
				group: null,
			},
			{
				name: 'RTL+ Premium',
				id: 'rtl-prem',
				group: 'rtl',
			},
		],
		includedServiceIds: [
			'hd-tv',
			'rtl-prem',
		],
	},
	{
		id: 'mtv-smartstream',
		name: 'MagentaTV SmartStream',
		price: 17.0,
		includes: [
			{
				name: 'HD-Fernsehen',
				id: 'hd-tv',
				group: 'tv',
			},
			{
				name: 'MagentaTV+',
				id: null,
				group: null,
			},
			{
				name: 'Netflix S. m. Werbung',
				id: 'netflix-ads',
				group: 'netflix',
			},
			{
				name: 'Disney+ S. m. Werbung',
				id: 'disney-ads',
				group: 'disney',
			},
			{
				name: 'RTL+ Premium',
				id: 'rtl-prem',
				group: 'rtl',
			},
		],
		includedServiceIds: [
			'hd-tv',
			'netflix-ads',
			'disney-ads',
			'rtl-prem',
		],
	},
	{
		id: 'mtv-megastream',
		name: 'MagentaTV MegaStream',
		price: 30.0,
		includes: [
			{
				name: 'HD-Fernsehen',
				id: 'hd-tv',
				group: 'tv',
			},
			{
				name: 'MagentaTV+',
				id: null,
				group: null,
			},
			{
				name: 'Netflix Standard',
				id: 'netflix-std',
				group: 'netflix',
			},
			{
				name: 'Disney+ Standard',
				id: 'disney-std',
				group: 'disney',
			},
			{
				name: 'RTL+ Premium',
				id: 'rtl-prem',
				group: 'rtl',
			},
			{
				name: 'AppleTV+',
				id: 'apple-tv',
				group: 'apple',
			},
		],
		includedServiceIds: [
			'hd-tv',
			'netflix-std',
			'disney-std',
			'rtl-prem',
			'apple-tv',
		],
	},
];

// Helper components for Select
function TierSelect({
	group,
	selectedId,
	onSelect,
	customPrice,
	onPriceChange,
	index,
	total,
}: {
	group: any;
	selectedId: string | null;
	onSelect: (id: string | null) => void;
	customPrice: string | undefined;
	onPriceChange: (id: string, val: string) => void;
	index: number;
	total: number;
}) {
	const [
		isOpen,
		setIsOpen,
	] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const isUpward = index >= total - 2;
	const isSingleTier = group.tiers.length === 1;
	const singleTier = group.tiers[0];

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [
	]);

	const selectedTier = group.tiers.find((t: any) => t.id === selectedId);

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => {
					if (isSingleTier) {
						onSelect(selectedId ? null : singleTier.id);
					}
					else {
						setIsOpen(!isOpen);
					}
				}}
				className={clsx(
					'w-full flex flex-col justify-center px-6 h-[92px] rounded-xl border transition-all duration-300 relative group text-left outline-none',
					selectedId
						? 'border-[#e20074]/40 bg-[#e20074]/5 shadow-[0_4px_20px_rgba(226,0,116,0.08)] ring-1 ring-[#e20074]/30'
						: 'border-[#eaedf0] bg-[#f7f8fa] hover:bg-white hover:border-[#d1d5db] hover:shadow-[0_2px_10px_rgba(0,0,0,0.03)]',
				)}
			>
				<div className="flex items-center justify-between w-full">
					<div className="flex flex-col items-start overflow-hidden">
						<h4
							className={clsx(
								'text-[1.15rem] font-extrabold tracking-tight leading-none mb-1.5 transition-colors',
								selectedId ? 'text-[#e20074]' : 'text-[#1a1a2e]',
							)}
						>
							{group.name}
						</h4>
						<span className="text-[0.85rem] font-semibold text-[#888] leading-none">
							{selectedTier ? selectedTier.tierName : 'Nicht ausgewählt'}
						</span>
					</div>

					<div className="flex items-center gap-5 shrink-0">
						{selectedTier && (
							<div
								className="flex items-center gap-2"
								onClick={(e) => e.stopPropagation()}
							>
								<div className="flex items-center bg-[#f7f8fa] px-3 py-1.5 rounded-xl border border-[#eaedf0] hover:border-[#e20074]/30 transition-all focus-within:border-[#e20074] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#e20074]/30">
									<input
										type="text"
										value={
											customPrice ??
											selectedTier.price.toFixed(2).replace('.', ',')
										}
										onChange={(e) => {
											const val = e.target.value;
											if (/^[0-9]*[.,]?[0-9]*$/.test(val) || val === '') {
												onPriceChange(selectedTier.id, val);
											}
										}}
										className="w-12 bg-transparent text-[0.95rem] font-extrabold text-[#1a1a2e] outline-none text-right"
									/>
									<span className="text-[0.85rem] text-[#1a1a2e] font-bold ml-1">
										€
									</span>
								</div>
							</div>
						)}
						<div
							className={clsx(
								'w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200',
								selectedId
									? 'bg-[#e20074] border-[#e20074]'
									: 'border-[#d1d5db] bg-white group-hover:border-[#a3a8b4]',
							)}
						>
							{selectedId ? (
								<Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
							) : !isSingleTier ? (
								<ChevronDown
									className={clsx(
										'w-3 h-3 text-[#aaa] transition-transform',
										isOpen ? 'rotate-180' : '',
									)}
								/>
							) : null}
						</div>
					</div>
				</div>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{
							opacity: 0,
							y: isUpward ? 4 : -4,
							scale: 0.98,
						}}
						animate={{
							opacity: 1,
							y: 0,
							scale: 1,
						}}
						exit={{
							opacity: 0,
							y: isUpward ? 4 : -4,
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
						className={clsx(
							'absolute left-0 right-0 bg-white border border-[#eaedf0] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.2)] z-100 overflow-hidden py-1.5',
							isUpward ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]',
						)}
					>
						<div className="max-h-[240px] overflow-y-auto custom-scrollbar">
							<button
								onClick={() => {
									onSelect(null);
									setIsOpen(false);
								}}
								className={clsx(
									'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
									!selectedId
										? 'bg-[#e20074]/5 text-[#e20074] font-bold'
										: 'hover:bg-[#fafafa] text-[#888] font-medium',
								)}
							>
								<span className="text-[0.85rem]">Nicht ausgewählt</span>
								{!selectedId && <Check className="w-3.5 h-3.5 ml-auto" />}
							</button>
							<div className="h-px bg-[#f3f4f6] mx-3 my-1" />
							{group.tiers.map((tier: any) => (
								<button
									key={tier.id}
									onClick={() => {
										onSelect(tier.id);
										setIsOpen(false);
									}}
									className={clsx(
										'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
										selectedId === tier.id
											? 'bg-[#e20074]/5 text-[#e20074] font-bold'
											: 'hover:bg-[#fafafa] text-[#1a1a2e] font-medium',
									)}
								>
									<div className="flex flex-col">
										<span className="text-[0.85rem]">{tier.tierName}</span>
										<span className="text-[0.7rem] opacity-60 font-medium whitespace-nowrap text-[#666]">
											{tier.price.toFixed(2).replace('.', ',')} € / Monat
										</span>
									</div>
									{selectedId === tier.id && <Check className="w-3.5 h-3.5" />}
								</button>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export function StreamingComparison({
	isVisible,
}: StreamingComparisonProps) {
	const [
		selectedServices,
		setSelectedServices,
	] = useState<string[]>([
	]);
	const [
		selectedPlan,
		setSelectedPlan,
	] = useState<string>('mtv-smartstream');
	const [
		customPrices,
		setCustomPrices,
	] = useState<Record<string, string>>({
	});
	const [
		mounted,
		setMounted,
	] = useState(false);

	// Reset state when modal is hidden
	useEffect(() => {
		if (!isVisible) {
			setSelectedServices([
			]);
			setSelectedPlan('mtv-smartstream');
			setCustomPrices({
			});
		}
	}, [
		isVisible,
	]);
	const getPrice = useCallback((id: string) => {
		if (customPrices[id] !== undefined) {
			const val = parseFloat(customPrices[id].replace(',', '.'));
			return isNaN(val) ? 0 : val;
		}
		return STREAMING_SERVICES_BY_ID.get(id)?.price || 0;
	}, [
		customPrices,
	]);

	const {
		data: pricingSettings,
	} = trpc.settings.getPricingSettings.useQuery(
		undefined,
		{
			staleTime: 10 * 60 * 1000,
		},
	);
	const settings = pricingSettings || DEFAULT_PRICING;

	const dynamicPlans = useMemo(
		() =>
			MAGENTA_PLANS.map((plan) => {
				if (plan.id === 'mtv-smart') {
					return {
						...plan,
						price: settings.magentatv_smart_price,
					};
				}
				if (plan.id === 'mtv-smartstream') {
					return {
						...plan,
						price: settings.magentatv_smartstream_price,
					};
				}
				if (plan.id === 'mtv-megastream') {
					return {
						...plan,
						price: settings.magentatv_megastream_price,
					};
				}
				return plan;
			}),
		[
			settings,
		],
	);

	useEffect(() => setMounted(true), [
	]);

	const groupedServices = useMemo(() => {
		const groups: Record<string, { name: string; tiers: typeof STREAMING_SERVICES }> = {
		};
		STREAMING_SERVICES.forEach((service) => {
			if (!groups[service.group]) {
				groups[service.group] = {
					name: service.groupName,
					tiers: [
					],
				};
			}
			groups[service.group].tiers.push(service);
		});
		return Object.entries(groups).map(([
			groupId,
			data,
		]) => ({
			groupId,
			name: data.name,
			tiers: data.tiers,
		}));
	}, [
	]);

	const toggleService = (groupId: string, id: string | null) => {
		setSelectedServices((prev) => {
			// Remove any existing selection from this group
			const filtered = prev.filter((sId) => {
				const service = STREAMING_SERVICES_BY_ID.get(sId);
				return service?.group !== groupId;
			});
			if (!id) { return filtered; }
			return [
				...filtered,
				id,
			];
		});
	};

	const currentCosts = useMemo(() => {
		return selectedServices.reduce((sum, id) => sum + getPrice(id), 0);
	}, [
		selectedServices,
		customPrices,
		getPrice,
	]);

	const targetPlan = useMemo(() => {
		return dynamicPlans.find((p) => p.id === selectedPlan);
	}, [
		selectedPlan,
		dynamicPlans,
	]);

	const coveredValue = useMemo(() => {
		return selectedServices.reduce((sum, currentServiceId) => {
			const currentService = STREAMING_SERVICES_BY_ID.get(currentServiceId);
			if (!currentService || !targetPlan) { return sum; }

			const currentPrice = getPrice(currentServiceId);

			const includedServiceIdForGroup = targetPlan.includedServiceIds.find(
				(serviceId) => {
					const incService = STREAMING_SERVICES_BY_ID.get(serviceId);
					return incService?.group === currentService.group;
				},
			);

			if (includedServiceIdForGroup) {
				const includedPrice = getPrice(includedServiceIdForGroup);
				return sum + Math.min(currentPrice, includedPrice);
			}
			return sum;
		}, 0);
	}, [
		selectedServices,
		targetPlan,
		customPrices,
		getPrice,
	]);

	const savings = coveredValue - (targetPlan?.price || 0);
	const paysMore = savings < 0;

	if (!mounted) { return null; }

	return (
		<div className={clsx('flex-1 overflow-y-auto min-h-0 bg-[#fbfcff]', !isVisible && 'hidden')}>
							<div className="px-8 md:px-10 py-8 min-h-full flex flex-col">
								<div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr_0.9fr] gap-8 md:gap-10 flex-1">
									{/* Column 1: Current Services */}
									<div className="flex flex-col gap-6">
										<div className="flex items-center gap-2.5 px-1">
											<h3 className="text-[1rem] font-extrabold text-[#1a1a2e] tracking-tight">
												Was nutzt der Kunde heute?
											</h3>
										</div>
										<div className="grid gap-5">
											{groupedServices.map((group, idx) => (
												<TierSelect
													key={group.groupId}
													group={group}
													index={idx}
													total={groupedServices.length}
													selectedId={
														selectedServices.find(
															(sId) =>
																STREAMING_SERVICES_BY_ID.get(sId)
																	?.group === group.groupId,
														) || null
													}
													onSelect={(id) => toggleService(group.groupId, id)}
													customPrice={
														selectedServices.find(
															(sId) =>
																STREAMING_SERVICES_BY_ID.get(sId)
																	?.group === group.groupId,
														)
															? customPrices[
																	selectedServices.find(
																		(sId) =>
																			STREAMING_SERVICES_BY_ID.get(sId)?.group === group.groupId,
																	)!
															]
															: undefined
													}
													onPriceChange={(id, val) =>
														setCustomPrices((prev) => ({
															...prev,
															[id]: val,
														}))
													}
												/>
											))}
										</div>
									</div>

									{/* Column 2: MagentaTV Tarife */}
									<div className="flex flex-col gap-6">
										<div className="flex items-center gap-2.5 px-1">
											<h3 className="text-[1rem] font-extrabold text-[#1a1a2e] tracking-tight">
												Gewünschter MagentaTV-Tarif
											</h3>
										</div>
										<div className="flex flex-col gap-4">
											{dynamicPlans.map((plan) => {
												const isSelected = selectedPlan === plan.id;
												return (
													<button
														key={plan.id}
														onClick={() => setSelectedPlan(plan.id)}
														className={clsx(
															'w-full flex flex-col p-5 rounded-xl border text-left transition-all duration-300 relative group overflow-hidden',
															isSelected
																? 'border-[#e20074]/40 bg-[#e20074]/5 shadow-[0_4px_20px_rgba(226,0,116,0.08)] ring-1 ring-[#e20074]/30'
																: 'border-[#eaedf0] bg-[#f7f8fa] hover:bg-white hover:border-[#d1d5db] hover:shadow-[0_2px_10px_rgba(0,0,0,0.03)]',
														)}
													>
														<div className="flex items-center justify-between mb-3 w-full">
															<div className="flex items-center gap-3">
																<div
																	className={clsx(
																		'w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 shrink-0',
																		isSelected
																			? 'bg-[#e20074] border-[#e20074]'
																			: 'border-[#d1d5db] bg-white group-hover:border-[#a3a8b4]',
																	)}
																>
																	{isSelected && (
																		<Check
																			className="w-2.5 h-2.5 text-white"
																			strokeWidth={4}
																		/>
																	)}
																</div>
																<span
																	className={clsx(
																		'text-[1.05rem] font-extrabold tracking-tight',
																		isSelected
																			? 'text-[#e20074]'
																			: 'text-[#1a1a2e]',
																	)}
																>
																	{plan.name}
																</span>
															</div>
															<span
																className={clsx(
																	'text-[1.1rem] font-extrabold',
																	isSelected
																		? 'text-[#e20074]'
																		: 'text-[#1a1a2e]',
																)}
															>
																{plan.price.toFixed(2).replace('.', ',')} €
															</span>
														</div>

														<div className="flex flex-wrap gap-1.5 mb-4 pl-8">
															{plan.includes.map((inc, i) => {
																const isGroupSelected =
																	inc.group &&
																	selectedServices.some((sId) => {
																		const s = STREAMING_SERVICES_BY_ID.get(sId);
																		return s && s.group === inc.group;
																	});
																return (
																	<span
																		key={i}
																		className={clsx(
																			'text-[0.65rem] px-2 py-0.5 rounded-lg transition-all border',
																			isGroupSelected
																				? 'bg-[#e20074] border-[#e20074] text-white font-bold'
																				: 'bg-[#f3f4f6] border-transparent text-[#6b7280] font-bold',
																		)}
																	>
																		{inc.name}
																	</span>
																);
															})}
														</div>

														<div className="mt-auto pt-3 border-t border-[#f3f4f6] flex justify-between items-center pl-1">
															<span className="text-[0.9rem] text-black font-bold tracking-wider flex items-center gap-4">
																<Coins className="w-3.5 h-3.5" />
																{plan.includedServiceIds
																	.reduce((sum, id) => sum + getPrice(id), 0)
																	.toFixed(2)
																	.replace('.', ',')}{' '}
																€ als Einzelbuchung
															</span>
														</div>
													</button>
												);
											})}
										</div>
									</div>

									{/* Column 3: Summary (aligned with product sidebar style) */}
									<div className="flex flex-col gap-6">
										<div className="flex items-center gap-2.5 px-1">
											<h3 className="text-[1rem] font-extrabold text-[#1a1a2e] tracking-tight">
												Zusammenfassung
											</h3>
										</div>

										<div className="flex flex-col gap-6.5">
											{/* Main Result Card (Moved to top) */}
											<div
												className={clsx(
													'rounded-2xl p-3 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 shadow-md',
													paysMore
														? 'bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white shadow-amber-500/10'
														: 'bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-emerald-500/10',
												)}
											>
												{/* Subtle light effect */}
												<div className="absolute top-0 right-0 w-40 h-40 bg-white/20 blur-[80px] -mr-16 -mt-16 rounded-full" />

												<span className="text-[0.8rem] font-bold uppercase tracking-[0.2em] mb-4 border-b pb-2">
													{paysMore
														? 'Monatliche Mehrkosten'
														: 'Monatliche Ersparnis'}
												</span>

												<div className="flex items-baseline py-2">
													<span className="text-[4rem] font-extrabold tracking-tighter leading-none drop-shadow-sm">
														{paysMore ? '+ ' : ''}
														<AnimatedNumber value={Math.abs(savings)} /> €
													</span>
												</div>

												<div className="mt-8 flex flex-col gap-4 w-full">
													<div className="bg-black/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-inner">
														<div className="flex justify-center items-center text-[1.0rem] font-bold mb-3 tracking-wide text-center">
															{coveredValue < (targetPlan?.price || 0) ? (
																<span>
																	Noch{' '}
																	<b className="text-white text-extrabold whitespace-nowrap">
																		<AnimatedNumber
																			value={
																				(targetPlan?.price || 0) - coveredValue
																			}
																		/>{' '}
																		€
																	</b>{' '}
																	bis zum Wertvorteil
																</span>
															) : (
																<span className="text-[1rem] flex items-center gap-1.5 font-extrabold">
																	WERTVORTEIL ERREICHT
																</span>
															)}
														</div>
														<div className="h-2 w-full bg-white/20 rounded-full overflow-hidden p-[2px]">
															<motion.div
																initial={{
																	width: 0,
																}}
																animate={{
																	width: `${Math.min(100, (coveredValue / (targetPlan?.price || 1)) * 100)}%`,
																}}
																className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
															/>
														</div>
													</div>
												</div>
											</div>

											{/* Grid Stats Tiles (Only Status Quo & Wertvorteil) */}
											<div className="grid grid-cols-2 gap-4">
												{/* Status Quo - Normal */}
												<div className="relative flex flex-col items-center text-center p-3.5 rounded-xl border border-[#eaedf0] bg-[#f7f8fa]">
													<Calculator
														className="w-5 h-5 mb-2 text-[#bbb]"
														strokeWidth={1.8}
													/>
													<div className="text-[0.8rem] font-semibold leading-tight text-[#888]">
														Status Quo
													</div>
													<div className="text-[1.0rem] font-semibold text-[#b0b0b0] mt-1">
														<AnimatedNumber value={currentCosts} /> €
													</div>
												</div>

												{/* Wertvorteil - Highlighted Green */}
												<div
													className="relative flex flex-col items-center text-center p-3.5 rounded-xl border border-[#10b981]/30 bg-[#10b981]/5 transition-all duration-200"
												>
													<Info
														className="w-5 h-5 mb-2 text-[#10b981]"
														strokeWidth={1.8}
													/>
													<div className="text-[0.8rem] font-semibold leading-tight text-[#1a1a2e]">
														Wertvorteil
													</div>
													<div className="text-[1.1rem] font-extrabold text-[#10b981] mt-1">
														+ <AnimatedNumber value={coveredValue} /> €
													</div>
												</div>
											</div>

											{/* Pro Tag - Normal (Full Width) */}
											<div className="relative flex flex-col items-center text-center p-4 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] mt-auto">
												<Coffee
													className="w-5 h-5 mb-2 text-[#bbb]"
													strokeWidth={1.8}
												/>
												<div className="text-[0.85rem] font-semibold text-[#888] mb-1">
													Kosten pro Tag für MagentaTV
												</div>
												<div className="text-[1.3rem] font-bold text-[#1a1a2e]">
													<AnimatedNumber
														value={(targetPlan?.price || 0) / 30}
													/>{' '}
													€
												</div>
											</div>
										</div>
									</div>
								</div>
			</div>
		</div>
	);
}
