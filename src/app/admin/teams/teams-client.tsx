"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
	Users,
	Trash2,
	Plus,
	Loader2,
	Star,
	X,
	Tag,
	Briefcase,
	Pencil,
	MapPin,
	Search
} from "lucide-react";
import clsx from "clsx";
import { Skeleton } from "@/components/shared/skeleton";
import Link from "next/link";
import { confirmDelete } from "@/components/shared/delete-confirm-toast";
import { AdminPageHeader } from "@/components/shared/ui/admin-ui";

const CATEGORIES = [
	{ id: "MOBILE", label: "Mobilfunk" },
	{ id: "FIBER", label: "Glasfaser" },
	{ id: "DSL", label: "Festnetz" },
	{ id: "MAGENTA_TV_OTT", label: "MagentaTV" },
	{ id: "DEVICE", label: "Gerät" },
	{ id: "ADDON", label: "Option" }
];

const BUSINESS_CASES = [
	{ id: "NEW_ACTIVATION", label: "Neubereitstellung" },
	{ id: "MOVE", label: "Umzug" },
	{ id: "PLAN_CHANGE", label: "Tarifwechsel" },
	{ id: "SPEED_UP", label: "SpeedUp" }
];

export default function TeamsPage() {
	const utils = trpc.useUtils();
	const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
	const [teamSearchQuery, setTeamSearchQuery] =
		useState(""); /* Used for teams list */
	const [searchQuery, setSearchQuery] = useState(""); /* Used in modal */
	const [managingFocusTeamId, setManagingFocusTeamId] = useState<string | null>(
		null
	);
	const [activeTab, setActiveTab] = useState<
		"products" | "categories" | "businessCases"
	>("products");

	const { data: locations, isLoading: isLocationsLoading } =
		trpc.location.list.useQuery();

	const {
		data: teamsData,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage
	} = trpc.team.list.useInfiniteQuery(
		{
			limit: 20,
			search: teamSearchQuery || undefined,
			locationId: selectedLocationId !== "all" ? selectedLocationId : undefined
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor
		}
	);

	const {
		data: productsData,
		isLoading: isProductsLoading,
		fetchNextPage: fetchNextProducts,
		hasNextPage: hasNextProducts,
		isFetchingNextPage: isFetchingNextProducts
	} = trpc.product.getAllProducts.useInfiniteQuery(
		{
			limit: 20,
			search: searchQuery || undefined
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			enabled: managingFocusTeamId !== null && activeTab === "products"
		}
	);

	const deleteTeam = trpc.team.delete.useMutation({
		onSuccess: () => utils.team.list.invalidate()
	});
	const toggleFocus = trpc.team.toggleFocus.useMutation({
		onSuccess: () => utils.team.list.invalidate()
	});

	const teams = teamsData?.pages.flatMap((page) => page.items) || [];
	const products = productsData?.pages.flatMap((page) => page.items) || [];

	return (
		<div className="space-y-6 pb-20">
			<div className="flex justify-between items-center">
				<AdminPageHeader
					title="Teams"
					subtitle="Verwalte Teams und delegiere Fokus-Produkte."
					backHref="/admin"
				/>
				<Link
					href="/admin/teams/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Team erstellen
				</Link>
			</div>

			<div className="flex flex-col md:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="w-4 h-4 text-[#bbb] absolute left-4 top-1/2 -translate-y-1/2" />
					<input
						type="text"
						placeholder="Team suchen..."
						value={teamSearchQuery}
						onChange={(e) => setTeamSearchQuery(e.target.value)}
						className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
					/>
				</div>
				<div className="w-full md:w-[250px] relative">
					<select
						value={selectedLocationId}
						onChange={(e) => setSelectedLocationId(e.target.value)}
						disabled={isLocationsLoading}
						className="w-full pl-4 pr-10 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem] appearance-none disabled:opacity-50"
					>
						<option value="all">Alle Standorte</option>
						{locations?.items?.map((loc: any) => (
							<option key={loc.id} value={loc.id}>
								{loc.name}
							</option>
						))}
					</select>
					<div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
						<svg width="12" height="8" viewBox="0 0 12 8" fill="none">
							<path
								d="M1.5 1.75L6 6.25L10.5 1.75"
								stroke="#bbb"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-3xl border border-[#eaedf0] overflow-hidden shadow-sm">
				{isLoading && teams.length === 0 ? (
					<div className="flex flex-col gap-3 p-5">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="h-14 w-full rounded-xl" />
						))}
					</div>
				) : teams.length === 0 ? (
					<div className="p-20 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Users className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1.1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Teams
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Es wurden keine Teams für deine Suche gefunden.
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead>
								<tr className="border-b border-[#eaedf0] bg-[#fcfcfd]">
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Team
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Standort
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right">
										Aktionen
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#f0f0f0]">
								{teams.map(
									(team: {
										id: string;
										name: string;
										highlights: { productId: string | null }[];
										location: { name: string } | null;
									}) => (
										<tr
											key={team.id}
											className="hover:bg-[#fcfcfd] transition-colors group"
										>
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<span className="text-[0.95rem] font-bold text-[#1a1a2e]">
														{team.name}
													</span>
													{team.highlights && team.highlights.length > 0 && (
														<span className="px-2 py-0.5 rounded-lg bg-[#ff6b00]/5 border border-[#ff6b00]/10 text-[#ff6b00] text-[0.65rem] font-bold flex items-center gap-1">
															<Star className="w-3 h-3 fill-[#ff6b00]" />
															{team.highlights.length} Fokus
														</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												{team.location ? (
													<div className="flex items-center gap-1.5 text-[0.85rem] text-[#666]">
														<MapPin className="w-3.5 h-3.5" />
														{team.location.name}
													</div>
												) : (
													<span className="text-[#bbb] italic text-[0.8rem]">
														Kein Standort
													</span>
												)}
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
													<Link
														href={`/admin/teams/${team.id}`}
														className="p-2 text-[#ccc] hover:text-[#0090d0] hover:bg-[#0090d0]/10 rounded-lg transition-all"
													>
														<Pencil className="w-4 h-4" />
													</Link>
													<button
														onClick={() => setManagingFocusTeamId(team.id)}
														className="p-2 text-[#ccc] hover:text-[#ff6b00] hover:bg-[#ff6b00]/10 rounded-lg transition-all"
													>
														<Star className="w-4 h-4" />
													</button>
													<button
														onClick={() =>
															confirmDelete({
																id: team.id,
																name: team.name,
																onConfirm: () =>
																	deleteTeam.mutate({ id: team.id })
															})
														}
														className="p-2 text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2] rounded-lg transition-all cursor-pointer border-none bg-transparent"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</td>
										</tr>
									)
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
							className="flex items-center gap-2 bg-white hover:bg-[#f7f8fa] text-[#1a1a2e] px-8 py-3 rounded-2xl font-bold transition-all border border-[#eaedf0] shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-[0.82rem]"
						>
							{isFetchingNextPage ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : (
								<Plus className="w-5 h-5" />
							)}
							{isFetchingNextPage ? "Wird geladen..." : "Mehr laden"}
						</button>
					</div>
				)}
			</div>

			{/* Focus Management Modal */}
			{managingFocusTeamId && (
				<div className="fixed inset-0 bg-[#000000]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-[2rem] shadow-2xl border border-white/50 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
						<div className="p-6 border-b border-[#eaedf0] flex justify-between items-center bg-white">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-[#ff6b00]/10 flex items-center justify-center text-[#ff6b00]">
									<Star className="w-5 h-5 fill-current" />
								</div>
								<div>
									<h3 className="font-bold text-[1.1rem] text-[#1a1a2e] m-0">
										Fokus-Produkte
									</h3>
									<p className="text-[0.75rem] text-[#999] m-0">
										Delegiere verkaufsschwerpunkte.
									</p>
								</div>
							</div>
							<button
								onClick={() => setManagingFocusTeamId(null)}
								className="p-2 bg-[#f7f8fa] text-[#bbb] hover:text-[#666] transition-all rounded-full border-none cursor-pointer"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="p-6 overflow-y-auto flex-1 bg-[#fcfcfd] flex flex-col gap-6">
							<div className="flex gap-2 bg-[#f0f2f5] p-1.5 rounded-2xl w-fit self-center">
								{[
									{ id: "products", label: "Tarife" },
									{ id: "categories", label: "Kategorien" },
									{ id: "businessCases", label: "Vertragsarten" }
								].map((tab) => (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id as any)}
										className={clsx(
											"px-6 py-2 rounded-xl text-[0.85rem] font-bold transition-all duration-200 cursor-pointer border-none",
											activeTab === tab.id
												? "bg-white text-[#1a1a2e] shadow-md"
												: "bg-transparent text-[#999] hover:text-[#666]"
										)}
									>
										{tab.label}
									</button>
								))}
							</div>

							<div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
								{activeTab === "products" && (
									<div className="space-y-4">
										<div className="relative">
											<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa]" />
											<input
												type="text"
												placeholder="Tarife suchen..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												className="w-full pl-11 pr-4 py-3 bg-white border border-[#eaedf0] rounded-2xl focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_4px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
											/>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
											{products.map((product) => {
												const team = teams.find(
													(t) => t.id === managingFocusTeamId
												);
												const isFocused = team?.highlights.some(
													(h: any) => h.productId === product.id
												);

												return (
													<button
														key={product.id}
														onClick={() =>
															toggleFocus.mutate({
																teamId: managingFocusTeamId,
																productId: product.id
															})
														}
														className={clsx(
															"p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-start gap-4 cursor-pointer bg-white group",
															isFocused
																? "border-[#e20074] bg-[#e20074]/2 shadow-sm shadow-[#e20074]/10"
																: "border-[#eaedf0] hover:border-[#ddd]"
														)}
													>
														<div
															className={clsx(
																"mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
																isFocused
																	? "bg-[#e20074] border-[#e20074] text-white shadow-md shadow-[#e20074]/20"
																	: "border-[#eaedf0] bg-[#fcfcfd]"
															)}
														>
															{isFocused && (
																<Star className="w-3.5 h-3.5 fill-current" />
															)}
														</div>
														<div className="flex-1 min-w-0">
															<div className="text-[0.9rem] font-bold text-[#1a1a2e] truncate">
																{product.name}
															</div>
															<div className="text-[0.7rem] text-[#999] mt-0.5 font-bold uppercase tracking-wider">
																{CATEGORIES.find(
																	(c) => c.id === product.category
																)?.label || product.category}
															</div>
														</div>
													</button>
												);
											})}
											{isProductsLoading && (
												<div className="col-span-full py-4 text-center text-[#999]">
													Wird geladen...
												</div>
											)}
											{!isProductsLoading && products.length === 0 && (
												<div className="col-span-full py-12 text-center text-[#999] bg-white rounded-2xl border border-dashed border-[#eaedf0]">
													Keine Tarife gefunden.
												</div>
											)}
											{hasNextProducts && (
												<div className="col-span-full py-4 flex justify-center">
													<button
														onClick={() => fetchNextProducts()}
														disabled={isFetchingNextProducts}
														className="text-[0.8rem] font-bold text-[#e20074] hover:underline bg-transparent border-none cursor-pointer flex items-center gap-2"
													>
														{isFetchingNextProducts ? (
															<Loader2 className="w-3.5 h-3.5 animate-spin" />
														) : (
															<Plus className="w-3.5 h-3.5" />
														)}
														Mehr laden
													</button>
												</div>
											)}
										</div>
									</div>
								)}

								{activeTab === "categories" && (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										{CATEGORIES.map((category) => {
											const team = teams.find(
												(t) => t.id === managingFocusTeamId
											);
											const isFocused = team?.highlights.some(
												(h: any) => h.category === category.id
											);
											return (
												<button
													key={category.id}
													onClick={() =>
														toggleFocus.mutate({
															teamId: managingFocusTeamId,
															category: category.id as any
														})
													}
													className={clsx(
														"p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-start gap-4 cursor-pointer bg-white group",
														isFocused
															? "border-[#e20074] bg-[#e20074]/2 shadow-sm shadow-[#e20074]/10"
															: "border-[#eaedf0] hover:border-[#ddd]"
													)}
												>
													<div
														className={clsx(
															"mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
															isFocused
																? "bg-[#e20074] border-[#e20074] text-white shadow-md shadow-[#e20074]/20"
																: "border-[#eaedf0] bg-[#fcfcfd]"
														)}
													>
														{isFocused && (
															<Star className="w-3.5 h-3.5 fill-current" />
														)}
													</div>
													<div className="flex-1">
														<div className="text-[0.9rem] font-bold text-[#1a1a2e]">
															{category.label}
														</div>
														<div className="text-[0.7rem] text-[#999] mt-0.5 font-bold uppercase tracking-wider">
															Kategorie
														</div>
													</div>
												</button>
											);
										})}
									</div>
								)}

								{activeTab === "businessCases" && (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										{BUSINESS_CASES.map((bc) => {
											const team = teams.find(
												(t) => t.id === managingFocusTeamId
											);
											const isFocused = team?.highlights.some(
												(h: any) => h.businessCase === bc.id
											);
											return (
												<button
													key={bc.id}
													onClick={() =>
														toggleFocus.mutate({
															teamId: managingFocusTeamId,
															businessCase: bc.id as any
														})
													}
													className={clsx(
														"p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-start gap-4 cursor-pointer bg-white group",
														isFocused
															? "border-[#e20074] bg-[#e20074]/2 shadow-sm shadow-[#e20074]/10"
															: "border-[#eaedf0] hover:border-[#ddd]"
													)}
												>
													<div
														className={clsx(
															"mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
															isFocused
																? "bg-[#e20074] border-[#e20074] text-white shadow-md shadow-[#e20074]/20"
																: "border-[#eaedf0] bg-[#fcfcfd]"
														)}
													>
														{isFocused && (
															<Star className="w-3.5 h-3.5 fill-current" />
														)}
													</div>
													<div className="flex-1">
														<div className="text-[0.9rem] font-bold text-[#1a1a2e]">
															{bc.label}
														</div>
														<div className="text-[0.7rem] text-[#999] mt-0.5 font-bold uppercase tracking-wider">
															Vertragsart
														</div>
													</div>
												</button>
											);
										})}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
