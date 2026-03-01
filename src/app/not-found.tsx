"use client";

import Link from "next/link";
import { TelekomLogo } from "@/components/shared/telekom-logo";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
	return (
		<div className="min-h-screen py-16 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074]">
			<div className="max-w-3xl mx-auto">
				{/* Header */}
				<div className="flex flex-col items-center mb-12 text-center">
					<TelekomLogo className="w-12 h-12 text-[#e20074] mb-8" />
					<h1 className="text-3xl font-extrabold text-[#1a1a2e] tracking-tight mb-4 lowercase">
						404
					</h1>
					<p className="text-[#888] font-medium max-w-xl">
						Huch! Da sind wir wohl falsch abgebogen.
					</p>
				</div>

				{/* Content Card */}
				<div className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] p-8 sm:p-12 flex flex-col items-center text-center">
					<h2 className="text-[1.8rem] font-extrabold text-[#1a1a2e] mb-4 tracking-tight">
						Diese Seite existiert leider nicht.
					</h2>
					<p className="text-[1rem] text-[#888] leading-relaxed max-w-[420px] mb-12">
						Die von Dir gesuchte Adresse wurde möglicherweise gelöscht,
						umbenannt oder ist nur vorübergehend nicht erreichbar.
					</p>

					<div className="pt-8 border-t border-[#eaedf0] w-full flex justify-center">
						<Link
							href="/"
							className="inline-flex items-center justify-center px-8 py-4 bg-[#e20074] hover:bg-[#c70066] text-white font-bold rounded-2xl transition-all shadow-[0_8px_20px_-6px_rgba(226,0,116,0.25)] hover:shadow-[0_12px_25px_-8px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95"
						>
							<ArrowLeft className="w-5 h-5 mr-3" strokeWidth={2.5} />
							Zurück zur Startseite
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
