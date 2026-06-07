'use client';

import {
	ArrowLeft, ChevronDown, HelpCircle, FileText, Sparkles, Settings,
} from 'lucide-react';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	useState,
} from 'react';
import {
	GlobalFooter,
} from '@/components/shared/global-footer';
import clsx from 'clsx';
import { PageHeader } from '@/components/shared/page-header';

const FAQ_CATEGORIES = [
	{
		id: 'general',
		title: 'Allgemeine Fragen',
		icon: HelpCircle,
		items: [
			{
				q: 'Was ist die Sales Experience?',
				a: 'Die Sales Experience ist ein internes Vertriebsberatungstool, das speziell für die Deutsche Telekom Service GmbH entwickelt wurde. Es unterstützt Dich bei der Produktauswahl, Tarifkonfiguration und der Erstellung professioneller Angebote für Deine Kunden.',
			},
			{
				q: 'Wer kann das Tool nutzen?',
				a: 'Das Tool ist für Vertriebsberater, Teamleiter und Manager in autorisierten Telekom-Standorten vorgesehen. Der Zugriff erfolgt oft personalisiert über eine E-Mail-Verifizierung. Bitte gib die Anwendung nicht weiter.',
			},
			{
				q: 'Sind die Preise und Aktionen immer aktuell?',
				a: 'Alle Produktdaten, Preise und Aktionsrabatte werden zentral in der Datenbank gepflegt. Änderungen sind sofort für alle Nutzer im Tool sichtbar.',
			},
		],
	},
	{
		id: 'offers',
		title: 'Angebot & Warenkorb',
		icon: FileText,
		items: [
			{
				q: 'Wie erstelle ich ein Angebot für einen Kunden?',
				a: 'Wähle die gewünschten Produkte aus, konfiguriere sie (z. B. Vertragsart, Optionen, Rabatte) und füge sie dem Warenkorb hinzu. Klicke im Warenkorb auf "Angebot erstellen", um ein PDF zu generieren und direkt eine E-Mail an den Kunden vorzubereiten.',
			},
			{
				q: 'Kann ich mehrere Tarife in einem Angebot kombinieren?',
				a: 'Absolut. Du kannst beliebig viele Mobilfunk-, Festnetz- oder TV-Tarife sowie Endgeräte in einem Warenkorb sammeln. Die Kostenübersicht berechnet automatisch die kombinierten monatlichen und einmaligen Kosten.',
			},
			{
				q: 'Wie werden die Ø-Monatskosten berechnet?',
				a: 'Wir berechnen den Durchschnitt über die gesamte Mindestvertragslaufzeit (24 Monate). Dabei werden alle Rabatte, Aktionspreise und monatliche Kosten zusammengerechnet und durch 24 geteilt, um dem Kunden einen transparenten Vergleichspreis zu bieten.',
			},
			{
				q: 'Was passiert, wenn ich den Warenkorb leere?',
				a: 'Alle aktuell konfigurierten Produkte werden entfernt und die Kalkulation wird zurückgesetzt. Dies ist nützlich, wenn Du eine komplett neue Beratung startest.',
			},
		],
	},
	{
		id: 'features',
		title: 'Beratung & Features',
		icon: Sparkles,
		items: [
			{
				q: 'Was sind "Team-Highlights"?',
				a: 'Team-Highlights sind spezielle Produkte oder Aktionen, die von Deiner Teamleitung oder dem Management als besonders relevant markiert wurden. Sie erscheinen prominent in Deiner Übersicht.',
			},
			{
				q: 'Was bedeuten die verschiedenen Geschäftsfälle?',
				a: 'Neubereitstellung: Ein komplett neuer Anschluss. Umzug: Der Kunde zieht mit seinem bestehenden Anschluss um. Tarifwechsel: Ein bestehender Tarif wird auf einen neuen Tarif umgestellt. Speed-Up: Erhöhung der Bandbreite in einem bestehenden Vertrag.',
			},
			{
				q: 'Wo finde ich Verkaufsargumente?',
				a: 'In der Detailansicht vieler Produkte, sowie in deren Vorschau, findest Du die Verkaufsargumente. Diese enthalten die wichtigsten USPs (Unique Selling Points), um Dich im Verkaufsgespräch zu unterstützen.',
			},
		],
	},
	{
		id: 'admin',
		title: 'Admin & System',
		icon: Settings,
		items: [
			{
				q: 'Wie lange bleibt meine Sitzung aktiv?',
				a: 'Eine aktive Session ist zeitlich begrenzt, um die Sicherheit der Daten zu gewährleisten. In der Regel bleibt sie 4 Stunden bestehen, sofern Du Dich nicht manuell abmeldest.',
			},
			{
				q: 'Wer verwaltet die Produkte und Nutzer?',
				a: 'Dies geschieht über die Admin-Oberfläche durch Administratoren oder OD-Manager. Dort können neue Produkte angelegt, Standorte verwaltet und Account-Berechtigungen vergeben werden.',
			},
			{
				q: 'An wen wende ich mich bei technischen Problemen?',
				a: 'Bitte kontaktiere zuerst Deinen Administrator vor Ort oder Deinen Teamleiter. Bei systemweiten Fehlern wird die IT-Administration automatisch benachrichtigt.',
			},
		],
	},
];

