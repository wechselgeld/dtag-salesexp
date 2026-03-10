"use client";

import { trpc } from "@/lib/trpc";
import { MapPin, Trash2, Plus, Loader2, Pencil, Search } from "lucide-react";
import clsx from "clsx";
import { Skeleton } from "@/components/shared/skeleton";
import { confirmDelete } from "@/components/shared/delete-confirm-toast";
import Link from "next/link";
import { useState } from "react";

export default function LocationsClient() {
	const utils = trpc.useUtils();
	const [searchQuery, setSearchQuery] = useState("");

	const { data: locations, isLoading } = trpc.location.list.useQuery();
	const { data: odRegions } = trpc.odRegion.list.useQuery();

	const deleteMutation = trpc.location.delete.useMutation({
		onSuccess: () => {
			utils.location.list.invalidate();
		}
	});

	const filteredLocations =
		locations?.filter((loc) =>
			loc.name.toLowerCase().includes(searchQuery.toLowerCase())
		) || [];

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<Skeleton className="h-10 w-48 rounded-xl" />
					<Skeleton className="h-10 w-32 rounded-xl" />
				</div>
				<div className="bg-white rounded-2xl border border-[#eaedf0] overflow-hidden p-5 space-y-3">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-14 w-full rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-[1.6rem] font-extrabold text-[#1a1a2e] tracking-tight mb-1">
						Standorte
					</h1>
					<p className="text-[0.85rem] text-[#999] m-0">
						Verwalte die Verkaufsstandorte.
					</p>
				</div>
				<Link
					href="/admin/locations/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Standort erstellen
				</Link>
			</div>

			{/* Search */}
			<div className="relative">
				<Search className="w-4 h-4 text-[#bbb] absolute left-4 top-1/2 -translate-y-1/2" />
				<input
					type="text"
					placeholder="Standort suchen..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
				/>
			</div>

			{/* Table */}
			<div className="bg-white rounded-2xl border border-[#eaedf0] overflow-hidden">
				{!locations || locations.length === 0 ? (
					<div className="p-16 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<MapPin className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Standorte
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Es wurden noch keine Standorte angelegt.
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
									OD-Bereich
								</th>
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider w-[120px] text-center">
									Status
								</th>
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right w-[150px]">
									Aktionen
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredLocations.map((loc) => (
								<tr
									key={loc.id}
									className="border-b border-[#f0f0f0] last:border-b-0 group hover:bg-[#f7f8fa] transition-colors duration-200"
								>
									<td className="py-3.5 px-5 text-[0.85rem] font-bold text-[#1a1a2e]">
										{loc.name}
									</td>
									<td className="py-3.5 px-5 text-[0.8rem] text-[#666]">
										{odRegions?.find((r) => r.id === (loc as any).odRegionId)
											?.name || (
											<span className="text-[#bbb] italic">
												Nicht zugewiesen
											</span>
										)}
									</td>
									<td className="py-3.5 px-5 text-center">
										<span
											className={clsx(
												"px-2 py-1 rounded-md text-[0.65rem] font-bold tracking-wider",
												loc.isActive
													? "bg-green-100 text-green-700"
													: "bg-red-100 text-red-700"
											)}
										>
											{loc.isActive ? "AKTIV" : "INAKTIV"}
										</span>
									</td>
									<td className="py-3.5 px-5 text-right">
										<div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
											<Link
												href={`/admin/locations/${loc.id}`}
												className="p-2 text-[#ccc] hover:text-[#0090d0] hover:bg-[#0090d0]/10 rounded-lg transition-all"
											>
												<Pencil className="w-4 h-4" />
											</Link>
											<button
												onClick={() => {
													confirmDelete({
														id: loc.id,
														name: loc.name,
														onConfirm: () =>
															deleteMutation.mutate({ id: loc.id })
													});
												}}
												disabled={deleteMutation.isPending}
												className="p-2 text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2] rounded-lg transition-all cursor-pointer bg-transparent border-none"
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
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
