"use client";

import { ArrowLeft, Palette, Bell, Globe, Info, RotateCcw } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBasketStore } from "@/hooks/use-basket-store";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
	const { clearBasket } = useBasketStore();
	const router = useRouter();

	const handleReset = () => {
		clearBasket();
		localStorage.removeItem("dts-splash-date");
		router.push("/");
	};

	return (
		<div className="min-h-full max-w-[700px]">
			<Link
				href="/"
				className="inline-flex items-center gap-2 text-[#999] hover:text-[#e20074] transition-colors mb-6 text-[0.8rem] font-semibold uppercase tracking-wider no-underline"
			>
				<ArrowLeft className="w-4 h-4" />
				<span className="text-[#e20074]">Zurück</span>
			</Link>

			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.35 }}
			>
				<h1 className="text-[2rem] font-extrabold text-[#1a1a2e] tracking-tight mb-2">
					Einstellungen
				</h1>
				<p className="text-[0.85rem] text-[#999] mb-8">
					Konfigurieren Sie das Sales Experience Tool
				</p>

				<div className="space-y-4">
					{/* App Info */}
					<div className="bg-white rounded-2xl border border-[#eaedf0] p-5">
						<div className="flex items-center gap-3 mb-4">
							<Info className="w-4 h-4 text-[#e20074]" />
							<h2 className="text-[0.88rem] font-bold text-[#1a1a2e] m-0">
								App-Informationen
							</h2>
						</div>
						<div className="space-y-2.5">
							<InfoRow label="Version" value="2.0.0" />
							<InfoRow label="Build" value="2026.02.19" />
							<InfoRow label="Umgebung" value="Produktion" />
						</div>
					</div>

					{/* Display */}
					<div className="bg-white rounded-2xl border border-[#eaedf0] p-5">
						<div className="flex items-center gap-3 mb-4">
							<Palette className="w-4 h-4 text-[#7b61ff]" />
							<h2 className="text-[0.88rem] font-bold text-[#1a1a2e] m-0">
								Anzeige
							</h2>
						</div>
						<div className="space-y-2.5">
							<InfoRow label="Design" value="Light" />
							<InfoRow label="Sprache" value="Deutsch" />
							<InfoRow label="Intro-Animation" value="Aktiviert" />
						</div>
					</div>

					{/* Notifications */}
					<div className="bg-white rounded-2xl border border-[#eaedf0] p-5">
						<div className="flex items-center gap-3 mb-4">
							<Bell className="w-4 h-4 text-[#ff6b00]" />
							<h2 className="text-[0.88rem] font-bold text-[#1a1a2e] m-0">
								Benachrichtigungen
							</h2>
						</div>
						<div className="space-y-2.5">
							<InfoRow label="Preisaktualisierungen" value="An" />
							<InfoRow label="Neue Aktionen" value="An" />
						</div>
					</div>

					{/* Reset */}
					<div className="bg-white rounded-2xl border border-[#eaedf0] p-5">
						<div className="flex items-center gap-3 mb-4">
							<RotateCcw className="w-4 h-4 text-[#dc2626]" />
							<h2 className="text-[0.88rem] font-bold text-[#1a1a2e] m-0">
								Sitzung
							</h2>
						</div>
						<p className="text-[0.78rem] text-[#999] mb-4 m-0">
							Setzt den Warenkorb und alle Konfigurationen zurück. Die
							Intro-Animation wird beim nächsten Start erneut angezeigt.
						</p>
						<button
							onClick={handleReset}
							className="px-4 py-2.5 rounded-xl bg-[#f7f8fa] border border-[#eaedf0] text-[0.78rem] font-medium text-[#999] hover:bg-[#fee2e2] hover:text-[#dc2626] hover:border-[#fca5a5] transition-all duration-200 cursor-pointer flex items-center gap-2"
						>
							<RotateCcw className="w-3.5 h-3.5" />
							Sitzung zurücksetzen
						</button>
					</div>
				</div>
			</motion.div>
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between py-1">
			<span className="text-[0.78rem] text-[#999]">{label}</span>
			<span className="text-[0.78rem] font-semibold text-[#1a1a2e]">
				{value}
			</span>
		</div>
	);
}
