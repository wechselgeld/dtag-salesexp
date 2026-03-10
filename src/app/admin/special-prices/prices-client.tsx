"use client";

import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2, Search, Tag, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Skeleton } from "@/components/shared/skeleton";
import { confirmDelete } from "@/components/shared/delete-confirm-toast";
import { AdminPageHeader } from "@/components/shared/ui/admin-ui";
import { Loader2 } from "lucide-react";

export default function AdminSpecialPricesPage() {
	const [search, setSearch] = useState("");
	const utils = trpc.useUtils();

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		trpc.admin.getAllSpecialPrices.useInfiniteQuery(
			{
				limit: 20,
				search: search || undefined
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor
			}
		);

	const deleteMutation = trpc.admin.deleteSpecialPrice.useMutation({
		onSuccess: () => {
			utils.admin.getAllSpecialPrices.invalidate();
		}
	});

	const specialPrices = data?.pages.flatMap((page) => page.items) || [];

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

			<div className="relative">
				<Search className="w-4 h-4 text-[#bbb] absolute left-4 top-1/2 -translate-y-1/2" />
				<input
					type="text"
					placeholder="Aktiansname oder Produkt suchen..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
				/>
			</div>

			<div className="bg-white rounded-3xl border border-[#eaedf0] overflow-hidden shadow-sm">
				{isLoading && specialPrices.length === 0 ? (
					<div className="flex flex-col gap-3 p-5">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="h-14 w-full rounded-xl" />
						))}
					</div>
				) : specialPrices.length === 0 ? (
					<div className="p-20 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Tag className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1.1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Aktionen gefunden
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Es wurden keine Aktionspreise für deine Suche gefunden.
						</p>
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
								{specialPrices.map((sp: any) => (
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
													{sp.requiresMagentaTV && (
														<div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#e20074]/5 border border-[#e20074]/10 text-[0.65rem] font-bold text-[#e20074]">
															MagentaTV erforderlich
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
														:{" "}
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
															onConfirm: () =>
																deleteMutation.mutate({ id: sp.id })
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
							{isFetchingNextPage ? "Wird geladen..." : "Mehr Aktionen laden"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
