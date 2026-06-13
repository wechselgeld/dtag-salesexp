'use client';

import {
	useState, useEffect,
} from 'react';
import {
	useRouter,
} from 'next/navigation';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	Sparkles, Sparkle, ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';
import {
	PremiumButton,
} from '@/components/shared/form/form-suite';
import {
	useChangelogStore,
} from '@/lib/store/changelog-store';
import {
	useModalStore,
} from '@/lib/store/modal-store';
import {
	useSettingsStore,
} from '@/lib/store/settings-store';
import {
	CHANGELOG_DATA,
} from '@/lib/data/changelog-data';

export function WhatsNewModal() {
	const router = useRouter();
	const lastSeenChangelogId = useChangelogStore((state) => state.lastSeenChangelogId);
	const setLastSeenChangelogId = useChangelogStore((state) => state.setLastSeenChangelogId);
	const acknowledgeFeature = useChangelogStore((state) => state.acknowledgeFeature);

	const setSalesTipsOpen = useModalStore((state) => state.setSalesTipsOpen);
	const acceptedTracking = useSettingsStore((state) => state.acceptedTracking);

	const [
		mounted,
		setMounted,
	] = useState(false);
	const [
		isOpen,
		setIsOpen,
	] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;

		// Delay showing what's new modal if the user is currently deciding tracking consent
		if (acceptedTracking === null) {
			setIsOpen(false);
			return;
		}

		const hasCompletedOnboarding = localStorage.getItem('onboarding-completed-v3') === 'true';
		const latestRelease = CHANGELOG_DATA[0];

		if (!latestRelease) return;

		const latestId = latestRelease.id;

		if (lastSeenChangelogId === null) {
			if (hasCompletedOnboarding) {
				// Returning user from before the store was introduced
				setIsOpen(true);
			} else {
				// Brand new user - mark current as read so they don't see popups of past features
				setLastSeenChangelogId(latestId);
			}
		} else if (lastSeenChangelogId !== latestId) {
			// Returning user with an older ID - only popup if the latest release is marked as major
			if (latestRelease.isMajor) {
				setIsOpen(true);
			}
		}
	}, [
		mounted,
		acceptedTracking,
		lastSeenChangelogId,
		setLastSeenChangelogId,
	]);

	if (!mounted || !isOpen) {
		return null;
	}

	const latestRelease = CHANGELOG_DATA[0];
	const isSalesTippsMajor = latestRelease?.featuredKey === 'sales-tips';

	const handleClose = () => {
		if (latestRelease) {
			setLastSeenChangelogId(latestRelease.id);
		}
		setIsOpen(false);
	};

	const handleAction = () => {
		if (latestRelease) {
			setLastSeenChangelogId(latestRelease.id);
			if (latestRelease.featuredKey) {
				acknowledgeFeature(latestRelease.featuredKey);
				if (latestRelease.featuredKey === 'sales-tips') {
					setSalesTipsOpen(true);
				}
			}
		}
		setIsOpen(false);
	};

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
								<Sparkles className="w-6 h-6" />
							</div>
							<h3 className="text-[1.2rem] font-extrabold text-[#1a1a2e] tracking-tight">
								Das ist Neu
							</h3>
							<p className="text-[0.875rem] text-[#666] leading-relaxed max-w-sm">
								Update vom {latestRelease.title}
							</p>
						</div>

						{/* Render Staggered Change Items */}
						<div className="w-full text-left divide-y divide-slate-100 bg-[#fbfbfc] border border-slate-100 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
							{latestRelease.items.map((item, idx) => {
								const isAdded = item.q === 'Hinzugefügt';
								const isChanged = item.q === 'Geändert';
								const isRemoved = item.q === 'Entfernt';
								return (
									<motion.div
										key={idx}
										initial={{
											opacity: 0,
											y: 8,
										}}
										animate={{
											opacity: 1,
											y: 0,
										}}
										transition={{
											delay: 0.05 + idx * 0.05,
											duration: 0.4,
										}}
										className="py-3 first:pt-0 last:pb-0 flex items-start gap-3.5"
									>
										<div className="shrink-0 pt-0.5 min-w-[76px]">
											<span className={clsx(
												'inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded',
												isAdded && 'text-[#e20074] bg-[#e20074]/5',
												isChanged && 'text-[#3b82f6] bg-[#3b82f6]/5',
												isRemoved && 'text-[#64748b] bg-[#64748b]/5',
											)}>
												{item.q}
											</span>
										</div>
										<p className="text-[0.825rem] text-slate-600 leading-relaxed font-normal m-0">
											{item.a}
										</p>
									</motion.div>
								);
							})}
						</div>

						<div className="flex flex-col gap-2 pt-1">
							<PremiumButton
								onClick={() => handleAction()}
								className="w-full"
							>
								{isSalesTippsMajor ? 'Sales Tipps mit KI ausprobieren' : 'Verstanden & Loslegen!'}
							</PremiumButton>

							<button
								onClick={() => {
									handleClose();
									router.push('/changelog');
								}}
								className="text-xs text-[#888] hover:text-[#e20074] transition-all font-semibold py-2 bg-transparent border-none cursor-pointer flex items-center justify-center gap-1 mx-auto active:scale-[0.98] group/lnk"
							>
								<span>Vollständigen Änderungsverlauf ansehen</span>
								<ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/lnk:translate-x-0.5" />
							</button>
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
							onClick={handleClose}
							className="text-xs text-white/80 hover:text-white hover:bg-transparent font-semibold py-1 h-auto cursor-pointer flex items-center gap-1"
						>
							Später ansehen
						</PremiumButton>
					</motion.div>
				</div>
			</div >
		</AnimatePresence >
	);
}
