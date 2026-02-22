"use client";

import { ArrowLeft, ChevronDown, HelpCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { TelekomLogo } from "@/components/telekom-logo";
import clsx from "clsx";

const FAQ_ITEMS = [
	{
		q: "Wie erstelle ich ein Angebot?",
		a: "Wähle zunächst eine Produktkategorie aus, konfiguriere den gewünschten Tarif mit Vertragsart und optionalen Zusätzen, und füge ihn dem Warenkorb hinzu. Über den Button 'Angebot erstellen' im Warenkorb kannst du das Angebot abschließen."
	},
	{
		q: "Kann ich mehrere Produkte in einem Angebot kombinieren?",
		a: "Ja, du kannst beliebig viele Tarife aus verschiedenen Kategorien zum Warenkorb hinzufügen. Die Kostenübersicht im Warenkorb zeigt automatisch die Gesamtkosten aller kombinierten Produkte."
	},
	{
		q: "Was bedeuten die verschiedenen Geschäftsfälle?",
		a: "Neubereitstellung: Erstmalige Einrichtung eines Anschlusses. Umzug: Mitnahme eines bestehenden Anschlusses an eine neue Adresse. Tarifwechsel: Änderung des bestehenden Tarifs. Speed Up: Erhöhung der Bandbreite im bestehenden Vertrag."
	},
	{
		q: "Wie funktionieren Aktionen & Rabatte?",
		a: "Sonderpreise sind zeitlich begrenzte Aktionspreise, die für bestimmte Vertragsmonate gelten. Sie können jeweils einen Sonderpreis pro Tarif auswählen. Die Ersparnis wird in der Kostenübersicht automatisch berücksichtigt."
	},
	{
		q: "Was ist das MagentaTV Bundle?",
		a: "Bei ausgewählten Festnetz-Tarifen kannst du MagentaTV als Kombivorteil hinzubuchen. Dies reduziert den monatlichen TV-Preis und wird automatisch in die Gesamtkosten einberechnet."
	},
	{
		q: "Wie setze ich meine Sitzung zurück?",
		a: "Klicke auf 'Sitzung zurücksetzen' in der Sidebar. Dies leert den Warenkorb und setzt alle Konfigurationen zurück, sodass du von vorne beginnen kannst."
	},
	{
		q: "Wo finde ich die Admin-Oberfläche?",
		a: "Die Admin-Oberfläche ist über den 'Admin' Link in der Sidebar erreichbar. Dort kannst du Produkte, Sonderpreise und Gutschriften verwalten. Beachte, dass hierfür erweiterte Berechtigungen erforderlich sind."
	},
	{
		q: "Wie werden die Gesamtkosten berechnet?",
		a: "Die Ø-Monatskosten werden aus dem Durchschnitt aller 24 Vertragsmonate berechnet, inklusive Sonderpreise und Aktionen. Die Gesamtkosten umfassen alle monatlichen Kosten über 24 Monate plus einmalige Bereitstellungsgebühren."
	}
];

export default function FAQPage() {
	return (
		<div className="min-h-screen py-16 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074]">
			<div className="max-w-3xl mx-auto">
				{/* Header */}
				<div className="flex flex-col items-center mb-12 text-center">
					<TelekomLogo className="w-12 h-12 text-[#e20074] mb-8" />
					<h1 className="text-3xl font-extrabold text-[#1a1a2e] tracking-tight mb-4">
						Hilfe & FAQ
					</h1>
					<p className="text-[#888] font-medium max-w-xl">
						Häufig gestellte Fragen zum Sales Experience Tool.
					</p>
				</div>

				{/* Content */}
				<div className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] p-8 sm:p-12 space-y-10">
					<section className="space-y-6">
						<div className="flex items-center gap-2 mb-2">
							<HelpCircle className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								Alle Fragen auf einen Blick
							</h2>
						</div>

						<div className="space-y-3">
							{FAQ_ITEMS.map((item, i) => (
								<FAQItem key={i} question={item.q} answer={item.a} index={i} />
							))}
						</div>
					</section>

					<div className="pt-6 border-t border-[#eaedf0] flex justify-center">
						<button
							onClick={() => window.history.back()}
							className="inline-flex items-center justify-center px-6 py-3 bg-[#f7f8fa] hover:bg-[#eaedf0] text-[#1a1a2e] font-bold rounded-xl transition-colors cursor-pointer border-none"
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Zurück
						</button>
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
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.05 + index * 0.04, duration: 0.3 }}
			className={clsx(
				"bg-white rounded-2xl border transition-all duration-300 overflow-hidden",
				open
					? "border-[#e20074]/30 shadow-[0_4px_20px_rgba(226,0,116,0.05)]"
					: "border-[#eaedf0] hover:border-[#d0d0d0]"
			)}
		>
			<button
				onClick={() => setOpen(!open)}
				className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer bg-transparent border-none outline-none group"
			>
				<span
					className={clsx(
						"text-[0.95rem] font-bold transition-colors duration-200 pr-4",
						open
							? "text-[#e20074]"
							: "text-[#1a1a2e] group-hover:text-[#e20074]"
					)}
				>
					{question}
				</span>
				<div
					className={clsx(
						"w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300",
						open
							? "bg-[#e20074] border-[#e20074] text-white"
							: "border-[#eaedf0] bg-white group-hover:border-[#d0d0d0] text-[#ccc] group-hover:text-[#888]"
					)}
				>
					<ChevronDown
						className={clsx(
							"w-4 h-4 transition-transform duration-300",
							open && "rotate-180"
						)}
					/>
				</div>
			</button>
			<motion.div
				initial={false}
				animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
				className="overflow-hidden"
			>
				<div className="px-6 pb-6 pt-1">
					<p className="text-[0.85rem] text-[#555] leading-relaxed m-0">
						{answer}
					</p>
				</div>
			</motion.div>
		</motion.div>
	);
}
