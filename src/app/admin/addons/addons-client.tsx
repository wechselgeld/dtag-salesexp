"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AddonsPage() {
	const { data: addons, isLoading, refetch } = trpc.addon.list.useQuery();

	const deleteMutation = trpc.addon.delete.useMutation({
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
						Zubuchoptionen
					</h1>
					<p className="text-[0.85rem] text-[#999] m-0">
						Verwalte zubuchbare Optionen und Services.
					</p>
				</div>
				<Link
					href="/admin/addons/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Neue Option
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
								Preis
							</th>
							<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
								Status
							</th>
							<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right">
								Aktionen
							</th>
						</tr>
					</thead>
					<tbody>
						{addons?.map((addon) => (
							<tr
								key={addon.id}
								className="border-b border-[#f0f0f0] last:border-b-0 hover:bg-[#f7f8fa] transition-colors group"
							>
								<td className="py-3.5 px-5 text-[0.85rem] font-semibold text-[#1a1a2e]">
									<div className="flex flex-col">
										<span>{addon.name}</span>
										<div className="flex flex-wrap gap-1 mt-1">
											{addon.requiresNoMagentaTV && (
												<span className="text-[0.65rem] text-[#e20074] bg-[#e20074]/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
													Ohne MagentaTV
												</span>
											)}
										</div>
									</div>
								</td>
								<td className="py-3.5 px-5 text-[0.85rem] font-bold text-[#1a1a2e]">
									{addon.tiers && addon.tiers.length > 0
										? addon.tiers.length === 1
											? `${addon.tiers[0].price.toFixed(2)} € mtl.`
											: `${Math.min(...addon.tiers.map((t: any) => t.price)).toFixed(2)} € - ${Math.max(...addon.tiers.map((t: any) => t.price)).toFixed(2)} € mtl.`
										: "0.00 € mtl."}
									{addon.tiers && addon.tiers.length > 1 && (
										<div className="text-[0.65rem] text-[#888] font-normal mt-0.5">
											{addon.tiers.length} Varianten
										</div>
									)}
								</td>
								<td className="py-3.5 px-5">
									{addon.isActive ? (
										<span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.68rem] font-semibold bg-[#e20074]/[0.08] text-[#e20074]">
											Aktiv
										</span>
									) : (
										<span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.68rem] font-semibold bg-[#f7f8fa] text-[#bbb]">
											Inaktiv
										</span>
									)}
								</td>
								<td className="py-3.5 px-5 text-right">
									<div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<Link
											href={`/admin/addons/${addon.id}`}
											className="p-2 text-[#ccc] hover:text-[#e20074] hover:bg-[#e20074]/[0.06] rounded-lg transition-all duration-150 no-underline"
										>
											<Pencil className="w-4 h-4" />
										</Link>
										<button
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												if (
													window.confirm(
														"Möchtest Du diese Option wirklich löschen?"
													)
												) {
													deleteMutation.mutate({ id: addon.id });
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
						{addons?.length === 0 && (
							<tr>
								<td
									colSpan={4}
									className="py-10 text-center text-[0.85rem] text-[#ccc]"
								>
									Keine Zubuchoptionen gefunden. Erstellen Sie die erste!
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
