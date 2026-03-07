import { motion } from "framer-motion";
import { ShieldCheck, Info, FileText } from "lucide-react";
import Link from "next/link";
import { TelekomLogo } from "@/components/shared/telekom-logo";

export default function PrivacyPage() {
	return (
		<div className="min-h-screen py-16 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074]">
			<div className="max-w-3xl mx-auto">
				{/* Header */}
				<div className="flex flex-col items-center mb-12 text-center">
					<TelekomLogo className="w-12 h-12 text-[#e20074] mb-8 ml-2" />
					<h1 className="text-3xl font-extrabold text-[#1a1a2e] tracking-tight mb-4">
						Datenschutzerklärung
					</h1>
					<p className="text-[#888] font-medium max-w-xl">
						Informationspflichten nach Art. 13 DSGVO für Mitarbeiter und
						Berechtigte zur Nutzung des internen Beratungstools (Sales
						Experience).
					</p>
				</div>

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
							Deutsche Telekom Service GmbH
							<br />
							Service-Standort Chemnitz
							<br />
							Reichenhainer Str. 68 A
							<br />
							09126 Chemnitz
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
							Unsere Hosting-Anbieter (Vercel Inc. / Oracle) sowie unser
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
							statistische Auswertungen über die Systemnutzung auf Team-Ebene zu
							fahren, werden folgende Daten in der Datenbank temporär
							gespeichert, sobald Sie die Nutzungsbedingungen akzeptieren und
							eine Session starten:
						</p>
						<ul className="list-disc list-inside text-[0.95rem] text-[#555] space-y-1 ml-2">
							<li>Ihre IP-Adresse</li>
							<li>Informationen zu Ihrem verwendeten Browser (User-Agent)</li>
							<li>Das von Ihnen ausgewählte Vertriebsteam</li>
							<li>Zeitpunkt des Starts der Sitzung (Timestamp)</li>
							<li>
								Information über die Akzeptanz des internen Nutzungshinweises
							</li>
						</ul>
						<p className="text-[0.95rem] text-[#555] leading-relaxed mt-2 p-4 bg-[#f7f8fa] border border-[#eaedf0] rounded-xl">
							Es findet{" "}
							<strong>
								kein Tracking Ihres spezifischen Nutzungsverhaltens
							</strong>{" "}
							statt. Das System erfasst lediglich, welches Team zu welchem
							Zeitpunkt das Tool gestartet hat, um den Zugriff eingrenzen und
							auswerten zu können.
						</p>
					</section>

					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<Info className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								3. Drittanbieter und Hosting
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
							Vercel (Hosting & Applikationslogik)
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Die Bereitstellung der Website erfolgt über die Plattform Vercel.
							Anbieter ist die Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA
							91789, USA. Vercel nutzt ein globales Content Delivery Network
							(CDN), um statische Dateien performant zur Verfügung zu stellen.
							Die serverseitige Verarbeitung (Backend-Funktionen) findet primär
							auf Servern innerhalb der Europäischen Union (Region: Frankfurt am
							Main, Deutschland) statt. Eine Übertragung von Metadaten in die
							USA kann im Rahmen der Infrastrukturnutzung erfolgen. Die Nutzung
							erfolgt zur Erfüllung unseres berechtigten Interesses an einer
							hochverfügbaren Bereitstellung (Art. 6 Abs. 1 lit. f DSGVO). Die
							Vercel Inc. ist nach dem EU-U.S. Data Privacy Framework
							zertifiziert.
						</p>

						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-4">
							Oracle Cloud Infrastructure (Datenbank)
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Die durch diese Anwendung verarbeiteten Daten (z. B.
							Sitzungsinformationen) werden in einer Datenbank der Oracle Cloud
							Infrastructure (OCI) gespeichert. Anbieter ist die Oracle
							Corporation. Die physische Speicherung und Verarbeitung dieser
							Daten findet ausschließlich im Rechenzentrum in Frankfurt am Main,
							Deutschland (Region: eu-frankfurt-1), statt. Da durch dieses Tool
							keine Kundendaten verarbeitet werden, sondern lediglich
							anonymisierte bzw. rein auf die Teamnutzung bezogene Meta-Daten
							anfallen, erfolgt die Nutzung auf Basis technischer
							Bereitstellungsinteressen der Infrastruktur.
						</p>
						<p className="text-[0.95rem] text-[#555] leading-relaxed mt-2 p-4 bg-[#f7f8fa] border border-[#eaedf0] rounded-xl">
							Wir haben mit den oben genannten Anbietern (Cloudflare, Vercel &
							Oracle) Verträge zur Auftragsverarbeitung (AVV) abgeschlossen.
							Diese garantieren, dass die Dienstleister die Daten ausschließlich
							nach unseren Weisungen und unter Einhaltung der DSGVO verarbeiten.
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
							Dieses Tool verwendet Cookies und den Local Storage Ihres
							Browsers, um eine reibungslose Funktion und Sitzungsverwaltung zu
							gewährleisten. Es handelt sich hierbei ausschließlich um{" "}
							<strong>technisch notwendige</strong> Daten (funktionale
							Speicherung). Es erfolgt kein Tracking zu Werbezwecken.
						</p>

						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-2">
							Cookies
						</h3>
						<ul className="list-disc list-inside text-[0.95rem] text-[#555] space-y-1 ml-2">
							<li>
								<strong>auth-token:</strong> Speichert die Anmeldeinformationen
								für Administratoren (Dauer: 24 Std.).
							</li>
							<li>
								<strong>sales-session-id:</strong> Verknüpft Ihren Browser mit
								Ihrer aktuellen Beratungs-Sitzung (Dauer: 30 Tage).
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
								Vor- und Nachname zur Personalisierung der Beratungsoberfläche.
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
						<Link
							href="/setup"
							className="inline-flex items-center justify-center px-6 py-3 bg-[#f7f8fa] hover:bg-[#eaedf0] text-[#1a1a2e] font-bold rounded-xl transition-colors"
						>
							Zurück zum Login
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
