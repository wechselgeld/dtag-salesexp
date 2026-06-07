import type {
	Metadata,
} from 'next';
import {
	BarChart3, Eye, ShieldCheck, Info,
} from 'lucide-react';
import {
	GlobalFooter,
} from '@/components/shared/global-footer';
import { PageHeader } from '@/components/shared/page-header';
import {
	BackButton,
} from '@/components/shared/back-button';

export const metadata: Metadata = {
	title: 'Tracking & Analyse',
};

export default function TrackingPage() {
	return (
		<div className="min-h-screen py-16 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074]">
			<div className="max-w-3xl mx-auto">
				<PageHeader
					title="Tracking & Nutzungsanalyse"
					description="Informationen über die Art, den Zweck und den Umfang der anonymen Nutzungsanalyse in diesem Beratungstool (Sales Experience)."
					logoClassName="ml-2"
				/>

				{/* Content */}
				<div className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] p-8 sm:p-12 space-y-10">
					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<Info className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								1. Warum wir Daten erfassen
							</h2>
						</div>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Um die Sales Experience kontinuierlich zu verbessern, technische
							Fehler (wie z. B. Ladeprobleme oder fehlgeschlagene
							Authentifizierungen) schnellstmöglich zu identifizieren und die
							Benutzerfreundlichkeit der Anwendung stetig zu optimieren, führen
							wir eine anonyme Nutzungsanalyse durch.
						</p>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Die Datenerfassung hilft uns zu verstehen, welche Funktionen am
							häufigsten genutzt werden und an welchen Stellen im Tool eventuell
							Optimierungsbedarf besteht.
						</p>
					</section>

					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<Eye className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								2. Welche Aktionen erfasst werden
							</h2>
						</div>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Sofern Sie der Nutzungsanalyse aktiv zustimmen, werden ausschließlich
							spezifische, anonymisierte Interaktionsereignisse (Events) und
							technische Rahmendaten aufgezeichnet. Dazu gehören:
						</p>
						<ul className="list-disc list-inside text-[0.95rem] text-[#555] space-y-2 ml-2">
							<li>
								<strong>Streaming-Rechner</strong>: Das Aufrufen des
								Sparvorteil-Rechners (Streaming-Check).
							</li>
							<li>
								<strong>Battlecards</strong>: Das Öffnen des Battlecard-Panels
								sowie der Wechsel zwischen den Tabs („Anbieter“ und
								„Einwände“).
							</li>
							<li>
								<strong>Warenkorb & Angebote</strong>: Das Erstellen neuer
								Konfigurations-Tabs im Warenkorb sowie das Generieren eines
								PDF-Angebots (hierbei werden anonyme Metadaten wie die Anzahl
								der Tarife und Gesamtsummen erfasst, um den Erfolg der
								Angebotserstellung zu messen).
							</li>
							<li>
								<strong>Authentifizierung</strong>: Der Start sowie der Erfolg
								oder Misserfolg von Login- und Setup-Vorgängen (PIN-Eingaben,
								Passkey-Registrierungen und -Logins).
							</li>
							<li>
								<strong>Technische Metadaten</strong>: Bildschirmauflösung,
								Browser-Typ, Betriebssystem sowie der Status der Sitzung.
							</li>
						</ul>
						<div className="p-4 bg-[#fff0f6] border border-[#e20074]/10 rounded-2xl text-[0.92rem] text-[#e20074] font-medium leading-relaxed">
							<strong>Wichtiger Hinweis</strong>: Es werden zu keinem Zeitpunkt
							personenbezogene Kundendaten, eingegebene PINs, Passwörter oder
							sensible Gesprächsinhalte aufgezeichnet. Alle Daten dienen
							ausschließlich statistischen Zwecken.
						</div>
					</section>

					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<ShieldCheck className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								3. Wie und wo die Analyse stattfindet
							</h2>
						</div>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Für das Tracking verwenden wir den modernen und datenschutzfreundlichen
							Analysedienst <strong>OpenPanel</strong>. Um ein Höchstmaß an
							Datenschutz und DSGVO-Konformität zu garantieren, betreiben wir diesen
							Dienst als <strong>selbstgehostete Instanz (In-House)</strong> auf unseren
							eigenen, abgesicherten Servern der Hetzner Online GmbH in Deutschland (EU).
						</p>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Es findet <strong>keine Übermittlung Ihrer Nutzungsdaten an
							Drittanbieter</strong> oder in Drittländer (wie z. B. die USA) statt.
							Die gesamte Verarbeitung verbleibt vollständig in unserer eigenen,
							europäischen Hosting-Infrastruktur.
						</p>
					</section>

					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<BarChart3 className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								4. Ihre Kontrolle über das Tracking
							</h2>
						</div>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Die Teilnahme an der Nutzungsanalyse ist absolut freiwillig. Standardmäßig
							ist das Tracking deaktiviert (Opt-In).
						</p>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Sie können Ihre Einwilligung jederzeit erteilen oder widerrufen:
						</p>
						<ul className="list-disc list-inside text-[0.95rem] text-[#555] space-y-1 ml-2">
							<li>Über das entsprechende Kontrollkästchen im Setup-Prozess.</li>
							<li>
								In den App-Einstellungen im Menü unter „Anzeige &amp; Interface“
								über den Schalter „Nutzungsanalyse erlauben“.
							</li>
						</ul>
					</section>

					{/* Back Button */}
					<div className="pt-8 border-t border-[#eaedf0] flex justify-center">
						<BackButton />
					</div>
				</div>

				<GlobalFooter />
			</div>
		</div>
	);
}
