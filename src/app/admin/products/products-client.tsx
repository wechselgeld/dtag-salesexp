"use client";

import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2, Search, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import clsx from "clsx";
import { Skeleton } from "@/components/shared/skeleton";
import { confirmDelete } from "@/components/shared/delete-confirm-toast";
import { AdminPageHeader } from "@/components/shared/ui/admin-ui";

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
	const [filterCat, setFilterCat] = useState<string | "ALL">("ALL");
	const utils = trpc.useUtils();

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		trpc.product.getAllProducts.useInfiniteQuery(
			{
				limit: 20,
				search: search || undefined,
				category: filterCat === "ALL" ? undefined : filterCat
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor
			}
		);

	const deleteMutation = trpc.admin.deleteProduct.useMutation({
		onSuccess: () => {
			utils.product.getAllProducts.invalidate();
		}
	});

	const processedProducts = useMemo(() => {
		return data?.pages.flatMap((page) => page.items) || [];
	}, [data]);

	const allCategories = Object.keys(CATEGORY_LABELS);

	return (
		<div className="space-y-6 pb-20">
			<div className="flex justify-between items-center">
				<AdminPageHeader
					title="Produktverwaltung"
					subtitle="Verwalte hier alle Tarife und Hardware."
					backHref="/admin"
				/>

				<Link
					href="/admin/products/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Neues Produkt
				</Link>
			</div>

			{/* Search & Filters */}
			<div className="flex flex-col md:flex-row gap-4">
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
						const catColor = CATEGORY_COLORS[catKey] || "#e20074";
						return (
							<button
								key={catKey}
								onClick={() => setFilterCat(catKey)}
								className={clsx(
									"px-4 py-2.5 rounded-xl font-medium text-[0.78rem] transition-colors whitespace-nowrap cursor-pointer active:scale-95",
									isSelected
										? "bg-[#1a1a2e] text-white border-transparent"
										: "bg-white border border-[#eaedf0] text-[#666] hover:bg-[#f7f8fa]"
								)}
								style={isSelected ? { backgroundColor: catColor } : {}}
							>
								{CATEGORY_LABELS[catKey]}
							</button>
						);
					})}
				</div>
			</div>

			<div className="bg-white rounded-3xl border border-[#eaedf0] overflow-hidden shadow-sm">
				{isLoading && processedProducts.length === 0 ? (
					<div className="flex flex-col gap-3 p-5">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="h-14 w-full rounded-xl" />
						))}
					</div>
				) : processedProducts.length === 0 ? (
					<div className="p-20 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Search className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1.1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Produkte gefunden
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Versuche es mit einem anderen Suchbegriff oder Filter.
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead>
								<tr className="border-b border-[#eaedf0] bg-[#fcfcfd]">
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Tarif / Hardware
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Kategorie
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Grundpreis
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right font-bold">
										Aktionen
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#f0f0f0]">
								{processedProducts.map((p) => {
									const catColor = CATEGORY_COLORS[p.category] || "#e20074";
									return (
										<tr
											key={p.id}
											className="hover:bg-[#fcfcfd] transition-colors group"
										>
											<td className="px-6 py-4">
												<div className="flex flex-col">
													<span className="text-[0.9rem] font-bold text-[#1a1a2e]">
														{p.name}
													</span>
													{p.hasMagentaTVBundle && (
														<div className="flex items-center gap-1 mt-0.5">
															<CheckCircle
																className="w-3 h-3"
																style={{ color: catColor }}
															/>
															<span
																className="text-[0.65rem] font-bold"
																style={{ color: catColor }}
															>
																TV Bundle verfügbar
															</span>
														</div>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												<span
													className="px-2.5 py-1 rounded-lg text-[0.68rem] font-extrabold uppercase tracking-wider"
													style={{
														color: catColor,
														backgroundColor: `${catColor}10`,
														border: `1px solid ${catColor}20`
													}}
												>
													{CATEGORY_LABELS[p.category] || p.category}
												</span>
											</td>
											<td className="px-6 py-4 text-[0.9rem] font-bold text-[#1a1a2e]">
												{p.basePrice?.toLocaleString("de-DE", {
													style: "currency",
													currency: "EUR"
												})}
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
													<Link
														href={`/admin/products/${p.id}`}
														className="p-2 text-[#ccc] hover:text-[#0090d0] hover:bg-[#0090d0]/10 rounded-lg transition-all"
													>
														<Edit className="w-4 h-4" />
													</Link>
													<button
														onClick={() =>
															confirmDelete({
																id: p.id,
																name: p.name,
																onConfirm: () =>
																	deleteMutation.mutate({ id: p.id })
															})
														}
														className="p-2 text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2] rounded-lg transition-all cursor-pointer border-none bg-transparent"
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
							{isFetchingNextPage ? "Wird geladen..." : "Mehr Produkte laden"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
