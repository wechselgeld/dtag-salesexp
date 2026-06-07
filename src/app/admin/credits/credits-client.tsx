'use client';

import {
	trpc,
} from '@/lib/trpc';
import Link from 'next/link';
import {
	Plus, Pencil, Trash2, Gift, Loader2, CheckCircle, XCircle,
} from 'lucide-react';
import { AdminEmptyState } from '@/components/features/admin/admin-empty-state';
import { AdminLoadMore } from '@/components/features/admin/admin-load-more';
import {
	showErrorToast,
} from '@/components/shared/error-toast';
import {
	format,
} from 'date-fns';
import {
	useState, useMemo,
} from 'react';
import {
	de,
} from 'date-fns/locale';
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

export default function CreditsPage() {
	const utils = trpc.useUtils();
	const [
		searchQuery,
		setSearchQuery,
	] = useState('');
	const [
		searchedCredits,
		setSearchedCredits,
	] = useState<any[]>([
]);
	const [
		activeFilterId,
		setActiveFilterId,
	] = useState<string>('ALL');

	const {
		data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage,
	} =
		trpc.admin.oneTimeCredit.list.useInfiniteQuery(
			{
				limit: 250, // Fetch all credits for seamless client-side search
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	const deleteMutation = trpc.admin.oneTimeCredit.delete.useMutation({
		onSuccess: () => utils.admin.oneTimeCredit.list.invalidate(),
		onError: (error) => showErrorToast('Fehler beim Löschen', error.message),
	});

	const credits = useMemo(() => {
		return data?.pages.flatMap((page) => page.items) || [
];
	}, [
 data,
]);

	const filteredCredits = useMemo(() => {
		if (activeFilterId === 'ALL') { return searchedCredits; }
		return searchedCredits.filter((credit: any) => {
			if (activeFilterId === 'ACTIVE') { return credit.isActive; }
			if (activeFilterId === 'INACTIVE') { return !credit.isActive; }
			return true;
		});
	}, [
		searchedCredits,
		activeFilterId,
	]);

	return (
		<div className="space-y-6 pb-20">
			<div className="flex justify-between items-center">
				<AdminPageHeader
					title="Gutschriften"
					subtitle="Verwalte einmalige Gutschriften (z.B. Anschlusspreisbefreiung)."
					backHref="/admin"
				/>
				<Link
					href="/admin/credits/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Neue Gutschrift
				</Link>
			</div>

			<div className="flex flex-col gap-4">
				<AdminSearch
					items={credits}
					onResultsChange={setSearchedCredits}
					getSearchableText={(credit: any) => [
						credit.name || '',
						credit.value?.toString() || '',
					]}
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Gutschrift suchen nach Name, Betrag..."
				/>

				{/* Filter Bubbles */}
				<ScrollableFilterRow>
					{[
						{
 id: 'ALL',
label: 'Alle Gutschriften',
icon: Gift,
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
				{isLoading && credits.length === 0 ? (
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
				) : filteredCredits.length === 0 ? (
					<AdminEmptyState
						icon={Gift}
						title="Keine Gutschriften"
						description="Es wurden keine Gutschriften"
						searchQuery={searchQuery}
						activeFilterId={activeFilterId}
						onResetFilters={() => { setSearchQuery(''); setActiveFilterId('ALL'); }}
						newLinkHref="/admin/credits/new"
						newLinkLabel="Neue Gutschrift"
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
										Wert
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Erstellt
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right">
										Aktionen
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#f0f0f0]">
								{filteredCredits.map(
									(credit: {
										id: string;
										name: string;
										value: number;
										isActive: boolean;
										createdAt: Date | string;
									}) => (
										<tr
											key={credit.id}
											className="group hover:bg-[#fcfcfd] transition-colors"
										>
											<td className="py-4 px-6 text-[0.95rem] font-bold text-[#1a1a2e]">
												{credit.name}
											</td>
											<td className="py-4 px-6 text-[0.95rem] font-black text-[#00a878]">
												{credit.value.toFixed(2)} €
											</td>
											<td className="py-4 px-6">
												{credit.isActive ? (
													<span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.68rem] font-bold bg-[#00a878]/10 text-[#00a878] border border-[#00a878]/20">
														Aktiv
													</span>
												) : (
													<span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.68rem] font-bold bg-[#f7f8fa] text-[#bbb] border border-[#eaedf0]">
														Inaktiv
													</span>
												)}
											</td>
											<td className="py-4 px-6 text-[0.8rem] text-[#888] font-bold">
												{format(new Date(credit.createdAt), 'dd. MMM yyyy', {
													locale: de,
												})}
											</td>
											<td className="py-4 px-6 text-right w-[150px]">
												<div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
													<Link
														href={`/admin/credits/${credit.id}`}
														className="p-2 text-[#ccc] hover:text-[#e20074] hover:bg-[#e20074]/10 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center bg-transparent border-none"
														title="Benutzer bearbeiten"
													>
														<Pencil className="w-4 h-4" />
													</Link>
													<button
														onClick={() => {
															confirmDelete({
																id: credit.id,
																name: credit.name,
																onConfirm: (sudoPassword) =>
																	deleteMutation.mutateAsync({
																		id: credit.id,
																		sudoPassword,
																	}),
															});
														}}
														disabled={deleteMutation.isPending}
														className="p-2 text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2] rounded-lg transition-all cursor-pointer bg-transparent border-none disabled:opacity-50"
														title="Benutzer löschen"
													>
														{deleteMutation.isPending ? (
															<Loader2 className="w-4 h-4 animate-spin" />
														) : (
															<Trash2 className="w-4 h-4" />
														)}
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
