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
	const utils = trpc.useContext();
	const { data: allProducts } = trpc.product.getAllProducts.useQuery();

	const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
	const { data: locations, isLoading: isLocationsLoading } =
		trpc.location.list.useQuery();

	const { data: teams, isLoading } = trpc.team.list.useQuery(
		selectedLocationId !== "all"
			? { locationId: selectedLocationId }
			: undefined
	);

	const deleteTeam = trpc.team.delete.useMutation({
		onSuccess: () => utils.team.list.invalidate()
	});
	const toggleFocus = trpc.team.toggleFocus.useMutation({
		onSuccess: () => utils.team.list.invalidate()
	});

	const [managingFocusTeamId, setManagingFocusTeamId] = useState<string | null>(
		null
	);
	const [activeTab, setActiveTab] = useState<
		"products" | "categories" | "businessCases"
	>("products");
	const [searchQuery, setSearchQuery] = useState(""); /* Used in modal */
	const [teamSearchQuery, setTeamSearchQuery] =
		useState(""); /* Used for teams list */

	const filteredTeams =
		teams?.filter((t) =>
			t.name.toLowerCase().includes(teamSearchQuery.toLowerCase())
		) || [];

	const filteredProducts =
		allProducts?.filter(
			(p) =>
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.category.toLowerCase().includes(searchQuery.toLowerCase())
		) || [];

	if (isLoading) {
		return (
			<div>
				<div className="flex justify-between items-center mb-6">
					<div>
						<h1 className="text-[1.6rem] font-extrabold text-[#1a1a2e] tracking-tight mb-1">
							Teams
						</h1>
						<p className="text-[0.85rem] text-[#999] m-0">
							Verwalte Teams und delegiere Fokus-Produkte.
						</p>
					</div>
					<Skeleton className="h-10 w-32 rounded-xl" />
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
						Teams
					</h1>
					<p className="text-[0.85rem] text-[#999] m-0">
						Verwalte Teams und delegiere Fokus-Produkte.
					</p>
				</div>
				<Link
					href="/admin/teams/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Team erstellen
				</Link>
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6">
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
						{locations?.map((loc) => (
							<option key={loc.id} value={loc.id}>
								{loc.name}
							</option>
						))}
					</select>
					<div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
						<svg
							width="12"
							height="8"
							viewBox="0 0 12 8"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
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

			<div className="bg-white rounded-2xl border border-[#eaedf0] overflow-hidden">
				{teams && teams.length === 0 ? (
					<div className="p-16 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Users className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Teams
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Es wurden noch keine Teams erfasst.
						</p>
					</div>
				) : filteredTeams.length === 0 && teams && teams.length > 0 ? (
					<div className="p-16 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Search className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Ergebnisse
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Es wurden keine Teams für die aktuelle Suche gefunden.
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
									Standort
								</th>
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right">
									Aktionen
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredTeams.map((team, i) => (
								<tr
									key={team.id}
									className={clsx(
										"border-b border-[#f0f0f0] last:border-b-0 group hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] relative z-0 hover:z-10 transition-all duration-300",
										i < filteredTeams.length - 1 && "border-b border-[#f0f0f0]"
									)}
								>
									<td className="py-3.5 px-5 text-[0.85rem] font-semibold text-[#1a1a2e]">
										<div className="flex items-center gap-2">
											{team.name}
											{team.highlights && team.highlights.length > 0 && (
												<span className="px-2 py-0.5 rounded-lg bg-[#ff6b00]/8 text-[#ff6b00] text-[0.65rem] font-semibold flex items-center gap-1">
													<Star className="w-3 h-3 fill-[#ff6b00]" />
													{team.highlights.length} Fokus
												</span>
											)}
										</div>
									</td>
									<td className="py-3.5 px-5 text-[0.8rem] text-[#666]">
										{(team as any).location?.name ? (
											<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f0f2f5] border border-[#eaedf0] text-[#1a1a2e] font-medium">
												<MapPin className="w-3 h-3 text-[#888]" />
												{(team as any).location.name}
											</span>
										) : (
											<span className="text-[#bbb] italic">Kein Standort</span>
										)}
									</td>
									<td className="py-3.5 px-5 text-right w-[180px]">
										<div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
											<Link
												href={`/admin/teams/${team.id}`}
												className="p-2 text-[#ccc] hover:text-[#0090d0] hover:bg-[#0090d0]/6 rounded-lg transition-all duration-150 cursor-pointer bg-transparent border-none inline-flex items-center justify-center"
												title="Team bearbeiten"
											>
												<Pencil className="w-4 h-4" />
											</Link>
											<button
												onClick={() => setManagingFocusTeamId(team.id)}
												className="p-2 text-[#ccc] hover:text-[#ff6b00] hover:bg-[#ff6b00]/6 rounded-lg transition-all duration-150 cursor-pointer bg-transparent border-none"
												title="Fokus-Produkte verwalten"
											>
												<Star className="w-4 h-4" />
											</button>
											<button
												onClick={() => {
													confirmDelete({
														id: team.id,
														name: team.name,
														onConfirm: () => deleteTeam.mutate({ id: team.id })
													});
												}}
												disabled={deleteTeam.isPending}
												className="p-2 text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2]/40 rounded-lg transition-all duration-150 cursor-pointer bg-transparent border-none disabled:opacity-50"
												title="Team löschen"
											>
												{deleteTeam.isPending ? (
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

			{/* Focus Management Modal */}
			{managingFocusTeamId && (
				<div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl shadow-xl border border-[#eaedf0] w-full max-w-2xl max-h-[80vh] flex flex-col">
						<div className="p-5 border-b border-[#eaedf0] flex justify-between items-center">
							<h3 className="font-bold text-[1rem] text-[#1a1a2e] m-0">
								Fokus-Produkte verwalten
							</h3>
							<button
								onClick={() => setManagingFocusTeamId(null)}
								className="text-[#ccc] hover:text-[#888] transition-colors cursor-pointer bg-transparent border-none"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="p-5 overflow-y-auto flex-1 bg-[#f7f8fa] flex flex-col gap-4">
							<div className="flex gap-2 bg-[#eaedf0]/60 p-1 rounded-xl w-fit">
								{[
									{ id: "products", label: "Tarife" },
									{ id: "categories", label: "Kategorien" },
									{ id: "businessCases", label: "Vertragsarten" }
								].map((tab) => (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id as any)}
										className={clsx(
											"px-4 py-1.5 rounded-lg text-[0.8rem] font-medium transition-all duration-200 cursor-pointer border-none",
											activeTab === tab.id
												? "bg-white text-[#1a1a2e] shadow-sm font-bold"
												: "bg-transparent text-[#888] hover:text-[#1a1a2e]"
										)}
									>
										{tab.label}
									</button>
								))}
							</div>

							<div className="flex-1 overflow-y-auto pr-1">
								{activeTab === "products" && (
									<div className="space-y-3">
										<div className="relative">
											<Search className="absolute left-3.5 top-[10px] w-4 h-4 text-[#aaa]" />
											<input
												type="text"
												placeholder="Tarife suchen..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												className="w-full pl-10 pr-4 py-2 bg-white border border-[#eaedf0] rounded-xl focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
											/>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
											{filteredProducts.map((product) => {
												const team = teams?.find(
													(t) => t.id === managingFocusTeamId
												);
												const isFocused = team?.highlights.some(
													(h) => h.productId === product.id
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
															"p-3.5 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-3 cursor-pointer bg-white group hover:border-[#ddd]",
															isFocused
																? "border-[#e20074] bg-[#e20074]/2"
																: "border-[#eaedf0]"
														)}
													>
														<div
															className={clsx(
																"mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
																isFocused
																	? "bg-[#e20074] border-[#e20074] text-white"
																	: "border-[#ddd]"
															)}
														>
															{isFocused && (
																<Star className="w-3 h-3 fill-current" />
															)}
														</div>
														<div>
															<div className="text-[0.82rem] font-semibold text-[#1a1a2e]">
																{product.name}
															</div>
															<div className="text-[0.68rem] text-[#bbb] mt-0.5 font-medium uppercase tracking-wider">
																{CATEGORIES.find(
																	(c) => c.id === product.category
																)?.label || product.category}
															</div>
														</div>
													</button>
												);
											})}
											{filteredProducts.length === 0 && (
												<div className="col-span-full p-8 text-center text-[#aaa] text-[0.85rem] bg-white rounded-xl border border-[#eaedf0]">
													Keine Tarife gefunden.
												</div>
											)}
										</div>
									</div>
								)}

								{activeTab === "categories" && (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
										{CATEGORIES.map((category) => {
											const team = teams?.find(
												(t) => t.id === managingFocusTeamId
											);
											const isFocused = team?.highlights.some(
												(h) => h.category === category.id
											);

											return (
												<button
													key={category.id}
													onClick={() =>
														toggleFocus.mutate({
															teamId: managingFocusTeamId,
															category: category.id
														})
													}
													className={clsx(
														"p-3.5 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 cursor-pointer bg-white group hover:border-[#ddd]",
														isFocused
															? "border-[#e20074] bg-[#e20074]/2"
															: "border-[#eaedf0]"
													)}
												>
													<div
														className={clsx(
															"w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200",
															isFocused
																? "bg-[#e20074] border-[#e20074] text-white"
																: "border-[#ddd]"
														)}
													>
														{isFocused && (
															<Star className="w-3 h-3 fill-current" />
														)}
													</div>
													<div className="flex items-center gap-2">
														<Tag className="w-3.5 h-3.5 text-[#aaa]" />
														<div className="text-[0.85rem] font-semibold text-[#1a1a2e]">
															{category.label}
														</div>
													</div>
												</button>
											);
										})}
									</div>
								)}

								{activeTab === "businessCases" && (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
										{BUSINESS_CASES.map((bc) => {
											const team = teams?.find(
												(t) => t.id === managingFocusTeamId
											);
											const isFocused = team?.highlights.some(
												(h) => h.businessCase === bc.id
											);

											return (
												<button
													key={bc.id}
													onClick={() =>
														toggleFocus.mutate({
															teamId: managingFocusTeamId,
															businessCase: bc.id
														})
													}
													className={clsx(
														"p-3.5 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 cursor-pointer bg-white group hover:border-[#ddd]",
														isFocused
															? "border-[#e20074] bg-[#e20074]/2"
															: "border-[#eaedf0]"
													)}
												>
													<div
														className={clsx(
															"w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200",
															isFocused
																? "bg-[#e20074] border-[#e20074] text-white"
																: "border-[#ddd]"
														)}
													>
														{isFocused && (
															<Star className="w-3 h-3 fill-current" />
														)}
													</div>
													<div className="flex items-center gap-2">
														<Briefcase className="w-3.5 h-3.5 text-[#aaa]" />
														<div className="text-[0.85rem] font-semibold text-[#1a1a2e]">
															{bc.label}
														</div>
													</div>
												</button>
											);
										})}
									</div>
								)}
							</div>
						</div>

						<div className="p-5 border-t border-[#eaedf0] flex justify-end">
							<button
								onClick={() => setManagingFocusTeamId(null)}
								className="px-5 py-2.5 bg-[#1a1a2e] text-white rounded-xl font-semibold text-[0.82rem] hover:bg-[#2a2a3e] active:scale-95 transition-all outline-none border-none cursor-pointer"
							>
								Fertig
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
