"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { TelekomLogo } from "@/components/telekom-logo";

export default function GlobalError({
	error,
	reset
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error("Global App Error:", error);
	}, [error]);

	return (
		<div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-sans">
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="max-w-[540px] w-full text-center space-y-8"
			>
				<div className="flex flex-col items-center">
					<TelekomLogo className="w-16 h-16 text-[#e20074] mb-8" />

					<div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
						<AlertCircle className="w-10 h-10 text-red-500" />
					</div>

					<h1 className="text-4xl font-extrabold text-[#1a1a2e] tracking-tight mb-4">
						Unerwarteter Fehler
					</h1>
					<p className="text-zinc-500 text-lg leading-relaxed">
						Ein technisches Problem ist aufgetreten. Wir entschuldigen uns für
						die Unannehmlichkeiten.
					</p>
				</div>

				<div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 text-left">
					<p className="text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest mb-2">
						Fehlermeldung
					</p>
					<code className="text-sm text-red-600 bg-red-50/50 p-3 rounded-xl block border border-red-100/50 break-words font-mono">
						{error.message || "An unknown error occurred."}
					</code>
					{error.digest && (
						<p className="text-[0.6rem] text-zinc-400 mt-2">
							Error ID: {error.digest}
						</p>
					)}
				</div>

				<div className="flex flex-col sm:flex-row gap-4 pt-4">
					<button
						onClick={() => reset()}
						className="flex-1 bg-magenta-500 hover:bg-magenta-600 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-xl shadow-magenta-500/25 flex items-center justify-center gap-2 cursor-pointer"
					>
						<RefreshCcw className="w-5 h-5" />
						Erneut versuchen
					</button>
					<Link
						href="/"
						className="flex-1 bg-zinc-900 hover:bg-black text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-xl shadow-zinc-900/20 flex items-center justify-center gap-2"
					>
						<Home className="w-5 h-5" />
						Zur Startseite
					</Link>
				</div>

				<div className="text-[0.75rem] font-medium text-[#c0c0c0] pt-12">
					&copy; {new Date().getFullYear()} Deutsche Telekom Service GmbH
				</div>
			</motion.div>
		</div>
	);
}
