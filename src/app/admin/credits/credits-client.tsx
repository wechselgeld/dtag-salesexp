"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { Plus, Pencil, Trash2, Gift, Search } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { de } from "date-fns/locale";
import { Skeleton } from "@/components/shared/skeleton";
import { confirmDelete } from "@/components/shared/delete-confirm-toast";

export default function CreditsPage() {
	const utils = trpc.useUtils();
	const { data: credits, isLoading } = trpc.admin.oneTimeCredit.list.useQuery();
	const deleteMutation = trpc.admin.oneTimeCredit.delete.useMutation({
		onSuccess: () => utils.admin.oneTimeCredit.list.invalidate()
	});

	const [searchQuery, setSearchQuery] = useState("");

	const filteredCredits =
		credits?.filter((c) =>
			c.name.toLowerCase().includes(searchQuery.toLowerCase())
		) || [];

	if (isLoading) {
		return (
			<div>
				<div className="flex justify-between items-center mb-6">
					<div>
						<h1 className="text-[1.6rem] font-extrabold text-[#1a1a2e] tracking-tight mb-1">
							Gutschriften
						</h1>
						<p className="text-[0.85rem] text-[#999] m-0">
							Verwalte einmalige Gutschriften (z.B. Anschlusspreisbefreiung).
						</p>
					</div>
					<Skeleton className="h-10 w-40 rounded-xl" />
				</div>
				<div className="bg-white rounded-2xl border border-[#eaedf0] overflow-hidden p-5 flex flex-col gap-3">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className="h-14 w-full rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-[1.6rem] font-extrabold text-[#1a1a2e] tracking-tight mb-1">
						Gutschriften
					</h1>
					<p className="text-[0.85rem] text-[#999] m-0">
						Verwalte einmalige Gutschriften (z.B. Anschlusspreisbefreiung).
					</p>
				</div>
				<Link
					href="/admin/credits/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Neue Gutschrift
				</Link>
			</div>

			{/* Search */}
			<div className="flex flex-col md:flex-row gap-4 mb-6">
				<div className="relative flex-1">
					<Search className="w-4 h-4 text-[#bbb] absolute left-4 top-1/2 -translate-y-1/2" />
					<input
						type="text"
						placeholder="Gutschrift suchen..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
					/>
				</div>
			</div>

			<div className="bg-white rounded-2xl border border-[#eaedf0] overflow-hidden">
				{credits && credits.length === 0 ? (
					<div className="p-16 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Gift className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Gutschriften
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Es wurden noch keine Gutschriften erstellt.
						</p>
					</div>
				) : filteredCredits.length === 0 && credits && credits.length > 0 ? (
					<div className="p-16 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Search className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Ergebnisse
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Es wurden keine Gutschriften für die aktuelle Suche gefunden.
						</p>
					</div>
				) : (
					<table className="w-full text-left">
						<thead>
							<tr className="border-b border-[#eaedf0]">
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
									Name
								</th>
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
									Wert
								</th>
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
									Status
								</th>
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
									Erstellt
								</th>
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right">
									Aktionen
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredCredits.map((credit) => (
								<tr
									key={credit.id}
									className="border-b border-[#f0f0f0] last:border-b-0 group hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] relative z-0 hover:z-10 transition-all duration-300"
								>
									<td className="py-3.5 px-5 text-[0.85rem] font-semibold text-[#1a1a2e]">
										{credit.name}
									</td>
									<td className="py-3.5 px-5 text-[0.85rem] font-bold text-[#00a878]">
										{credit.value.toFixed(2)} €
									</td>
									<td className="py-3.5 px-5">
										{credit.isActive ? (
											<span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.68rem] font-semibold bg-[#00a878]/8 text-[#00a878]">
												Aktiv
											</span>
										) : (
											<span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.68rem] font-semibold bg-[#f7f8fa] text-[#bbb]">
												Inaktiv
											</span>
										)}
									</td>
									<td className="py-3.5 px-5 text-[0.78rem] text-[#999]">
										{format(new Date(credit.createdAt), "dd. MMM yyyy", {
											locale: de
										})}
									</td>
									<td className="py-3.5 px-5 text-right">
										<div className="flex items-center justify-end gap-1">
											<Link
												href={`/admin/credits/${credit.id}`}
												className="p-2 text-[#aaa] hover:text-[#e20074] hover:bg-[#e20074]/10 rounded-lg transition-all duration-150 no-underline"
											>
												<Pencil className="w-4 h-4" />
											</Link>
											<button
												onClick={() => {
													confirmDelete({
														id: credit.id,
														name: credit.name,
														onConfirm: () =>
															deleteMutation.mutate({ id: credit.id })
													});
												}}
												className="p-2 text-[#aaa] hover:text-[#dc2626] hover:bg-[#fee2e2] rounded-lg transition-all duration-150 cursor-pointer bg-transparent border-none active:scale-95"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
