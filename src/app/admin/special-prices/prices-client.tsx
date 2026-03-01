"use client";

import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2, Search, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Skeleton } from "@/components/shared/skeleton";

export default function AdminSpecialPricesPage() {
	const [search, setSearch] = useState("");
	const utils = trpc.useUtils();
	const { data: specialPrices, isLoading } =
		trpc.admin.getAllSpecialPrices.useQuery();

	const deleteMutation = trpc.admin.deleteSpecialPrice.useMutation({
		onSuccess: () => {
			utils.admin.getAllSpecialPrices.invalidate();
		}
	});

	const filteredPrices = specialPrices?.filter(
		(p) =>
			p.name.toLowerCase().includes(search.toLowerCase()) ||
			(p as any).products?.some((prod: any) =>
				prod.name.toLowerCase().includes(search.toLowerCase())
			)
	);

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-[1.6rem] font-extrabold text-[#1a1a2e] tracking-tight mb-1">
						Aktionspreise
					</h1>
					<p className="text-[0.85rem] text-[#999] m-0">
						Verwalte hier Sonderpreise und Kampagnen.
					</p>
				</div>
				<Link
					href="/admin/special-prices/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Neue Aktion
				</Link>
			</div>

			{/* Search */}
			<div className="flex flex-col md:flex-row gap-4 mb-6">
				<div className="relative flex-1">
					<Search className="w-4 h-4 text-[#bbb] absolute left-4 top-1/2 -translate-y-1/2" />
					<input
						type="text"
						placeholder="Suchen nach Name oder Produkt..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
					/>
				</div>
			</div>

			<div className="bg-white rounded-2xl border border-[#eaedf0] overflow-hidden">
				{isLoading ? (
					<div className="flex flex-col gap-3 p-5">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="h-14 w-full rounded-xl" />
						))}
					</div>
				) : !filteredPrices || filteredPrices.length === 0 ? (
					<div className="p-16 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Tag className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Aktionen gefunden
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Es wurden keine speziellen Preise für die aktuelle Suche gefunden.
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
									Produkte
								</th>
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
									Staffelung
								</th>
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right">
									Aktionen
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredPrices.map((sp) => (
								<tr
									key={sp.id}
									className="border-b border-[#f0f0f0] last:border-b-0 group hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] relative z-0 hover:z-10 transition-all duration-300"
								>
									<td className="px-5 py-3.5">
										<div className="text-[0.85rem] font-semibold text-[#1a1a2e] flex items-center gap-2">
											<Tag className="w-3.5 h-3.5 text-[#e20074]" />
											{sp.name}
										</div>
										{sp.requiresMagentaTV && (
											<span className="text-[0.68rem] text-[#bbb] ml-5.5">
												Benötigt MagentaTV
											</span>
										)}
									</td>
									<td className="px-5 py-3.5">
										<div className="flex flex-wrap gap-1">
											{(sp as any).products?.map(
												(prod: { id: string; name: string }) => (
													<span
														key={prod.id}
														className="bg-[#f0f4ff] px-2 py-0.5 rounded text-[0.7rem] font-medium text-[#4a6fa5]"
													>
														{prod.name}
													</span>
												)
											)}
										</div>
									</td>
									<td className="px-5 py-3.5">
										<div className="flex flex-wrap gap-1.5">
											{(sp as any).tiers?.map(
												(
													tier: {
														fromMonth: number;
														toMonth: number;
														price: number;
													},
													i: number
												) => (
													<span
														key={i}
														className="bg-[#f7f8fa] px-2.5 py-1 rounded-lg text-[0.72rem] font-semibold text-[#1a1a2e] border border-[#eaedf0]"
													>
														Mo {tier.fromMonth}–{tier.toMonth}:{" "}
														<span className="text-[#e20074]">
															{tier.price.toFixed(2)} €
														</span>
													</span>
												)
											)}
										</div>
									</td>
									<td className="px-5 py-3.5 text-right">
										<div className="flex items-center justify-end gap-1">
											<Link
												href={`/admin/special-prices/${sp.id}`}
												className="p-2 text-[#aaa] hover:text-[#e20074] hover:bg-[#e20074]/10 rounded-lg transition-all duration-150 no-underline"
											>
												<Edit className="w-4 h-4" />
											</Link>
											<button
												onClick={() => {
													if (
														confirm(
															"Möchten Sie diese Aktion wirklich löschen?"
														)
													) {
														deleteMutation.mutate({ id: sp.id });
													}
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
