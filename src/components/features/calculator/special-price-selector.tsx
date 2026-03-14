'use client';

import type {
	SpecialPrice,
} from '@/types/product';
import clsx from 'clsx';
import {
	motion,
} from 'framer-motion';
import {
	ArrowDown, TrendingDown,
} from 'lucide-react';

interface Props {
	specialPrices: SpecialPrice[];
	selectedIds: string[];
	onChange: (ids: string[]) => void;
	isMagentaTVSelected: boolean;
	businessCase: string;
	accentColor?: string;
	basePrice?: number;
	tvBasePrice?: number;
}

export function SpecialPriceSelector({
	specialPrices,
	selectedIds,
	onChange,
	isMagentaTVSelected,
	businessCase,
	accentColor = '#e20074',
	basePrice,
	tvBasePrice,
}: Props) {
	const availablePrices = specialPrices.filter((sp) => {
		if (sp.requiresMagentaTV && !isMagentaTVSelected) { return false; }
		if (sp.requiresMove && businessCase !== 'MOVE') { return false; }
		if (sp.requiresNewActivation && businessCase !== 'NEW_ACTIVATION') { return false; }
		if (sp.requiresSpeedUp && businessCase !== 'SPEED_UP') { return false; }
		return true;
	});

	const handleSelect = (id: string) => {
		if (selectedIds.includes(id)) {
			onChange([
			]);
		}
		else {
			onChange([
				id,
			]);
		}
	};

	if (availablePrices.length === 0) {
		return (
			<div className="text-[0.82rem] text-[#bbb] italic">
				Keine Aktionen verfügbar für diese Konfiguration.
			</div>
		);
	}

	return (
		<div className="space-y-2.5">
			{availablePrices.map((sp) => {
				const isSelected = selectedIds.includes(sp.id);

				const getTierSavings = (tier: { price: number, discountTarget?: string, discountType?: string }) => {
					const target = tier.discountTarget || sp.discountTarget;
					const type = tier.discountType || sp.discountType;

					if (target === 'MAGENTA_TV') {
						return type === 'RELATIVE'
							? tier.price
							: Math.max(0, (tvBasePrice || 0) - tier.price);
					}
					else {
						return type === 'RELATIVE'
							? tier.price
							: Math.max(0, (basePrice || 0) - tier.price);
					}
				};

				const getTierDisplayPrice = (tier: { price: number, discountTarget?: string, discountType?: string }) => {
					const target = tier.discountTarget || sp.discountTarget;
					const type = tier.discountType || sp.discountType;

					// Return the exact discounted value, based on relation.
					if (target === 'MAGENTA_TV') {
						return type === 'RELATIVE'
							? Math.max(0, (tvBasePrice || 0) + (basePrice || 0) - tier.price)
							: (basePrice || 0) + tier.price;
					}
					else {
						return type === 'RELATIVE'
							? Math.max(0, (basePrice || 0) - tier.price)
							: tier.price;
					}
				};

				const lowestPrice =
					sp.tiers.length > 0
						? Math.min(...sp.tiers.map((t) => getTierDisplayPrice(t)))
						: 0;

				const totalSavings = sp.tiers.reduce((acc, tier) => {
					const from = tier.fromMonth || 1;
					const to = tier.toMonth || 24;
					const months = to - from + 1;
					const tierSaving = getTierSavings(tier) * months;
					return acc + (tierSaving > 0 ? tierSaving : 0);
				}, 0);

				return (
					<motion.div
						key={sp.id}
						whileTap={{
							scale: 0.98,
						}}
						onClick={() => handleSelect(sp.id)}
						className={clsx(
							'rounded-xl border-2 cursor-pointer transition-all duration-200 group',
							isSelected ? 'shadow-sm' : 'hover:border-[#ccc]',
						)}
						style={{
							borderColor: isSelected ? accentColor : '#eaedf0',
							backgroundColor: isSelected ? `${accentColor}08` : 'white',
						}}
					>
						{/* Main row */}
						<div className="flex items-center p-4">
							{/* Radio button */}
							<div
								className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center mr-3 shrink-0 transition-all duration-200"
								style={{
									borderColor: isSelected ? accentColor : '#ddd',
								}}
							>
								{isSelected && (
									<div
										className="w-[8px] h-[8px] rounded-full"
										style={{
											backgroundColor: accentColor,
										}}
									/>
								)}
							</div>

							{/* Info */}
							<div className="flex-1 min-w-0">
								<div className="text-[0.9rem] font-bold text-[#1a1a2e] truncate">
									{sp.name}
								</div>
								{sp.description && (
									<div className="text-[0.72rem] text-[#888] line-clamp-1 mt-0.5">
										{sp.description}
									</div>
								)}
								<div className="flex flex-wrap gap-1.5 mt-1.5">
									{sp.tiers.map((tier, i) => {
										const displayPrice = getTierDisplayPrice(tier);

										return (
											<span
												key={i}
												className="text-[0.65rem] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
												style={{
													backgroundColor: isSelected
														? `${accentColor}15`
														: '#f0f2f5',
													color: isSelected ? accentColor : '#666',
												}}
											>
												<ArrowDown className="w-3 h-3" />
												Monat {tier.fromMonth}–{tier.toMonth}:{' '}
												{displayPrice.toFixed(2).replace('.', ',')} €
											</span>
										);
									})}
								</div>
							</div>

							{/* Price */}
							<div className="flex flex-col items-end shrink-0 ml-4">
								<div className="flex items-center gap-1.5 mt-0.5">
									{basePrice !== undefined && lowestPrice < basePrice && (
										<span className="text-[0.75rem] font-semibold text-[#a0a0a0] line-through decoration-[#a0a0a0] opacity-80">
											{basePrice.toFixed(2).replace('.', ',')} €
										</span>
									)}
									<div className="flex items-baseline gap-1">
										<span className="text-[0.72rem] font-bold text-[#888]">
											ab
										</span>
										<span
											className="text-[1.2rem] font-extrabold tracking-tight leading-none"
											style={{
												color: isSelected ? accentColor : '#1a1a2e',
											}}
										>
											{lowestPrice.toFixed(2).replace('.', ',')} €
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Savings bar – full width, below main content */}
						{totalSavings > 0 && (
							<div
								className="flex items-center gap-2 px-4 py-2 rounded-b-xl rounded-t-lg border-t transition-colors"
								style={{
									backgroundColor: isSelected ? `${accentColor}0c` : '#f7f8fa',
									borderColor: isSelected ? `${accentColor}20` : '#eaedf0',
								}}
							>
								<TrendingDown
									className="w-3.5 h-3.5 shrink-0 mb-1"
									style={{
										color: isSelected ? accentColor : '#16a34a',
									}}
								/>
								<span
									className="text-[0.9rem] font-bold"
									style={{
										color: isSelected ? accentColor : '#16a34a',
									}}
								>
									{totalSavings.toFixed(0)} € Gesamtvorteil
								</span>
							</div>
						)}
					</motion.div>
				);
			})}
		</div>
	);
}
