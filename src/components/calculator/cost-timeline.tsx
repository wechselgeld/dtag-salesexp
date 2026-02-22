"use client";

import { CalculationResult } from "@/hooks/use-cost-calculator";

interface Props {
	calculation: CalculationResult;
	accentColor?: string;
}

export function CostTimeline({ calculation, accentColor = "#e20074" }: Props) {
	const { monthlyCosts, averageMonthlyCost, totalCost24Months, oneTimeCosts } =
		calculation;

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

	return (
		<div>
			<h3 className="text-[1rem] font-bold text-[#1a1a2e] mb-5">
				Kostenübersicht
			</h3>

			{/* Highlight row */}
			<div className="grid grid-cols-2 gap-3 mb-5">
				<div className="p-3.5 bg-[#f7f8fa] rounded-xl">
					<div className="text-[0.6rem] font-semibold uppercase tracking-wider text-[#aaa] mb-1">
						Ø Monatlich
					</div>
					<div className="text-[1.4rem] font-extrabold text-[#1a1a2e] tracking-tight leading-none">
						{averageMonthlyCost.toFixed(2)} €
					</div>
				</div>
				<div
					className="p-3.5 rounded-xl"
					style={{ backgroundColor: `${accentColor}08` }}
				>
					<div
						className="text-[0.6rem] font-semibold uppercase tracking-wider mb-1"
						style={{ color: accentColor }}
					>
						Gesamt (24M)
					</div>
					<div
						className="text-[1.4rem] font-extrabold tracking-tight leading-none"
						style={{ color: accentColor }}
					>
						{totalCost24Months.toFixed(2)} €
					</div>
				</div>
			</div>

			{/* One time costs */}
			{oneTimeCosts.total > 0 && (
				<div className="mb-5">
					<div className="flex justify-between items-center mb-2">
						<span className="text-[0.78rem] font-semibold text-[#888]">
							Einmalige Kosten
						</span>
						<span className="text-[0.85rem] font-bold text-[#1a1a2e]">
							{oneTimeCosts.total.toFixed(2)} €
						</span>
					</div>
					{oneTimeCosts.breakdown.length > 0 && (
						<div className="space-y-1">
							{oneTimeCosts.breakdown.map((item, i) => (
								<div
									key={i}
									className="flex justify-between text-[0.75rem] text-[#aaa] py-1"
								>
									<span>{item.name}</span>
									<span
										className={
											item.cost < 0 ? "text-green-600 font-medium" : ""
										}
									>
										{item.cost.toFixed(2)} €
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
				<div className="text-[0.72rem] font-semibold text-[#aaa] uppercase tracking-wider mb-3">
					Monatliche Kosten
				</div>
				<div className="space-y-2">
					{getPeriods().map((period, idx) => (
						<div key={idx} className="flex items-center justify-between py-1.5">
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
								{period.price.toFixed(2)} €
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
