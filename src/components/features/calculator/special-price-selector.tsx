"use client";

import { SpecialPrice } from "@/types/product";
import clsx from "clsx";

interface Props {
	specialPrices: SpecialPrice[];
	selectedIds: string[];
	onChange: (ids: string[]) => void;
	isMagentaTVSelected: boolean;
	businessCase: string;
	accentColor?: string;
}

export function SpecialPriceSelector({
	specialPrices,
	selectedIds,
	onChange,
	isMagentaTVSelected,
	businessCase,
	accentColor = "#e20074"
}: Props) {
	const availablePrices = specialPrices.filter((sp) => {
		if (sp.requiresMagentaTV && !isMagentaTVSelected) return false;
		if (sp.requiresMove && businessCase !== "MOVE") return false;
		if (sp.requiresSpeedUp && businessCase !== "SPEED_UP") return false;
		return true;
	});

	const handleSelect = (id: string) => {
		// Radio behavior: single selection only
		if (selectedIds.includes(id)) {
			onChange([]); // deselect
		} else {
			onChange([id]); // select only this one
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
		<div className="space-y-2">
			{availablePrices.map((sp) => {
				const isSelected = selectedIds.includes(sp.id);
				const lowestPrice =
					sp.tiers.length > 0 ? Math.min(...sp.tiers.map((t) => t.price)) : 0;
				return (
					<div
						key={sp.id}
						onClick={() => handleSelect(sp.id)}
						className={clsx(
							"flex items-center p-3.5 rounded-xl border cursor-pointer transition-all duration-200 group"
						)}
						style={{
							borderColor: isSelected ? accentColor : "#eaedf0",
							backgroundColor: isSelected ? `${accentColor}08` : "white"
						}}
					>
						{/* Radio button */}
						<div
							className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center mr-3 shrink-0 transition-all duration-200"
							style={{
								borderColor: isSelected ? accentColor : "#ddd"
							}}
						>
							{isSelected && (
								<div
									className="w-[8px] h-[8px] rounded-full"
									style={{ backgroundColor: accentColor }}
								/>
							)}
						</div>

						{/* Info */}
						<div className="flex-1 min-w-0">
							<div className="text-[0.85rem] font-semibold text-[#1a1a2e]">
								{sp.name}
							</div>
							<div className="flex flex-wrap gap-1 mt-1">
								{sp.tiers.map((tier, i) => (
									<span
										key={i}
										className="text-[0.68rem] text-[#888] bg-[#f7f8fa] px-1.5 py-0.5 rounded"
									>
										Mo {tier.fromMonth}–{tier.toMonth}:{" "}
										<span className="font-semibold text-[#1a1a2e]">
											{tier.price.toFixed(2)} €
										</span>
									</span>
								))}
							</div>
						</div>

						{/* Price (lowest) */}
						<span
							className="text-[0.88rem] font-bold shrink-0 ml-3"
							style={{ color: isSelected ? accentColor : "#1a1a2e" }}
						>
							ab {lowestPrice.toFixed(2)} €
						</span>
					</div>
				);
			})}
		</div>
	);
}
