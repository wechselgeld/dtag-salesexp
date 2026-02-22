"use client";

import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2, Search, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";

const CATEGORY_COLORS: Record<string, string> = {
	MOBILE: "#e20074",
	FIBER: "#0090d0",
	DSL: "#7b61ff",
	MAGENTA_TV_OTT: "#ff6b00",
	DEVICE: "#00a878",
	ADDON: "#e67e22"
};

const CATEGORY_LABELS: Record<string, string> = {
	MOBILE: "Mobilfunk",
	FIBER: "Glasfaser",
	DSL: "Festnetz",
	MAGENTA_TV_OTT: "MagentaTV",
	DEVICE: "Endgeräte",
	ADDON: "Zubuchoptionen"
};

export default function AdminProductsPage() {
	const [search, setSearch] = useState("");
	const utils = trpc.useUtils();
	const { data: products, isLoading } = trpc.product.getAllProducts.useQuery();

	const deleteMutation = trpc.admin.deleteProduct.useMutation({
		onSuccess: () => {
			utils.product.getAllProducts.invalidate();
		}
	});

	const filteredProducts = products?.filter(
		(p) =>
			p.name.toLowerCase().includes(search.toLowerCase()) ||
			p.category.toLowerCase().includes(search.toLowerCase()) ||
			CATEGORY_LABELS[p.category]?.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-[1.6rem] font-extrabold text-[#1a1a2e] tracking-tight mb-1">
						Produktverwaltung
					</h1>
					<p className="text-[0.85rem] text-[#999] m-0">
						Verwalten Sie hier alle Tarife und Hardware.
					</p>
				</div>

				<Link
					href="/admin/products/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Neues Produkt
				</Link>
			</div>

			{/* Search */}
			<div className="mb-5 relative">
				<Search className="w-4 h-4 text-[#bbb] absolute left-4 top-1/2 -translate-y-1/2" />
				<input
					type="text"
					placeholder="Produkt suchen..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
				/>
			</div>

			{/* Product table */}
			<div className="bg-white rounded-2xl border border-[#eaedf0] overflow-hidden">
				{isLoading ? (
					<div className="p-10 text-center text-[0.85rem] text-[#ccc]">
						Lade Produkte...
					</div>
				) : !filteredProducts || filteredProducts.length === 0 ? (
					<div className="p-10 text-center text-[0.85rem] text-[#ccc]">
						Keine Produkte gefunden.
					</div>
				) : (
					<table className="w-full text-left">
						<thead>
							<tr className="border-b border-[#eaedf0]">
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
									Name
								</th>
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
									Kategorie
								</th>
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
									Basispreis
								</th>
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right">
									Aktionen
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredProducts.map((product) => {
								const catColor = CATEGORY_COLORS[product.category] || "#e20074";
								return (
									<tr
										key={product.id}
										className="border-b border-[#f0f0f0] last:border-b-0 hover:bg-[#f7f8fa] transition-colors"
									>
										<td className="px-5 py-3.5">
											<div className="text-[0.85rem] font-semibold text-[#1a1a2e]">
												{product.name}
											</div>
											{product.hasMagentaTVBundle && (
												<div className="flex items-center gap-1 mt-0.5">
													<CheckCircle
														className="w-3 h-3"
														style={{ color: catColor }}
													/>
													<span
														className="text-[0.68rem] font-medium"
														style={{ color: catColor }}
													>
														TV Bundle verfügbar
													</span>
												</div>
											)}
										</td>
										<td className="px-5 py-3.5">
											<span
												className="px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold uppercase tracking-wider"
												style={{
													color: catColor,
													backgroundColor: `${catColor}0a`
												}}
											>
												{CATEGORY_LABELS[product.category] || product.category}
											</span>
										</td>
										<td className="px-5 py-3.5 text-[0.85rem] font-semibold text-[#1a1a2e]">
											{product.basePrice.toFixed(2)} €
										</td>
										<td className="px-5 py-3.5 text-right">
											<div className="flex items-center justify-end gap-1">
												<Link
													href={`/admin/products/${product.id}`}
													className="p-2 text-[#ccc] hover:text-[#e20074] hover:bg-[#e20074]/[0.06] rounded-lg transition-all duration-150 no-underline"
												>
													<Edit className="w-4 h-4" />
												</Link>
												<button
													onClick={() => {
														if (
															confirm(
																"Möchten Sie dieses Produkt wirklich löschen?"
															)
														) {
															deleteMutation.mutate({ id: product.id });
														}
													}}
													className="p-2 text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2]/40 rounded-lg transition-all duration-150 cursor-pointer bg-transparent border-none"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
