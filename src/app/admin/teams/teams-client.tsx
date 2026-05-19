'use client';

import {
	useState,
	useMemo,
} from 'react';
import {
	trpc,
} from '@/lib/trpc';
import {
	Users,
	Trash2,
	Plus,
	Loader2,
	Star,
	X,
	Pencil,
	MapPin,
	Search,
	Check,
} from 'lucide-react';
import clsx from 'clsx';
import {
 useDebounce,
} from '@/hooks/use-debounce';
import {
 showErrorToast,
} from '@/components/shared/error-toast';
import {
	Skeleton,
} from '@/components/shared/skeleton';
import {
	ScrollableFilterRow,
} from '@/components/shared/scrollable-filter-row';
import Link from 'next/link';
import {
	confirmDelete,
} from '@/components/shared/delete-confirm-toast';
import {
	AdminPageHeader,
} from '@/components/shared/ui/admin-ui';
import {
	Tooltip,
} from '@/components/shared/ui/tooltip';
import {
 AdminSearch,
} from '@/components/shared/admin-search';

const CATEGORIES = [
	{
 id: 'MOBILE',
label: 'Mobilfunk',
},
	{
 id: 'FIBER',
label: 'Glasfaser',
},
	{
 id: 'DSL',
label: 'Festnetz',
},
	{
 id: 'MAGENTA_TV_OTT',
label: 'MagentaTV',
},
	{
 id: 'DEVICE',
label: 'Gerät',
},
	{
 id: 'ADDON',
label: 'Option',
},
];

const BUSINESS_CASES = [
	{
 id: 'NEW_ACTIVATION',
label: 'Neubereitstellung',
},
	{
 id: 'MOVE',
label: 'Umzug',
},
	{
 id: 'PLAN_CHANGE',
label: 'Tarifwechsel',
},
	{
 id: 'SPEED_UP',
label: 'SpeedUp',
},
];

