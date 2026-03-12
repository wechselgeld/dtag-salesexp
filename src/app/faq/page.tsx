"use client";

import { ArrowLeft, ChevronDown, HelpCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { TelekomLogo } from "@/components/shared/telekom-logo";
import { GlobalFooter } from "@/components/shared/global-footer";
import clsx from "clsx";

const FAQ_ITEMS = [
	{
		q: "Wie erstelle ich ein Angebot?",
		a: "Wähle zunächst eine Produktkategorie aus, konfiguriere den gewünschten Tarif mit Vertragsart und optionalen Zusätzen, und füge ihn dem Warenkorb hinzu. Über den Button 'Angebot erstellen' im Warenkorb kannst Du das Angebot abschließen."
	},
	{
		q: "Kann ich mehrere Produkte in einem Angebot kombinieren?",
		a: "Ja, Du kannst beliebig viele Tarife aus verschiedenen Kategorien zum Warenkorb hinzufügen. Die Kostenübersicht im Warenkorb zeigt automatisch die Gesamtkosten aller kombinierten Produkte."
	},
	{
		q: "Was bedeuten die verschiedenen Geschäftsfälle?",
		a: "Neubereitstellung: Erstmalige Einrichtung eines Anschlusses. Umzug: Mitnahme eines bestehenden Anschlusses an eine neue Adresse. Tarifwechsel: Änderung des bestehenden Tarifs. Speed Up: Erhöhung der Bandbreite im bestehenden Vertrag."
	},
	{
		q: "Wie funktionieren Aktionen & Rabatte?",
		a: "Sonderpreise sind zeitlich begrenzte Aktionspreise, die für bestimmte Vertragsmonate gelten. Du kannst jeweils einen Sonderpreis pro Tarif auswählen. Die Ersparnis wird in der Kostenübersicht automatisch berücksichtigt."
	},
	{
		q: "Wie setze ich meine Sitzung zurück?",
		a: "Klicke auf 'Sitzung zurücksetzen' in der Sidebar. Dies leert den Warenkorb und setzt alle Konfigurationen zurück, sodass Du von vorne beginnen kannst."
	},
	{
		q: "Wo finde ich die Admin-Oberfläche?",
		a: "Die Admin-Oberfläche ist über den 'Admin' Link in der Sidebar erreichbar. Dort kannst Du Produkte, Sonderpreise und Gutschriften verwalten. Beachte, dass hierfür erweiterte Berechtigungen erforderlich sind."
	},
	{
		q: "Wie werden die Gesamtkosten berechnet?",
		a: "Die Ø-Monatskosten werden aus dem Durchschnitt aller 24 Vertragsmonate berechnet, inklusive Sonderpreise und Aktionen. Die Gesamtkosten umfassen alle monatlichen Kosten über 24 Monate plus einmalige Bereitstellungsgebühren."
	}
];

export default function FAQPage() {
	return (
		<div className="min-h-screen py-12 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074]">
			<div className="max-w-3xl mx-auto">
				{/* ─── Header / Branding ─── */}
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
					className="flex flex-col items-center mb-10 text-center"
				>
					<TelekomLogo className="w-12 h-12 text-[#e20074] mb-8" />
					<h1 className="text-3xl sm:text-[2.5rem] font-extrabold text-[#1a1a2e] tracking-tight mb-3 leading-none">
						Hilfe & FAQ
					</h1>
					<p className="text-[1.05rem] text-[#888] font-normal leading-relaxed max-w-md mx-auto mt-1">
						Hier findest Du Antworten auf die häufigsten Fragen zum Sales Experience Tool. 👋🏻
					</p>
				</motion.div>

				{/* ─── Main Content Card ─── */}
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
					className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] p-8 sm:p-12 space-y-12"
				>
					<section className="space-y-6">
						<div className="flex items-center gap-4 mb-2">
							<div className="w-11 h-11 rounded-2xl bg-[#e20074]/5 border border-[#e20074]/10 flex items-center justify-center shrink-0">
								<HelpCircle className="w-6 h-6 text-[#e20074]" />
							</div>
							<h2 className="text-[1.2rem] font-extrabold text-[#1a1a2e] m-0 tracking-tight">
								Häufige Fragen
							</h2>
						</div>

						<div className="space-y-4">
							{FAQ_ITEMS.map((item, i) => (
								<FAQItem key={i} question={item.q} answer={item.a} index={i} />
							))}
						</div>
					</section>

					<div className="pt-8 border-t border-[#f7f8fa] flex justify-center">
						<button
							onClick={() => window.history.back()}
							className="inline-flex items-center justify-center px-8 py-4 bg-[#1a1a2e] hover:bg-black text-white font-bold rounded-2xl transition-all cursor-pointer border-none shadow-lg shadow-[#1a1a2e]/20 active:scale-[0.98] gap-2"
						>
							<ArrowLeft className="w-4 h-4" />
							Zurück zur App
						</button>
					</div>
				</motion.div>

				<GlobalFooter
					className="pt-10 pb-0 mt-4 text-[#bbb]"
					linkColor="text-[#bbb]"
				/>
			</div>
		</div>
	);
}

function FAQItem({
	question,
	answer,
	index
}: {
	question: string;
	answer: string;
	index: number;
}) {
	const [open, setOpen] = useState(false);

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 + index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
			className={clsx(
				"group rounded-3xl border transition-all duration-300 overflow-hidden",
				open
					? "border-[#e20074]/30 bg-[#e20074]/5 shadow-sm"
					: "border-[#eaedf0] bg-[#f7f8fa] hover:bg-white hover:border-[#d1d5db]"
			)}
		>
			<button
				onClick={() => setOpen(!open)}
				className="w-full flex items-center justify-between px-7 py-5 text-left cursor-pointer bg-transparent border-none outline-none"
			>
				<span
					className={clsx(
						"text-[0.95rem] font-bold transition-colors duration-200 pr-6",
						open
							? "text-[#e20074]"
							: "text-[#1a1a2e]"
					)}
				>
					{question}
				</span>
				<div
					className={clsx(
						"w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300",
						open
							? "bg-[#e20074] border-[#e20074] text-white shadow-md shadow-[#e20074]/20"
							: "border-[#eaedf0] bg-white text-[#ccc] group-hover:border-[#e20074]/30 group-hover:text-[#e20074]"
					)}
				>
					<ChevronDown
						className={clsx(
							"w-4 h-4 transition-transform duration-300",
							open && "rotate-180"
						)}
						strokeWidth={2.5}
					/>
				</div>
			</button>
			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
					>
						<div className="px-7 pb-6 pt-0">
							<p className="text-[0.9rem] text-[#555] leading-relaxed m-0 font-medium">
								{answer}
							</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
