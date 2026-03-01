"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Megaphone, Loader2, Search, Layers } from "lucide-react";
import clsx from "clsx";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Skeleton } from "@/components/shared/skeleton";
import Link from "next/link";
import { confirmDelete } from "@/components/shared/delete-confirm-toast";

const PRIORITY_COLORS: Record<string, string> = {
	INFO: "#00a878", // Green
	UPDATE: "#0090d0", // Blue
	IMPORTANT: "#ff6b00", // Orange
	CRITICAL: "#dc2626" // Red
};

const PRIORITY_LABELS: Record<string, string> = {
	INFO: "Info",
	UPDATE: "Update",
	IMPORTANT: "Wichtig",
	CRITICAL: "Kritisch"
};

export default function AdminNewsPage() {
	const utils = trpc.useContext();
	const { data: newsItems, isLoading } = trpc.admin.news.list.useQuery();

	const deleteNews = trpc.admin.news.delete.useMutation({
		onSuccess: async () => {
			await utils.admin.news.list.invalidate();
		}
	});

	const [searchQuery, setSearchQuery] = useState("");

	const filteredNews =
		newsItems?.filter(
			(n) =>
				n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				n.content.toLowerCase().includes(searchQuery.toLowerCase())
		) || [];

	if (isLoading) {
		return (
			<div>
				<div className="flex justify-between items-center mb-6">
					<div>
						<h1 className="text-[1.6rem] font-extrabold text-[#1a1a2e] tracking-tight mb-1">
							Neuigkeiten
						</h1>
						<p className="text-[0.85rem] text-[#999] m-0">
							Verwalte Mitteilungen für das Dashboard.
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
						Neuigkeiten
					</h1>
					<p className="text-[0.85rem] text-[#999] m-0">
						Verwalte Mitteilungen für das Dashboard.
					</p>
				</div>
				<Link
					href="/admin/news/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Neuigkeit erstellen
				</Link>
			</div>

			{/* Search */}
			<div className="flex flex-col md:flex-row gap-4 mb-6">
				<div className="relative flex-1">
					<Search className="w-4 h-4 text-[#bbb] absolute left-4 top-1/2 -translate-y-1/2" />
					<input
						type="text"
						placeholder="Neuigkeiten suchen..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
					/>
				</div>
			</div>

			<div className="bg-white rounded-2xl border border-[#eaedf0] overflow-hidden">
				{newsItems && newsItems.length === 0 ? (
					<div className="p-16 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Megaphone className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Neuigkeiten
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Es wurden noch keine Neuigkeiten erfasst.
						</p>
					</div>
				) : filteredNews.length === 0 && newsItems && newsItems.length > 0 ? (
					<div className="p-16 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Search className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Ergebnisse
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Es wurden keine Neuigkeiten für die aktuelle Suche gefunden.
						</p>
					</div>
				) : (
					<div className="flex flex-col">
						{filteredNews.map(
							(
								item: {
									id: string;
									title: string;
									content: string;
									priority: string;
									createdAt: Date | string;
								},
								i: number
							) => {
								const color =
									PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.INFO;
								return (
									<div
										key={item.id}
										className={clsx(
											"px-6 py-5 flex items-start justify-between group hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] relative z-0 hover:z-10 transition-all duration-300 gap-4",
											i < filteredNews.length - 1 && "border-b border-[#f0f0f0]"
										)}
									>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1.5">
												<span
													className="px-2 py-0.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider"
													style={{
														color: color,
														backgroundColor: `${color}15`
													}}
												>
													{PRIORITY_LABELS[item.priority]}
												</span>
												<span className="text-[0.7rem] text-[#aaa] font-medium">
													{format(
														new Date(item.createdAt),
														"dd. MMM yyyy - HH:mm",
														{
															locale: de
														}
													)}
												</span>
											</div>
											<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] m-0 mb-1.5">
												{item.title}
											</h3>
											<p className="text-[0.85rem] text-[#666] m-0 leading-relaxed max-w-[800px]">
												{item.content}
											</p>
										</div>
										<div className="flex items-center gap-1">
											<button
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													confirmDelete({
														id: item.id,
														name: item.title,
														onConfirm: () => deleteNews.mutate({ id: item.id })
													});
												}}
												disabled={deleteNews.isPending}
												className="p-2 text-[#aaa] hover:text-[#dc2626] hover:bg-[#fee2e2]/40 rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50"
												title="Löschen"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</div>
								);
							}
						)}
					</div>
				)}
			</div>
		</div>
	);
}
