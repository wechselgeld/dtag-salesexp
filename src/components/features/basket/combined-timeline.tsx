'use client';

import {
	useBasketStore,
} from '@/hooks/use-basket-store';
import {
	calculateProductCosts,
	DEFAULT_PRICING,
} from '@/hooks/use-cost-calculator';
import {
	trpc,
} from '@/lib/trpc';
import {
	useMemo,
} from 'react';
import {
	Bar,
	BarChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
} from 'recharts';
import {
	AnimatedNumber,
} from '@/components/shared/animated-number';

export function CombinedTimeline() {
	const items = useBasketStore((state) => state.items);
	const {
		data: pricingSettings,
	} = trpc.settings.getPricingSettings.useQuery(
		undefined,
		{
			staleTime: 10 * 60 * 1000,
		},
	);
	const settings = pricingSettings || DEFAULT_PRICING;

	const aggregatedData = useMemo(() => {
		const data = Array.from({
			length: 24,
		}, (_, i) => ({
			month: i + 1,
			total: 0,
			details: [
			] as { name: string; cost: number }[],
		}));

		items.forEach((item) => {
			const calculation = calculateProductCosts({
				product: item.product,
				businessCase: item.config.businessCase,
				magentaTVPackage: item.config.magentaTVPackage,
				selectedSpecialPriceIds: item.config.selectedSpecialPriceIds,
				selectedAddonIds: item.config.selectedAddonIds,
				vouchers: item.config.vouchers,
				credits: item.config.credits || [
				],
				settings,
			});

			calculation.monthlyCosts.forEach((mc, index) => {
				if (data[index]) {
					data[index].total += mc.total;
					data[index].details.push({
						name: item.product.name,
						cost: mc.total,
					});
				}
			});
		});

		return data;
	}, [
		items,
	]);

	if (items.length === 0) { return null; }

	const averageTotal =
		aggregatedData.reduce((acc, curr) => acc + curr.total, 0) / 24;

	return (
		<div>
			{/* Header */}
			<div className="flex items-baseline justify-between mb-3">
				<span className="text-[0.72rem] font-semibold text-[#aaa] uppercase tracking-wider">
					Kostenverlauf
				</span>
				<div className="text-right">
					<span className="text-[1.1rem] font-extrabold text-[#e20074] leading-none">
						<AnimatedNumber value={averageTotal} /> €
					</span>
					<span className="text-[0.6rem] text-[#b0b0b0] font-medium ml-1">
						Ø mtl.
					</span>
				</div>
			</div>

			{/* Chart */}
			<div className="h-[100px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={aggregatedData}
						margin={{
							top: 4,
							right: 0,
							left: 0,
							bottom: 0,
						}}
					>
						<XAxis
							dataKey="month"
							axisLine={false}
							tickLine={false}
							tick={{
								fontSize: 8,
								fill: '#ccc',
							}}
							interval={5}
						/>
						<Tooltip
							cursor={{
								fill: 'rgba(226, 0, 116, 0.03)',
							}}
							content={({
								active, payload,
							}: any) => {
								if (active && payload && payload.length) {
									const data = payload[0].payload;
									return (
										<div className="bg-white p-3 rounded-xl shadow-lg border border-[#eaedf0] text-[0.7rem]">
											<div className="font-bold mb-2 text-[#1a1a2e] border-b border-[#f0f0f0] pb-1.5">
												Monat {data.month}
											</div>
											{data.details.map(
												(d: { name: string; cost: number }, i: number) => (
													<div
														key={i}
														className="flex justify-between gap-4 mb-1"
													>
														<span className="text-[#888]">{d.name}</span>
														<span className="font-semibold text-[#1a1a2e]">
															{d.cost.toFixed(2)} €
														</span>
													</div>
												),
											)}
											<div className="border-t border-[#eaedf0] mt-2 pt-1.5 flex justify-between font-bold text-[0.72rem]">
												<span className="text-[#888]">Gesamt</span>
												<span className="text-[#e20074]">
													{data.total.toFixed(2)} €
												</span>
											</div>
											<div className="mt-1 flex justify-between text-[0.6rem] text-[#ccc]">
												<span>Täglich ca.</span>
												<span>
													{data.total < 30
														? `${((data.total / 30) * 100).toFixed(0)} Cent`
														: `${(data.total / 30).toFixed(2)} €`}
												</span>
											</div>
										</div>
									);
								}
								return null;
							}}
						/>
						<ReferenceLine
							y={averageTotal}
							stroke="#e20074"
							strokeDasharray="3 3"
							strokeOpacity={0.5}
							strokeWidth={1}
						/>
						<Bar
							dataKey="total"
							fill="url(#colorTotal)"
							radius={[
								7,
								7,
								0,
								0,
							]}
							maxBarSize={14}
						/>
						<defs>
							<linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#e20074" stopOpacity={0.2} />
								<stop offset="100%" stopColor="#e20074" stopOpacity={1} />
							</linearGradient>
						</defs>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
