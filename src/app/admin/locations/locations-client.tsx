'use client';

import {
	trpc,
} from '@/lib/trpc';
import {
	MapPin, Trash2, Plus, Loader2, Pencil, CheckCircle, XCircle,
} from 'lucide-react';
import clsx from 'clsx';
import {
	showErrorToast,
} from '@/components/shared/error-toast';
import {
 AdminSearch,
} from '@/components/shared/admin-search';
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
	Tooltip,
} from '@/components/shared/ui/tooltip';
import { AdminEmptyState } from '@/components/features/admin/admin-empty-state';
import { AdminLoadMore } from '@/components/features/admin/admin-load-more';

export default function LocationsClient() {
	const utils = trpc.useUtils();
	const [
		searchQuery,
		setSearchQuery,
	] = useState('');
	const [
		activeFilterId,
		setActiveFilterId,
	] = useState<string>('ALL');
	const [
		searchedLocations,
		setSearchedLocations,
	] = useState<any[]>([
]);

	const {
		data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage,
	} =
		trpc.location.list.useInfiniteQuery(
			{
				limit: 250, // Fetch everything for seamless client-side search
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	const deleteMutation = trpc.location.delete.useMutation({
		onSuccess: () => {
			utils.location.list.invalidate();
		},
		onError: (error) => showErrorToast('Fehler beim Löschen', error.message),
	});

	const locations = data?.pages.flatMap((page) => page.items) || [
	];

	const filteredLocations = useMemo(() => {
		if (activeFilterId === 'ALL') { return searchedLocations; }
		return searchedLocations.filter((loc: any) => {
			if (activeFilterId === 'ACTIVE') { return loc.isActive; }
			if (activeFilterId === 'INACTIVE') { return !loc.isActive; }
			return true;
		});
	}, [
		searchedLocations,
		activeFilterId,
	]);

	return (
		<div className="space-y-6 pb-20">
			<div className="flex justify-between items-center">
				<AdminPageHeader
					title="Standorte"
					subtitle="Verwalte die Verkaufsstandorte."
					backHref="/admin"
				/>
				<Link
					href="/admin/locations/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Standort erstellen
				</Link>
			</div>

			<div className="flex flex-col gap-4">
				<AdminSearch
					items={locations}
					onResultsChange={setSearchedLocations}
					getSearchableText={(loc: any) => [
						loc.name,
						loc.address || '',
						loc.odRegion?.name || '',
					]}
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Standort suchen nach Name, Adresse, OD-Bereich..."
				/>

				{/* Filter Bubbles */}
				<ScrollableFilterRow>
					{[
						{
 id: 'ALL',
label: 'Alle Standorte',
icon: MapPin,
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
				{isLoading && locations.length === 0 ? (
					<div className="flex flex-col gap-3 p-5">
						{[
							1,
							2,
							3,
						].map((i) => (
							<Skeleton key={i} className="h-14 w-full rounded-xl" />
						))}
					</div>
				) : filteredLocations.length === 0 ? (
					<AdminEmptyState
						icon={MapPin}
						title="Keine Standorte"
						description="Es wurden keine Standorte"
						searchQuery={searchQuery}
						activeFilterId={activeFilterId}
						onResetFilters={() => { setSearchQuery(''); setActiveFilterId('ALL'); }}
						newLinkHref="/admin/locations/new"
						newLinkLabel="Neuer Standort"
					/>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead>
								<tr className="border-b border-[#eaedf0] bg-[#fcfcfd]">
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Name
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										OD-Bereich
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
								{filteredLocations.map(
									(loc: {
										id: string;
										name: string;
										address: string | null;
										isActive: boolean;
										odRegion: { name: string } | null;
									}) => (
										<tr
											key={loc.id}
											className="hover:bg-[#fcfcfd] transition-colors group"
										>
											<td className="px-6 py-4">
												<div className="flex flex-col">
													{loc.address ? (
														<Tooltip content={loc.address}>
															<span className="text-[0.95rem] font-bold text-[#1a1a2e] border-b border-dashed border-[#eaedf0] cursor-help">
																{loc.name}
															</span>
														</Tooltip>
													) : (
														<span className="text-[0.95rem] font-bold text-[#1a1a2e]">
															{loc.name}
														</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												<span className="text-[0.85rem] text-[#666]">
													{loc.odRegion?.name || 'Kein Bereich'}
												</span>
											</td>
											<td className="px-6 py-4 text-center">
												<span
													className={clsx(
														'inline-flex items-center px-2.5 py-1 rounded-lg text-[0.68rem] font-bold border',
														loc.isActive
															? 'bg-[#e20074]/5 text-[#e20074] border-[#e20074]/10'
															: 'bg-[#f7f8fa] text-[#bbb] border-[#eaedf0]',
													)}
												>
													{loc.isActive ? 'Aktiv' : 'Inaktiv'}
												</span>
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
													<Link
														href={`/admin/locations/${loc.id}`}
														className="p-2 text-[#ccc] hover:text-[#e20074] hover:bg-[#e20074]/10 rounded-lg transition-all"
													>
														<Pencil className="w-4 h-4" />
													</Link>
													<button
														onClick={() =>
															confirmDelete({
																id: loc.id,
																name: loc.name,
																onConfirm: (sudoPassword) =>
																	deleteMutation.mutateAsync({
																		id: loc.id,
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

				<AdminLoadMore
					hasNextPage={hasNextPage}
					isFetchingNextPage={isFetchingNextPage}
					fetchNextPage={fetchNextPage}
				/>
			</div>
		</div>
	);
}
