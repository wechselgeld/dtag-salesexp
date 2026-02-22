"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function CreditsPage() {
	const {
		data: credits,
		isLoading,
		refetch
	} = trpc.admin.oneTimeCredit.list.useQuery();
	const deleteMutation = trpc.admin.oneTimeCredit.delete.useMutation({
		onSuccess: () => refetch()
	});

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[50vh]">
				<div className="animate-spin h-6 w-6 border-2 border-[#e20074] border-t-transparent rounded-full" />
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
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Neue Gutschrift
				</Link>
			</div>

			<div className="bg-white rounded-2xl border border-[#eaedf0] overflow-hidden">
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
						{credits?.map((credit) => (
							<tr
								key={credit.id}
								className="border-b border-[#f0f0f0] last:border-b-0 hover:bg-[#f7f8fa] transition-colors group"
							>
								<td className="py-3.5 px-5 text-[0.85rem] font-semibold text-[#1a1a2e]">
									{credit.name}
								</td>
								<td className="py-3.5 px-5 text-[0.85rem] font-bold text-[#00a878]">
									{credit.value.toFixed(2)} €
								</td>
								<td className="py-3.5 px-5">
									{credit.isActive ? (
										<span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.68rem] font-semibold bg-[#00a878]/[0.08] text-[#00a878]">
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
									<div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<Link
											href={`/admin/credits/${credit.id}`}
											className="p-2 text-[#ccc] hover:text-[#e20074] hover:bg-[#e20074]/[0.06] rounded-lg transition-all duration-150 no-underline"
										>
											<Pencil className="w-4 h-4" />
										</Link>
										<button
											onClick={() => {
												if (
													confirm(
														"Möchtest Du diese Gutschrift wirklich löschen?"
													)
												) {
													deleteMutation.mutate({ id: credit.id });
												}
											}}
											className="p-2 text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2]/40 rounded-lg transition-all duration-150 cursor-pointer bg-transparent border-none"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</td>
							</tr>
						))}
						{credits?.length === 0 && (
							<tr>
								<td
									colSpan={5}
									className="py-10 text-center text-[0.85rem] text-[#ccc]"
								>
									Keine Gutschriften gefunden. Erstelle die erste!
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
