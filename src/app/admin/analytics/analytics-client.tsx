'use client';

import {
	trpc,
} from '@/lib/trpc';
import {
	useState, useMemo,
} from 'react';
import {
	BarChart3,
	Eye,
	ShoppingCart,
	TrendingUp,
	Users,
	Package,
	Layers,
	ArrowUpRight,
	ArrowDownRight,
	Calendar,
} from 'lucide-react';
import clsx from 'clsx';
import {
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
	Area,
	AreaChart,
} from 'recharts';
import {
	Skeleton,
} from '@/components/shared/skeleton';
import {
	motion,
} from 'framer-motion';
import {
	Tooltip as CustomTooltip,
} from '@/components/shared/ui/tooltip';

const CATEGORY_NAMES: Record<string, string> = {
	MOBILE: 'Mobilfunk',
	FIBER: 'Glasfaser',
	DSL: 'Festnetz',
	MAGENTA_TV_OTT: 'MagentaTV',
	DEVICE: 'Endgeräte',
	ADDON: 'Zubuchoptionen',
	PAGE_VIEW: 'Seitenaufrufe',
};

const CATEGORY_COLORS: Record<string, string> = {
	MOBILE: '#e20074',
	FIBER: '#0090d0',
	DSL: '#7b61ff',
	MAGENTA_TV_OTT: '#ff6b00',
	DEVICE: '#00a878',
	ADDON: '#64748b',
	PAGE_VIEW: '#94a3b8',
};

const PERIOD_OPTIONS = [
	{
		label: '7 Tage',
		days: 7,
	},
	{
		label: '30 Tage',
		days: 30,
	},
	{
		label: '90 Tage',
		days: 90,
	},
];

