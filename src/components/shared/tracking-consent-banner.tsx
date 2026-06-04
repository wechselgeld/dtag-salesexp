'use client';

import {
	useState, useEffect,
} from 'react';
import {
	useSettingsStore,
} from '@/lib/store/settings-store';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import Link from 'next/link';
import {
	BarChart3,
} from 'lucide-react';
import {
	PremiumButton,
} from '@/components/shared/form/form-suite';

export function TrackingConsentBanner() {
	const acceptedTracking = useSettingsStore((state) => state.acceptedTracking);
	const setAcceptedTracking = useSettingsStore((state) => state.setAcceptedTracking);

	const [
		mounted,
		setMounted,
	] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, [
	]);

	if (!mounted || acceptedTracking !== null) {
		return null;
	}

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
				<div className="flex flex-col items-center gap-4 w-full max-w-md">
					<motion.div
						initial={{
							opacity: 0,
							scale: 0.95,
							y: 10,
						}}
						animate={{
							opacity: 1,
							scale: 1,
							y: 0,
						}}
						exit={{
							opacity: 0,
							scale: 0.95,
							y: 10,
						}}
						transition={{
							duration: 0.25,
							ease: 'easeOut',
						}}
						className="bg-white rounded-3xl border border-[#eaedf0] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-8 w-full flex flex-col gap-6 text-center relative"
					>
						<div className="flex flex-col items-center gap-3">
							<div className="w-12 h-12 rounded-full bg-[#e20074]/10 text-[#e20074] flex items-center justify-center shrink-0">
								<BarChart3 className="w-6 h-6" />
							</div>
							<h3 className="text-[1.2rem] font-extrabold text-[#1a1a2e] tracking-tight">
								Nutzungsanalyse aktivieren?
							</h3>
							<p className="text-[0.875rem] text-[#666] leading-relaxed max-w-sm">
								Zur kontinuierlichen Optimierung der Sales Experience möchten wir anonyme Nutzungsdaten erheben.
								Weitere Details findest Du in unserer{' '}
								<Link
									href="/tracking"
									className="text-[#e20074] hover:underline font-semibold"
								>
									Erklärung zu Tracking &amp; Analysen
								</Link>
								.
							</p>
						</div>

						<div className="flex flex-col gap-2 pt-2">
							<PremiumButton
								onClick={() => setAcceptedTracking(true)}
								className="w-full"
							>
								Zustimmen
							</PremiumButton>
						</div>
					</motion.div>

					<motion.div
						initial={{
							opacity: 0,
							y: 10,
						}}
						animate={{
							opacity: 1,
							y: 0,
						}}
						exit={{
							opacity: 0,
							y: 10,
						}}
						transition={{
							delay: 0.1,
							duration: 0.25,
						}}
					>
						<PremiumButton
							variant="ghost"
							onClick={() => setAcceptedTracking(false)}
							className="text-xs text-white/80 hover:text-white hover:bg-transparent font-medium py-1 h-auto cursor-pointer"
						>
							Nein danke, nicht analysieren
						</PremiumButton>
					</motion.div>
				</div>
			</div>
		</AnimatePresence>
	);
}