export default function TeamsPage() {
	const utils = trpc.useUtils();
	const [
 selectedLocationId,
setSelectedLocationId,
] = useState<string>('all');
	const [
 teamSearchQuery,
setTeamSearchQuery,
] = useState('');
	const [
		searchedTeams,
		setSearchedTeams,
	] = useState<any[]>([
]);
	const [
 searchQuery,
setSearchQuery,
] = useState('');
	const [
 managingFocusTeamId,
setManagingFocusTeamId,
] = useState<string | null>(null);
	const [
 activeTab,
setActiveTab,
] = useState<'products' | 'categories' | 'businessCases'>('products');
	const [
 showSelectedOnly,
setShowSelectedOnly,
] = useState(false);

	const debouncedProductSearch = useDebounce(searchQuery, 300);

	const {
 data: me,
} = trpc.auth.me.useQuery();
	const isRestrictedUser = me?.role === 'LOCATION_MANAGER' || me?.role === 'TEAM_LEADER';

	const {
 data: locations, isLoading: isLocationsLoading,
} = trpc.location.list.useQuery();

	const {
		data: teamsData,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = trpc.team.list.useInfiniteQuery(
		{
			limit: 250,
		},
		{
 getNextPageParam: (lastPage) => lastPage.nextCursor,
},
	);

	const {
		data: productsData,
	} = trpc.product.getAllProducts.useInfiniteQuery(
		{
			limit: 40,
			search: debouncedProductSearch || undefined,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			enabled: managingFocusTeamId !== null && activeTab === 'products',
		},
	);

	const deleteTeam = trpc.team.delete.useMutation({
		onSuccess: () => utils.team.list.invalidate(),
		onError: (error) => showErrorToast('Fehler beim Löschen', error.message),
	});

	const toggleFocus = trpc.team.toggleFocus.useMutation({
		onSuccess: () => utils.team.list.invalidate(),
		onError: (error) => showErrorToast('Fehler beim Speichern', error.message),
	});

	const teams = teamsData?.pages.flatMap((page) => page.items) || [
];
	const filteredTeams = useMemo(() => {
		if (selectedLocationId === 'all') {
			return searchedTeams;
		}
		return searchedTeams.filter((t: any) => t.locationId === selectedLocationId);
	}, [
		searchedTeams,
		selectedLocationId,
	]);
	const products = productsData?.pages.flatMap((page) => page.items) || [
];
	const currentTeam = teams.find((t) => t.id === managingFocusTeamId);
	const activeHighlights = currentTeam?.highlights || [
];

	const filteredProducts = showSelectedOnly
		? products.filter((p) => activeHighlights.some((h: any) => h.productId === p.id))
		: products;

	const filteredCategories = showSelectedOnly
		? CATEGORIES.filter((c) => activeHighlights.some((h: any) => h.category === c.id))
		: CATEGORIES;

	const filteredBusinessCases = showSelectedOnly
		? BUSINESS_CASES.filter((bc: any) => activeHighlights.some((h: any) => h.businessCase === bc.id))
		: BUSINESS_CASES;

	return (
		<div className="space-y-6 pb-20">
			<div className="flex justify-between items-center">
				<AdminPageHeader
					title="Teams"
					subtitle="Verwalte Teams und delegiere Fokus-Produkte."
					backHref="/admin"
				/>
				<Link
					href="/admin/teams/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Team erstellen
				</Link>
			</div>

			{/* List Controls */}
			<div className="flex flex-col gap-4">
				<AdminSearch
					items={teams}
					onResultsChange={setSearchedTeams}
					getSearchableText={(t: any) => [
						t.name || '',
						t.location?.name || '',
						t.location?.address || '',
						t.location?.odRegion?.name || '',
					]}
					value={teamSearchQuery}
					onChange={setTeamSearchQuery}
					placeholder="Team suchen nach Name, Standort, Adresse..."
				/>

				{!isRestrictedUser && (
					<ScrollableFilterRow>
						<button
							onClick={() => setSelectedLocationId('all')}
							className={clsx(
								'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all duration-200 cursor-pointer outline-none font-semibold text-[0.8rem] active:scale-95',
								selectedLocationId === 'all'
									? 'text-white shadow-md'
									: 'bg-linear-to-br from-white to-[#fcfafc] border-[#eaedf0] text-[#666] hover:bg-[#f7f8fa] hover:border-[#ddd]',
							)}
							style={{
								backgroundColor: selectedLocationId === 'all' ? '#1a1a2e' : undefined,
								borderColor: selectedLocationId === 'all' ? '#1a1a2e' : undefined,
							}}
						>
							<MapPin className={clsx('w-4 h-4', selectedLocationId === 'all' ? 'opacity-100' : 'opacity-60')} />
							<span>Alle Standorte</span>
						</button>

						{isLocationsLoading ? (
							<div className="flex gap-2">
								{[
 1,
2,
3,
].map((i) => (
									<Skeleton key={i} className="h-[38px] w-28 rounded-xl" />
								))}
							</div>
						) : (
							locations?.items?.map((loc: any) => {
								const isSelected = selectedLocationId === loc.id;
								return (
									<button
										key={loc.id}
										onClick={() => setSelectedLocationId(loc.id)}
										className={clsx(
											'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all duration-200 cursor-pointer outline-none font-semibold text-[0.8rem] active:scale-95',
											isSelected
												? 'text-white shadow-md'
												: 'bg-linear-to-br from-white to-[#fcfafc] border-[#eaedf0] text-[#666] hover:bg-[#f7f8fa] hover:border-[#ddd]',
										)}
										style={{
											backgroundColor: isSelected ? '#e20074' : undefined,
											borderColor: isSelected ? '#e20074' : undefined,
										}}
									>
										<MapPin className={clsx('w-4 h-4', isSelected ? 'opacity-100' : 'opacity-60')} />
										<span>{loc.name}</span>
									</button>
								);
							})
						)}
					</ScrollableFilterRow>
				)}
			</div>

			{/* Teams Table */}
			<div className="bg-white rounded-3xl border border-[#eaedf0] overflow-hidden shadow-sm">
				{isLoading && filteredTeams.length === 0 ? (
					<div className="p-5 space-y-3">
						{[
 1,
2,
3,
4,
5,
].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
					</div>
				) : filteredTeams.length === 0 ? (
					<div className="p-20 text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#eaedf0]">
							<Users className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="font-bold text-[#1a1a2e] mb-1">Keine Teams gefunden</h3>
						<p className="text-[0.85rem] text-[#999] mb-6">Versuche es mit einem anderen Suchbegriff oder Standort.</p>
						<button onClick={() => { setTeamSearchQuery(''); setSelectedLocationId('all'); }} className="px-6 py-2 bg-[#f7f8fa] text-[#1a1a2e] rounded-xl font-bold border border-[#eaedf0] hover:bg-[#f0f2f5] transition-all">
							Filter zurücksetzen
						</button>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead>
								<tr className="border-b border-[#eaedf0] bg-[#fcfcfd]">
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">Team</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">Standort</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right">Aktionen</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#f0f0f0]">
								{filteredTeams.map((team) => (
									<tr key={team.id} className="hover:bg-[#fcfcfd]/50 transition-colors group">
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<span className="font-bold text-[#1a1a2e]">{team.name}</span>
												{team.highlights && team.highlights.length > 0 && (
													<span className="px-2 py-0.5 rounded-lg bg-[#ff6b00]/5 border border-[#ff6b00]/10 text-[#ff6b00] text-[0.65rem] font-bold flex items-center gap-1">
														<Star className="w-3 h-3 fill-[#ff6b00]" /> {team.highlights.length} Fokus
													</span>
												)}
											</div>
										</td>
										<td className="px-6 py-4">
											{team.location ? (
												<div className="flex items-center gap-1.5 text-[0.85rem] text-[#666]">
													<MapPin className="w-3.5 h-3.5" />
													{team.location.address ? (
														<Tooltip content={team.location.address}>
															<span className="border-b border-dashed border-[#eaedf0] cursor-help">{team.location.name}</span>
														</Tooltip>
													) : team.location.name}
												</div>
											) : <span className="text-[#bbb] italic text-[0.8rem]">Kein Standort</span>}
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
												<Link href={`/admin/teams/${team.id}`} className="p-2 text-[#ccc] hover:text-[#0090d0] hover:bg-[#0090d0]/10 rounded-lg transition-all"><Pencil className="w-4 h-4" /></Link>
												<button onClick={() => setManagingFocusTeamId(team.id)} className="p-2 text-[#ccc] hover:text-[#ff6b00] hover:bg-[#ff6b00]/10 rounded-lg transition-all border-none bg-transparent cursor-pointer"><Star className="w-4 h-4" /></button>
												<button onClick={() => confirmDelete({
 id: team.id,
name: team.name,
onConfirm: (sudoPassword) => deleteTeam.mutateAsync({
 id: team.id,
 sudoPassword,
}),
})} className="p-2 text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2] rounded-lg transition-all border-none bg-transparent cursor-pointer"><Trash2 className="w-4 h-4" /></button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{hasNextPage && (
					<div className="p-8 border-t border-[#f0f0f0] flex justify-center bg-[#fcfcfd]">
						<button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="flex items-center gap-2 bg-white hover:bg-[#f7f8fa] text-[#1a1a2e] px-8 py-3 rounded-2xl font-bold transition-all border border-[#eaedf0] shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50">
							{isFetchingNextPage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
							{isFetchingNextPage ? 'Wird geladen...' : 'Mehr laden'}
						</button>
					</div>
				)}
			</div>

			{/* FOCUS MANAGEMENT MODAL */}
			{managingFocusTeamId && (
				<div className="fixed inset-0 bg-[#1a1a2e]/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
					<div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

						{/* Header */}
						<div className="px-8 py-6 border-b border-[#f0f2f5] flex justify-between items-center bg-white shrink-0">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-2xl bg-[#ff6b00] flex items-center justify-center text-white shadow-[0_8px_16px_rgba(255,107,0,0.2)]">
									<Star className="w-6 h-6 fill-current" />
								</div>
								<div>
									<h3 className="font-bold text-[1.4rem] text-[#1a1a2e] m-0 tracking-tight">
										Fokus verwalten <span className="text-[#ff6b00] mx-1">•</span> {currentTeam?.name}
									</h3>
									<p className="text-[0.85rem] text-[#94a3b8] m-0 font-medium">Änderungen werden sofort gespeichert.</p>
								</div>
							</div>
							<button onClick={() => setManagingFocusTeamId(null)} className="p-3 bg-[#f1f5f9] text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] transition-all rounded-full border-none cursor-pointer">
								<X className="w-6 h-6" />
							</button>
						</div>

						{/* Modal Body: Grid Top, Summary Bottom */}
						<div className="flex-1 flex flex-col min-h-0">

							{/* Content Area (Top) */}
							<div className="flex-1 flex flex-col min-h-0 bg-white">
								{/* Integrated Controls */}
								<div className="px-8 py-5 border-b border-[#f0f2f5] space-y-5">
									<div className="flex flex-wrap items-center justify-between gap-4">
										<div className="flex bg-[#f1f5f9] p-1.5 rounded-2xl">
											{[
												{
 id: 'products',
label: 'Tarife',
},
												{
 id: 'categories',
label: 'Kategorien',
},
												{
 id: 'businessCases',
label: 'Vertragsarten',
},
											].map((tab) => (
												<button
													key={tab.id}
													onClick={() => setActiveTab(tab.id as any)}
													className={clsx(
														'px-8 py-2.5 rounded-xl text-[0.85rem] font-bold transition-all duration-200 cursor-pointer border-none',
														activeTab === tab.id ? 'bg-white text-[#1a1a2e] shadow-md' : 'bg-transparent text-[#64748b] hover:text-[#1e293b]',
													)}
												>
													{tab.label}
												</button>
											))}
										</div>

										<button
											onClick={() => setShowSelectedOnly(!showSelectedOnly)}
											className={clsx(
												'flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[0.85rem] font-bold transition-all cursor-pointer border-2',
												showSelectedOnly ? 'bg-[#ff6b00] border-[#ff6b00] text-white shadow-lg shadow-[#ff6b00]/20' : 'bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1]',
											)}
										>
											<Star className={clsx('w-4.5 h-4.5', showSelectedOnly && 'fill-current')} />
											Nur Auswahl
										</button>
									</div>

									<div className="relative">
										<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94a3b8]" />
										<input
											type="text"
											placeholder="Suchen..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="w-full pl-12 pr-12 py-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl focus:outline-none focus:border-[#e20074]/30 focus:bg-white transition-all text-[0.9rem]"
										/>
										{searchQuery && (
											<button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#1a1a2e] bg-transparent border-none cursor-pointer">
												<X className="w-4 h-4" />
											</button>
										)}
									</div>
								</div>

								{/* Items Grid */}
								<div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{activeTab === 'products' && filteredProducts.map((p) => {
											const isFocused = activeHighlights.some((h: any) => h.productId === p.id);
											return (
												<button
													key={p.id}
													disabled={toggleFocus.isPending}
													onClick={() => toggleFocus.mutate({
 teamId: managingFocusTeamId!,
productId: p.id,
})}
													className={clsx(
														'p-5 rounded-3xl border-2 text-left transition-all flex items-center gap-4 cursor-pointer bg-white',
														isFocused ? 'border-[#e20074] bg-[#fff0f7] shadow-sm' : 'border-[#f1f5f9] hover:border-[#e2e8f0]',
													)}
												>
													<div className={clsx('w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all', isFocused ? 'bg-[#e20074] border-[#e20074] text-white' : 'bg-[#f8fafc] border-[#e2e8f0] text-[#cbd5e1]')}>
														{isFocused ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
													</div>
													<div className="min-w-0 flex-1">
														<div className="text-[0.9rem] font-bold text-[#1a1a2e] truncate">{p.name}</div>
														<div className="text-[0.65rem] text-[#94a3b8] font-bold uppercase tracking-wider">{CATEGORIES.find(c => c.id === p.category)?.label}</div>
													</div>
												</button>
											);
										})}

										{activeTab === 'categories' && filteredCategories.map((cat) => {
											const isFocused = activeHighlights.some((h: any) => h.category === cat.id);
											return (
												<button
													key={cat.id}
													disabled={toggleFocus.isPending}
													onClick={() => toggleFocus.mutate({
 teamId: managingFocusTeamId!,
category: cat.id as any,
})}
													className={clsx(
														'p-5 rounded-3xl border-2 text-left transition-all flex items-center gap-4 cursor-pointer bg-white',
														isFocused ? 'border-[#e20074] bg-[#fff0f7]' : 'border-[#f1f5f9] hover:border-[#e2e8f0]',
													)}
												>
													<div className={clsx('w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all', isFocused ? 'bg-[#e20074] border-[#e20074] text-white' : 'bg-[#f8fafc] border-[#e2e8f0] text-[#cbd5e1]')}>
														{isFocused ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
													</div>
													<div className="flex-1">
														<div className="text-[0.9rem] font-bold text-[#1a1a2e]">{cat.label}</div>
														<div className="text-[0.65rem] text-[#94a3b8] font-bold uppercase tracking-wider">Kategorie</div>
													</div>
												</button>
											);
										})}

										{activeTab === 'businessCases' && filteredBusinessCases.map((bc: any) => {
											const isFocused = activeHighlights.some((h: any) => h.businessCase === bc.id);
											return (
												<button
													key={bc.id}
													disabled={toggleFocus.isPending}
													onClick={() => toggleFocus.mutate({
 teamId: managingFocusTeamId!,
businessCase: bc.id as any,
})}
													className={clsx(
														'p-5 rounded-3xl border-2 text-left transition-all flex items-center gap-4 cursor-pointer bg-white',
														isFocused ? 'border-[#e20074] bg-[#fff0f7]' : 'border-[#f1f5f9] hover:border-[#e2e8f0]',
													)}
												>
													<div className={clsx('w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all', isFocused ? 'bg-[#e20074] border-[#e20074] text-white' : 'bg-[#f8fafc] border-[#e2e8f0] text-[#cbd5e1]')}>
														{isFocused ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
													</div>
													<div className="flex-1">
														<div className="text-[0.9rem] font-bold text-[#1a1a2e]">{bc.label}</div>
														<div className="text-[0.65rem] text-[#94a3b8] font-bold uppercase tracking-wider">Vertragsart</div>
													</div>
												</button>
											);
										})}
									</div>
								</div>
							</div>

							{/* SELECTION SUMMARY (BOTTOM) */}
							<div className="h-[240px] border-t border-[#f0f2f5] bg-[#f8fafc] flex flex-col shrink-0">
								<div className="px-8 py-4 bg-white/50 border-b border-[#f0f2f5] flex justify-between items-center">
									<h4 className="font-bold text-[0.9rem] text-[#1a1a2e] m-0 flex items-center gap-3">
										Aktuelle Auswahl
										<span className="bg-[#1a1a2e] text-white text-[0.7rem] px-2 py-0.5 rounded-lg font-bold">
											{activeHighlights.length}
										</span>
									</h4>
								</div>

								<div className="flex-1 overflow-x-auto p-6 flex items-start gap-4 custom-scrollbar">
									{activeHighlights.length === 0 ? (
										<div className="w-full flex flex-col items-center justify-center text-[#94a3b8] opacity-50 py-10">
											<Plus className="w-8 h-8 mb-2" />
											<p className="text-[0.8rem] font-bold">Noch nichts ausgewählt</p>
										</div>
									) : (
										activeHighlights.map((h: any) => (
											<div key={h.id} className="min-w-[200px] max-w-[240px] p-4 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center justify-between group animate-in fade-in slide-in-from-bottom-2 duration-300">
												<div className="min-w-0 pr-3">
													<div className="text-[0.8rem] font-bold text-[#1a1a2e] truncate">
														{h.productId ? (h.product?.name || 'Tarif') :
														 h.category ? (CATEGORIES.find(c => c.id === h.category)?.label || h.category) :
														 (BUSINESS_CASES.find(bc => bc.id === h.businessCase)?.label || h.businessCase)}
													</div>
													<div className="text-[0.6rem] text-[#94a3b8] font-bold uppercase tracking-wider mt-0.5">
														{h.productId ? 'Tarif' : h.category ? 'Kategorie' : 'Vertragsart'}
													</div>
												</div>
												<button
													onClick={() => toggleFocus.mutate({
 teamId: managingFocusTeamId!,
productId: h.productId,
category: h.category,
businessCase: h.businessCase,
})}
													className="p-1.5 text-[#cbd5e1] hover:text-[#dc2626] hover:bg-[#fff1f2] rounded-lg transition-all border-none bg-transparent cursor-pointer"
												>
													<Trash2 className="w-3.5 h-3.5" />
												</button>
											</div>
										))
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
