"use client";

import { motion } from "framer-motion";
import { Construction, Lock } from "lucide-react";
import { TelekomLogo } from "./telekom-logo";
import Link from "next/link";

export function MaintenanceSplash() {
	return (
		<div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-sans">
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="max-w-[480px] w-full text-center space-y-8"
			>
				<div className="flex flex-col items-center mb-12 text-center">
					<TelekomLogo className="w-12 h-12 text-[#e20074] mb-8 ml-2" />
					<h1 className="text-3xl font-extrabold text-[#1a1a2e] tracking-tight mb-4">
						Wartungsmodus
					</h1>
					<p className="text-[#888] font-medium max-w-xl">
						Die Sales Experience wird gerade aktualisiert, um dir ein noch
						besseres Erlebnis zu bieten.
					</p>
				</div>

				<div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 text-left">
					<div className="flex gap-4">
						<Construction className="w-5 h-5 text-zinc-400 shrink-0 mt-1" />
						<div>
							<h3 className="font-bold text-zinc-800 m-0">
								System vorübergehend gesperrt
							</h3>
							<p className="text-sm text-zinc-500 m-0 mt-1">
								Während der Wartungsarbeiten können keine Angebote erstellt oder
								bearbeitet werden. Das System ist in Kürze wieder für dich da!
							</p>

							<div className="pt-4">
								<Link
									href="/login"
									className="inline-flex items-center gap-2 text-zinc-400 hover:text-magenta-500 transition-colors text-sm font-semibold"
								>
									<Lock className="w-3.5 h-3.5" />
									Oder melde Dich hier als Administrator an.
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-14 text-center text-[0.75rem] font-medium text-[#c0c0c0]">
					&copy; {new Date().getFullYear()} Felix Kinze für Deutsche Telekom
					Service GmbH &bull; Via www.flxk.nz
				</div>
			</motion.div>
		</div>
	);
}
