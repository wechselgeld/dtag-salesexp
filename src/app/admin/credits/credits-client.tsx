'use client';

import {
	trpc,
} from '@/lib/trpc';
import Link from 'next/link';
import {
	Plus, Pencil, Trash2, Gift, Search, Loader2, X,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { showErrorToast } from '@/components/shared/error-toast';
import {
	format,
} from 'date-fns';
import {
	useState,
} from 'react';
import {
	de,
} from 'date-fns/locale';
import {
	Skeleton,
} from '@/components/shared/skeleton';
import {
	confirmDelete,
} from '@/components/shared/delete-confirm-toast';
import {
	AdminPageHeader,
} from '@/components/shared/ui/admin-ui';

export default function CreditsPage() {
	const utils = trpc.useUtils();
	const [
		searchQuery,
		setSearchQuery,
	] = useState('');

	const debouncedSearch = useDebounce(searchQuery, 300);

	const {
		data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage,
	} =
		trpc.admin.oneTimeCredit.list.useInfiniteQuery(
			{
				limit: 20,
				search: debouncedSearch || undefined,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	const deleteMutation = trpc.admin.oneTimeCredit.delete.useMutation({
		onSuccess: () => utils.admin.oneTimeCredit.list.invalidate(),
		onError: (error) => showErrorToast('Fehler beim Löschen', error.message),
	});

	const credits = data?.pages.flatMap((page) => page.items) || [
	];

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

			<div className="relative">
				<Search className="w-4 h-4 text-[#bbb] absolute left-4 top-1/2 -translate-y-1/2" />
				<input
					type="text"
					placeholder="Gutschrift suchen..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-11 pr-11 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
				/>
				{searchQuery && (
					<button
						onClick={() => setSearchQuery('')}
						className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#1a1a2e] bg-transparent border-none cursor-pointer"
					>
						<X className="w-4 h-4" />
					</button>
				)}
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
				) : credits.length === 0 ? (
					<div className="p-20 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Gift className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1.1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Gutschriften
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0 mb-4">
							Es wurden keine Gutschriften {searchQuery ? 'für deine Suche' : ''} gefunden.
						</p>
						<div className="flex gap-3 mt-2">
							{searchQuery && (
								<button
									onClick={() => setSearchQuery('')}
									className="text-[#1a1a2e] text-[0.85rem] font-semibold bg-white border border-[#eaedf0] px-4 py-2 rounded-xl hover:bg-[#f7f8fa] transition-colors cursor-pointer"
								>
									Suche zurücksetzen
								</button>
							)}
							<Link
								href="/admin/credits/new"
								className="text-white text-[0.85rem] font-semibold bg-[#e20074] border-none px-4 py-2 rounded-xl hover:bg-[#c70066] transition-colors cursor-pointer no-underline flex items-center gap-2"
							>
								<Plus className="w-4 h-4" /> Neue Gutschrift
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
								{credits.map(
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
																onConfirm: () =>
																	deleteMutation.mutate({
																		id: credit.id,
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
