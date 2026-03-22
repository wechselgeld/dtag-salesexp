'use client';

import {
	useState, useMemo, useEffect,
} from 'react';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import clsx from 'clsx';
import {
	Zap, Search, Calculator, Coffee, Check, X as XIcon, Info, Smartphone, Wifi, Settings2,
} from 'lucide-react';
import {
	AnimatedNumber,
} from '@/components/shared/animated-number';
import { useRouter } from 'next/navigation';

interface TarifComparisonProps {
	isVisible: boolean;
	onClose?: () => void;
}

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
	const [
		debouncedValue,
		setDebouncedValue,
	] = useState<T>(value);
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(timer);
	}, [
		value,
		delay,
	]);
	return debouncedValue;
}

type TarifCategory = 'festnetz' | 'mobile';

interface Tarif {
	id: string;
	name: string;
	speed: string;
	group: string;
	category: TarifCategory;
	basePrice: number;
}

const TARIFS: Tarif[] = [
	{ id: 's', name: 'MagentaZuhause S', speed: '16 MBit/s', group: 'DSL', category: 'festnetz', basePrice: 37.95 },
	{ id: 'm', name: 'MagentaZuhause M', speed: '100 MBit/s', group: 'DSL', category: 'festnetz', basePrice: 42.95 },
	{ id: 'l', name: 'MagentaZuhause L', speed: '250 MBit/s', group: 'DSL', category: 'festnetz', basePrice: 47.95 },
	{ id: 'xl', name: 'MagentaZuhause XL', speed: '250 MBit/s', group: 'DSL', category: 'festnetz', basePrice: 54.95 },
	{ id: 'gf150', name: 'Glasfaser 150', speed: '150 MBit/s', group: 'Glasfaser', category: 'festnetz', basePrice: 44.95 },
	{ id: 'gf300', name: 'Glasfaser 300', speed: '300 MBit/s', group: 'Glasfaser', category: 'festnetz', basePrice: 49.95 },
	{ id: 'gf600', name: 'Glasfaser 600', speed: '600 MBit/s', group: 'Glasfaser', category: 'festnetz', basePrice: 59.95 },
	{ id: 'gf1000', name: 'Glasfaser 1000', speed: '1000 MBit/s', group: 'Glasfaser', category: 'festnetz', basePrice: 79.95 },
	
	// MOBILE
	{ id: 'mob_s', name: 'MagentaMobil S', speed: '20 GB', group: '5G', category: 'mobile', basePrice: 39.95 },
	{ id: 'mob_m', name: 'MagentaMobil M', speed: '40 GB', group: '5G', category: 'mobile', basePrice: 49.95 },
	{ id: 'mob_l', name: 'MagentaMobil L', speed: 'Unlimited', group: '5G', category: 'mobile', basePrice: 59.95 },
	{ id: 'mob_xl', name: 'MagentaMobil XL', speed: 'Unlimited Premium', group: '5G', category: 'mobile', basePrice: 84.95 },
];

