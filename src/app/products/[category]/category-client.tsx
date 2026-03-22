'use client';

import {
	useState, useMemo, useRef, useEffect,
} from 'react';
import {
	trpc,
} from '@/lib/trpc';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	ArrowLeft,
	Star,
	Smartphone,
	ChevronDown,
	MessageSquareQuote,
	Users,

	GraduationCap,
	HeartHandshake,
	Gamepad2,
	Briefcase,
	Asterisk,
	ArrowUpDown,
	ArrowUp,
	Check,
	Plus,
	Sparkles,
	ArrowDown,
} from 'lucide-react';
import Link from 'next/link';
import {
	useParams,
} from 'next/navigation';
import clsx from 'clsx';
import {
	SearchBar,
} from '@/components/features/search/search-bar';
import {
	useSettingsStore,
} from '@/hooks/use-settings-store';
import {
	useBasketStore,
} from '@/hooks/use-basket-store';
import {
	Skeleton,
} from '@/components/shared/skeleton';

/* --- Custom UI Icons --- */
const SpeedTacho = ({
	percentage,
	color,
}: {
	percentage: number;
	color: string;
}) => {
	const angle = (percentage / 100) * 180 - 90;
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			className="shrink-0 drop-shadow-sm mb-1"
		>
			<path
				d="M 3 17 A 9 9 0 0 1 21 17"
				fill="none"
				stroke={color}
				strokeOpacity="0.25"
				strokeWidth="3.5"
				strokeLinecap="round"
			/>
			<g
				style={{
					transform: `rotate(${angle}deg)`,
					transformOrigin: '12px 17px',
					transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
				}}
			>
				<polygon points="12,17 10,17 12,8 14,17" fill={color} />
			</g>
			<circle cx="12" cy="17" r="3" fill={color} />
		</svg>
	);
};

const VolumeBars = ({
	percentage,
	color,
}: {
	percentage: number;
	color: string;
}) => {
	const level =
		percentage <= 25 ? 1 : percentage <= 50 ? 2 : percentage <= 75 ? 3 : 4;
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			className="shrink-0 drop-shadow-sm"
		>
			<rect
				x="3"
				y="15"
				width="3.5"
				height="5"
				rx="1.5"
				fill={level >= 1 ? color : `${color}30`}
				style={{
					transition: 'fill 0.4s ease-out',
				}}
			/>
			<rect
				x="8.5"
				y="11"
				width="3.5"
				height="9"
				rx="1.5"
				fill={level >= 2 ? color : `${color}30`}
				style={{
					transition: 'fill 0.4s ease-out 0.1s',
				}}
			/>
			<rect
				x="14"
				y="7"
				width="3.5"
				height="13"
				rx="1.5"
				fill={level >= 3 ? color : `${color}30`}
				style={{
					transition: 'fill 0.4s ease-out 0.2s',
				}}
			/>
			<rect
				x="19.5"
				y="3"
				width="3.5"
				height="17"
				rx="1.5"
				fill={level >= 4 ? color : `${color}30`}
				style={{
					transition: 'fill 0.4s ease-out 0.3s',
				}}
			/>
		</svg>
	);
};

