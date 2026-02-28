"use client";

import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2, Search, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import clsx from "clsx";
import { Skeleton } from "@/components/skeleton";

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

	const [filterCat, setFilterCat] = useState<string | "ALL">("ALL");

	const deleteMutation = trpc.admin.deleteProduct.useMutation({
		onSuccess: () => {
			utils.product.getAllProducts.invalidate();
		}
	});

	const processedProducts = useMemo(() => {
		if (!products) return [];
		return products.filter((p) => {
			const matchesSearch =
				p.name.toLowerCase().includes(search.toLowerCase()) ||
				p.category.toLowerCase().includes(search.toLowerCase()) ||
				CATEGORY_LABELS[p.category]
					?.toLowerCase()
					.includes(search.toLowerCase());
			const matchesCategory = filterCat === "ALL" || p.category === filterCat;
			return matchesSearch && matchesCategory;
		});
	}, [products, search, filterCat]);

	const allCategories = Object.keys(CATEGORY_LABELS);

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-[1.6rem] font-extrabold text-[#1a1a2e] tracking-tight mb-1">
						Produktverwaltung
					</h1>
					<p className="text-[0.85rem] text-[#999] m-0">
						Verwalte hier alle Tarife und Hardware.
					</p>
				</div>

				<Link
					href="/admin/products/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Neues Produkt
				</Link>
			</div>

			{/* Search & Filters */}
			<div className="flex flex-col md:flex-row gap-4 mb-6">
				<div className="relative flex-1">
					<Search className="w-4 h-4 text-[#bbb] absolute left-4 top-1/2 -translate-y-1/2" />
					<input
						type="text"
						placeholder="Produkt suchen..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
					/>
				</div>
				<div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none items-center">
					<button
						onClick={() => setFilterCat("ALL")}
						className={clsx(
							"px-4 py-2.5 rounded-xl font-medium text-[0.78rem] transition-colors whitespace-nowrap cursor-pointer active:scale-95",
							filterCat === "ALL"
								? "bg-[#1a1a2e] text-white"
								: "bg-white border border-[#eaedf0] text-[#666] hover:bg-[#f7f8fa]"
						)}
					>
						Alle
					</button>
					{allCategories.map((catKey) => {
						const isSelected = filterCat === catKey;
						return (
							<button
								key={catKey}
								onClick={() => setFilterCat(catKey)}
								className={clsx(
									"px-4 py-2.5 rounded-xl font-medium text-[0.78rem] transition-colors whitespace-nowrap cursor-pointer active:scale-95",
									isSelected
										? "bg-[#e20074]/10 text-[#e20074] border border-[#e20074]/20"
										: "bg-white border border-[#eaedf0] text-[#666] hover:bg-[#f7f8fa]"
								)}
							>
								{CATEGORY_LABELS[catKey]}
							</button>
						);
					})}
				</div>
			</div>

			{/* Product table */}
			<div className="bg-white rounded-2xl border border-[#eaedf0] overflow-hidden">
				{isLoading ? (
					<div className="flex flex-col gap-3 p-5">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="h-14 w-full rounded-xl" />
						))}
					</div>
				) : processedProducts.length === 0 ? (
					<div className="p-16 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Search className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Produkte gefunden
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Es wurden keine Produkte für die aktuelle Suche oder Kategorie
							gefunden.
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
							{processedProducts.map((product) => {
								const catColor = CATEGORY_COLORS[product.category] || "#e20074";
								return (
									<tr
										key={product.id}
										className="border-b border-[#f0f0f0] last:border-b-0 group hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] relative z-0 hover:z-10 transition-all duration-300"
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
													className="p-2 text-[#aaa] hover:text-[#e20074] hover:bg-[#e20074]/10 rounded-lg transition-all duration-150 no-underline"
												>
													<Edit className="w-4 h-4" />
												</Link>
												<button
													onClick={() => {
														if (
															confirm(
																"Möchtest Du dieses Produkt wirklich löschen?"
															)
														) {
															deleteMutation.mutate({ id: product.id });
														}
													}}
													className="p-2 text-[#aaa] hover:text-[#dc2626] hover:bg-[#fee2e2] rounded-lg transition-all duration-150 cursor-pointer bg-transparent border-none active:scale-95"
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