export function TarifComparison({
	isVisible,
	onClose,
}: TarifComparisonProps) {
	const router = useRouter();
	const [
		rawPriceInputValue,
		setRawPriceInputValue,
	] = useState('');
	const [category, setCategory] = useState<TarifCategory>('festnetz');
	const [
		searchQuery,
		setSearchQuery,
	] = useState('');
	const [
		selectedTarifId,
		setSelectedTarifId,
	] = useState<string | null>(null);

	const debouncedRawPrice = useDebounce(rawPriceInputValue, 300);

	const currentPrice = useMemo(() => {
		const val = parseFloat(debouncedRawPrice.replace(',', '.'));
		return isNaN(val) ? 0 : val;
	}, [
		debouncedRawPrice,
	]);

	const debouncedSearch = useDebounce(searchQuery, 200);

	const displayTarifs = useMemo(() => {
		const categoryFilter = TARIFS.filter(t => t.category === category);
		if (debouncedSearch) {
			const lowerQ = debouncedSearch.toLowerCase();
			return categoryFilter.filter(t =>
				t.name.toLowerCase().includes(lowerQ) ||
				t.speed.toLowerCase().includes(lowerQ) ||
				t.group.toLowerCase().includes(lowerQ),
			).slice(0, 3);
		}

		if (currentPrice === 0) {
			return categoryFilter.slice(0, 3);
		}

		// Intelligent Selection: Anchor, Target, Decoy
		// Find the closest upgrade (Target)
		const sorted = [...categoryFilter].sort((a, b) => a.basePrice - b.basePrice);
		
		let targetIdx = sorted.findIndex(t => t.basePrice >= currentPrice);
		
		if (targetIdx === -1) {
			// All plans are cheaper. Target = most expensive available.
			targetIdx = sorted.length - 1;
		}

		// Make sure we have room for an anchor if possible
		let anchorIdx = targetIdx - 1;
		if (anchorIdx < 0) anchorIdx = 0; // No cheaper plan exists, fallback to cheapest

		let decoyIdx = sorted.length - 1;
		if (decoyIdx <= targetIdx && targetIdx < sorted.length - 1) {
			decoyIdx = targetIdx + 1; // Push decoy up
		} else if (decoyIdx === targetIdx) {
			// Not enough plans to have a true decoy, just pick whatever is around
			decoyIdx = Math.min(sorted.length - 1, targetIdx + 1);
		}

		// Collect and ensure uniqueness
		const selection = [
			sorted[anchorIdx],
			sorted[targetIdx],
			sorted[decoyIdx]
		].filter(Boolean);

		const uniqueSelection = Array.from(new Set(selection));
		if (uniqueSelection.length < 3) {
			// Fallback: Just return the 3 closest plans if math fails due to limited array size
			return sorted
				.sort((a, b) => Math.abs(a.basePrice - currentPrice) - Math.abs(b.basePrice - currentPrice))
				.slice(0, 3)
				.sort((a, b) => a.basePrice - b.basePrice);
		}

		// Return them in cost order
		return uniqueSelection.sort((a, b) => a.basePrice - b.basePrice);
	}, [debouncedSearch, category, currentPrice]);

	// Auto-select the optimal (Target) plan if switching categories or inputting a new price
	useEffect(() => {
		if (displayTarifs.length > 0) {
			// If we have a currentPrice > 0, the Target is usually the middle item (index 1) in our smart sort array.
			const optimalIdx = displayTarifs.length >= 2 ? 1 : 0;
			setSelectedTarifId(displayTarifs[optimalIdx].id);
		}
	}, [category, currentPrice]); // Only re-run if category or price fundamentally changes, not on search to preserve user clicks

	const selectedTarif = useMemo(() => {
		return TARIFS.find(t => t.id === selectedTarifId) || null;
	}, [
		selectedTarifId,
	]);

	const targetPrice = selectedTarif ? selectedTarif.basePrice : 0;
	const differenz = targetPrice - currentPrice;
	const paysMore = differenz > 0;
	const savingsAbsolute = Math.abs(differenz);

	if (!isVisible) return null;

	return (
		<div className="flex-1 overflow-hidden min-h-0 bg-white animate-in fade-in duration-300">
			<div className="flex flex-col lg:flex-row h-full">

				{/* LEFT COLUMN - CONTENT */}
				<div className="flex-1 flex flex-col min-h-0 bg-white shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)] z-10 relative">
					<div className="p-6 md:p-8 flex-1 overflow-y-auto w-full max-w-5xl mx-auto">

						{/* Step 1: Current Cust Situation */}
						<div className="mb-6 animate-slide-up" style={{
							animationDelay: '0.1s',
						}}>
							<h3 className="text-[1.1rem] font-extrabold text-[#1a1a2e] mb-4 flex items-center gap-2">
								Kundensituation erfassen
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex flex-col gap-2">
									<label className="text-[0.75rem] font-bold text-[#888] uppercase tracking-wider">
										Bisheriger Monatspreis
									</label>
									<div className="flex items-center bg-[#fbfcff] px-4 py-3 rounded-2xl border border-[#eaedf0] focus-within:border-[#e20074] focus-within:ring-4 focus-within:ring-[#e20074]/5 transition-all">
										<input
											type="text"
											placeholder="z.B. 44,95"
											value={rawPriceInputValue}
											onChange={(e) => {
												const val = e.target.value;
												if (/^[0-9]*[.,]?[0-9]*$/.test(val) || val === '') {
													setRawPriceInputValue(val);
												}
											}}
											className="w-full bg-transparent text-xl font-extrabold text-[#1a1a2e] outline-none"
										/>
										<span className="text-xl text-[#888] font-bold ml-2">€</span>
									</div>
								</div>

								<div className="flex flex-col gap-2 justify-center">
									<label className="text-[0.75rem] font-bold text-[#888] uppercase tracking-wider">
										Kategorie
									</label>
									<div className="flex bg-[#fbfcff] p-1 rounded-2xl border border-[#eaedf0] h-full items-center shadow-sm">
										<button
											onClick={() => setCategory('festnetz')}
											className={clsx(
												'flex-1 h-full px-2 rounded-xl text-[0.85rem] font-bold transition-all flex items-center justify-center gap-2',
												category === 'festnetz'
													? 'bg-white text-[#e20074] shadow border border-[#eaedf0]'
													: 'text-[#888] hover:text-[#1a1a2e] border border-transparent',
											)}
										>
											<Wifi className="w-4 h-4" />
											Festnetz
										</button>
										<button
											onClick={() => setCategory('mobile')}
											className={clsx(
												'flex-1 h-full px-2 rounded-xl text-[0.85rem] font-bold transition-all flex items-center justify-center gap-2',
												category === 'mobile'
													? 'bg-white text-[#e20074] shadow border border-[#eaedf0]'
													: 'text-[#888] hover:text-[#1a1a2e] border border-transparent',
											)}
										>
											<Smartphone className="w-4 h-4" />
											Mobilfunk
										</button>
									</div>
								</div>
							</div>
						</div>

						<hr className="border-[#f0f0f0] my-6" />

						{/* Step 2: Target Tarif Smart Select */}
						<div className="mb-6 animate-slide-up" style={{
							animationDelay: '0.2s',
						}}>
							<h3 className="text-[1.1rem] font-extrabold text-[#1a1a2e] mb-4 flex items-center justify-between">
								<div className="flex items-center gap-2">
									Tarif auswählen
								</div>
							</h3>

							<div className="relative mb-4">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#bbb]" />
								<input
									type="text"
									placeholder="Z.B. MagentaZuhause XL..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-12 pr-12 py-3 bg-[#fbfcff] border border-[#eaedf0] rounded-2xl text-[0.9rem] font-bold text-[#1a1a2e] focus:outline-none focus:border-[#e20074] focus:ring-4 focus:ring-[#e20074]/5 transition-all shadow-sm"
								/>
								{searchQuery && (
									<button
										onClick={() => setSearchQuery('')}
										className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#1a1a2e] p-1 bg-white rounded-full shadow-sm"
									>
										<XIcon className="w-4 h-4" />
									</button>
								)}
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
								<AnimatePresence mode="popLayout">
									{displayTarifs.map((tarif) => {
										const isSelected = selectedTarifId === tarif.id;
										const calcPrice = tarif.basePrice;
										const cardDiff = calcPrice - currentPrice;
										const isCardSaving = cardDiff < 0;

										return (
											<motion.button
												layout="position"
												initial={{
													opacity: 0,
													y: 15,
												}}
												animate={{
													opacity: 1,
													y: 0,
												}}
												exit={{
													opacity: 0,
													scale: 0.95,
												}}
												transition={{ type: 'spring', stiffness: 400, damping: 30 }}
												key={tarif.id}
												onClick={() => setSelectedTarifId(tarif.id)}
												className={clsx(
													'relative flex flex-col p-4 rounded-3xl border-2 transition-all duration-300 text-left cursor-pointer group hover:shadow-lg',
													isSelected
														? 'border-[#e20074] bg-[#e20074]/[0.03] shadow-md ring-4 ring-[#e20074]/10'
														: 'border-[#eaedf0] hover:border-[#ccc] bg-white',
												)}
											>
												{isSelected && (
													<div className="absolute top-4 right-4 w-5 h-5 bg-[#e20074] rounded-full flex items-center justify-center shadow-sm">
														<Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
													</div>
												)}

												<div className="flex items-center gap-1.5 mb-2 mt-1">
													<span className="text-[0.65rem] font-bold text-[#888] uppercase tracking-wider px-2 py-0.5 bg-telekom-gray-50 border border-[#eaedf0] rounded-md">
														{tarif.group}
													</span>
												</div>
												<h4 className={clsx(
													'text-[1.05rem] font-extrabold leading-tight mb-1 pr-6 tracking-tight',
													isSelected ? 'text-[#e20074]' : 'text-[#1a1a2e]',
												)}>
													{tarif.name}
												</h4>
												<div className="text-[0.8rem] text-[#888] font-bold flex items-center gap-1.5">
													<Zap className="w-3.5 h-3.5" /> {tarif.speed}
													{category === 'mobile' && <span className="text-[0.7rem] bg-[#10b981]/10 text-[#10b981] px-1.5 rounded ml-1">5G Max</span>}
												</div>

												{/* Daily Pricing Psychology Block */}
												<div className={clsx(
													"my-3 py-4 w-full flex flex-col gap-1 items-center rounded-2xl transition-colors",
													isSelected ? "bg-white border border-[#e20074]/20 shadow-sm" : "bg-[#fbfcff] border border-[#eaedf0]"
												)}>
													<span className="text-[0.65rem] font-extrabold text-[#bbb] uppercase tracking-widest">
														Täglich
													</span>
													<div className="text-[1.8rem] font-extrabold text-[#1a1a2e] leading-none my-1 flex items-baseline gap-1">
														<AnimatedNumber value={calcPrice / 30} /> <span className="text-[1rem]">€</span>
													</div>
													
													{currentPrice > 0 && (
														<div className={clsx(
															"text-[0.75rem] font-extrabold px-2.5 py-1 rounded-lg mt-1 w-11/12 text-center tracking-wide",
															isCardSaving ? "bg-[#10b981]/15 text-[#10b981]" : "bg-[#1a1a2e]/5 text-[#666]"
														)}>
															{isCardSaving ? '-' : '+'}<AnimatedNumber value={Math.abs(cardDiff / 30)} /> € Differenz
														</div>
													)}
												</div>

												{/* Footer Average Price */}
												<div className="flex justify-between items-center w-full mb-3 px-1">
													<span className="text-[0.7rem] font-bold text-[#888] uppercase tracking-wider">
														Monatlich
													</span>
													<div className={clsx(
														"text-[1.1rem] font-extrabold flex items-baseline gap-1",
														isSelected ? "text-[#1a1a2e]" : "text-[#666]"
													)}>
														<AnimatedNumber value={calcPrice} /> €
													</div>
												</div>

												{/* Configure Button */}
												<div className="w-full mt-auto">
													<button 
														className={clsx(
															"w-full py-2.5 rounded-xl font-bold text-[0.8rem] transition-colors flex items-center justify-center gap-1.5", 
															isSelected ? "bg-[#e20074] text-white shadow-md hover:bg-[#c20063]" : "bg-[#f3f4f6] text-[#1a1a2e] hover:bg-[#e5e7eb]"
														)}
														onClick={(e) => { 
															e.stopPropagation(); 
															setSelectedTarifId(tarif.id);
															if (onClose) onClose();
															router.push(`/products/${category}/${tarif.id}`);
														}}
													>
														<Settings2 className="w-4 h-4" />
														Tarif anpassen
													</button>
												</div>

											</motion.button>
										);
									})}
								</AnimatePresence>

								{displayTarifs.length === 0 && (
									<div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-10 bg-[#fbfcff] rounded-3xl border-2 border-dashed border-[#eaedf0] text-[#888] font-bold text-[0.95rem]">
										<Search className="w-8 h-8 mx-auto mb-2 text-[#ccc]" />
										Kein Tarif gefunden für "{searchQuery}"
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* RIGHT COLUMN - RESULTS SIDEBAR (1:1 UI Clone of Streaming Check) */}
				<div
					className={clsx(
						'lg:w-[480px] bg-white border-t lg:border-t-0 lg:border-l border-[#eaedf0] flex flex-col h-full shrink-0 transition-opacity duration-500',
						currentPrice > 0 ? 'opacity-100' : 'opacity-40 lg:opacity-100',
					)}
				>
					<div className="p-6 md:p-8 flex-1 overflow-y-auto">
						<div className="flex flex-col gap-6">

							<div className="flex items-center gap-2.5 px-1">
								<h3 className="text-[1rem] font-extrabold text-[#1a1a2e] tracking-tight">
									Ergebnis
								</h3>
							</div>

							<div className="flex flex-col gap-6">
								{/* Main Result Card */}
								<div
									className={clsx(
										'rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 shadow-xl',
										currentPrice > 0
											? (paysMore ? 'bg-[#b97010] text-white shadow-[#b97010]/20' : 'bg-[#10b981] text-white shadow-[#10b981]/20')
											: 'bg-telekom-gray-50 border border-[#eaedf0] text-[#1a1a2e] shadow-none',
									)}
								>
									{currentPrice > 0 && (
										<div className="absolute top-0 right-0 w-40 h-40 bg-white/20 blur-[80px] -mr-16 -mt-16 rounded-full mix-blend-overlay" />
									)}

									<span className={clsx(
										'text-[0.75rem] font-bold uppercase tracking-[0.2em] mb-4 border-b pb-2 w-full',
										currentPrice > 0 ? 'border-white/20 text-white/90' : 'border-[#ccc]',
									)}>
										{currentPrice === 0
											? 'Auswertung'
											: (paysMore ? 'Monatliche Zusatzausgabe' : 'Monatliches Einsparpotenzial')
										}
									</span>

									<div className="flex items-baseline py-2 z-10">
										<span className="text-[3.5rem] md:text-[4rem] font-extrabold tracking-tighter leading-none drop-shadow-sm flex items-center">
											{currentPrice > 0 && paysMore ? '+ ' : ''}
											{currentPrice === 0 ? '0' : <AnimatedNumber value={savingsAbsolute} />}
											<span className="ml-2 text-3xl font-bold opacity-80">€</span>
										</span>
									</div>

									<div className="mt-8 flex flex-col gap-4 w-full z-10">
										<div className={clsx(
											'rounded-2xl p-4 md:p-5 border shadow-inner backdrop-blur-md',
											currentPrice > 0 ? 'bg-black/10 border-white/20' : 'bg-white border-[#eaedf0]',
										)}>
											<div className="flex justify-center items-center text-[0.95rem] font-bold tracking-wide text-center leading-snug">
												{currentPrice === 0 ? (
													'Bitte bisherigen Preis eintragen'
												) : (
													paysMore
														? 'Das gebaute Paket bietet einen Mehrwert gegenüber der aktuellen Situation.'
														: 'Trotz neuem Paket und Hardware sinken die laufenden Ausgaben!'
												)}
											</div>
										</div>
									</div>
								</div>

								{/* Grid Stats Tiles (1:1 Streaming Check style) */}
								<div className="grid grid-cols-2 gap-4">
									{/* Status Quo - Normal */}
									<div className="relative flex flex-col items-center text-center p-3.5 rounded-xl border-2 transition-all duration-200 border-[#eaedf0] bg-white">
										<Calculator
											className="w-5 h-5 mb-2 text-[#bbb]"
											strokeWidth={1.8}
										/>
										<div className="text-[0.8rem] font-semibold leading-tight text-[#888]">
											Status Quo
										</div>
										<div className="text-[1.0rem] font-semibold text-[#b0b0b0] mt-1">
											<AnimatedNumber value={currentPrice} /> €
										</div>
									</div>

									{/* Neuer Paketpreis - Highlighted Pink instead of Green for Target */}
									<div
										className="relative flex flex-col items-center text-center p-3.5 rounded-xl border-2 transition-all duration-200"
										style={{
											borderColor: '#e20074',
											backgroundColor: '#e200740a',
										}}
									>
										<Info
											className="w-5 h-5 mb-2 text-[#e20074]"
											strokeWidth={1.8}
										/>
										<div className="text-[0.8rem] font-semibold leading-tight text-[#1a1a2e]">
											Neuer Paketpreis
										</div>
										<div className="text-[1.1rem] font-extrabold text-[#e20074] mt-1">
											<AnimatedNumber value={targetPrice} /> €
										</div>
									</div>
								</div>

								{/* Pro Tag - Normal (Full Width) */}
								<div className="relative flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all duration-200 border-[#eaedf0] bg-white mt-auto">
									<Coffee
										className="w-5 h-5 mb-2 text-[#bbb]"
										strokeWidth={1.8}
									/>
									<div className="text-[0.85rem] font-semibold text-[#888] mb-1">
										Kosten pro Tag für das Paket
									</div>
									<div className="text-[1.3rem] font-bold text-[#1a1a2e]">
										<AnimatedNumber value={targetPrice / 30} /> €
									</div>
								</div>
							</div>

						</div>
					</div>
				</div>

			</div>
		</div>
	);
}
