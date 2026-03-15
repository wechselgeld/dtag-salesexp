'use client';

import {
	motion,
} from 'framer-motion';
import {
	Lock, ShieldAlert,
} from 'lucide-react';
import {
	TelekomLogo,
} from '@/components/shared/telekom-logo';
import {
	GlobalFooter,
} from '@/components/shared/global-footer';
import Link from 'next/link';

export function MaintenanceSplash() {
	return (
		<div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-[#e20074]/20 selection:text-[#e20074]">
			<motion.div
				initial={{
					opacity: 0,
					y: 15,
				}}
				animate={{
					opacity: 1,
					y: 0,
				}}
				transition={{
					duration: 0.5,
					ease: [
						0.16,
						1,
						0.3,
						1,
					],
				}}
				className="w-full max-w-[480px] flex flex-col items-center text-center"
			>
				{/* Top Branding */}
				<div className="mb-10 flex flex-col items-center">
					<TelekomLogo className="w-12 h-12 text-[#e20074] mb-8" />

					<h1 className="text-[2.2rem] sm:text-[2.5rem] font-extrabold text-[#1a1a2e] tracking-tight mb-3 leading-none">
						Wartungsmodus
					</h1>
					<p className="text-[1.05rem] text-[#888] font-normal leading-relaxed max-w-[90%] mx-auto mt-2">
						Die Sales Experience wird gerade aktualisiert, um Dir ein noch
						besseres Erlebnis zu bieten.
					</p>
				</div>

				{/* Maintenance Notice Box */}
				<div className="w-full bg-[#fdf2f8] border border-[#fbcfe8] rounded-2xl p-6 flex flex-col items-center text-center gap-4">
					<div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
						<ShieldAlert className="w-8 h-8 text-[#e20074]" />
					</div>

					<div className="space-y-2">
						<h3 className="text-[1.2rem] font-extrabold text-[#1a1a2e] tracking-tight">
							System vorübergehend gesperrt
						</h3>
						<p className="text-[0.95rem] text-[#888] leading-relaxed m-0">
							Während der Wartungsarbeiten können keine Angebote erstellt oder
							bearbeitet werden. Wir sind in Kürze wieder für Dich da!
						</p>
					</div>

					<div className="pt-4 border-t border-[#fbcfe8]/40 w-full">
						<Link
							href="/login"
							className="inline-flex items-center gap-2 text-[#e20074] hover:text-[#c70066] transition-colors text-sm font-bold bg-white/50 px-4 py-2 rounded-xl border border-[#fbcfe8]/50"
						>
							<Lock className="w-3.5 h-3.5" />
							Admin Login
						</Link>
					</div>
				</div>

				<GlobalFooter
					className="pt-14! pb-0! text-[#c0c0c0]"
					linkColor="text-[#c0c0c0]"
				/>
			</motion.div>
		</div>
	);
}
