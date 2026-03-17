'use client';

import {
	trpc,
} from '@/lib/trpc';
import Link from 'next/link';
import {
	Plus, Pencil, Trash2, Layers, Search,
} from 'lucide-react';
import {
	Skeleton,
} from '@/components/shared/skeleton';
import {
	confirmDelete,
} from '@/components/shared/delete-confirm-toast';
import {
	useState,
} from 'react';
import {
	AdminPageHeader,
} from '@/components/shared/ui/admin-ui';
import {
	Loader2, MessageSquare,
} from 'lucide-react';

export default function AddonsPage() {
	const utils = trpc.useUtils();
	const [
		searchQuery,
		setSearchQuery,
	] = useState('');

	const {
		data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage,
	} =
		trpc.addon.list.useInfiniteQuery(
			{
				limit: 20,
				search: searchQuery || undefined,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	const deleteMutation = trpc.addon.delete.useMutation({
		onSuccess: () => utils.addon.list.invalidate(),
	});

	const addons = data?.pages.flatMap((page) => page.items) || [
	];

	return (
		<div className="space-y-6 pb-20">
			<div className="flex justify-between items-center">
				<AdminPageHeader
					title="Zubuchoptionen"
					subtitle="Verwalte zubuchbare Optionen und Services."
					backHref="/admin"
				/>
				<Link
					href="/admin/addons/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Neue Option
				</Link>
			</div>

			<div className="relative">
				<Search className="w-4 h-4 text-[#bbb] absolute left-4 top-1/2 -translate-y-1/2" />
				<input
					type="text"
					placeholder="Zubuchoption suchen..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
				/>
			</div>

			<div className="bg-white rounded-3xl border border-[#eaedf0] overflow-hidden shadow-sm">
				{isLoading && addons.length === 0 ? (
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
				) : addons.length === 0 ? (
					<div className="p-20 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Layers className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1.1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Zubuchoptionen
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Es wurden keine Zubuchoptionen für deine Suche gefunden.
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead>
								<tr className="border-b border-[#eaedf0] bg-[#fcfcfd]">
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Option
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Preis
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right">
										Aktionen
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#f0f0f0]">
								{addons.map(
									(addon: {
										id: string;
										name: string;
										magentaTVRequirement: 'REQUIRED' | 'NOT_ALLOWED' | 'NONE';
										internalNote?: string | null;
										isActive: boolean;
										tiers: { id: string; name: string; price: number }[];
										compatibleProducts: {
											id: string;
											name: string;
											category: string | null;
										}[];
									}) => (
										<tr
											key={addon.id}
											className="hover:bg-[#fcfcfd] transition-colors group"
										>
											<td className="px-6 py-4">
												<div className="flex flex-col">
													<span className="text-[0.95rem] font-bold text-[#1a1a2e]">
														{addon.name}
													</span>
													<div className="flex flex-wrap gap-1 mt-1">
														{addon.magentaTVRequirement === 'NOT_ALLOWED' && (
															<span className="text-[0.65rem] text-[#f97316] bg-[#fff8f1] border border-[#ffedd5] px-1.5 py-0.5 rounded font-bold">
																Ohne MagentaTV
															</span>
														)}
														{addon.magentaTVRequirement === 'REQUIRED' && (
															<span className="text-[0.65rem] text-[#e20074] bg-[#fff1f2] border border-[#ffe4e6] px-1.5 py-0.5 rounded font-bold">
																Mit MagentaTV
															</span>
														)}
														{addon.internalNote && (
															<div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#f7f8fa] border border-[#eaedf0] text-[0.65rem] font-bold text-[#666]">
																<MessageSquare className="w-3" />
																Notiz
															</div>
														)}
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-[0.9rem] font-bold text-[#1a1a2e]">
													{addon.tiers && addon.tiers.length > 0
														? addon.tiers.length === 1
															? `${addon.tiers[0].price.toFixed(2)} €`
															: `${Math.min(...addon.tiers.map((t: { price: number }) => t.price)).toFixed(2)} € - ${Math.max(...addon.tiers.map((t: { price: number }) => t.price)).toFixed(2)} €`
														: '0.00 €'}
													<span className="text-[0.7rem] text-[#999] ml-1 font-normal">
														mtl.
													</span>
												</div>
												{addon.tiers && addon.tiers.length > 1 && (
													<div className="text-[0.65rem] text-[#888] font-bold mt-0.5 uppercase tracking-wider">
														{addon.tiers.length} Varianten
													</div>
												)}
											</td>
											<td className="px-6 py-4">
												{addon.isActive ? (
													<span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.68rem] font-bold bg-[#e20074]/5 text-[#e20074] border border-[#e20074]/10">
														Aktiv
													</span>
												) : (
													<span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.68rem] font-bold bg-[#f7f8fa] text-[#bbb] border border-[#eaedf0]">
														Inaktiv
													</span>
												)}
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
													<Link
														href={`/admin/addons/${addon.id}`}
														className="p-2 text-[#ccc] hover:text-[#0090d0] hover:bg-[#0090d0]/10 rounded-lg transition-all"
													>
														<Pencil className="w-4 h-4" />
													</Link>
													<button
														onClick={() =>
															confirmDelete({
																id: addon.id,
																name: addon.name,
																onConfirm: () =>
																	deleteMutation.mutate({
																		id: addon.id,
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
