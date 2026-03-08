"use client";

import { CalculationResult } from "@/types/product";
import { Coffee, Calculator, Tag, Calendar } from "lucide-react";
import { AnimatedNumber } from "@/components/shared/animated-number";

interface Props {
	calculation: CalculationResult;
	accentColor?: string;
}

export function CostTimeline({ calculation, accentColor = "#e20074" }: Props) {
	const {
		monthlyCosts,
		averageMonthlyCost,
		totalCost24Months,
		oneTimeCosts,
		basePrice,
		effectiveBasePrice,
		dailyPriceTrivialization
	} = calculation;

	const getPeriods = () => {
		const periods: {
			start: number;
			end: number;
			price: number;
			name?: string;
		}[] = [];
		let currentPeriod: (typeof periods)[0] | null = null;

		monthlyCosts.forEach((month) => {
			if (
				!currentPeriod ||
				Math.abs(currentPeriod.price - month.total) > 0.01
			) {
				if (currentPeriod) periods.push(currentPeriod);
				currentPeriod = {
					start: month.month,
					end: month.month,
					price: month.total,
					name: month.specialPriceApplied?.name
				};
			} else {
				currentPeriod.end = month.month;
			}
		});
		if (currentPeriod) periods.push(currentPeriod);
		return periods;
	};

	const displayBasePrice =
		effectiveBasePrice !== basePrice ? effectiveBasePrice : basePrice;

	return (
		<div>
			{/* 4 Key Metrics — 2x2 Grid using exactly the Business Case Card Design */}
			<div
				className="grid grid-cols-2 gap-4 mb-6"
				style={{ "--accent": accentColor } as React.CSSProperties}
			>
				{/* Ø Monatlich — Highlighted */}
				<div
					className="relative flex flex-col items-center text-center p-3.5 rounded-xl border-2 transition-all duration-200 bg-(--accent)/4"
					style={{ borderColor: accentColor }}
				>
					<Calculator
						className="w-5 h-5 mb-2 transition-colors"
						style={{ color: accentColor }}
						strokeWidth={1.8}
					/>
					<div className="text-[0.8rem] font-semibold leading-tight transition-colors text-[#1a1a2e]">
						Ø Monatlich
					</div>
					<div className="text-[0.68rem] text-[#b0b0b0] mt-1">
						<AnimatedNumber value={averageMonthlyCost} /> €
					</div>
				</div>

				{/* Regulär — Normal */}
				<div className="relative flex flex-col items-center text-center p-3.5 rounded-xl border-2 transition-all duration-200 border-[#eaedf0] bg-white">
					<Tag
						className="w-5 h-5 mb-2 transition-colors"
						style={{ color: "#bbb" }}
						strokeWidth={1.8}
					/>
					<div className="text-[0.8rem] font-semibold leading-tight transition-colors text-[#888]">
						Regulär
					</div>
					<div className="text-[0.68rem] text-[#b0b0b0] mt-1">
						<AnimatedNumber value={displayBasePrice} /> €
					</div>
				</div>

				{/* Pro Tag — Highlighted */}
				<div
					id="tour-config-daily-price"
					className="relative flex flex-col items-center text-center p-3.5 rounded-xl border-2 transition-all duration-200 bg-(--accent)/4"
					style={{ borderColor: accentColor }}
				>
					<Coffee
						className="w-5 h-5 mb-2 transition-colors"
						style={{ color: accentColor }}
						strokeWidth={1.8}
					/>
					<div className="text-[0.8rem] font-semibold leading-tight transition-colors text-[#1a1a2e]">
						Pro Tag
					</div>
					<div className="text-[0.68rem] text-[#b0b0b0] mt-1">
						{dailyPriceTrivialization || (
							<>
								<AnimatedNumber value={averageMonthlyCost / 30} /> €
							</>
						)}
					</div>
				</div>

				{/* 24 Monate — Normal */}
				<div className="relative flex flex-col items-center text-center p-3.5 rounded-xl border-2 transition-all duration-200 border-[#eaedf0] bg-white">
					<Calendar
						className="w-5 h-5 mb-2 transition-colors"
						style={{ color: "#bbb" }}
						strokeWidth={1.8}
					/>
					<div className="text-[0.8rem] font-semibold leading-tight transition-colors text-[#888]">
						24 Monate
					</div>
					<div className="text-[0.68rem] text-[#b0b0b0] mt-1">
						<AnimatedNumber value={totalCost24Months} /> €
					</div>
				</div>
			</div>

			{/* One time costs */}
			{oneTimeCosts.total > 0 && (
				<div className="mb-4">
					<div className="flex justify-between items-center mb-2">
						<span className="text-[0.78rem] font-semibold text-[#888]">
							Einmalige Kosten
						</span>
						<span className="text-[0.85rem] font-bold text-[#1a1a2e]">
							<AnimatedNumber value={oneTimeCosts.total} /> €
						</span>
					</div>
					{oneTimeCosts.breakdown.length > 0 && (
						<div className="space-y-1">
							{oneTimeCosts.breakdown.map((item: any, i: number) => (
								<div
									key={i}
									className="flex justify-between text-[0.75rem] text-[#aaa] py-0.5"
								>
									<span>{item.name}</span>
									<span
										className={
											item.cost < 0 ? "text-green-600 font-medium" : ""
										}
									>
										<AnimatedNumber value={item.cost} /> €
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* Separator */}
			<div className="h-px bg-[#eaedf0] mb-4" />

			{/* Monthly periods */}
			<div>
				<div className="text-[0.65rem] font-bold text-[#aaa] uppercase tracking-wider mb-3">
					Monatliche Kosten
				</div>
				<div className="space-y-1.5">
					{getPeriods().map((period, idx) => (
						<div key={idx} className="flex items-center justify-between py-1">
							<div className="flex items-center gap-2">
								<span className="text-[0.7rem] font-semibold text-[#bbb] bg-[#f7f8fa] px-2.5 py-1 rounded-lg tracking-wide min-w-[70px] text-center">
									Mo {period.start}–{period.end}
								</span>
								{period.name && (
									<span
										className="text-[0.65rem] font-semibold px-2 py-0.5 rounded"
										style={{
											color: accentColor,
											backgroundColor: `${accentColor}0a`
										}}
									>
										{period.name}
									</span>
								)}
							</div>
							<span className="text-[0.88rem] font-bold text-[#1a1a2e]">
								<AnimatedNumber value={period.price} /> €
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