export default function FAQPage() {
	return (
		<div className="min-h-screen py-12 px-4 selection:bg-[#e20074]/10 selection:text-[#e20074]">
			<div className="max-w-3xl mx-auto">
				{/* ─── Header / Branding ─── */}
				<PageHeader
					title="Hilfe & FAQ"
					description="Hier findest Du Antworten auf die häufigsten Fragen zum Sales Experience Tool."
				/>

				<div className="space-y-12 mb-16">
					{FAQ_CATEGORIES.map((category, catIdx) => (
						<motion.section
							key={category.id}
							initial={{
								opacity: 0,
								y: 20,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							transition={{
								duration: 0.5,
								delay: 0.1 + catIdx * 0.1,
								ease: [
									0.16,
									1,
									0.3,
									1,
								],
							}}
							className="space-y-6"
						>
							<div className="flex items-center gap-4 px-2">
								<div className="w-10 h-10 rounded-xl bg-[#e20074]/5 border border-[#e20074]/10 flex items-center justify-center shrink-0">
									<category.icon className="w-5 h-5 text-[#e20074]" />
								</div>
								<h2 className="text-[1.3rem] font-extrabold text-[#1a1a2e] m-0 tracking-tight">
									{category.title}
								</h2>
							</div>

							<div className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] border border-[#eaedf0] p-3 sm:p-5 space-y-3">
								{category.items.map((item, i) => (
									<FAQItem
										key={`${catIdx}-${i}`}
										question={item.q}
										answer={item.a}
										index={i}
									/>
								))}
							</div>
						</motion.section>
					))}
				</div>

				<div className="flex justify-center mb-20">
					<button
						onClick={() => window.history.back()}
						className="inline-flex items-center justify-center px-10 py-5 bg-[#1a1a2e] hover:bg-black text-white font-bold rounded-2xl transition-all cursor-pointer border-none shadow-xl shadow-[#1a1a2e]/20 active:scale-[0.98] gap-2.5 text-[1rem]"
					>
						<ArrowLeft className="w-5 h-5" />
						Zurück zur App
					</button>
				</div>

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
	index,
}: {
	question: string;
	answer: string;
	index: number;
}) {
	const [
		open,
		setOpen,
	] = useState(false);

	return (
		<motion.div
			initial={{
				opacity: 0,
				y: 10,
			}}
			animate={{
				opacity: 1,
				y: 0,
			}}
			transition={{
				delay: index * 0.05,
				duration: 0.4,
				ease: [
					0.16,
					1,
					0.3,
					1,
				],
			}}
			className={clsx(
				'group rounded-3xl border transition-all duration-300 overflow-hidden',
				open
					? 'border-[#e20074]/30 bg-[#e20074]/2 shadow-xs'
					: 'border-transparent bg-[#f7f8fa] hover:bg-white hover:border-[#eaedf0] hover:shadow-sm',
			)}
		>
			<button
				onClick={() => setOpen(!open)}
				className="w-full flex items-center justify-between px-6 py-4.5 text-left cursor-pointer bg-transparent border-none outline-none group"
			>
				<span
					className={clsx(
						'text-[0.95rem] font-bold transition-colors duration-300 pr-6 leading-snug',
						open
							? 'text-[#e20074]'
							: 'text-[#1a1a2e] group-hover:text-[#e20074]',
					)}
				>
					{question}
				</span>
				<div
					className={clsx(
						'w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-300',
						open
							? 'bg-[#e20074] border-[#e20074] text-white shadow-lg shadow-[#e20074]/20'
							: 'border-[#eaedf0] bg-white text-[#ccc] group-hover:border-[#e20074]/30 group-hover:text-[#e20074]',
					)}
				>
					<ChevronDown
						className={clsx(
							'w-3.5 h-3.5 transition-transform duration-300',
							open && 'rotate-180',
						)}
						strokeWidth={2.5}
					/>
				</div>
			</button>
			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						initial={{
							height: 0,
							opacity: 0,
						}}
						animate={{
							height: 'auto',
							opacity: 1,
						}}
						exit={{
							height: 0,
							opacity: 0,
						}}
						transition={{
							duration: 0.35,
							ease: [
								0.16,
								1,
								0.3,
								1,
							],
						}}
					>
						<div className="px-6 pb-6 pt-1">
							<p className="text-[0.92rem] text-[#5b5b71] leading-relaxed m-0 font-medium">
								{answer}
							</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
