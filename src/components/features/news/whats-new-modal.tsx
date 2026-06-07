'use client';

import {
	useState, useEffect,
} from 'react';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	Sparkles, Sparkle,
} from 'lucide-react';
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
						<div className="w-full text-left space-y-3.5 my-1">
							{latestRelease.items.map((item, idx) => (
								<motion.div
									key={idx}
									initial={{
										opacity: 0,
										x: -10,
									}}
									animate={{
										opacity: 1,
										x: 0,
									}}
									transition={{
										delay: 0.1 + idx * 0.1,
										duration: 0.3,
									}}
									className="bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl p-4 flex flex-col gap-1 transition-all hover:border-[#e20074]/20 hover:shadow-xs group"
								>
									<div className="flex items-center gap-1.5">
										<span className="text-[0.65rem] font-extrabold text-[#e20074] uppercase tracking-wider bg-[#e20074]/5 px-2 py-0.5 rounded-md group-hover:bg-[#e20074]/10 transition-colors">
											{item.q}
										</span>
									</div>
									<p className="text-[0.825rem] text-[#4a4a5e] leading-relaxed font-medium m-0 pt-0.5">
										{item.a}
									</p>
								</motion.div>
							))}
						</div>

						<div className="flex flex-col gap-2 pt-1">
							<PremiumButton
								onClick={() => handleAction()}
								className="w-full"
							>
								{isSalesTippsMajor ? 'Sales Tipps ausprobieren' : 'Verstanden & Loslegen!'}
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
