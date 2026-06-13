'use client';

import type {
	BasketItem,
} from '@/lib/store/basket-store';
import {
	useBasketStore,
} from '@/lib/store/basket-store';
import {
	calculateProductCosts,
	DEFAULT_PRICING,
} from '@/hooks/use-cost-calculator';
import {
	trpc,
} from '@/lib/trpc';
import {
	useMemo,
	useId,
	useState,
	useEffect,
	useRef,
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
import {
	Skeleton,
} from '@/components/shared/skeleton';

export function CombinedTimeline({
	catColor = '#e20074',
	items: propItems,
	columnIndex = 0,
	activeLoadingIndex = 0,
	onLoadFinished,
}: {
	catColor?: string;
	items?: BasketItem[];
	columnIndex?: number;
	activeLoadingIndex?: number;
	onLoadFinished?: () => void;
}) {
	const [
 isChartReady,
setIsChartReady,
] = useState(false);
	const isComparisonMode = useBasketStore((state) => state.isComparisonMode);
	const prevComparisonRef = useRef(isComparisonMode);

	useEffect(() => {
		// Case A: Comparison mode is active (Multi-basket view)
		if (isComparisonMode) {
			if (columnIndex < activeLoadingIndex) {
				setIsChartReady(true);
				return;
			}

			if (columnIndex > activeLoadingIndex) {
				setIsChartReady(false);
				return;
			}

			// Hide the chart initially for Stage 3 coordination during first column expand
			if (activeLoadingIndex === 0) {
				setIsChartReady(false);
			}

			const delay = activeLoadingIndex === 0 ? 600 : 350;
			const timer = setTimeout(() => {
				setIsChartReady(true);
				onLoadFinished?.();
			}, delay);

			return () => clearTimeout(timer);
		}

		// Case B: Comparison mode is inactive (Single-basket view)
		// If we just collapsed comparison mode (transitioned from true to false),
		// we delay showing the chart by 550ms to let the 500ms drawer collapse complete at high FPS.
		const wasComparisonMode = prevComparisonRef.current;
		prevComparisonRef.current = isComparisonMode;

		if (wasComparisonMode === true && !isComparisonMode) {
			setIsChartReady(false);
			const timer = setTimeout(() => {
				setIsChartReady(true);
			}, 550);
			return () => clearTimeout(timer);
		}

		// Otherwise, normal single-basket mode (e.g., active tab selection sliding)
		setIsChartReady(true);
	}, [
		columnIndex,
		activeLoadingIndex,
		isComparisonMode,
		onLoadFinished,
	]);

	const storeItems = useBasketStore((state) => propItems !== undefined ? null : state.items);
	const items = propItems !== undefined ? propItems : (storeItems || [
]);
	const uniqueId = useId().replace(/:/g, '');
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
				plusKartenCount: item.config.plusKartenCount,
				plusKarten: item.config.plusKarten,
				settings,
				isHybrid: (item.config as any).isHybrid,
			});

			calculation.monthlyCosts.forEach((mc, index) => {
				if (data[index]) {
					data[index].total += mc.total;
					let baseName = item.product.name;
					if ((item.config as any).isHybrid) {
						if (baseName.includes('(DSL)')) {
							baseName = baseName.replace('(DSL)', 'Hybrid').trim();
						} else {
							baseName = `${baseName} Hybrid`;
						}
					}
					data[index].details.push({
						name: baseName,
						cost: mc.total,
					});
				}
			});
		});

		return data;
	}, [
		items,
		settings,
	]);

	if (items.length === 0) { return null; }

	const averageTotal =
		aggregatedData.reduce((acc, curr) => acc + curr.total, 0) / 24;

	return (
		<div style={{
 '--cat-color': catColor,
} as React.CSSProperties}>
			{/* Header */}
			<div className="flex items-baseline justify-between mb-3">
				<span className="text-[0.72rem] font-semibold text-[#aaa] uppercase tracking-wider">
					Kostenverlauf
				</span>
				<div className="text-right">
					<span
						className="text-[1.1rem] font-extrabold leading-none transition-colors duration-500"
						style={{
							color: 'var(--cat-color)',
						}}
					>
						<AnimatedNumber value={averageTotal} /> €
					</span>
					<span className="text-[0.6rem] text-[#b0b0b0] font-medium ml-1">
						Ø mtl.
					</span>
				</div>
			</div>

			{/* Chart */}
			<div className="h-[100px] w-full transition-all duration-500 relative flex items-end">
				{!isChartReady ? (
					<div className="w-full h-full flex items-end justify-between gap-1 px-1 pb-1">
						{Array.from({
 length: 12,
}).map((_, i) => {
							const heights = [
 'h-1/3',
'h-1/2',
'h-2/3',
'h-3/4',
'h-2/5',
'h-1/2',
'h-3/5',
'h-4/5',
'h-1/2',
'h-2/3',
'h-3/4',
'h-1/3',
];
							const height = heights[i % heights.length];
							return (
								<Skeleton
									key={i}
									className={`${height} w-full rounded-t-sm bg-[#eaedf0]`}
								/>
							);
						})}
					</div>
				) : (
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
								fill: 'var(--cat-color)',
								opacity: 0.05,
							}}
							content={({
								active, payload,
							}: {
								active?: boolean;
								payload?: readonly {
									payload: {
										month: number;
										total: number;
										details: { name: string; cost: number }[];
									};
								}[];
							}) => {
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
												<span
													style={{
														color: 'var(--cat-color)',
													}}
													className="transition-colors duration-500"
												>
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
							stroke="var(--cat-color)"
							strokeDasharray="3 3"
							strokeOpacity={0.5}
							strokeWidth={1}
							className="transition-all duration-500"
						/>
						<Bar
							dataKey="total"
							fill={`url(#colorTotal-${uniqueId})`}
							radius={[
								7,
								7,
								0,
								0,
							]}
							maxBarSize={14}
						/>
						<defs>
							<linearGradient id={`colorTotal-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="var(--cat-color)" stopOpacity={0.2} />
								<stop offset="100%" stopColor="var(--cat-color)" stopOpacity={1} />
							</linearGradient>
						</defs>
					</BarChart>
				</ResponsiveContainer>
				)}
			</div>
		</div>
	);
}
