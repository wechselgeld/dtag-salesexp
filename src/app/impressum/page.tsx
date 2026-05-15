import type {
	Metadata,
} from 'next';
import {
	Building2, Info, FileText,
} from 'lucide-react';
import Link from 'next/link';
import {
	TelekomLogo,
} from '@/components/shared/telekom-logo';
import {
	GlobalFooter,
} from '@/components/shared/global-footer';
import {
	BackButton,
} from '@/components/shared/back-button';

export const metadata: Metadata = {
	title: 'Impressum',
};

export default function ImpressumPage() {
	return (
		<div className="min-h-screen py-16 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074]">
			<div className="max-w-3xl mx-auto">
				{/* Header */}
				<div className="flex flex-col items-center mb-12 text-center">
					<TelekomLogo className="w-12 h-12 text-[#e20074] mb-8 ml-2" />
					<h1 className="text-3xl font-extrabold text-[#1a1a2e] tracking-tight mb-4">
						Impressum
					</h1>
					<p className="text-[#888] font-medium max-w-xl">
						Angaben gemäß § 5 TMG für die interne Nutzung der Sales Experience.
					</p>
				</div>

				{/* Content */}
				<div className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] p-8 sm:p-12 space-y-10">
					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<Building2 className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								Verantwortlich
							</h2>
						</div>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Buff Germany UG (haftungsbeschränkt)
							<br />
							Eulitzstr. 1
							<br />
							09112 Chemnitz
							<br/><br/>
							Besuchen Sie Buff Interactive gern auf ihrer Website unter <a href="https://buffinteractive.net">buffinteractive.net</a>.

						</p>
					</section>

					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<Info className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								Kontakt & Umsetzung
							</h2>
						</div>

						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-2">
							Verantwortliche Kontaktperson
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Karsten Gerlach
							<br />
							Telefon: Auf Anfrage
							<br />
							E-Mail:{' '}
							<a
								href="mailto:karsten.gerlach@telekom.de"
								className="text-[#e20074] hover:underline"
							>
								karsten.gerlach@telekom.de
							</a>
						</p>

						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-4">
							Technische Umsetzung
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Felix Kinze
							<br />
							Telefon: Auf Anfrage
							<br />
							E-Mail:{' '}
							<a
								href="mailto:felix.kinze@telekom.de"
								className="text-[#e20074] hover:underline"
							>
								felix.kinze@telekom.de
							</a>
						</p>
					</section>

					<section className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<FileText className="w-5 h-5 text-[#e20074]" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								Haftung & Datenschutz
							</h2>
						</div>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Dieses Tool dient ausschließlich der internen Verwendung durch
							autorisierte Mitarbeiter der Deutschen Telekom Service GmbH. Alle
							dargestellten Preise und Konditionen sind unverbindlich und dienen
							lediglich der Beratungsunterstützung. Die Verwendung für
							rechtsverbindliche Angebote an Endkunden basiert stets auf den
							operativen Buchungssystemen, nicht auf diesem UI.
						</p>
						<p className="text-[0.95rem] text-[#555] leading-relaxed mt-4 p-4 bg-[#f7f8fa] border border-[#eaedf0] rounded-xl">
							Personenbezogene Daten werden nur im absolut minimal nötigen
							Rahmen zur technischen Bereitstellung der Anwendungsfunktionalität
							verarbeitet. Weitere Informationen hierzu entnehmen Sie bitte der
							dedizierten{' '}
							<Link
								href="/privacy"
								className="text-[#1a1a2e] font-bold hover:text-[#e20074] transition-colors underline underline-offset-2"
							>
								Datenschutzerklärung
							</Link>
							.
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
