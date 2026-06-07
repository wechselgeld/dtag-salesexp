import type {
	Metadata,
} from 'next';
import {
	ShieldCheck, Info, FileText,
} from 'lucide-react';
import {
	GlobalFooter,
} from '@/components/shared/global-footer';
import { PageHeader } from '@/components/shared/page-header';
import {
	BackButton,
} from '@/components/shared/back-button';

export const metadata: Metadata = {
	title: 'Datenschutz',
};

export default function PrivacyPage() {
	return (
		<div className="min-h-screen py-16 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074]">
			<div className="max-w-3xl mx-auto">
				<PageHeader
					title="Datenschutzerklärung"
					description="Informationspflichten nach Art. 13 DSGVO für Mitarbeiter und Berechtigte zur Nutzung des internen Beratungstools (Sales Experience)."
					logoClassName="ml-2"
				/>

				{/* Content */}
				<div className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] p-8 sm:p-12 space-y-10">
					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<ShieldCheck className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								1. Allgemeine Hinweise und Pflichtinformationen
							</h2>
						</div>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges
							Anliegen. Diese Datenschutzerklärung klärt Sie über die Art, den
							Umfang und Zwecke der Erhebung und Verwendung personenbezogener
							Daten durch den Verantwortlichen innerhalb dieses internen
							Beratungstools auf.
						</p>
						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-2">
							Verantwortliche Stelle
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Die verantwortliche Stelle für die Datenverarbeitung auf dieser
							Website ist die:
							<br />
							Buff Germany UG (haftungsbeschränkt)
							<br />
							Eulitzstr. 1
							<br />
							09112 Chemnitz
							<br /><br />
							Besuchen Sie Buff Interactive gern auf ihrer Website unter <a href="https://buffinteractive.net">buffinteractive.net</a>.
						</p>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Dieses Tool ist <strong>strikt vertraulich</strong> und
							ausschließlich für die interne Nutzung und zur Beratung von Kunden
							durch autorisiertes Personal bestimmt. Es werden durch dieses
							System <strong>keinerlei Kundendaten</strong> verarbeitet oder
							gespeichert.
						</p>
					</section>

					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<FileText className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								2. Datenerfassung auf dieser Website
							</h2>
						</div>

						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-2">
							Server-Log-Dateien
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Unsere Hosting-Infrastruktur (Hetzner Online GmbH) sowie unser
							vorgeschaltetes Content Delivery Network (Cloudflare) erheben und
							speichern automatisch Informationen in so genannten
							Server-Log-Dateien, die Ihr Browser automatisch an uns
							übermittelt. Dies sind:
						</p>
						<ul className="list-disc list-inside text-[0.95rem] text-[#555] space-y-1 ml-2">
							<li>Browsertyp und Browserversion</li>
							<li>Verwendetes Betriebssystem</li>
							<li>Referrer URL</li>
							<li>Hostname des zugreifenden Rechners</li>
							<li>Uhrzeit der Serveranfrage</li>
							<li>IP-Adresse</li>
						</ul>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1
							lit. f DSGVO. Wir haben ein berechtigtes Interesse an der
							technisch fehlerfreien Darstellung und der Optimierung dieses
							internen Tools – hierzu müssen die Server-Log-Files erfasst werden
							sowie Angriffe via Cloudflare mitigiert werden.
						</p>

						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-4">
							Nutzungsdaten und System-Sitzungen (Sessions)
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Um die missbräuchliche Nutzung des Systems durch Unbefugte zu
							unterbinden (Identifikation von Leaks der internen URL) und
							die Systemsicherheit zu gewährleisten, werden folgende Daten in der Datenbank temporär
							gespeichert, sobald Sie die Nutzungsbedingungen akzeptieren und
							eine Session starten:
						</p>
						<ul className="list-disc list-inside text-[0.95rem] text-[#555] space-y-1 ml-2">
							<li>Ihr Vor- und Nachname</li>
							<li>Ihre dienstliche E-Mail-Adresse (zur Verifizierung)</li>
							<li>Ihre IP-Adresse</li>
							<li>Informationen zu Ihrem verwendeten Browser (User-Agent)</li>
							<li>Das von Ihnen ausgewählte Vertriebsteam</li>
							<li>Zeitpunkt des Starts der Sitzung (Timestamp)</li>
							<li>
								Information über die Akzeptanz des internen Nutzungshinweises
							</li>
						</ul>
						<p className="text-[0.95rem] text-[#555] leading-relaxed mt-2 p-4 bg-[#f7f8fa] border border-[#eaedf0] rounded-xl">
							Es findet{' '}
							<strong>
								ein funktionales und sicherheitsbezogenes Tracking
							</strong>{' '}
							über eine selbstgehostete Instanz des Analysedienstes <strong>OpenPanel</strong> statt. Der Dienst erfasst Interaktionen wie Seitenaufrufe, Klicks sowie Ereignisse im Zusammenhang mit dem Login, der Einrichtung des Accounts und der Nutzung von Passkeys. Dies dient ausschließlich der Systemsicherheit, der Analyse technischer Fehler und der bedarfsgerechten Optimierung unseres Tools. IP-Adressen werden dabei datenschutzfreundlich verarbeitet und Klickdaten nicht für werbliche Zwecke genutzt.
						</p>

					</section>

					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<Info className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								3. Drittanbieter, Analysen und Hosting
							</h2>
						</div>

						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-2">
							Cloudflare
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Wir nutzen zur Absicherung und Beschleunigung dieses Tools den
							Dienst "Cloudflare". Anbieter ist die Cloudflare Inc., 101
							Townsend St., San Francisco, CA 94107, USA. Der Datenverkehr
							zwischen Ihrem Browser und unserem Server wird über die
							Infrastruktur von Cloudflare geleitet. Cloudflare schützt uns vor
							DDoS-Angriffen und blockiert unbefugte Zugriffe, hierfür
							verarbeitet Cloudflare IP-Adressen. Die Nutzung beruht auf unserem
							berechtigten Interesse an einer sicheren Bereitstellung (Art. 6
							Abs. 1 lit. f DSGVO). Die Datenübertragung in die USA wird durch
							Standardvertragsklauseln und das EU-U.S. Data Privacy Framework
							(DPF) abgesichert.
						</p>

						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-4">
							Hetzner (Hosting, Datenbank, Caching)
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Wir betreiben die gesamte Infrastruktur dieses Tools –
							einschließlich der Applikation selbst,
							der Datenbank sowie des Caches – als vollständig
							selbst-gehostete Umgebung. Alle Server werden in verschiedenen
							redundanten Rechenzentren der Hetzner Online GmbH, Industriestr.
							25, 91710 Gunzenhausen, Deutschland, betrieben. Dadurch stellen
							wir sicher, dass alle Daten, inklusive der in der
							Datenbank abgelegten anonymisierten Meta-Daten oder
							temporären Sitzungsinformationen, den Geltungsbereich der DSGVO
							nicht verlassen. Die physische Speicherung und Verarbeitung
							dieser Daten findet ausschließlich auf Servern in Deutschland
							statt. Die Nutzung erfolgt auf Basis unseres berechtigten
							Interesses an einer sicheren, hochverfügbaren und
							datenschutzkonformen Bereitstellung der Infrastruktur (Art. 6
							Abs. 1 lit. f DSGVO).
						</p>
						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-4">
							Resend (E-Mail-Versand)
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Wir nutzen für den Versand von systemseitigen E-Mails den Dienst
							"Resend". Anbieter ist die Resend Inc., 2261 Market Street #4817,
							San Francisco, CA 94114, USA. Wir haben den Dienst so
							konfiguriert, dass der technische E-Mail-Versand über Server
							innerhalb der Europäischen Union (Region: Irland, eu-west-1)
							erfolgt. Dennoch können Metadaten (z. B. Empfängeradressen,
							Zeitstempel, Versandstatus) zur Abrechnung und Analyse in die USA
							übermittelt und dort gespeichert werden. Die Nutzung erfolgt auf
							Grundlage unseres berechtigten Interesses an einem effizienten
							Versand (Art. 6 Abs. 1 lit. f DSGVO). Die Datenübermittlung in die
							USA wird durch das EU-U.S. Data Privacy Framework (sofern
							zertifiziert) oder Standardvertragsklauseln (SCC) abgesichert.
						</p>
						<p className="text-[0.95rem] text-[#555] leading-relaxed mt-2 p-4 bg-[#f7f8fa] border border-[#eaedf0] rounded-xl">
							Wir haben mit den oben genannten Anbietern (Cloudflare, Hetzner,
							Resend sowie NVIDIA) Verträge zur Auftragsverarbeitung (AVV)
							abgeschlossen oder entsprechende Datenschutzklauseln vereinbart. Diese garantieren, dass die Dienstleister die Daten
							ausschließlich nach unseren Weisungen und unter Einhaltung der
							DSGVO verarbeiten.
						</p>
						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-4">
							OpenPanel (selbstgehostet via Serve)
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Zur kontinuierlichen Verbesserung der Plattform, zur Fehleranalyse sowie zur Erkennung von Sicherheitsvorfällen (z. B. wiederholte fehlgeschlagene Anmeldeversuche) nutzen wir eine selbstgehostete Instanz des Analysedienstes "OpenPanel". Die Datenverarbeitung erfolgt auf von uns (der Buff Germany UG) gemieteten Servern bei der Hetzner Online GmbH (in Deutschland/EU) unter der Domain buffinteractive.net. Es findet keine Übermittlung an Drittländer (wie die USA) statt. OpenPanel erfasst Nutzungsdaten wie aufgerufene Seiten, Interaktionen mit der Benutzeroberfläche (Klicks) sowie sicherheitsrelevante Ereignisse (Login, Kontoeinrichtung, Passkey-Registrierung und -Nutzung). Hierbei werden im Falle von Authentifizierungsvorgängen Ihre dienstliche E-Mail-Adresse und Benutzerrolle verarbeitet, um den Erfolg der Vorgänge nachzuvollziehen. Die Nutzung erfolgt auf Grundlage unseres berechtigten Interesses an der Stabilität, Sicherheit und bedarfsgerechten Gestaltung des Tools (Art. 6 Abs. 1 lit. f DSGVO i.V.m. § 26 BDSG).
						</p>
						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-4">
							NVIDIA NIM (Künstliche Intelligenz / SXP Scout)
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Für unseren KI Sales Copilot (SXP Scout) nutzen wir die API-Schnittstelle von NVIDIA NIM. Anbieter ist die NVIDIA Corporation, 2788 San Tomas Expressway, Santa Clara, CA 95051, USA. Über diese Schnittstelle verarbeiten wir rein sachliche und anonyme Daten des aktiven Warenkorbs (Produktnamen, Kategorien, Preise) sowie Ihre manuell eingegebenen Fragen oder Kundeneinwände. Dies dient der Bereitstellung von Echtzeit-Verkaufsargumenten und Vertriebsunterstützung. Es werden <strong>keine personenbezogenen Kundendaten</strong> an NVIDIA übermittelt. NVIDIA verarbeitet die Anfragen flüchtig im Arbeitsspeicher; eine dauerhafte Speicherung oder Nutzung Ihrer Eingaben zum Training zukünftiger Modelle ist vertraglich ausgeschlossen (Zero-Retention-Policy). Die Datenübertragung in die USA wird durch Standardvertragsklauseln (SCC) sowie das EU-U.S. Data Privacy Framework abgesichert. Die Nutzung erfolgt auf Grundlage unseres berechtigten Interesses an einer intelligenten und zeitgemäßen Vertriebsunterstützung (Art. 6 Abs. 1 lit. f DSGVO).
						</p>
					</section>

					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<FileText className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								4. Cookies und Local Storage
							</h2>
						</div>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Dieses Tool verwendet Cookies, den Local Storage sowie den Session
							Storage Ihres Browsers, um eine reibungslose Funktion,
							Sitzungsverwaltung und anonymisierte Statistik-Deduplizierung zu
							gewährleisten. Es handelt sich hierbei ausschließlich um{' '}
							<strong>technisch notwendige</strong> Daten (funktionale
							Speicherung). Es erfolgt kein Tracking zu Werbezwecken.
						</p>

						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-2">
							Cookies
						</h3>
						<ul className="list-disc list-inside text-[0.95rem] text-[#555] space-y-1 ml-2">
							<li>
								<strong>auth-token:</strong> Speichert die Anmeldeinformationen und Sitzungsdaten für alle angemeldeten Benutzer (Dauer: 4 Std. für administrative Rollen / 30 Tage für Vertriebsmitarbeiter).
							</li>
							<li>
								<strong>sales-session-id:</strong> Verknüpft Ihren Browser mit Ihrer aktuellen Beratungs-Sitzung (Dauer: 30 Tage).
							</li>
							<li>
								<strong>sales-device-id:</strong> Identifiziert verifizierte Endgeräte zur Erhöhung der Sicherheit und zur Vermeidung wiederholter E-Mail-Verifizierungen (Dauer: 365 Tage).
							</li>
						</ul>

						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-4">
							Local Storage
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Im Local Storage werden Informationen dauerhaft gespeichert, bis
							Sie Ihren Browser-Cache leeren oder die Daten in den Einstellungen
							des Tools löschen:
						</p>
						<ul className="list-disc list-inside text-[0.95rem] text-[#555] space-y-1 ml-2">
							<li>
								<strong>setup-user-firstName & setup-user-lastName:</strong> Ihr
								Vor- und Nachname zur Personalisierung der Beratungsoberfläche
								(zusätzlich zur serverseitigen Speicherung).
							</li>
							<li>
								<strong>setup-user-email:</strong> Ihre E-Mail-Adresse zur
								Wiedererkennung bei erneutem Aufruf.
							</li>
							<li>
								<strong>setup-completed:</strong> Zeitstempel des
								abgeschlossenen Setups.
							</li>
							<li>
								<strong>onboarding-completed-v3:</strong> Statusinformation, ob
								Sie das Einführungstutorial bereits gesehen haben.
							</li>
							<li>
								<strong>splash-timestamp:</strong> Letzte Anzeige des
								Startbildschirms (zur Vermeidung unnötiger Wiederholungen).
							</li>
							<li>
								<strong>basket-storage:</strong> Speichert die Produkte, die Sie
								Ihrem Warenkorb hinzugefügt haben.
							</li>
							<li>
								<strong>settings-values:</strong> Speichert die von Ihnen
								ausgewählten Einstellungen.
							</li>
						</ul>
						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-4">
							Session Storage
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Im Session Storage werden Informationen flüchtig gespeichert.
							Diese Daten werden automatisch gelöscht, sobald Sie den
							entsprechenden Tab oder Ihren Browser schließen:
						</p>
						<ul className="list-disc list-inside text-[0.95rem] text-[#555] space-y-1 ml-2">
							<li>
								<strong>saleshelper_session:</strong> Speichert temporär die zugewiesene Benutzerrolle und Berechtigungen, um die korrekten Funktionen auf der Benutzeroberfläche freizugeben.
							</li>
						</ul>

					</section>

					<section className="space-y-4">
						<h2 className="text-xl font-bold text-[#1a1a2e]">
							5. Speicherdauer und Betroffenenrechte
						</h2>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Sitzungsinformationen (Sales Sessions) werden nach Ablauf eines
							systemdefnierten Zeitraums (in der Regel 30 Tage) automatisch
							unwiderruflich gelöscht. Server-Logs werden nach wenigen Tagen
							rotiert und gelöscht, sofern keine Anzeichen auf einen andauernden
							Missbrauch vorliegen, dessen Aufklärung eine längere Speicherung
							nach sich zieht.
						</p>
						<p className="text-[0.95rem] text-[#555] leading-relaxed pt-2">
							<strong>Ihre Rechte:</strong> Da es sich um personenbezogene Daten
							handelt (IP-Adresse), haben Sie im Rahmen der geltenden
							gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche
							Auskunft über Ihre gespeicherten personenbezogenen Daten, deren
							Herkunft und Empfänger und den Zweck der Datenverarbeitung und
							ggf. ein Recht auf Berichtigung oder Löschung dieser Daten. Hierzu
							sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich an
							den internen Datenschutzbeauftragten oder Ihren Teamleiter wenden.
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