export default function ProductListPage() {
	const params = useParams();
	const category = params.category as string;
	const [
		expandedArgId,
		setExpandedArgId,
	] = useState<string | null>(null);
	const [
		activeFilterId,
		setActiveFilterId,
	] = useState<string | null>(null);
	const [
		sortMenuOpen,
		setSortMenuOpen,
	] = useState(false);
	const sortRef = useRef<HTMLDivElement>(null);

	const utils = trpc.useUtils();
	const {
		compactView, sortOption, setSortOption,
	} = useSettingsStore();
	const {
		addItem,
	} = useBasketStore();

	const {
		data: session,
	} = trpc.session.getCurrent.useQuery();

	const {
		data: products, isLoading,
	} =
		trpc.product.getProductsByCategory.useQuery({
			category,
	});

	const categoryNames: Record<string, string> = {
		MOBILE: 'Mobilfunk',
		FIBER: 'Glasfaser',
		DSL: 'Festnetz',
		MAGENTA_TV_OTT: 'MagentaTV — OTT',
		DEVICE: 'Endgeräte',
		ADDON: 'Zubuchoptionen',
	};

	const categoryColors: Record<string, string> = {
		MOBILE: '#e20074',
		FIBER: '#0090d0',
		DSL: '#7b61ff',
		MAGENTA_TV_OTT: '#ff6b00',
		DEVICE: '#00a878',
		ADDON: '#e67e22',
	};

	const catColor = categoryColors[category] || '#e20074';

	const FILTER_PRESETS = [
		{
			id: 'student',
			label: 'Student & Young',
			icon: GraduationCap,
			categories: [
				'MOBILE',
				'DSL',
				'FIBER',
			],
			pitch:
				'Perfekt für junge Leute: Viel Datenvolumen oder hohe Geschwindigkeiten zum kleinen Preis. Optimal für alle unter 28 Jahren. Nutze hierfür die Young-Konditionen!',
			predicate: (p: any) => p.targetGroups?.includes('student'),
		},
		{
			id: 'family',
			label: 'Familie mit Kids',
			icon: Users,
			categories: [
				'MOBILE',
				'DSL',
				'FIBER',
			],
			pitch:
				'Hervorragendes Netz für alle Geräte, ideal für Streaming, Home-Schooling und günstige PlusKarten für die Kids. Geeignet für mehrere gleichzeitige Nutzer.',
			predicate: (p: any) => p.targetGroups?.includes('family'),
		},
		{
			id: 'senior',
			label: 'Ältere Personen',
			icon: HeartHandshake,
			categories: [
				'MOBILE',
				'DSL',
				'FIBER',
			],
			pitch:
				'Einfach, sicher, verlässlich: Die Basis-Tarife ohne Schnickschnack. Perfekt für gelegentliches Surfen und Telefonate mit den Liebsten.',
			predicate: (p: any) => p.targetGroups?.includes('senior'),
		},
		{
			id: 'power',
			label: 'Stream/Gaming',
			icon: Gamepad2,
			categories: [
				'DSL',
				'FIBER',
				'MOBILE',
			],
			pitch:
				'Viel Datenvolumen, maximale Geschwindigkeit und beste Latenz für grenzenloses Online-Gaming und 4K-Streaming.',
			predicate: (p: any) => p.targetGroups?.includes('power'),
		},
		{
			id: 'business',
			label: 'Home-Office',
			icon: Briefcase,
			categories: [
				'DSL',
				'FIBER',
			],
			pitch:
				'Stabiles Netz für Video-Calls: Höchste Zuverlässigkeit und starker Upload für reibungsloses Arbeiten von Zuhause.',
			predicate: (p: any) => p.targetGroups?.includes('business'),
		},
	];

	const visibleFilters = FILTER_PRESETS.filter((f) =>
		f.categories.some((c) => c.toUpperCase() === category?.toUpperCase()),
	);
	const activeFilter = FILTER_PRESETS.find((f) => f.id === activeFilterId);

	const SORT_OPTIONS = [
		{
			id: 'default',
			label: 'Standard',
			icon: ArrowUpDown,
		},
		{
			id: 'name-asc',
			label: 'Name (A → Z)',
			icon: ArrowUp,
		},
		{
			id: 'name-desc',
			label: 'Name (Z → A)',
			icon: ArrowDown,
		},
		{
			id: 'price-asc',
			label: 'Preis (aufsteigend)',
			icon: ArrowUp,
		},
		{
			id: 'price-desc',
			label: 'Preis (absteigend)',
			icon: ArrowDown,
		},
		{
			id: 'speed-asc',
			label: 'Geschwindigkeit (aufsteigend)',
			icon: ArrowUp,
		},
		{
			id: 'speed-desc',
			label: 'Geschwindigkeit (absteigend)',
			icon: ArrowDown,
		},
	];

	const activeSortOption = SORT_OPTIONS.find((s) => s.id === sortOption);

	// Close sort menu on outside click
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
				setSortMenuOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [
]);


	const filteredProducts = useMemo(() => {
		const filtered =
			products?.filter((p) => {
				if (!activeFilter) { return true; }
				return activeFilter.predicate(p);
			}) || [
];

		if (sortOption === 'default') { return filtered; }

		return [
			...filtered,
		].sort((a, b) => {
			switch (sortOption) {
			case 'name-asc':
				return a.name.localeCompare(b.name, 'de');
			case 'name-desc':
				return b.name.localeCompare(a.name, 'de');
			case 'price-asc':
				return (a.basePrice ?? 0) - (b.basePrice ?? 0);
			case 'price-desc':
				return (b.basePrice ?? 0) - (a.basePrice ?? 0);
			case 'speed-asc':
				return (a.downloadSpeed ?? 0) - (b.downloadSpeed ?? 0);
			case 'speed-desc':
				return (b.downloadSpeed ?? 0) - (a.downloadSpeed ?? 0);
			default:
				return 0;
			}
		});
	}, [
		products,
		activeFilter,
		sortOption,
	]);

	// Calculate dynamic percentage for speed and data volume
	const productMetrics = useMemo(() => {
		if (!products) {
			return {
				speeds: {
				},
				volumes: {
				},
			};
		}

		const speedSet = new Set<number>();
		const volumeSet = new Set<number>();

		products.forEach((p) => {
			if (p.downloadSpeed && p.downloadSpeed > 0) { speedSet.add(p.downloadSpeed); }
			if (p.dataVolume) {
				const lower = p.dataVolume.toLowerCase();
				if (lower.includes('unbegrenzt') || lower.includes('unlimited')) {
					volumeSet.add(Infinity);
				}
				else {
					const match = p.dataVolume.match(/(\d+)/);
					if (match) { volumeSet.add(parseInt(match[1], 10)); }
				}
			}
		});

		const uniqueSpeeds = Array.from(speedSet).sort((a, b) => a - b);
		const uniqueVolumes = Array.from(volumeSet).sort((a, b) => a - b);

		const speeds: Record<string, number> = {
		};
		const volumes: Record<string, number> = {
		};

		products.forEach((p) => {
			if (p.downloadSpeed && p.downloadSpeed > 0) {
				const idx = uniqueSpeeds.indexOf(p.downloadSpeed);
				speeds[p.id] =
					uniqueSpeeds.length > 0
						? ((idx + 1) / uniqueSpeeds.length) * 100
						: 100;
			}
			if (p.dataVolume) {
				const lower = p.dataVolume.toLowerCase();
				let val = 0;
				if (lower.includes('unbegrenzt') || lower.includes('unlimited')) {
					val = Infinity;
				}
				else {
					const match = p.dataVolume.match(/(\d+)/);
					if (match) { val = parseInt(match[1], 10); }
				}
				if (val > 0 || val === Infinity) {
					const idx = uniqueVolumes.indexOf(val);
					volumes[p.id] =
						uniqueVolumes.length > 0
							? ((idx + 1) / uniqueVolumes.length) * 100
							: 100;
				}
			}
		});

		return {
			speeds,
			volumes,
		};
	}, [
		products,
	]);

	return (
		<div className="min-h-full">
			{/* Search Bar */}
			<div className="pt-2">
				<SearchBar compact />
			</div>

			{/* Header */}
			<motion.div
				initial={{
					opacity: 0,
					y: 8,
				}}
				animate={{
					opacity: 1,
					y: 0,
				}}
				transition={{
					duration: 0.15,
					ease: 'easeOut',
					delay: 0,
				}}
				className="bg-transparent pb-8"
			>
				<Link
					href="/products"
					className="inline-flex items-center gap-2 text-[#999] hover:text-[#e20074] transition-colors mb-5 text-[0.85rem] font-medium"
				>
					<ArrowLeft className="w-4 h-4" />
					<span className="text-[0.8rem] mt-0.5 font-semibold uppercase tracking-wider text-[#e20074]">
						Kategorieauswahl
					</span>
				</Link>

				<h1 className="text-3xl font-extrabold text-[#262626] tracking-tight mb-2">
					{categoryNames[category] || category}
				</h1>
				<p className="text-[0.95rem] text-[#6a6a6a]">
					{filteredProducts.length || 0} verfügbare Tarife in dieser Kategorie.
				</p>
			</motion.div>

			{/* Filters + Sorting */}
			<div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-20">
				<div className="flex items-center gap-2 flex-wrap pb-4">
					{/* Filter Pills */}
					{visibleFilters.map((filter) => (
						<button
							key={filter.id}
							onClick={() =>
								setActiveFilterId(
									activeFilterId === filter.id ? null : filter.id,
								)
							}
							className={clsx(
								'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all duration-200 cursor-pointer outline-none',
								activeFilterId === filter.id
									? 'text-white shadow-md'
									: 'bg-linear-to-br from-white to-[#fcfafc] border-[#eaedf0] text-[#666] hover:bg-[#f7f8fa] hover:border-[#ddd]',
							)}
							style={{
								backgroundColor:
									activeFilterId === filter.id ? catColor : undefined,
								borderColor: activeFilterId === filter.id ? catColor : undefined,
							}}
						>
							<filter.icon
								className={clsx(
									'w-4 h-4',
									activeFilterId === filter.id ? 'opacity-100' : 'opacity-60',
								)}
							/>
							<span className="font-semibold text-[0.8rem]">
								{filter.label}
							</span>
						</button>
					))}

					{/* Separator */}
					{visibleFilters.length > 0 && (
						<div className="h-6 w-px bg-[#e0e0e0] mx-1 shrink-0" />
					)}

					{/* Sort Dropdown */}
					<div className="relative shrink-0" ref={sortRef}>
						<button
							onClick={() => setSortMenuOpen(!sortMenuOpen)}
							className={clsx(
								'flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all duration-200 cursor-pointer outline-none',
								sortOption !== 'default'
									? 'text-white shadow-md'
									: 'bg-linear-to-br from-white to-[#fcfafc] border-[#eaedf0] text-[#666] hover:bg-[#f7f8fa] hover:border-[#ddd]',
							)}
							style={{
								backgroundColor:
									sortOption !== 'default' ? catColor : undefined,
								borderColor: sortOption !== 'default' ? catColor : undefined,
							}}
						>
							<ArrowUpDown className="w-4 h-4" />
							<span className="font-semibold text-[0.8rem]">
								{activeSortOption?.label || 'Sortieren'}
							</span>
							<ChevronDown
								className={clsx(
									'w-3.5 h-3.5 transition-transform duration-200',
									sortMenuOpen ? 'rotate-180' : '',
								)}
							/>
						</button>

						{/* Dropdown Menu */}
						<AnimatePresence>
							{sortMenuOpen && (
								<motion.div
									initial={{
										opacity: 0,
										y: -8,
										scale: 0.96,
									}}
									animate={{
										opacity: 1,
										y: 0,
										scale: 1,
									}}
									exit={{
										opacity: 0,
										y: -8,
										scale: 0.96,
									}}
									transition={{
										duration: 0.15,
									}}
									className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl border border-[#eaedf0] shadow-lg py-1.5 min-w-[220px]"
								>
									{SORT_OPTIONS.map((option) => (
										<button
											key={option.id}
											onClick={() => {
												setSortOption(option.id);
												setSortMenuOpen(false);
											}}
											className={clsx(
												'w-full flex items-center gap-3 px-4 py-2.5 text-left text-[0.8rem] font-medium transition-colors cursor-pointer outline-none',
												sortOption === option.id
													? 'bg-[#f7f8fa]'
													: 'hover:bg-[#fafafa]',
											)}
											style={{
												color: sortOption === option.id ? catColor : '#555',
											}}
										>
											<option.icon className="w-3.5 h-3.5 shrink-0 opacity-70" />
											<span className="flex-1">{option.label}</span>
											{sortOption === option.id && (
												<Check
													className="w-3.5 h-3.5 shrink-0"
													style={{
														color: catColor,
													}}
												/>
											)}
										</button>
									))}
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>

				<AnimatePresence mode="popLayout">
					{activeFilter && (
						<motion.div
							initial={{
								opacity: 0,
								scale: 0.95,
								y: -5,
							}}
							animate={{
								opacity: 1,
								scale: 1,
								y: 0,
							}}
							exit={{
								opacity: 0,
								scale: 0.95,
								y: -5,
							}}
							transition={{
								duration: 0.15,
							}}
							className="border px-5 py-4 rounded-2xl flex items-start gap-3 shadow-sm"
							style={{
								backgroundColor: `${catColor}1C`,
								borderColor: `${catColor}59`,
								color: catColor,
							}}
						>
							<Asterisk
								className="w-10 h-10 mt-0.5 shrink-0"
								strokeWidth={1.5}
							/>
							<div>
								<h4 className="font-bold text-[0.85rem] mb-1">
									Empfehlung für: {activeFilter.label}
								</h4>
								<p className="text-[0.85rem] m-0 leading-relaxed opacity-90">
									{activeFilter.pitch}
								</p>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Product Grid */}
			<div className="pb-10">
				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[
							1,
							2,
							3,
							4,
							5,
							6,
						].map((i) => (
							<div
								key={i}
								className="h-auto bg-linear-to-br from-white to-[#fcfafc] rounded-2xl border border-[#eaedf0] overflow-hidden flex flex-col justify-between"
							>
								{/* Skeleton Top Section matching content padding */}
								<div className="p-5">
									<div className="flex justify-between items-baseline mb-4">
										<Skeleton className="h-[1.15rem] w-3/4 rounded-md bg-[#eaedf0]" />
										<Skeleton className="h-3 w-8 rounded-full bg-[#f0f0f0]" />
									</div>
									<div className="space-y-2.5 mb-5">
										<Skeleton className="h-2.5 w-full rounded bg-[#f7f8fa]" />
										<Skeleton className="h-2.5 w-5/6 rounded bg-[#f7f8fa]" />
									</div>
									<div className="flex gap-4">
										<div className="flex gap-1.5 items-center">
											<Skeleton className="h-3 w-3 rounded-full bg-[#eaedf0]" />
											<Skeleton className="h-2.5 w-10 rounded bg-[#f0f0f0]" />
										</div>
										<div className="flex gap-1.5 items-center">
											<Skeleton className="h-3 w-3 rounded-full bg-[#eaedf0]" />
											<Skeleton className="h-2.5 w-16 rounded bg-[#f0f0f0]" />
										</div>
									</div>
								</div>

								{/* Skeleton Bottom Section */}
								<div className="p-5 pt-3 border-t border-[#f0f0f0] mt-auto">
									<div className="flex justify-between items-end">
										<div>
											<Skeleton className="h-7 w-20 rounded-md bg-[#eaedf0] mb-1" />
											<Skeleton className="h-2 w-14 rounded bg-[#f0f0f0]" />
										</div>
										<div className="flex gap-1.5">
											<Skeleton className="h-8 w-10 rounded-xl bg-[#eaedf0]" />
											<Skeleton className="h-8 w-28 rounded-xl bg-[#eaedf0]" />
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<AnimatePresence mode="popLayout">
							{filteredProducts.map((product, index) => {
								const isFocused = session?.team?.highlights.some(
									(h) => h.productId === product.id,
								);

								return (
									<motion.div
										key={product.id}
										id={`tour-product-${index}`}
										initial={{
											opacity: 0,
											y: 5,
										}}
										animate={{
											opacity: 1,
											y: 0,
										}}
										transition={{
											duration: 0.15,
											delay: index * 0.02,
										}}
										style={{
											'--cat-color': catColor,
										} as React.CSSProperties}
										data-cursor="view"
										className={clsx(
											'bg-linear-to-br from-white to-[#fcfafc] rounded-2xl flex flex-col justify-between transition-all duration-300 group border relative cursor-pointer overflow-hidden',
											isFocused ? 'highlight-glow' : 'border-[#eaedf0]',
											compactView ? 'p-3.5' : 'p-5',
										)}
									>
										{/* Gradient overlay - hover only */}
										<div
											className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
											style={{
												background: `linear-gradient(to right, transparent 20%, ${catColor}10 60%, ${catColor}18 100%)`,
											}}
										/>

										{/* Top section */}
										<div className="relative z-10">
											{/* Badges row */}
											{isFocused && (
												<div className="mb-2 flex items-center gap-2">
													<div className="inline-flex bg-[rgba(255,213,79,0.15)] text-[#b78900] px-2 py-0.5 rounded text-[0.65rem] font-bold tracking-wide leading-none uppercase items-center gap-1 whitespace-nowrap">
														<Star className="w-3 h-3 fill-current" />
														<span className="relative top-[1.5px]">
															TEAM-FOKUS
														</span>
													</div>
												</div>
											)}


											{/* Title + Duration + Stats indicator on same line */}
											<div
												className={clsx(
													'flex items-baseline justify-between',
													compactView ? 'mb-1.5' : 'mb-3',
												)}
											>
												<div className="flex items-center gap-3">
													<h3
														className={clsx(
															'font-bold transition-colors duration-300 leading-tight m-0 flex items-center gap-2',
															compactView ? 'text-[0.95rem]' : 'text-[1.15rem]',
															isFocused
																? ''
																: 'text-[#1a1a2e] group-hover:text-(--cat-color)',
														)}
														style={isFocused ? {
															color: catColor,
														} : undefined}
													>
														{product.name}
													</h3>

													{/* Speed / Volume Visualizer */}
													{product.category === 'MOBILE' &&
													product.dataVolume ? (
															<div
																className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold text-[0.7rem] uppercase tracking-wide group-hover:scale-[1.02] transition-transform"
																style={{
																	backgroundColor: `${catColor}0d`,
																	borderColor: `${catColor}25`,
																	color: catColor,
																}}
															>
																<VolumeBars
																	percentage={
																		productMetrics.volumes[product.id] || 0
																	}
																	color={catColor}
																/>
																<span className="mt-0.5">
																	{product.dataVolume}
																</span>
															</div>
														) : product.category !== 'DEVICE' &&
													  product.downloadSpeed ? (
																<div
																	className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold text-[0.7rem] uppercase tracking-wide group-hover:scale-[1.02] transition-transform"
																	style={{
																		backgroundColor: `${catColor}0d`,
																		borderColor: `${catColor}25`,
																		color: catColor,
																	}}
																>
																	<SpeedTacho
																		percentage={
																			productMetrics.speeds[product.id] || 0
																		}
																		color={catColor}
																	/>
																	<span className="mt-0.5">
																		{product.downloadSpeed} Mbit/s
																	</span>
																</div>
															) : null}
												</div>
												{product.contractDuration && (
													<span className="text-[0.68rem] font-medium text-[#c0c0c0] uppercase tracking-wider ml-3 shrink-0">
														{product.contractDuration}M
													</span>
												)}
											</div>

											{/* Description snippet */}
											{!compactView && product.description && (
												<p className="text-[0.8rem] text-[#666] line-clamp-2 mt-1 mb-3 leading-relaxed">
													{product.description}
												</p>
											)}

											{/* Specs - compact inline (REMOVED: Now displayed beside the title) */}
											{product.category === 'DEVICE' &&
												(product as any).deviceManufacturer && (
												<div className="flex items-center gap-4 text-[0.8rem] text-[#888]">
													<div className="flex items-center gap-1.5">
														<Smartphone className="w-3.5 h-3.5 text-[#bbb]" />
														<span className="font-medium text-[#666]">
															{(product as any).deviceManufacturer}
														</span>
													</div>
												</div>
											)}

											{/* Sales Arguments (Collapsible) */}
											{(product as any).salesArguments &&
												(product as any).salesArguments.length > 0 && (
												<div className="mt-1 pt-1">
													<button
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															setExpandedArgId(
																expandedArgId === product.id
																	? null
																	: product.id,
															);
														}}
														className="flex items-center justify-between w-full text-[0.8rem] font-medium transition-colors cursor-pointer group/args"
														style={{
															color: catColor,
														}}
													>
														<span className="flex items-center gap-1.5">
															<MessageSquareQuote className="w-3.5 h-3.5 opacity-80" />
															{(product as any).salesArguments.length}{' '}
																Verkaufsargument(e)
														</span>
														<ChevronDown
															className={clsx(
																'w-3.5 h-3.5 transition-transform duration-300',
																expandedArgId === product.id
																	? 'rotate-180'
																	: '',
															)}
														/>
													</button>

													<AnimatePresence>
														{expandedArgId === product.id && (
															<motion.div
																initial={{
																	height: 0,
																	opacity: 0,
																}}
																animate={{
																	height: 'auto',
																	opacity: 1,
																}}
																exit={{
																	height: 0,
																	opacity: 0,
																}}
																transition={{
																	duration: 0.2,
																}}
																className="overflow-hidden"
															>
																<div className="pt-3 pb-1 flex flex-wrap gap-x-2.5 gap-y-2">
																	{(product as any).salesArguments.map(
																		(arg: any) => (
																			<div
																				key={arg.id}
																				className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#f7f8fa] border border-[#eaedf0] text-[0.78rem] font-semibold text-[#555] shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-default transition-all hover:bg-white hover:border-[#d1d5db]"
																			>
																				<Sparkles
																					className="w-3.5 h-3.5 shrink-0"
																					style={{
																						color: catColor,
																					}}
																				/>
																				<span className="leading-tight">
																					{arg.text}
																				</span>
																			</div>
																		),
																	)}
																</div>
															</motion.div>
														)}
													</AnimatePresence>
												</div>
											)}
										</div>

										{/* Bottom: Price + CTA */}
										<div className="relative z-10 flex justify-between items-end mt-2 pt-2 border-t border-[#f0f0f0]">
											<div>
												{product.category === 'DEVICE' ? (
													<div className="flex flex-col gap-1 mb-1 justify-end h-full">
														{(product as any).purchasePrice > 0 && (
															<div className="flex items-baseline mt-0.5">
																<span
																	className={clsx(
																		'font-extrabold text-[#1a1a2e] tracking-tight leading-none',
																		((product as any).rentalPrice ||
																			product.basePrice) > 0
																			? 'text-[1.1rem]'
																			: 'text-[1.35rem]',
																	)}
																>
																	{(product as any).purchasePrice.toFixed(2)} €
																</span>
																<span className="text-[0.65rem] text-[#b0b0b0] font-bold ml-1.5 uppercase tracking-wide">
																	Kauf
																</span>
															</div>
														)}
														{((product as any).rentalPrice ||
															product.basePrice) > 0 && (
															<div className="flex items-baseline mt-0.5">
																<span
																	className={clsx(
																		'font-extrabold text-[#1a1a2e] tracking-tight leading-none',
																		(product as any).purchasePrice > 0
																			? 'text-[1.1rem]'
																			: 'text-[1.35rem]',
																	)}
																>
																	{(
																		(product as any).rentalPrice ||
																		product.basePrice
																	).toFixed(2)}{' '}
																	€
																</span>
																<span className="text-[0.65rem] text-[#b0b0b0] font-bold ml-1.5 uppercase tracking-wide">
																	Miete
																</span>
															</div>
														)}
													</div>
												) : (
													<>
														<span
															className={clsx(
																'font-extrabold text-[#1a1a2e] tracking-tight leading-none',
																compactView ? 'text-[1.3rem]' : 'text-[1.8rem]',
															)}
														>
															{product.basePrice.toFixed(2)} €
														</span>
														<span className="text-[0.7rem] text-[#b0b0b0] font-medium ml-1">
															/Monat
														</span>
													</>
												)}
											</div>

											<div className="flex items-center gap-1.5">
												<button
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														addItem(product as any, {
															businessCase: 'NEW_ACTIVATION',
															selectedSpecialPriceIds: [
															],
															magentaTVPackage: null,
															selectedAddonIds: [
															],
															vouchers: [
															],
															credits: [
															],
															hardwarePurchaseType:
																product.category === 'DEVICE'
																	? ((product as any).rentalPrice ||
																			product.basePrice) > 0
																		? 'RENT'
																		: 'BUY'
																	: undefined,
														});
													}}
													className={clsx(
														'px-2.5 py-1.5 h-full rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95',
														isFocused
															? 'text-white border-transparent'
															: 'bg-[#f7f8fa] border border-[#eaedf0] text-[#666] hover:text-white',
													)}
													style={{
														backgroundColor: isFocused ? catColor : undefined,
														borderColor: isFocused ? catColor : undefined,
													}}
													onMouseEnter={(e) => {
														if (!isFocused) {
															e.currentTarget.style.backgroundColor = catColor;
															e.currentTarget.style.borderColor = catColor;
														}
													}}
													onMouseLeave={(e) => {
														if (!isFocused) {
															e.currentTarget.style.backgroundColor = '';
															e.currentTarget.style.borderColor = '';
														}
													}}
													title="Hinzufügen"
												>
													<Plus className="w-5 h-5 shrink-0" />
												</button>

												<Link
													href={`/products/${category}/${product.id}`}
													className="block"
													onMouseEnter={() =>
														utils.product.getProductById.prefetch({
															id: product.id,
														})
													}
													onFocus={() =>
														utils.product.getProductById.prefetch({
															id: product.id,
														})
													}
												>
													<button
														className={clsx(
															'px-3 py-1.5 rounded-xl font-semibold text-[0.8rem] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95',
															isFocused
																? 'text-white hover:shadow-lg'
																: 'bg-[#f7f8fa] border border-[#eaedf0] text-[#666] hover:bg-[#1a1a2e] hover:text-white hover:border-[#1a1a2e]',
														)}
														style={{
															backgroundColor: isFocused ? catColor : undefined,
															boxShadow: isFocused
																? `0 4px 12px ${catColor}33`
																: undefined,
														}}
													>
														Konfigurieren
														<ArrowLeft className="w-3.5 h-3.5 rotate-180" />
													</button>
												</Link>
											</div>
										</div>
									</motion.div>
								);
							})}
						</AnimatePresence>
					</div>
				)}
			</div>
		</div>
	);
}
