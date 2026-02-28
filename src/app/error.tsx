"use client";

import { useEffect } from "react";
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
		<div className="min-h-screen py-16 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074]">
			<div className="max-w-3xl mx-auto">
				{/* Header */}
				<div className="flex flex-col items-center mb-12 text-center">
					<TelekomLogo className="w-12 h-12 text-[#e20074] mb-8" />
					<h1 className="text-3xl font-extrabold text-[#1a1a2e] tracking-tight mb-4 lowercase">
						unerwarteter fehler
					</h1>
					<p className="text-[#888] font-medium max-w-xl">
						Ein technisches Problem ist aufgetreten. Wir entschuldigen uns für
						die Unannehmlichkeiten.
					</p>
				</div>

				{/* Content Card */}
				<div className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] p-8 sm:p-12">
					<div className="flex flex-col items-center text-center mb-10">
						<div className="w-20 h-20 bg-[#fdf2f8] border border-[#fbcfe8] rounded-3xl flex items-center justify-center mb-8 shadow-sm">
							<AlertCircle className="w-10 h-10 text-[#e20074]" />
						</div>

						<h2 className="text-[1.8rem] font-extrabold text-[#1a1a2e] mb-4 tracking-tight">
							Etwas ist schiefgelaufen.
						</h2>
						<p className="text-[1rem] text-[#888] leading-relaxed max-w-[480px]">
							Der Server konnte die Anfrage nicht ordnungsgemäß verarbeiten.
							Falls das Problem weiterhin besteht, kontaktiere bitte den
							technischen Support.
						</p>
					</div>

					{/* Error Details */}
					<div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl p-6 mb-12 text-left overflow-hidden">
						<p className="text-[0.7rem] font-bold text-[#b0b0b0] uppercase tracking-widest pl-1 font-sans mb-3">
							Technische Details
						</p>
						<code className="text-[0.85rem] text-red-600 bg-red-50 p-4 rounded-xl block border border-red-100 wrap-break-word font-mono shadow-inner leading-relaxed">
							{error.message || "An unknown error occurred."}
						</code>
						{error.digest && (
							<p className="text-[0.75rem] text-[#aaa] mt-3 pl-1">
								Error ID: <span className="font-mono">{error.digest}</span>
							</p>
						)}
					</div>

					{/* Actions */}
					<div className="pt-8 border-t border-[#eaedf0] w-full flex flex-col sm:flex-row gap-4">
						<button
							onClick={() => reset()}
							className="flex-1 h-[56px] text-[#1a1a2e] bg-[#f7f8fa] hover:bg-[#eaedf0] border border-[#eaedf0] rounded-2xl font-bold transition-all duration-200 flex items-center justify-center gap-2 outline-none cursor-pointer active:scale-95"
						>
							<RefreshCcw className="w-4 h-4 text-[#888]" />
							<span>Wiederholen</span>
						</button>

						<Link
							href="/setup"
							className="flex-[1.5] h-[56px] bg-[#e20074] hover:bg-[#c70066] text-white rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 outline-none shadow-[0_8px_20px_-6px_rgba(226,0,116,0.25)] hover:shadow-[0_12px_25px_-8px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
						>
							<Home className="w-4 h-4 opacity-90" />
							<span>Zur Startseite</span>
						</Link>
					</div>
				</div>

				<div className="mt-8 text-center text-[0.75rem] font-medium text-[#bbb]">
					&copy; {new Date().getFullYear()} Felix Kinze für Deutsche Telekom
					Service GmbH &bull; Sales Experience
				</div>
			</div>
		</div>
	);
}
