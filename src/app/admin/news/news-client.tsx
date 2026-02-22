"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Megaphone, Loader2 } from "lucide-react";
import clsx from "clsx";
import { format } from "date-fns";
import { de } from "date-fns/locale";

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

	const createNews = trpc.admin.news.create.useMutation({
		onSuccess: () => {
			setNewTitle("");
			setNewContent("");
			setNewPriority("INFO");
			utils.admin.news.list.invalidate();
		}
	});

	const deleteNews = trpc.admin.news.delete.useMutation({
		onSuccess: async () => {
			await utils.admin.news.list.invalidate();
			alert("Neuigkeit erfolgreich gelöscht.");
		},
		onError: (err) => {
			alert("Fehler beim Löschen: " + err.message);
		}
	});

	const [newTitle, setNewTitle] = useState("");
	const [newContent, setNewContent] = useState("");
	const [newPriority, setNewPriority] = useState<
		"INFO" | "UPDATE" | "IMPORTANT" | "CRITICAL"
	>("INFO");

	const handleCreate = () => {
		if (!newTitle.trim() || !newContent.trim()) return;
		createNews.mutate({
			title: newTitle,
			content: newContent,
			priority: newPriority
		});
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-[1.6rem] font-extrabold text-[#1a1a2e] tracking-tight mb-1">
					Neuigkeiten verwalten
				</h1>
				<p className="text-[0.85rem] text-[#999] m-0">
					Erstelle Mitteilungen für das Dashboard.
				</p>
			</div>

			{/* Create News */}
			<div className="bg-white p-5 rounded-2xl border border-[#eaedf0]">
				<div className="grid grid-cols-1 gap-4 mb-4">
					<div className="space-y-1.5">
						<label className="text-[0.75rem] font-semibold text-[#888]">
							Titel
						</label>
						<input
							type="text"
							value={newTitle}
							onChange={(e) => setNewTitle(e.target.value)}
							placeholder="z.B. Wartungsarbeiten am Wochenende"
							className="w-full px-4 py-2.5 border border-[#eaedf0] rounded-xl focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
						/>
					</div>

					<div className="space-y-1.5">
						<label className="text-[0.75rem] font-semibold text-[#888]">
							Inhalt
						</label>
						<textarea
							value={newContent}
							onChange={(e) => setNewContent(e.target.value)}
							placeholder="Kurze Beschreibung..."
							className="w-full px-4 py-2.5 border border-[#eaedf0] rounded-xl focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem] resize-none h-20"
						/>
					</div>

					<div className="space-y-1.5">
						<label className="text-[0.75rem] font-semibold text-[#888]">
							Wichtigkeitsstufe
						</label>
						<div className="flex flex-wrap gap-2">
							{(["INFO", "UPDATE", "IMPORTANT", "CRITICAL"] as const).map(
								(p) => {
									const color = PRIORITY_COLORS[p];
									const isSelected = newPriority === p;
									return (
										<button
											key={p}
											onClick={() => setNewPriority(p)}
											className={clsx(
												"px-4 py-2 rounded-xl text-[0.75rem] font-semibold transition-all duration-200 border-2 cursor-pointer",
												isSelected
													? "border-transparent text-white"
													: "bg-transparent hover:bg-black/5"
											)}
											style={{
												backgroundColor: isSelected ? color : "transparent",
												borderColor: isSelected ? color : "#eaedf0",
												color: isSelected ? "#fff" : color
											}}
										>
											{PRIORITY_LABELS[p]}
										</button>
									);
								}
							)}
						</div>
					</div>
				</div>

				<div className="flex justify-end">
					<button
						onClick={handleCreate}
						disabled={
							createNews.isPending || !newTitle.trim() || !newContent.trim()
						}
						className={clsx(
							"px-5 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 transition-all duration-200 text-[0.82rem] cursor-pointer",
							createNews.isPending || !newTitle.trim() || !newContent.trim()
								? "bg-[#ddd] cursor-not-allowed"
								: "bg-[#e20074] hover:bg-[#c70066]"
						)}
					>
						{createNews.isPending ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Plus className="w-4 h-4" />
						)}
						Neuigkeit veröffentlichen
					</button>
				</div>
			</div>

			{/* News List */}
			<div className="bg-white rounded-2xl border border-[#eaedf0] overflow-hidden">
				<div className="px-5 py-3.5 border-b border-[#eaedf0] flex justify-between items-center">
					<h2 className="text-[0.88rem] font-bold text-[#1a1a2e] flex items-center gap-2 m-0">
						<Megaphone className="w-4 h-4 text-[#bbb]" />
						Veröffentlichte Neuigkeiten
					</h2>
					<span className="text-[0.65rem] font-semibold text-[#999] bg-[#f7f8fa] px-2.5 py-1 rounded-full">
						{newsItems?.length || 0}
					</span>
				</div>

				{isLoading ? (
					<div className="p-10 text-center text-[0.85rem] text-[#ccc]">
						Lade Neuigkeiten...
					</div>
				) : newsItems && newsItems.length > 0 ? (
					<div>
						{newsItems.map(
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
											"px-5 py-4 flex items-start justify-between group hover:bg-[#f7f8fa] transition-colors gap-4",
											i < newsItems.length - 1 && "border-b border-[#f0f0f0]"
										)}
									>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
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
											<h3 className="text-[0.9rem] font-bold text-[#1a1a2e] m-0 mb-1">
												{item.title}
											</h3>
											<p className="text-[0.8rem] text-[#666] m-0 leading-relaxed">
												{item.content}
											</p>
										</div>
										<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
											<DeleteButton
												onConfirm={() => deleteNews.mutate({ id: item.id })}
											/>
										</div>
									</div>
								);
							}
						)}
					</div>
				) : (
					<div className="p-10 text-center text-[0.85rem] text-[#ccc]">
						Keine Neuigkeiten vorhanden.
					</div>
				)}
			</div>
		</div>
	);
}

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
	const [confirmMode, setConfirmMode] = useState(false);

	return (
		<button
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				if (confirmMode) {
					onConfirm();
					setConfirmMode(false);
				} else {
					setConfirmMode(true);
					setTimeout(() => setConfirmMode(false), 3000);
				}
			}}
			className={clsx(
				"p-2 rounded-lg transition-all duration-150 cursor-pointer border-none flex items-center gap-1 text-[0.75rem] font-bold relative z-10",
				confirmMode
					? "bg-[#dc2626] text-white hover:bg-[#b91c1c] shadow-md"
					: "bg-transparent text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2]/40"
			)}
			title={confirmMode ? "Tatsächlich löschen?" : "Neuigkeit löschen"}
		>
			<Trash2 className="w-4 h-4" />
			{confirmMode && "Sicher?"}
		</button>
	);
}
