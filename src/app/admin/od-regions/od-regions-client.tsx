'use client';

import {
	trpc,
} from '@/lib/trpc';
import {
	Globe, Trash2, Plus, Loader2, Pencil, CheckCircle, XCircle,
} from 'lucide-react';
import clsx from 'clsx';
import {
	showErrorToast,
} from '@/components/shared/error-toast';
import {
	Skeleton,
} from '@/components/shared/skeleton';
import {
	ScrollableFilterRow,
} from '@/components/shared/scrollable-filter-row';
import {
	confirmDelete,
} from '@/components/shared/delete-confirm-toast';
import Link from 'next/link';
import {
	useState, useMemo,
} from 'react';
import {
	AdminPageHeader,
} from '@/components/shared/ui/admin-ui';
import {
 AdminSearch,
} from '@/components/shared/admin-search';

export default function OdRegionsClient() {
	const utils = trpc.useUtils();
	const [
		searchQuery,
		setSearchQuery,
	] = useState('');
	const [
		searchedRegions,
		setSearchedRegions,
	] = useState<any[]>([
]);
	const [
		activeFilterId,
		setActiveFilterId,
	] = useState<string>('ALL');

	const {
		data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage,
	} =
		trpc.odRegion.list.useInfiniteQuery(
			{
				limit: 250, // Fetch all regions for seamless client-side search
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	const deleteMutation = trpc.odRegion.delete.useMutation({
		onSuccess: () => {
			utils.odRegion.list.invalidate();
		},
		onError: (error) => showErrorToast('Fehler beim Löschen', error.message),
	});

	const regions = useMemo(() => {
		return data?.pages.flatMap((page) => page.items) || [
];
	}, [
 data,
]);

	const filteredRegions = useMemo(() => {
		if (activeFilterId === 'ALL') { return searchedRegions; }
		return searchedRegions.filter((region: any) => {
			if (activeFilterId === 'ACTIVE') { return region.isActive; }
			if (activeFilterId === 'INACTIVE') { return !region.isActive; }
			return true;
		});
	}, [
		searchedRegions,
		activeFilterId,
	]);

	return (
		<div className="space-y-6 pb-20">
			<div className="flex justify-between items-center">
				<AdminPageHeader
					title="OD-Bereiche"
					subtitle="Verwalte die organisatorischen Divisionen."
					backHref="/admin"
				/>
				<Link
					href="/admin/od-regions/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Bereich erstellen
				</Link>
			</div>

			<div className="flex flex-col gap-4">
				<AdminSearch
					items={regions}
					onResultsChange={setSearchedRegions}
					getSearchableText={(region: any) => [
						region.name || '',
					]}
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="OD-Bereich suchen nach Name..."
				/>

				{/* Filter Bubbles */}
				<ScrollableFilterRow>
					{[
						{
 id: 'ALL',
label: 'Alle Bereiche',
icon: Globe,
color: '#1a1a2e',
},
						{
 id: 'ACTIVE',
label: 'Aktiv',
icon: CheckCircle,
color: '#00a878',
},
						{
 id: 'INACTIVE',
label: 'Inaktiv',
icon: XCircle,
color: '#94a3b8',
},
					].map((filter) => {
						const isSelected = activeFilterId === filter.id;
						const Icon = filter.icon;
						return (
							<button
								key={filter.id}
								onClick={() => setActiveFilterId(filter.id)}
								className={clsx(
									'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all duration-200 cursor-pointer outline-none font-semibold text-[0.8rem] active:scale-95',
									isSelected
										? 'text-white shadow-md'
										: 'bg-linear-to-br from-white to-[#fcfafc] border-[#eaedf0] text-[#666] hover:bg-[#f7f8fa] hover:border-[#ddd]',
								)}
								style={{
									backgroundColor: isSelected ? filter.color : undefined,
									borderColor: isSelected ? filter.color : undefined,
								}}
							>
								<Icon className={clsx('w-4 h-4', isSelected ? 'opacity-100' : 'opacity-60')} />
								<span>{filter.label}</span>
							</button>
						);
					})}
				</ScrollableFilterRow>
			</div>

			<div className="bg-white rounded-3xl border border-[#eaedf0] overflow-hidden shadow-sm">
				{isLoading && regions.length === 0 ? (
					<div className="flex flex-col gap-3 p-5">
						{[
							1,
							2,
							3,
						].map((i) => (
							<Skeleton key={i} className="h-14 w-full rounded-xl" />
						))}
					</div>
				) : filteredRegions.length === 0 ? (
					<div className="p-20 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Globe className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1.1rem] font-bold text-[#1a1a2e] mb-1">
							Keine OD-Bereiche
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0 mb-4">
							Es wurden keine OD-Bereiche {searchQuery || activeFilterId !== 'ALL' ? 'für deine Suche/Filter' : ''} gefunden.
						</p>
						<div className="flex gap-3 mt-2">
							{(searchQuery || activeFilterId !== 'ALL') && (
								<button
									onClick={() => { setSearchQuery(''); setActiveFilterId('ALL'); }}
									className="text-[#1a1a2e] text-[0.85rem] font-semibold bg-white border border-[#eaedf0] px-4 py-2 rounded-xl hover:bg-[#f7f8fa] transition-colors cursor-pointer"
								>
									Filter zurücksetzen
								</button>
							)}
							<Link
								href="/admin/od-regions/new"
								className="text-white text-[0.85rem] font-semibold bg-[#e20074] border-none px-4 py-2 rounded-xl hover:bg-[#c70066] transition-colors cursor-pointer no-underline flex items-center gap-2"
							>
								<Plus className="w-4 h-4" /> Neuer Bereich
							</Link>
						</div>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead>
								<tr className="border-b border-[#eaedf0] bg-[#fcfcfd]">
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Name
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-center">
										Status
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right">
										Aktionen
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#f0f0f0]">
								{filteredRegions.map(
									(region: {
										id: string;
										name: string;
										isActive: boolean;
										locations?: { id: string }[];
									}) => (
										<tr
											key={region.id}
											className="hover:bg-[#fcfcfd] transition-colors group"
										>
											<td className="px-6 py-4">
												<div className="flex flex-col">
													<span className="text-[0.95rem] font-bold text-[#1a1a2e]">
														{region.name}
													</span>
													<span className="text-[0.72rem] text-[#999]">
														{region.locations?.length || 0} Standorte
													</span>
												</div>
											</td>
											<td className="px-6 py-4 text-center">
												<span
													className={clsx(
														'inline-flex items-center px-2.5 py-1 rounded-lg text-[0.68rem] font-bold border',
														region.isActive
															? 'bg-[#e20074]/5 text-[#e20074] border-[#e20074]/10'
															: 'bg-[#f7f8fa] text-[#bbb] border-[#eaedf0]',
													)}
												>
													{region.isActive ? 'Aktiv' : 'Inaktiv'}
												</span>
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
													<Link
														href={`/admin/od-regions/${region.id}`}
														className="p-2 text-[#ccc] hover:text-[#e20074] hover:bg-[#e20074]/10 rounded-lg transition-all"
													>
														<Pencil className="w-4 h-4" />
													</Link>
													<button
														onClick={() =>
															confirmDelete({
																id: region.id,
																name: region.name,
																onConfirm: (sudoPassword) =>
																	deleteMutation.mutateAsync({
																		id: region.id,
																		sudoPassword,
																	}),
															})
														}
														className="p-2 text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2] rounded-lg transition-all cursor-pointer border-none bg-transparent"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</td>
										</tr>
									),
								)}
							</tbody>
						</table>
					</div>
				)}

				{hasNextPage && (
					<div className="p-8 border-t border-[#f0f0f0] flex justify-center bg-[#fcfcfd]">
						<button
							onClick={() => fetchNextPage()}
							disabled={isFetchingNextPage}
							className="flex items-center gap-2 bg-white hover:bg-[#f7f8fa] text-[#1a1a2e] px-8 py-3 rounded-2xl font-bold transition-all border border-[#eaedf0] shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-[0.85rem]"
						>
							{isFetchingNextPage ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : (
								<Plus className="w-5 h-5" />
							)}
							{isFetchingNextPage ? 'Wird geladen...' : 'Mehr laden'}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
