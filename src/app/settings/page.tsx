'use client';

import {
	ArrowLeft,
	Palette,
	ShoppingBag,
	Info,
	RotateCcw,
	Trash2,
	Users,
	Fingerprint,
	Eye,
	BookOpen,
	Copy,
	Check,
	FileText,
	MonitorPlay,
} from 'lucide-react';

import {
	TelekomLogo,
} from '@/components/shared/telekom-logo';
import {
	GlobalFooter,
} from '@/components/shared/global-footer';
import clsx from 'clsx';
import {
	motion,
} from 'framer-motion';
import {
	useBasketStore,
} from '@/hooks/use-basket-store';
import {
	useSettingsStore,
} from '@/hooks/use-settings-store';
import {
	useRouter,
} from 'next/navigation';
import {
	trpc,
} from '@/lib/trpc';
import {
	useState, useCallback,
} from 'react';

export default function SettingsPage() {
	const {
		clearBasket,
	} = useBasketStore();
	const {
		compactView,
		setCompactView,
		clearAfterExport,
		setClearAfterExport,
		reduceAnimations,
		setReduceAnimations,
		offerTemplateText,
		setOfferTemplateText,
		showHeroImage,
		setShowHeroImage,
	} = useSettingsStore();
	const router = useRouter();
	const {
		data: session,
	} = trpc.session.getCurrent.useQuery();
	const logoutMutation = trpc.session.logout.useMutation({
		onSuccess: () => {
			router.push('/setup');
			router.refresh();
		},
	});

	const [
		copiedField,
		setCopiedField,
	] = useState<string | null>(null);

	const handleReset = () => {
		clearBasket();
		const keysToRemove = [
			'splash-timestamp',
			'setup-completed',
		];
		keysToRemove.forEach((key) => localStorage.removeItem(key));
		logoutMutation.mutate();
	};

	const handleClearCache = () => {
		// Clear all app-specific localStorage entries
		const keysToRemove = [
			'basket-storage',
			'splash-timestamp',
			'onboarding-completed-v3',
			'settings-values',
			'setup-user-firstName',
			'setup-user-lastName',
			'setup-completed',
		];
		keysToRemove.forEach((key) => localStorage.removeItem(key));
		handleReset();
	};

	const handleRestartOnboarding = () => {
		localStorage.removeItem('onboarding-completed-v3');
		router.push('/');
		// The onboarding component will auto-start on next mount
		setTimeout(() => window.location.reload(), 100);
	};

	const copyToClipboard = useCallback((text: string, field: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
	}, [
	]);

	return (
		<div className="min-h-screen py-12 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074]">
			<div className="max-w-3xl mx-auto">
				{/* ─── Header / Branding ─── */}
				<motion.div
					initial={{
						opacity: 0,
						y: 12,
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
					className="flex flex-col items-center mb-10 text-center"
				>
					<TelekomLogo className="w-12 h-12 text-[#e20074] mb-8" />
					<h1 className="text-3xl sm:text-[2.5rem] font-extrabold text-[#1a1a2e] tracking-tight mb-3 leading-none">
						Einstellungen
					</h1>
					<p className="text-[1.05rem] text-[#888] font-normal leading-relaxed max-w-md mx-auto mt-1">
						Personalisiere Deine Sales Experience.
					</p>
				</motion.div>

				{/* ─── Main Card ─── */}
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
						delay: 0.1,
						ease: [
							0.16,
							1,
							0.3,
							1,
						],
					}}
					className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] p-8 sm:p-12 space-y-12"
				>
					{/* Sitzung & Team Section */}
					<section>
						<SectionHeader
							icon={<Users className="w-5 h-5 text-[#e20074]" />}
							title="Sitzung & Team"
						/>
						<div className="mt-6 space-y-4">
							<div className="flex items-center justify-between py-2 border-b border-[#f7f8fa]">
								<span className="text-[0.9rem] text-[#999] font-medium">
									Dein aktuelles Team
								</span>
								<div className="flex items-center gap-3">
									<span className="text-[0.9rem] font-bold text-[#1a1a2e]">
										{session?.team?.name ?? '—'}
									</span>
									<div className="relative group">
										<div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-[#eaedf0] hover:border-[#e20074]/30 hover:bg-[#e20074]/5 text-[#bbb] hover:text-[#1a1a2e] transition-all cursor-help shadow-sm">
											<Info className="w-4 h-4" />
										</div>
										<div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-[#1a1a2e] text-white text-[0.75rem] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none shadow-xl z-10 font-medium leading-relaxed">
											<p className="m-0">
												Um dein Team zu wechseln, musst du deine{' '}
												<span className="text-[#e20074] font-bold">
													Daten zurücksetzen
												</span>{' '}
												(siehe unten).
											</p>
											<div className="absolute top-full right-3 w-3 h-3 bg-[#1a1a2e] rotate-45 -mt-1.5" />
										</div>
									</div>
								</div>
							</div>

							<div className="flex items-center justify-between py-2 border-b border-[#f7f8fa]">
								<span className="text-[0.9rem] text-[#999] font-medium flex items-center gap-2">
									<Fingerprint className="w-4 h-4 text-[#ccc]" />
									Session-ID
								</span>
								<div className="flex items-center gap-3">
									<span className="text-[0.8rem] font-mono text-[#aaa] bg-[#f7f8fa] px-3 py-1 rounded-lg border border-[#eaedf0] max-w-[220px] truncate">
										{session?.id ?? '—'}
									</span>
									{session?.id && (
										<button
											onClick={() => copyToClipboard(session.id, 'session')}
											className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-[#eaedf0] hover:border-[#e20074]/30 hover:bg-[#e20074]/5 text-[#bbb] hover:text-[#1a1a2e] transition-all cursor-pointer shadow-sm"
											title="Session-ID kopieren"
										>
											{copiedField === 'session' ? (
												<Check className="w-4 h-4 text-[#00a878]" />
											) : (
												<Copy className="w-4 h-4" />
											)}
										</button>
									)}
								</div>
							</div>

							<div className="flex items-center justify-between py-2">
								<span className="text-[0.9rem] text-[#999] font-medium">
									Zugriffstatus
								</span>
								<span
									className={`text-[0.75rem] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
										session?.isVerified
											? 'text-[#00a878] bg-[#00a878]/10'
											: 'text-[#dc2626] bg-[#dc2626]/10'
									}`}
								>
									{session?.isVerified ? 'Verifiziert' : 'Inaktiv'}
								</span>
							</div>
						</div>
					</section>

					{/* Anzeige & UI Section */}
					<section>
						<SectionHeader
							icon={<Palette className="w-5 h-5 text-[#7b61ff]" />}
							title="Anzeige & Interface"
						/>
						<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
							<ToggleCard
								label="Kompakte Ansicht"
								description="Zeigt Tarif-Karten kleiner an, für mehr Übersicht auf kleinen Bildschirmen."
								icon={<Eye className="w-5 h-5 text-[#7b61ff]" />}
								checked={compactView}
								onChange={setCompactView}
							/>
							<ToggleCard
								label="Animationen reduzieren"
								description="Deaktiviert flüssige UI-Übergänge für maximale Performance."
								icon={<MonitorPlay className="w-5 h-5 text-[#7b61ff]" />}
								checked={reduceAnimations}
								onChange={setReduceAnimations}
							/>
							<ToggleCard
								label="Hero-Image anzeigen"
								description="Blendet das große Hintergrundbild im Header der Produktauswahl ein oder aus."
								icon={<ShoppingBag className="w-5 h-5 text-[#7b61ff]" />}
								checked={showHeroImage}
								onChange={setShowHeroImage}
							/>
						</div>
					</section>

					{/* Beratung & Verkauf Section */}
					<section>
						<SectionHeader
							icon={<FileText className="w-5 h-5 text-[#00a878]" />}
							title="Beratung & Verkauf"
						/>
						<div className="mt-8 space-y-6">
							<div className="flex flex-col gap-3">
								<div className="flex items-center justify-between">
									<h3 className="text-[0.9rem] font-bold text-[#1a1a2e] m-0">
										Angebotsvorlage-Text
									</h3>
									<span className="text-[0.7rem] font-bold text-[#ccc] uppercase tracking-widest">
										E-Mail Vorlage
									</span>
								</div>
								<p className="text-[0.85rem] text-[#888] m-0 leading-relaxed max-w-xl">
									Dieser Text wird als E-Mail-Inhalt verwendet, wenn Du ein
									PDF-Angebot aus dem Warenkorb exportierst.
								</p>
								<textarea
									value={offerTemplateText}
									onChange={(e) => setOfferTemplateText(e.target.value)}
									className="w-full h-[160px] p-4 text-[0.9rem] text-[#1a1a2e] bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl focus:outline-none focus:border-[#e20074] focus:ring-2 focus:ring-[#e20074]/10 focus:bg-white transition-all resize-none font-sans leading-relaxed"
									placeholder="Geben Sie hier Ihre Standard-Begrüßung ein..."
								/>
							</div>

							<div className="pt-4">
								<ToggleRow
									label="Warenkorb nach Export leeren"
									description="Leert den Warenkorb automatisch, sobald ein PDF-Angebot erstellt wurde."
									icon={<Trash2 className="w-4 h-4 text-[#ff6b00]" />}
									checked={clearAfterExport}
									onChange={setClearAfterExport}
								/>
							</div>
						</div>
					</section>

					{/* System & Daten Section */}
					<section>
						<SectionHeader
							icon={<RotateCcw className="w-5 h-5 text-[#0090d0]" />}
							title="System & Hilfe"
						/>

						<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl p-6 flex flex-col gap-4">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[#eaedf0] shadow-sm">
										<BookOpen className="w-5 h-5 text-[#0090d0]" />
									</div>
									<h4 className="text-[0.9rem] font-bold text-[#1a1a2e] m-0">
										App-Einführung
									</h4>
								</div>
								<p className="text-[0.8rem] text-[#888] m-0 leading-relaxed">
									Starte die interaktive Tour erneut, um alle Funktionen
									kennenzulernen.
								</p>
								<button
									onClick={handleRestartOnboarding}
									className="mt-auto px-4 py-3 rounded-xl bg-white border border-[#eaedf0] text-[0.85rem] font-bold text-[#0090d0] hover:bg-[#dbeafe] hover:border-[#0090d0]/30 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
								>
									Tour erneut starten
								</button>
							</div>

							<div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl p-6 flex flex-col gap-4">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[#eaedf0] shadow-sm">
										<RotateCcw className="w-5 h-5 text-[#dc2626]" />
									</div>
									<h4 className="text-[0.9rem] font-bold text-[#1a1a2e] m-0">
										Daten zurücksetzen
									</h4>
								</div>
								<p className="text-[0.8rem] text-[#888] m-0 leading-relaxed">
									Leert den lokalen Cache und setzt alle Sitzungsdaten zurück.
								</p>
								<div className="mt-auto flex gap-2">
									<button
										onClick={handleReset}
										className="flex-1 px-3 py-3 rounded-xl bg-white border border-[#eaedf0] text-[0.8rem] font-bold text-[#dc2626] hover:bg-[#fee2e2] hover:border-[#dc2626]/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
									>
										Sitzung
									</button>
									<button
										onClick={handleClearCache}
										className="flex-1 px-3 py-3 rounded-xl bg-white border border-[#eaedf0] text-[0.8rem] font-bold text-[#dc2626] hover:bg-[#fee2e2] hover:border-[#dc2626]/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
									>
										Alle Daten
									</button>
								</div>
							</div>
						</div>
					</section>

					<div className="pt-8 border-t border-[#f7f8fa] flex justify-center">
						<button
							onClick={() => window.history.back()}
							className="inline-flex items-center justify-center px-8 py-4 bg-[#1a1a2e] hover:bg-black text-white font-bold rounded-2xl transition-all cursor-pointer border-none shadow-lg shadow-[#1a1a2e]/20 active:scale-[0.98] gap-2"
						>
							<ArrowLeft className="w-4 h-4" />
							Zurück zur App
						</button>
					</div>
				</motion.div>

				<GlobalFooter
					className="pt-10 pb-0 mt-4 text-[#bbb]"
					linkColor="text-[#bbb]"
				/>
			</div>
		</div>
	);
}

function SectionHeader({
	icon,
	title,
}: {
	icon: React.ReactNode;
	title: string;
}) {
	return (
		<div className="flex items-center gap-4">
			<div className="w-11 h-11 rounded-2xl bg-[#f7f8fa] border border-[#eaedf0] flex items-center justify-center shrink-0 shadow-sm">
				{icon}
			</div>
			<h2 className="text-[1.2rem] font-extrabold text-[#1a1a2e] m-0 tracking-tight">
				{title}
			</h2>
		</div>
	);
}

function ToggleCard({
	label,
	description,
	icon,
	checked,
	onChange,
}: {
	label: string;
	description: string;
	icon: React.ReactNode;
	checked: boolean;
	onChange: (v: boolean) => void;
}) {
	return (
		<div
			onClick={() => onChange(!checked)}
			className={clsx(
				'p-5 rounded-3xl border transition-all duration-300 cursor-pointer group flex flex-col gap-4',
				checked
					? 'bg-[#e20074]/5 border-[#e20074]/30 shadow-sm'
					: 'bg-[#f7f8fa] border-[#eaedf0] hover:bg-white hover:border-[#d1d5db]',
			)}
		>
			<div className="flex items-center justify-between">
				<div
					className={clsx(
						'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
					)}
				>
					{icon}
				</div>
				<div
					className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
						checked ? 'bg-[#e20074]' : 'bg-[#ddd]'
					}`}
					role="switch"
					aria-checked={checked}
				>
					<span
						className={`pointer-events-none inline-block h-[20px] w-[20px] rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
							checked ? 'translate-x-[20px]' : 'translate-x-0'
						}`}
					/>
				</div>
			</div>
			<div>
				<h4
					className={clsx(
						'text-[0.95rem] font-extrabold m-0 mb-1',
						checked ? 'text-[#e20074]' : 'text-[#1a1a2e]',
					)}
				>
					{label}
				</h4>
				<p className="text-[0.8rem] text-[#888] m-0 leading-relaxed font-medium">
					{description}
				</p>
			</div>
		</div>
	);
}

function ToggleRow({
	label,
	description,
	icon,
	checked,
	onChange,
}: {
	label: string;
	description: string;
	icon: React.ReactNode;
	checked: boolean;
	onChange: (value: boolean) => void;
}) {
	return (
		<div className="flex items-start gap-4">
			<div className="w-10 h-10 rounded-xl bg-[#f7f8fa] border border-[#eaedf0] flex items-center justify-center shrink-0">
				{icon}
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between">
					<span className="text-[0.9rem] font-bold text-[#1a1a2e]">
						{label}
					</span>
					<button
						onClick={() => onChange(!checked)}
						className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
							checked ? 'bg-[#e20074]' : 'bg-[#ddd]'
						}`}
						role="switch"
						aria-checked={checked}
					>
						<span
							className={`pointer-events-none inline-block h-[20px] w-[20px] rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
								checked ? 'translate-x-[20px]' : 'translate-x-0'
							}`}
						/>
					</button>
				</div>
				<p className="text-[0.8rem] text-[#999] mt-1 m-0 leading-relaxed pr-12 font-medium">
					{description}
				</p>
			</div>
		</div>
	);
}
