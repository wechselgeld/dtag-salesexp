import type {
	Metadata,
} from 'next';
import {
	Building2, Info, FileText,
} from 'lucide-react';
import Link from 'next/link';
import {
	GlobalFooter,
} from '@/components/shared/global-footer';
import { PageHeader } from '@/components/shared/page-header';
import {
	BackButton,
} from '@/components/shared/back-button';

export const metadata: Metadata = {
	title: 'Impressum',
};

export default function ImpressumPage() {
	return (
		<div className="min-h-screen py-16 px-4 selection:bg-black/10 selection:text-black">
			<div className="max-w-3xl mx-auto">
				<PageHeader
					title="Impressum"
					description="Angaben gemäß § 5 TMG."
					logoClassName="ml-2"
					hideLogo={true}
				/>

				{/* Content */}
				<div className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] p-8 sm:p-12 space-y-10">
					<section className="space-y-4 font-sans">
						<div className="flex items-center gap-2 mb-2">
							<Building2 className="w-5 h-5 text-black" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								Verantwortlich & Ansprechpartner
							</h2>
						</div>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Buff Interactive - Felix Kinze & Leon Trepesch GbR
							<br />
							Eulitzstr. 1
							<br />
							09112 Chemnitz
							<br />
							Deutschland
						</p>
						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-2">
							Vertreten durch die Gesellschafter:
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Felix Kinze & Leon Trepesch
						</p>
					</section>

					<section className="space-y-4 font-sans">
						<div className="flex items-center gap-2 mb-2">
							<Info className="w-5 h-5 text-black" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								Kontakt & Gesellschaftsinformationen
							</h2>
						</div>
						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e]">
							Kontakt
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							E-Mail:{' '}
							<a
								href="mailto:service@buffinteractive.net"
								className="text-black hover:underline"
							>
								service@buffinteractive.net
							</a>
						</p>
						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-2">
							Sitz der Gesellschaft
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Chemnitz
						</p>
						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] pt-2">
							Umsatzsteuer-ID
						</h3>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
							<br />
							<strong>DE463435130</strong>
						</p>
					</section>

					<section className="space-y-4 font-sans">
						<div className="flex items-center gap-2 mb-2">
							<FileText className="w-5 h-5 text-black" />
							<h2 className="text-xl font-bold text-[#1a1a2e]">
								Haftung & Datenschutz
							</h2>
						</div>
						<p className="text-[0.95rem] text-[#555] leading-relaxed">
							Dieses Tool dient der Vertriebsunterstützung und Beratung. Alle
							dargestellten Preise und Konditionen sind unverbindlich und dienen
							lediglich der Beratung.
						</p>
						<p className="text-[0.95rem] text-[#555] leading-relaxed mt-4 p-4 bg-[#f7f8fa] border border-[#eaedf0] rounded-xl">
							Personenbezogene Daten werden nur im absolut minimal nötigen
							Rahmen zur technischen Bereitstellung der Anwendungsfunktionalität
							verarbeitet. Weitere Informationen hierzu entnehmen Sie bitte der
							dedizierten{' '}
							<Link
								href="/privacy"
								className="text-[#1a1a2e] font-bold hover:text-black transition-colors underline underline-offset-2"
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
