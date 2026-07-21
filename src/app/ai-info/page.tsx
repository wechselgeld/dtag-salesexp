import type {
	Metadata,
} from 'next';
import {
	ShieldCheck, Info, Cpu, Database, EyeOff, AlertTriangle
} from 'lucide-react';
import {
	GlobalFooter,
} from '@/components/shared/global-footer';
import { PageHeader } from '@/components/shared/page-header';
import {
	BackButton,
} from '@/components/shared/back-button';

export const metadata: Metadata = {
	title: 'KI-Nutzung & Datensicherheit',
};

export default function AiInfoPage() {
	return (
		<div className="min-h-screen py-16 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074]">
			<div className="max-w-3xl mx-auto">
				<PageHeader
					title="KI-Nutzung & Datensicherheit"
					description="Informationen zur sicheren Datenverarbeitung und den Nutzungsrichtlinien der künstlichen Intelligenz (SXP Scout) im internen Beratungstool."
					logoClassName="ml-2"
					hideLogo={true}
				/>

				{/* Content */}
				<div className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] p-8 sm:p-12 space-y-10">
					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<Cpu className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								1. Funktionsweise des SXP Scout
							</h2>
						</div>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Der <strong>SXP Scout</strong> ist ein KI-gestütztes Assistenzsystem, das Vertriebsmitarbeiter im Kundengespräch mit passgenauen Verkaufsargumenten, Tipps zur Einwandbehandlung und Nutzenbrücken unterstützt.
						</p>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Als technologische Basis wird das hochleistungsfähige Modell <strong>llama-3.3-70b-instruct</strong> über eine gesicherte <strong>NVIDIA NIM</strong> API-Schnittstelle angebunden. Dies ermöglicht eine extrem schnelle Generierung von Texten (Streaming in Echtzeit) bei maximaler Datensparsamkeit.
						</p>
					</section>

					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<Database className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								2. Welche Daten werden verarbeitet?
							</h2>
						</div>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Um dem Sprachmodell den notwendigen Kontext für ein Beratungsgespräch zu geben, werden ausschließlich die folgenden, rein sachlichen Daten an die API übermittelt:
						</p>
						<ul className="list-disc list-inside text-[0.95rem] text-[#555] space-y-2 ml-2">
							<li>
								<strong>Aktiver Warenkorb-Inhalt:</strong> Die Namen der hinzugefügten Produkte (z.B. <em>MagentaMobil M</em>), deren Basispreise und Kategorien.
							</li>
							<li>
								<strong>Gesamtpreis des Warenkorbs:</strong> Der kalkulierte monatliche Grundpreis.
							</li>
							<li>
								<strong>Aktive Produktkategorie:</strong> Die Seite, auf der sich der Verkäufer aktuell im Tool befindet.
							</li>
							<li>
								<strong>Chat-Verlauf:</strong> Ihre eingegebenen Fragen oder Kundenaussagen sowie die Antworten der KI innerhalb der aktuellen Sitzung.
							</li>
						</ul>
					</section>

					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<EyeOff className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								3. Strikte Vermeidung von Kundendaten (DSGVO)
							</h2>
						</div>
						<div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-[0.95rem] text-[#7c5e00] leading-relaxed space-y-2">
							<div className="flex items-center gap-2 font-bold text-amber-800">
								<AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
								WICHTIGE VERHALTENSREGEL FÜR VERKÄUFER:
							</div>
							<p>
								Geben Sie <strong>niemals personenbezogene Kundendaten</strong> in das Chatfenster ein! Dazu gehören beispielsweise:
							</p>
							<ul className="list-disc list-inside ml-2 space-y-1 font-semibold">
								<li>Name, Anschrift oder Geburtsdatum des Kunden</li>
								<li>Telefonnummern oder E-Mail-Adressen</li>
								<li>Rufnummernportierungs-Details oder Kundennummern</li>
								<li>Bankverbindungen (IBAN) oder Ausweisdaten</li>
							</ul>
							<p className="text-[0.85rem] text-amber-700/90 font-medium pt-1">
								Das Tool dient ausschließlich der Formulierungshilfe und Argumentation auf Basis von Tarifeigenschaften und allgemeinen Kundeneinwänden. Eine Eingabe persönlicher Merkmale ist technisch weder notwendig noch zulässig.
							</p>
						</div>
					</section>

					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<ShieldCheck className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								4. Datensicherheit & Zero-Retention-Policy
							</h2>
						</div>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Sicherheit und Datenschutz stehen bei unserem Copiloten an oberster Stelle:
						</p>
						<div className="space-y-3 pt-2">
							<div className="flex gap-3 items-start">
								<div className="w-1.5 h-1.5 rounded-full bg-[#e20074] shrink-0 mt-2.5" />
								<div>
									<h4 className="text-[0.95rem] font-bold text-[#1a1a2e]">Kein KI-Training mit Ihren Daten</h4>
									<p className="text-[0.9rem] text-[#555] leading-relaxed">
										Die über die kommerzielle API gesendeten Daten werden vertraglich zugesichert <strong>nicht</strong> zum Training zukünftiger Modelle des KI-Anbieters genutzt.
									</p>
								</div>
							</div>
							<div className="flex gap-3 items-start">
								<div className="w-1.5 h-1.5 rounded-full bg-[#e20074] shrink-0 mt-2.5" />
								<div>
									<h4 className="text-[0.95rem] font-bold text-[#1a1a2e]">Zero Retention (Keine Speicherung beim Provider)</h4>
									<p className="text-[0.9rem] text-[#555] leading-relaxed">
										Anfragen werden flüchtig im Arbeitsspeicher des API-Gateways verarbeitet und unmittelbar nach Generierung der Antwort verworfen. Es erfolgt keine dauerhafte Archivierung beim Provider.
									</p>
								</div>
							</div>
							<div className="flex gap-3 items-start">
								<div className="w-1.5 h-1.5 rounded-full bg-[#e20074] shrink-0 mt-2.5" />
								<div>
									<h4 className="text-[0.95rem] font-bold text-[#1a1a2e]">Lokaler Chat-Speicher</h4>
									<p className="text-[0.9rem] text-[#555] leading-relaxed">
										Der Verlauf des Gesprächs wird flüchtig im Arbeitsspeicher Ihres Webbrowsers gehalten. Sobald Sie den Chat manuell über das "Papierkorb"-Symbol zurücksetzen, die Seite neu laden oder das Fenster schließen, sind alle vorherigen Chatverläufe unwiderruflich gelöscht.
									</p>
								</div>
							</div>
						</div>
					</section>

					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<Info className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								5. Haftungsausschluss & KI-Fehleranfälligkeit
							</h2>
						</div>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Künstliche Intelligenzen und Large Language Models (LLMs) sind statistische Text-Modelle. Obwohl wir dem Modell präzise Systemprompts und die aktuellen Warenkorb-Daten vorgeben, kann es vorkommen, dass die KI sachlich inkorrekte Aussagen, ungenaue Tarifergebnisse oder unpassende Formulierungen generiert (&bdquo;Halluzinationen&ldquo;).
						</p>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							<strong>Die generierten Tipps sind rechtlich unverbindlich.</strong> Bitte überprüfen Sie alle vertraglichen Kernpunkte, rechtlichen Rahmenbedingungen und technischen Verfügbarkeiten (insb. Preise, Bandbreiten und Laufzeiten) vor der finalen Weitergabe an den Kunden anhand des offiziellen Preis- und Leistungsverzeichnisses.
						</p>
					</section>

					<div className="pt-6 border-t border-[#eaedf0] flex justify-center">
						<BackButton />
					</div>
				</div>

				<GlobalFooter
					className="pt-8 pb-0 mt-4 text-[#bbb]"
					linkColor="text-[#bbb]"
				/>
			</div>
		</div>
	);
}
