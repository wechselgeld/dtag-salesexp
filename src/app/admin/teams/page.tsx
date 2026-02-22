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
	Search,
	Tag,
	Briefcase
} from "lucide-react";
import clsx from "clsx";

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
	const { data: teams, isLoading } = trpc.team.list.useQuery();

	const createTeam = trpc.team.create.useMutation({
		onSuccess: () => {
			setNewTeamName("");
			utils.team.list.invalidate();
		}
	});
	const deleteTeam = trpc.team.delete.useMutation({
		onSuccess: () => utils.team.list.invalidate()
	});
	const toggleFocus = trpc.team.toggleFocus.useMutation({
		onSuccess: () => utils.team.list.invalidate()
	});

	const [newTeamName, setNewTeamName] = useState("");
	const [managingFocusTeamId, setManagingFocusTeamId] = useState<string | null>(
		null
	);
	const [activeTab, setActiveTab] = useState<
		"products" | "categories" | "businessCases"
	>("products");
	const [searchQuery, setSearchQuery] = useState("");

	const filteredProducts =
		allProducts?.filter(
			(p) =>
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.category.toLowerCase().includes(searchQuery.toLowerCase())
		) || [];

	const handleCreate = () => {
		if (!newTeamName.trim()) return;
		createTeam.mutate({ name: newTeamName });
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-[1.6rem] font-extrabold text-[#1a1a2e] tracking-tight mb-1">
					Teams verwalten
				</h1>
				<p className="text-[0.85rem] text-[#999] m-0">
					Erstellen Sie Teams und legen Sie Fokus-Produkte fest.
				</p>
			</div>

			{/* Create Team */}
			<div className="bg-white p-5 rounded-2xl border border-[#eaedf0] flex items-end gap-3 max-w-xl">
				<div className="flex-1 space-y-1.5">
					<label className="text-[0.75rem] font-semibold text-[#888]">
						Neues Team erstellen
					</label>
					<input
						type="text"
						value={newTeamName}
						onChange={(e) => setNewTeamName(e.target.value)}
						placeholder="z.B. Team Berlin Süd"
						className="w-full px-4 py-2.5 border border-[#eaedf0] rounded-xl focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
						onKeyDown={(e) => e.key === "Enter" && handleCreate()}
					/>
				</div>
				<button
					onClick={handleCreate}
					disabled={createTeam.isPending || !newTeamName.trim()}
					className={clsx(
						"px-4 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 transition-all duration-200 text-[0.82rem] cursor-pointer",
						createTeam.isPending || !newTeamName.trim()
							? "bg-[#ddd] cursor-not-allowed"
							: "bg-[#e20074] hover:bg-[#c70066]"
					)}
				>
					{createTeam.isPending ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						<Plus className="w-4 h-4" />
					)}
					Anlegen
				</button>
			</div>

			{/* Teams List */}
			<div className="bg-white rounded-2xl border border-[#eaedf0] overflow-hidden max-w-3xl">
				<div className="px-5 py-3.5 border-b border-[#eaedf0] flex justify-between items-center">
					<h2 className="text-[0.88rem] font-bold text-[#1a1a2e] flex items-center gap-2 m-0">
						<Users className="w-4 h-4 text-[#bbb]" />
						Vorhandene Teams
					</h2>
					<span className="text-[0.65rem] font-semibold text-[#999] bg-[#f7f8fa] px-2.5 py-1 rounded-full">
						{teams?.length || 0}
					</span>
				</div>

				{isLoading ? (
					<div className="p-10 text-center text-[0.85rem] text-[#ccc]">
						Lade Teams...
					</div>
				) : teams && teams.length > 0 ? (
					<div>
						{teams.map((team, i) => (
							<div
								key={team.id}
								className={clsx(
									"px-5 py-3.5 flex items-center justify-between group hover:bg-[#f7f8fa] transition-colors",
									i < teams.length - 1 && "border-b border-[#f0f0f0]"
								)}
							>
								<div>
									<div className="text-[0.85rem] font-semibold text-[#1a1a2e] flex items-center gap-2">
										{team.name}
										{team.highlights && team.highlights.length > 0 && (
											<span className="px-2 py-0.5 rounded-lg bg-[#ff6b00]/[0.08] text-[#ff6b00] text-[0.65rem] font-semibold flex items-center gap-1">
												<Star className="w-3 h-3 fill-[#ff6b00]" />
												{team.highlights.length} Fokus
											</span>
										)}
									</div>
								</div>
								<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									<button
										onClick={() => setManagingFocusTeamId(team.id)}
										className="p-2 text-[#ccc] hover:text-[#ff6b00] hover:bg-[#ff6b00]/[0.06] rounded-lg transition-all duration-150 cursor-pointer bg-transparent border-none"
										title="Fokus-Produkte verwalten"
									>
										<Star className="w-4 h-4" />
									</button>
									<button
										onClick={() => deleteTeam.mutate({ id: team.id })}
										disabled={deleteTeam.isPending}
										className="p-2 text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2]/40 rounded-lg transition-all duration-150 cursor-pointer bg-transparent border-none"
										title="Team löschen"
									>
										{deleteTeam.isPending ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											<Trash2 className="w-4 h-4" />
										)}
									</button>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="p-10 text-center text-[0.85rem] text-[#ccc]">
						Noch keine Teams angelegt.
					</div>
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

							<div className="flex-1 overflow-y-auto">
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
															"p-3.5 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-3 cursor-pointer bg-white",
															isFocused
																? "border-[#e20074] bg-[#e20074]/2"
																: "border-[#eaedf0] hover:border-[#ddd]"
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
															<div className="text-[0.68rem] text-[#bbb] mt-0.5">
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
														"p-3.5 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 cursor-pointer bg-white",
														isFocused
															? "border-[#e20074] bg-[#e20074]/2"
															: "border-[#eaedf0] hover:border-[#ddd]"
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
														"p-3.5 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 cursor-pointer bg-white",
														isFocused
															? "border-[#e20074] bg-[#e20074]/2"
															: "border-[#eaedf0] hover:border-[#ddd]"
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
								className="px-5 py-2.5 bg-[#1a1a2e] text-white rounded-xl font-semibold text-[0.82rem] hover:bg-[#2a2a3e] transition-all duration-200 cursor-pointer border-none"
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