export default function AnalyticsClient() {
	const [
		selectedPeriod,
		setSelectedPeriod,
	] = useState(30);

	const {
		data, isLoading,
	} = trpc.analytics.getDashboard.useQuery(
		{
			days: selectedPeriod,
		},
		{
			staleTime: 10 * 1000,
			refetchOnWindowFocus: true,
		},
	);

	// Aggregate daily data for chart
	const chartData = useMemo(() => {
		if (!data?.dailyTrend) {
			return [
			];
		}

		const map = new Map<
			string,
			{
				date: string;
				views: number;
				basket: number;
				pages: number;
				uniquePages: number;
			}
		>();

		data.dailyTrend.forEach((d: any) => {
			if (!map.has(d.date)) {
				map.set(d.date, {
					date: d.date,
					views: 0,
					basket: 0,
					pages: 0,
					uniquePages: 0,
				});
			}
			const entry = map.get(d.date)!;
			if (d.eventType === 'PRODUCT_VIEW') { entry.views += d.count; }
			else if (d.eventType === 'BASKET_ADD') { entry.basket += d.count; }
			else if (d.eventType === 'PAGE_VIEW') { entry.pages += d.count; }
			else if (d.eventType === 'UNIQUE_PAGE_VIEW') { entry.uniquePages += d.count; }
		});

		return Array.from(map.values()).sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		);
	}, [
		data?.dailyTrend,
	]);

	// Aggregate top products: group by productId, show views + basket
	const topProductsList = useMemo(() => {
		if (!data?.topProducts) {
			return [
			];
		}

		const map = new Map<
			string,
			{
				name: string;
				category: string;
				views: number;
				basket: number;
				conversionRate: number;
			}
		>();

		data.topProducts.forEach((p: any) => {
			if (!map.has(p.productId!)) {
				map.set(p.productId!, {
					name: p.name,
					category: p.category,
					views: 0,
					basket: 0,
					conversionRate: 0,
				});
			}
			const entry = map.get(p.productId!)!;
			if (p.eventType === 'PRODUCT_VIEW') { entry.views += p.count; }
			else if (p.eventType === 'BASKET_ADD') { entry.basket += p.count; }
		});

		// Calculate conversion rate per product
		const list = Array.from(map.values());
		list.forEach((p) => {
			p.conversionRate =
				p.views > 0 ? Math.round((p.basket / p.views) * 1000) / 10 : 0;
		});

		return list.sort((a, b) => b.views - a.views).slice(0, 10);
	}, [
		data?.topProducts,
	]);

	// Format date for chart axis
	const formatDate = (dateStr: string) => {
		const d = new Date(dateStr);
		return `${d.getDate()}.${d.getMonth() + 1}.`;
	};

	return (
		<div>
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 rounded-2xl bg-[#e20074]/10 flex items-center justify-center">
						<BarChart3 className="w-6 h-6 text-[#e20074]" />
					</div>
					<div>
						<h1 className="text-[1.6rem] font-extrabold text-[#1a1a2e] tracking-tight m-0">
							Statistiken
						</h1>
						<p className="text-[0.8rem] text-[#888] font-medium m-0">
							Produktaufrufe & Warenkorb-Aktivität
						</p>
					</div>
				</div>

				{/* Period Selector */}
				<div className="flex items-center gap-1 bg-[#f7f8fa] rounded-xl p-1 border border-[#eaedf0]">
					{PERIOD_OPTIONS.map((opt) => (
						<button
							key={opt.days}
							onClick={() => setSelectedPeriod(opt.days)}
							className={clsx(
								'px-4 py-2 rounded-lg text-[0.78rem] font-semibold transition-all duration-200 cursor-pointer',
								selectedPeriod === opt.days
									? 'bg-white text-[#1a1a2e] shadow-sm border border-[#eaedf0]'
									: 'text-[#888] hover:text-[#1a1a2e] border border-transparent',
							)}
						>
							<Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
							{opt.label}
						</button>
					))}
				</div>
			</div>

			{isLoading ? (
				<div className="space-y-6">
					<div className="grid grid-cols-4 gap-4">
						{[
							...Array(4),
						].map((_, i) => (
							<Skeleton key={i} className="h-28 rounded-2xl" />
						))}
					</div>
					<Skeleton className="h-80 rounded-2xl" />
					<div className="grid grid-cols-2 gap-4">
						<Skeleton className="h-96 rounded-2xl" />
						<Skeleton className="h-96 rounded-2xl" />
					</div>
				</div>
			) : (
				<div className="space-y-6">
					{/* KPI Cards */}
					<div className="grid grid-cols-4 gap-4">
						<KPICard
							label="Produktaufrufe"
							value={data?.kpis.totalProductViews ?? 0}
							icon={Eye}
							color="#0090d0"
							subtitle={`${selectedPeriod} Tage`}
						/>
						<KPICard
							label="In den Warenkorb"
							value={data?.kpis.totalBasketAdds ?? 0}
							icon={ShoppingCart}
							color="#00a878"
							subtitle={`${selectedPeriod} Tage`}
						/>
						<KPICard
							label="Add Rate"
							value={data?.kpis.conversionRate ?? 0}
							icon={TrendingUp}
							color="#e20074"
							suffix="%"
							subtitle="Aufrufe → Warenkorb"
						/>
						<KPICard
							label="Seitenaufrufe (Tgl. eindeutig)"
							value={data?.kpis.totalUniquePageViews ?? 0}
							icon={Layers}
							color="#7b61ff"
							subtitle={`Von gesamt ${data?.kpis.totalPageViews?.toLocaleString('de-DE') ?? 0} Aufrufen`}
						/>
					</div>

					{/* Trend Chart */}
					<motion.div
						initial={{
							opacity: 0,
							y: 10,
						}}
						animate={{
							opacity: 1,
							y: 0,
						}}
						transition={{
							delay: 0.1,
						}}
						className="bg-white rounded-2xl border border-[#eaedf0] p-6"
					>
						<h2 className="text-[0.95rem] font-bold text-[#1a1a2e] mb-1 tracking-tight">
							Täglicher Verlauf
						</h2>
						<p className="text-[0.72rem] text-[#aaa] font-medium mb-5">
							Produktaufrufe und Warenkorb-Zugänge pro Tag
						</p>

						{chartData.length === 0 ? (
							<div className="h-64 flex items-center justify-center text-[#ccc] text-[0.85rem] font-medium">
								Noch keine Daten für diesen Zeitraum
							</div>
						) : (
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart
										data={chartData}
										margin={{
											top: 5,
											right: 5,
											left: -20,
											bottom: 0,
										}}
									>
										<defs>
											<linearGradient
												id="gradViews"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="5%"
													stopColor="#0090d0"
													stopOpacity={0.15}
												/>
												<stop
													offset="95%"
													stopColor="#0090d0"
													stopOpacity={0}
												/>
											</linearGradient>
											<linearGradient
												id="gradBasket"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="5%"
													stopColor="#00a878"
													stopOpacity={0.15}
												/>
												<stop
													offset="95%"
													stopColor="#00a878"
													stopOpacity={0}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid
											strokeDasharray="3 3"
											stroke="#f0f0f0"
											vertical={false}
										/>
										<XAxis
											dataKey="date"
											tickFormatter={formatDate}
											axisLine={false}
											tickLine={false}
											tick={{
												fontSize: 10,
												fill: '#bbb',
											}}
											interval="preserveStartEnd"
										/>
										<YAxis
											axisLine={false}
											tickLine={false}
											tick={{
												fontSize: 10,
												fill: '#bbb',
											}}
										/>
										<Tooltip
											content={({
												active, payload, label,
											}) =>
												active && payload?.length ? (
													<div className="bg-white rounded-xl shadow-lg border border-[#eaedf0] p-3 text-[0.75rem]">
														<div className="font-bold text-[#1a1a2e] mb-2 border-b border-[#f0f0f0] pb-1.5">
															{new Date(
																label as string | number,
															).toLocaleDateString('de-DE', {
																weekday: 'short',
																day: 'numeric',
																month: 'short',
															})}
														</div>
														{payload.map((p: any, i: number) => (
															<div
																key={i}
																className="flex items-center justify-between gap-4 mb-0.5"
															>
																<div className="flex items-center gap-1.5">
																	<div
																		className="w-2 h-2 rounded-full"
																		style={{
																			backgroundColor: p.color ?? '#ccc',
																		}}
																	/>
																	<span className="text-[#888]">
																		{p.name === 'views'
																			? 'Aufrufe'
																			: 'Warenkorb'}
																	</span>
																</div>
																<span className="font-bold text-[#1a1a2e]">
																	{p.value}
																</span>
															</div>
														))}
													</div>
												) : null
											}
										/>
										<Area
											type="monotone"
											dataKey="views"
											stroke="#0090d0"
											strokeWidth={2}
											fill="url(#gradViews)"
											name="views"
										/>
										<Area
											type="monotone"
											dataKey="basket"
											stroke="#00a878"
											strokeWidth={2}
											fill="url(#gradBasket)"
											name="basket"
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						)}

						{/* Legend */}
						<div className="flex items-center gap-6 mt-4 pt-3 border-t border-[#f0f0f0]">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-[#0090d0]" />
								<span className="text-[0.72rem] font-semibold text-[#888]">
									Produktaufrufe
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-[#00a878]" />
								<span className="text-[0.72rem] font-semibold text-[#888]">
									In den Warenkorb
								</span>
							</div>
						</div>
					</motion.div>

					{/* Bottom Grid: Top Products + Team Usage */}
					<div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
						{/* Top Products */}
						<motion.div
							initial={{
								opacity: 0,
								y: 10,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							transition={{
								delay: 0.2,
							}}
							className="bg-white rounded-2xl border border-[#eaedf0] p-6"
						>
							<div className="flex items-center justify-between mb-5">
								<div>
									<h2 className="text-[0.95rem] font-bold text-[#1a1a2e] tracking-tight">
										Top Produkte
									</h2>
									<p className="text-[0.72rem] text-[#aaa] font-medium mt-0.5">
										Meistaufgerufene Tarife
									</p>
								</div>
								<Package className="w-5 h-5 text-[#ccc]" />
							</div>

							{topProductsList.length === 0 ? (
								<div className="py-12 text-center text-[0.85rem] text-[#ccc] font-medium">
									Noch keine Produktdaten
								</div>
							) : (
								<div className="space-y-2">
									{topProductsList.map((product, i) => {
										const catColor =
											CATEGORY_COLORS[product.category] ?? '#888';
										const maxViews = topProductsList[0]?.views ?? 1;
										const barWidth = Math.max(
											(product.views / maxViews) * 100,
											4,
										);

										return (
											<div
												key={i}
												className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[#f7f8fa] transition-colors group"
											>
												{/* Rank */}
												<span
													className={clsx(
														'w-6 h-6 rounded-lg flex items-center justify-center text-[0.65rem] font-bold shrink-0',
														i < 3
															? 'bg-[#e20074]/10 text-[#e20074]'
															: 'bg-[#f0f0f0] text-[#aaa]',
													)}
												>
													{i + 1}
												</span>

												{/* Name + Category */}
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<span className="text-[0.82rem] font-semibold text-[#1a1a2e] truncate">
															{product.name}
														</span>
														<span
															className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded shrink-0"
															style={{
																backgroundColor: `${catColor}15`,
																color: catColor,
															}}
														>
															{CATEGORY_NAMES[product.category] ??
																product.category}
														</span>
													</div>

													{/* Mini bar */}
													<div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
														<div
															className="h-full rounded-full transition-all duration-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
															style={{
																width: `${barWidth}%`,
																backgroundColor: catColor,
															}}
														/>
													</div>
												</div>

												{/* Stats */}
												<div className="flex items-center gap-4 shrink-0">
													<div className="text-right">
														<div className="text-[0.8rem] font-bold text-[#1a1a2e]">
															{product.views}
														</div>
														<div className="text-[0.6rem] text-[#aaa] font-medium">
															Aufrufe
														</div>
													</div>
													<div className="text-right">
														<div className="text-[0.8rem] font-bold text-[#00a878]">
															{product.basket}
														</div>
														<div className="text-[0.6rem] text-[#aaa] font-medium">
															Warenkorb
														</div>
													</div>
													<div className="text-right min-w-[50px]">
														<div
															className={clsx(
																'text-[0.75rem] font-bold flex items-center justify-end gap-0.5',
																product.conversionRate >= 50
																	? 'text-[#00a878]'
																	: product.conversionRate >= 20
																		? 'text-[#ff6b00]'
																		: 'text-[#aaa]',
															)}
														>
															{product.conversionRate >= 50 ? (
																<ArrowUpRight className="w-3 h-3" />
															) : product.conversionRate < 20 &&
															  product.conversionRate > 0 ? (
																	<ArrowDownRight className="w-3 h-3" />
																) : null}
															{product.conversionRate}%
														</div>
														<div className="text-[0.6rem] text-[#aaa] font-medium">
															Conv.
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</motion.div>

						{/* Right Column: Categories + Team Usage */}
						<div className="space-y-6">
							{/* Category Distribution */}
							{data?.topCategories && data.topCategories.length > 0 && (
								<motion.div
									initial={{
										opacity: 0,
										y: 10,
									}}
									animate={{
										opacity: 1,
										y: 0,
									}}
									transition={{
										delay: 0.25,
									}}
									className="bg-white rounded-2xl border border-[#eaedf0] p-6"
								>
									<div className="flex items-center justify-between mb-5">
										<h2 className="text-[0.95rem] font-bold text-[#1a1a2e] tracking-tight">
											Kategorien
										</h2>
										<Layers className="w-5 h-5 text-[#ccc]" />
									</div>
									<div className="space-y-4">
										{data.topCategories.map((c: any, i: number) => {
											const name =
												CATEGORY_NAMES[c.category?.toUpperCase() ?? ''] ??
												c.category ??
												'Unbekannt';
											const catColor =
												CATEGORY_COLORS[c.category?.toUpperCase() ?? ''] ??
												'#ccc';
											const maxCount = data.topCategories[0]?.count ?? 1;
											const barWidth = Math.max((c.count / maxCount) * 100, 3);

											return (
												<div key={i} className="flex items-center gap-3">
													<div className="w-6 h-6 rounded-lg bg-[#f0f0f0] flex items-center justify-center text-[0.65rem] font-bold text-[#aaa] shrink-0">
														{i + 1}
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-center justify-between mb-1.5">
															<span className="text-[0.82rem] font-bold text-[#1a1a2e]">
																{name}
															</span>
															<span
																className="text-[0.78rem] font-extrabold"
																style={{
																	color: catColor,
																}}
															>
																{c.count.toLocaleString('de-DE')}
															</span>
														</div>
														<div className="h-2.5 bg-[#f0f0f0] rounded-full overflow-hidden">
															<div
																className="h-full rounded-full transition-all duration-1000 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
																style={{
																	width: `${barWidth}%`,
																	backgroundColor: catColor,
																}}
															/>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								</motion.div>
							)}

							{/* Team Usage */}
							{data?.teamUsage && data.teamUsage.length > 0 && (
								<motion.div
									initial={{
										opacity: 0,
										y: 10,
									}}
									animate={{
										opacity: 1,
										y: 0,
									}}
									transition={{
										delay: 0.3,
									}}
									className="bg-white rounded-2xl border border-[#eaedf0] p-6"
								>
									<div className="flex items-center justify-between mb-5">
										<h2 className="text-[0.95rem] font-bold text-[#1a1a2e] tracking-tight">
											Aktivste Teams
										</h2>
										<Users className="w-5 h-5 text-[#ccc]" />
									</div>
									<div className="space-y-4">
										{data.teamUsage.slice(0, 10).map((team: any, i: number) => {
											const maxCount = data.teamUsage[0]?.count ?? 1;
											const barWidth = Math.max(
												(team.count / maxCount) * 100,
												3,
											);

											return (
												<div key={i} className="flex items-center gap-3">
													<div className="w-6 h-6 rounded-lg bg-[#f0f0f0] flex items-center justify-center text-[0.65rem] font-bold text-[#aaa] shrink-0">
														{i + 1}
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-center justify-between mb-1.5">
															<div className="flex flex-col">
																<span className="text-[0.82rem] font-bold text-[#1a1a2e] truncate">
																	{team.name}
																</span>
																{team.locationAddress ? (
																	<CustomTooltip content={team.locationAddress}>
																		<span className="text-[0.6rem] text-[#bbb] font-medium border-b border-dashed border-[#eaedf0] cursor-help w-fit">
																			{team.location}
																		</span>
																	</CustomTooltip>
																) : (
																	<span className="text-[0.6rem] text-[#bbb] font-medium">
																		{team.location}
																	</span>
																)}
															</div>
															<span className="text-[0.78rem] font-extrabold text-[#e20074] shrink-0 ml-2">
																{team.count.toLocaleString('de-DE')}
															</span>
														</div>
														<div className="h-2.5 bg-[#f0f0f0] rounded-full overflow-hidden">
															<div
																className="h-full rounded-full bg-[#e20074]/60 transition-all duration-1000 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
																style={{
																	width: `${barWidth}%`,
																}}
															/>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								</motion.div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// --- KPI Card Component ---
function KPICard({
	label,
	value,
	icon: Icon,
	color,
	suffix = '',
	subtitle,
}: {
	label: string;
	value: number;
	icon: React.ElementType;
	color: string;
	suffix?: string;
	subtitle?: string;
}) {
	return (
		<motion.div
			initial={{
				opacity: 0,
				y: 10,
			}}
			animate={{
				opacity: 1,
				y: 0,
			}}
			className="bg-white rounded-2xl border border-[#eaedf0] p-5 flex items-start gap-4"
		>
			<div
				className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
				style={{
					backgroundColor: `${color}12`,
				}}
			>
				<Icon className="w-5 h-5" style={{
					color,
				}} />
			</div>
			<div>
				<span className="text-[0.72rem] font-semibold text-[#aaa] uppercase tracking-wider block mb-1">
					{label}
				</span>
				<span
					className="text-[1.6rem] font-extrabold tracking-tight leading-none"
					style={{
						color,
					}}
				>
					{typeof value === 'number' && suffix !== '%'
						? value.toLocaleString('de-DE')
						: value}
					{suffix && (
						<span className="text-[0.85rem] ml-0.5 font-bold">{suffix}</span>
					)}
				</span>
				{subtitle && (
					<span className="text-[0.65rem] text-[#ccc] font-medium block mt-1">
						{subtitle}
					</span>
				)}
			</div>
		</motion.div>
	);
}
