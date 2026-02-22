"use client";

import { trpc } from "@/lib/trpc";
import { AlertTriangle, Megaphone, Info, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import clsx from "clsx";

export function SystemAnnouncements() {
	const { data: announcements } = trpc.public.getActiveAnnouncements.useQuery();
	const [dismissed, setDismissed] = useState<string[]>([]);

	const activeAnnouncements =
		announcements?.filter((a: any) => !dismissed.includes(a.id)) || [];

	if (activeAnnouncements.length === 0) return null;

	return (
		<div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-none space-y-2">
			<AnimatePresence>
				{activeAnnouncements.map((ann) => (
					<motion.div
						key={ann.id}
						initial={{ opacity: 0, y: -20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className={clsx(
							"pointer-events-auto flex items-center gap-4 p-4 rounded-2xl shadow-xl border backdrop-blur-md",
							ann.priority === "CRITICAL"
								? "bg-magenta-500/90 border-magenta-400 text-white"
								: ann.priority === "HIGH"
									? "bg-orange-500/90 border-orange-400 text-white"
									: "bg-zinc-900/90 border-zinc-700 text-white"
						)}
					>
						<div className="shrink-0">
							{ann.priority === "CRITICAL" ? (
								<AlertTriangle className="w-5 h-5" />
							) : ann.priority === "HIGH" ? (
								<AlertCircle className="w-5 h-5" />
							) : (
								<Megaphone className="w-5 h-5" />
							)}
						</div>
						<div className="flex-1 min-w-0">
							<h4 className="font-bold text-sm m-0 leading-tight">
								{ann.title}
							</h4>
							<p className="text-xs opacity-80 m-0 line-clamp-1">
								{ann.message}
							</p>
						</div>
						<button
							onClick={() => setDismissed([...dismissed, ann.id])}
							className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
						>
							<X className="w-4 h-4" />
						</button>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
