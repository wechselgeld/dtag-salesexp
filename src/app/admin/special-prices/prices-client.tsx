'use client';

import {
	trpc,
} from '@/lib/trpc';
import {
	Plus, Edit, Trash2, Tag, MessageSquare, Loader2, Tv, Smartphone, ArrowUpCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
	useState, useMemo,
} from 'react';
import {
	Skeleton,
} from '@/components/shared/skeleton';
import {
	ScrollableFilterRow,
} from '@/components/shared/scrollable-filter-row';
import {
	confirmDelete,
} from '@/components/shared/delete-confirm-toast';
import {
	AdminPageHeader,
} from '@/components/shared/ui/admin-ui';
import clsx from 'clsx';

import {
 AdminSearch,
} from '@/components/shared/admin-search';

export default function AdminSpecialPricesPage() {
	const [
		searchQuery,
		setSearchQuery,
	] = useState('');
	const [
		searchedPrices,
		setSearchedPrices,
	] = useState<any[]>([
]);
	const [
		activeFilterId,
		setActiveFilterId,
	] = useState<string>('ALL');
	const utils = trpc.useUtils();

	const {
		data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage,
	} =
		trpc.admin.getAllSpecialPrices.useInfiniteQuery(
			{
				limit: 250, // Fetch all special prices for seamless client-side search
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	const deleteMutation = trpc.admin.deleteSpecialPrice.useMutation({
		onSuccess: () => {
			utils.admin.getAllSpecialPrices.invalidate();
		},
	});

	const specialPrices = useMemo(() => {
		return data?.pages.flatMap((page) => page.items) || [
];
	}, [
 data,
]);

	const filteredPrices = useMemo(() => {
		if (activeFilterId === 'ALL') { return searchedPrices; }
		return searchedPrices.filter((sp: any) => {
			if (activeFilterId === 'MAGENTA_TV_REQUIRED') {
				return [
					'REQUIRED',
					'ONLY_SMART',
					'ONLY_SMARTSTREAM',
					'ONLY_MEGASTREAM',
				].includes(sp.magentaTVRequirement);
			}
			if (activeFilterId === 'MAGENTA_TV_NOT_ALLOWED') { return sp.magentaTVRequirement === 'NOT_ALLOWED'; }
			if (activeFilterId === 'HIGH_PRIO') { return sp.priority >= 5; }
			return true;
		});
	}, [
		searchedPrices,
		activeFilterId,
	]);

	return (
		<div className="space-y-6 pb-20">
			<div className="flex justify-between items-center">
				<AdminPageHeader
					title="Aktionspreise"
					subtitle="Verwalte hier Sonderpreise und Kampagnen."
					backHref="/admin"
				/>
				<Link
					href="/admin/special-prices/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Neue Aktion
				</Link>
			</div>

			<div className="flex flex-col gap-4">
				<AdminSearch
					items={specialPrices}
					onResultsChange={setSearchedPrices}
					getSearchableText={(sp: any) => [
						sp.name || '',
						sp.internalNote || '',
						...(sp.products?.map((p: any) => p.name) || [
]),
					]}
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Aktionsname, interne Notiz oder Produkt suchen..."
				/>

				{/* Filter Bubbles */}
				<ScrollableFilterRow>
					{[
						{
 id: 'ALL',
label: 'Alle Aktionen',
icon: Tag,
color: '#1a1a2e',
},
						{
 id: 'MAGENTA_TV_REQUIRED',
label: 'MagentaTV erforderlich',
icon: Tv,
color: '#e20074',
},
						{
 id: 'MAGENTA_TV_NOT_ALLOWED',
label: 'Nur ohne MagentaTV',
icon: Smartphone,
color: '#7b61ff',
},
						{
 id: 'HIGH_PRIO',
label: 'Hohe Priorität (Prio ≥ 5)',
icon: ArrowUpCircle,
color: '#ff6b00',
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
				{isLoading && specialPrices.length === 0 ? (
					<div className="flex flex-col gap-3 p-5">
						{[
							1,
							2,
							3,
							4,
							5,
						].map((i) => (
							<Skeleton key={i} className="h-14 w-full rounded-xl" />
						))}
					</div>
				) : filteredPrices.length === 0 ? (
					<div className="p-20 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Tag className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1.1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Aktionen gefunden
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0 mb-4">
							Es wurden keine Aktionspreise {searchQuery || activeFilterId !== 'ALL' ? 'für deine Suche/Filter' : ''} gefunden.
						</p>
						{(searchQuery || activeFilterId !== 'ALL') && (
							<button
								onClick={() => { setSearchQuery(''); setActiveFilterId('ALL'); }}
								className="text-[#1a1a2e] text-[0.85rem] font-semibold bg-white border border-[#eaedf0] px-4 py-2 rounded-xl hover:bg-[#f7f8fa] transition-colors cursor-pointer"
							>
								Filter zurücksetzen
							</button>
						)}
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead>
								<tr className="border-b border-[#eaedf0] bg-[#fcfcfd]">
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Aktion
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Verknüpfte Produkte
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Staffelung
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right">
										Aktionen
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#f0f0f0]">
								{filteredPrices.map((sp: any) => (
									<tr
										key={sp.id}
										className="hover:bg-[#fcfcfd] transition-colors group"
									>
										<td className="px-6 py-4">
											<div className="flex flex-col">
												<span className="text-[0.95rem] font-bold text-[#1a1a2e] flex items-center gap-2">
													{sp.name}
													{sp.internalNote && (
														<span
															title={sp.internalNote}
															className="cursor-help"
														>
															<MessageSquare className="w-3.5 h-3.5 text-[#bbb] hover:text-[#e20074] transition-colors" />
														</span>
													)}
												</span>
												<div className="flex items-center gap-2 mt-1">
													<div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#f7f8fa] border border-[#eaedf0] text-[0.65rem] font-bold text-[#666]">
														<Tag className="w-3" />
														Prio: {sp.priority}
													</div>
													{sp.magentaTVRequirement === 'REQUIRED' && (
														<div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#e20074]/5 border border-[#e20074]/10 text-[0.65rem] font-bold text-[#e20074]">
															MagentaTV erforderlich
														</div>
													)}
													{sp.magentaTVRequirement === 'ONLY_SMART' && (
														<div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#e20074]/5 border border-[#e20074]/10 text-[0.65rem] font-bold text-[#e20074]">
															Nur Smart
														</div>
													)}
													{sp.magentaTVRequirement === 'ONLY_SMARTSTREAM' && (
														<div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#e20074]/5 border border-[#e20074]/10 text-[0.65rem] font-bold text-[#e20074]">
															Nur SmartStream
														</div>
													)}
													{sp.magentaTVRequirement === 'ONLY_MEGASTREAM' && (
														<div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#e20074]/5 border border-[#e20074]/10 text-[0.65rem] font-bold text-[#e20074]">
															Nur MegaStream
														</div>
													)}
													{sp.magentaTVRequirement === 'NOT_ALLOWED' && (
														<div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#f97316]/5 border border-[#f97316]/10 text-[0.65rem] font-bold text-[#f97316]">
															Nur ohne MagentaTV
														</div>
													)}
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="flex flex-wrap gap-1.5 max-w-[300px]">
												{sp.products?.map((prod: any) => (
													<span
														key={prod.id}
														className="px-2 py-0.5 rounded bg-[#f0f4ff] border border-[#dce6ff] text-[0.68rem] font-bold text-[#4a6fa5]"
													>
														{prod.name}
													</span>
												)) || (
													<span className="text-[0.75rem] text-[#ccc] italic">
														Keine Produkte
													</span>
												)}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="flex flex-wrap gap-1.5">
												{sp.tiers?.map((tier: any, i: number) => (
													<span
														key={i}
														className="bg-[#fcfcfd] px-2 py-1 rounded-lg text-[0.7rem] font-bold text-[#1a1a2e] border border-[#eaedf0]"
													>
														{tier.fromMonth === tier.toMonth
															? `Monat ${tier.fromMonth}`
															: `${tier.fromMonth}-${tier.toMonth}. Mo`}
														:{' '}
														<span className="text-[#e20074]">
															{tier.price.toFixed(2)} €
														</span>
													</span>
												))}
											</div>
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
												<Link
													href={`/admin/special-prices/${sp.id}`}
													className="p-2 text-[#ccc] hover:text-[#0090d0] hover:bg-[#0090d0]/10 rounded-lg transition-all"
												>
													<Edit className="w-4 h-4" />
												</Link>
												<button
													onClick={() =>
														confirmDelete({
															id: sp.id,
															name: sp.name,
															onConfirm: (sudoPassword) =>
																deleteMutation.mutateAsync({
																	id: sp.id,
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
								))}
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
							{isFetchingNextPage ? 'Wird geladen...' : 'Mehr Aktionen laden'}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
