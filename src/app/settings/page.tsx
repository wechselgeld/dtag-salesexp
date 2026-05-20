'use client';

import {
	ArrowLeft,
	Palette,
	RotateCcw,
	Users,
	Fingerprint,
	BookOpen,
	Copy,
	Check,
	FileText,
	Search,
	Sparkles,
	MapPin,
	Lock,
	CheckCircle2,
	ArrowRight,
	ArrowUpDown,
} from 'lucide-react';

import {
 TelekomLogo,
} from '@/components/shared/telekom-logo';
import {
 GlobalFooter,
} from '@/components/shared/global-footer';
import clsx from 'clsx';
import {
 motion, AnimatePresence,
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
 useState, useCallback, useEffect, useRef,
} from 'react';
import {
	PremiumInput,
	PremiumButton,
	SelectionTile,
	ScreenHeader,
	ErrorBanner,
	InfoCard,
} from '@/components/shared/form/form-suite';
import {
 PremiumPinInput,
} from '@/components/shared/premium-pin-input';
import {
 Skeleton,
} from '@/components/shared/skeleton';
import {
 Textarea,
} from '@/components/shared/ui/textarea';

const TABS = [
	{
 id: 'profile',
label: 'Profil & Team',
icon: <Users className="w-4 h-4" />,
},
	{
 id: 'security',
label: 'Sicherheit',
icon: <Lock className="w-4 h-4" />,
},
	{
 id: 'interface',
label: 'Interface',
icon: <Palette className="w-4 h-4" />,
},
	{
		id: 'templates',
		label: 'Vorlagen & Verkauf',
		icon: <FileText className="w-4 h-4" />,
	},
	{
 id: 'system',
label: 'System & Hilfe',
icon: <RotateCcw className="w-4 h-4" />,
},
] as const;

type TabId = typeof TABS[number]['id'];

interface LocationItem {
	id: string;
	name: string;
	address?: string | null;
	isActive?: boolean;
}

interface TeamItem {
	id: string;
	name: string;
	email?: string;
}

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
		bypassResolutionGuard,
		setBypassResolutionGuard,
		sortOption,
		setSortOption,
	} = useSettingsStore();
	const router = useRouter();

	// Session query
	const {
		data: session,
		refetch: refetchCurrentSession,
	} = trpc.session.getCurrent.useQuery();

	const logoutMutation = trpc.session.logout.useMutation({
		onSuccess: () => {
			router.push('/setup');
			router.refresh();
		},
	});

	// --- Passkey (WebAuthn) Enrollment ---
	const getRegOptions = trpc.webauthn.generateRegistrationOptions.useMutation();
	const verifyReg = trpc.webauthn.verifyRegistration.useMutation();
	const [isPasskeyRegistering, setIsPasskeyRegistering] = useState(false);
	const [passkeyError, setPasskeyError] = useState<string | null>(null);
	const [passkeySuccess, setPasskeySuccess] = useState(false);

	const handleRegisterPasskey = async () => {
		if (!session?.email) {
			setPasskeyError('Keine aktive Sitzung gefunden oder E-Mail fehlt.');
			return;
		}
		setIsPasskeyRegistering(true);
		setPasskeyError(null);
		setPasskeySuccess(false);
		try {
			const { startRegistration } = await import('@simplewebauthn/browser');
			const options = await getRegOptions.mutateAsync({
				email: session.email,
			});
			const resp = await startRegistration({
				optionsJSON: options,
			});
			await verifyReg.mutateAsync({
				email: session.email,
				response: resp,
			});
			setPasskeySuccess(true);
		} catch (err: any) {
			console.error('Passkey registration failed', err);
			setPasskeyError(err.message || 'Fehler bei der Passkey-Registrierung.');
		} finally {
			setIsPasskeyRegistering(false);
		}
	};

	const [
 activeTab,
setActiveTab,
] = useState<TabId>('profile');
	const [
 copiedField,
setCopiedField,
] = useState<string | null>(null);

	// Card height morphing variables
	const cardRef = useRef<HTMLDivElement>(null);
	const [
 cardHeight,
setCardHeight,
] = useState<number | 'auto'>('auto');

	useEffect(() => {
		if (!cardRef.current) return;
		const observer = new ResizeObserver((entries) => {
			setCardHeight(
				entries[0].borderBoxSize?.[0]?.blockSize ??
					entries[0].target.getBoundingClientRect().height,
			);
		});
		observer.observe(cardRef.current);
		return () => observer.disconnect();
	}, [
]);

	// --- Team/Location Switcher States ---
	const [
 isSwitcherOpen,
setIsSwitcherOpen,
] = useState(false);
	const [
 switcherStep,
setSwitcherStep,
] = useState<1 | 2>(1);
	const [
 locationSearch,
setLocationSearch,
] = useState('');
	const [
 debouncedSearch,
setDebouncedSearch,
] = useState('');
	const [
 selectedLocationId,
setSelectedLocationId,
] = useState<string | null>(null);
	const [
 selectedTeamId,
setSelectedTeamId,
] = useState<string | null>(null);
	const [
 isSwitcherSaving,
setIsSwitcherSaving,
] = useState(false);
	const [
 switcherError,
setSwitcherError,
] = useState<string | null>(null);

	// Debounce location search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(locationSearch);
		}, 300);
		return () => clearTimeout(timer);
	}, [
 locationSearch,
]);

	// Fetch locations (enabled only when switcher is open)
	const {
		data: locations,
		isLoading: isLocationsLoading,
	} = trpc.location.list.useQuery(
		{
			search: debouncedSearch || undefined,
			limit: debouncedSearch ? 100 : 6,
		},
		{
			enabled: isSwitcherOpen,
			refetchOnWindowFocus: false,
		},
	);

	// Fetch teams for selected location
	const {
		data: teams,
		isLoading: isTeamsLoading,
	} = trpc.team.list.useQuery(
		selectedLocationId ? {
			locationId: selectedLocationId,
		} : undefined,
		{
			enabled: isSwitcherOpen && !!selectedLocationId,
		},
	);

	const updateTeamMutation = trpc.session.updateTeam.useMutation();

	// Initialize selected IDs from active session when opening switcher
	useEffect(() => {
		if (isSwitcherOpen && session) {
			setSelectedLocationId(session.locationId || null);
			setSelectedTeamId(session.teamId || null);
		}
	}, [
 isSwitcherOpen,
session,
]);

	const handleSaveTeamChange = async () => {
		if (!selectedTeamId) return;
		setIsSwitcherSaving(true);
		setSwitcherError(null);
		try {
			await updateTeamMutation.mutateAsync({
				teamId: selectedTeamId,
			});
			await refetchCurrentSession();
			setIsSwitcherOpen(false);
			setSwitcherStep(1);
			setLocationSearch('');
		}
 catch (err: any) {
			setSwitcherError(err.message || 'Fehler beim Aktualisieren des Standorts/Teams.');
		}
 finally {
			setIsSwitcherSaving(false);
		}
	};

	// --- PIN Changer States ---
	const [
 newPin,
setNewPin,
] = useState('');
	const [
 newPinConfirm,
setNewPinConfirm,
] = useState('');
	const [
 pinError,
setPinError,
] = useState<string | null>(null);
	const [
 pinSuccess,
setPinSuccess,
] = useState(false);
	const [
 isPinSaving,
setIsPinSaving,
] = useState(false);

	const updatePinMutation = trpc.session.updatePin.useMutation();

	const handleSavePin = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		setPinError(null);
		setPinSuccess(false);

		if (newPin.length !== 6 || newPinConfirm.length !== 6) {
			setPinError('Die PIN muss genau 6 Ziffern lang sein.');
			return;
		}

		if (newPin !== newPinConfirm) {
			setPinError('Die eingegebenen PINs stimmen nicht überein.');
			return;
		}

		setIsPinSaving(true);
		try {
			await updatePinMutation.mutateAsync({
				pin: newPin,
			});
			setPinSuccess(true);
			setNewPin('');
			setNewPinConfirm('');
			setTimeout(() => {
				setPinSuccess(false);
			}, 3000);
		}
 catch (err: any) {
			setPinError(err.message || 'Fehler beim Speichern der neuen PIN.');
		}
 finally {
			setIsPinSaving(false);
		}
	};

	// --- Live Preview Parsing ---
	const parsedTemplateText = (() => {
		if (!offerTemplateText) return '';
		const repName = session ? `${session.firstName || ''} ${session.lastName || ''}`.trim() : '';
		const finalRepName = repName || 'Vertriebsberater';
		return offerTemplateText.replace(/\{\{salesRepName\}\}/g, finalRepName);
	})();

	// --- Standard Helpers ---
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
		setTimeout(() => window.location.reload(), 100);
	};

	const copyToClipboard = useCallback((text: string, field: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
	}, []);

	// Render profile details & actions
	const renderProfileView = () => {
		const repName = session ? `${session.firstName || ''} ${session.lastName || ''}`.trim() : '';
		const initials = session ? `${session.firstName?.[0] || ''}${session.lastName?.[0] || ''}`.toUpperCase() : 'VB';

		return (
			<motion.div
				key="profile-view"
				initial={{
					opacity: 0,
					x: 15,
				}}
				animate={{
					opacity: 1,
					x: 0,
				}}
				exit={{
					opacity: 0,
					x: -15,
				}}
				className="flex flex-col gap-8 text-left"
			>
				<ScreenHeader
					icon={<Users className="w-5 h-5 text-[#e20074]" />}
					title="Profil & Team"
					subtitle="Hier siehst Du Deine aktuellen Profildaten und kannst Dein Team wechseln."
				/>

				{/* Brand-aligned Profile Card Section */}
				<div className="space-y-6">
					{/* Section 1: User Identity Card */}
					<div className="bg-[#f8f9fa] border border-[#eaedf0] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
						<div className="flex items-center gap-4 text-left">
							{/* Initials Avatar Bubble */}
							<div className="w-14 h-14 rounded-full bg-[#e20074] text-white flex items-center justify-center font-extrabold text-[1.2rem] shadow-sm shrink-0">
								{initials}
							</div>
							<div>
								<span className="text-[0.7rem] font-bold text-[#888] uppercase tracking-wider block font-sans">Vertriebsberater</span>
								<h4 className="text-[1.15rem] font-extrabold text-[#1a1a2e] leading-tight mt-0.5">
									{repName || '—'}
								</h4>
								{session?.email && (
									<span className="text-[0.8rem] text-[#666] font-medium block mt-0.5">
										{session.email}
									</span>
								)}
							</div>
						</div>

						{/* Access Verification Badge */}
						<div className="flex flex-col items-start sm:items-end gap-1 shrink-0 text-left sm:text-right">
							<span className="text-[0.7rem] font-bold text-[#888] uppercase tracking-wider block font-sans">Zugriffsstatus</span>
							<span
								className={clsx(
									'text-[0.72rem] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm mt-0.5 inline-block',
									session?.isVerified
										? 'text-[#00a878] bg-[#00a878]/10 border border-[#00a878]/20'
										: 'text-[#dc2626] bg-[#dc2626]/10 border border-[#dc2626]/20',
								)}
							>
								{session?.isVerified ? 'Verifiziert' : 'Inaktiv'}
							</span>
						</div>
					</div>

					{/* Section 2: Active Working Context (Unified styling, no double nested cards) */}
					<div className="border border-[#eaedf0] bg-white rounded-2xl p-6 sm:p-8 space-y-6">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-[#eaedf0]">
							<div className="flex flex-col gap-1 text-left">
								<span className="text-[0.7rem] font-bold text-[#888] uppercase tracking-wider font-sans">Dein Team</span>
								<span className="text-[1rem] font-extrabold text-[#e20074] mt-1 flex items-center gap-2">
									<Users className="w-4 h-4" />
									{session?.team?.name ?? '—'}
								</span>
							</div>

							<div className="flex flex-col gap-1 text-left border-t sm:border-t-0 sm:border-l border-[#eaedf0] pt-4 sm:pt-0 sm:pl-6">
								<span className="text-[0.7rem] font-bold text-[#888] uppercase tracking-wider font-sans">Standort</span>
								<span className="text-[1rem] font-extrabold text-[#1a1a2e] mt-1 flex items-center gap-2">
									<MapPin className="w-4 h-4 text-[#e20074]" />
									{session?.location?.name ?? '—'}
								</span>
								{session?.location?.address && (
									<span className="text-[0.75rem] text-[#666] font-medium block mt-1 leading-normal pl-6">
										{session.location.address}
									</span>
								)}
							</div>
						</div>

						<div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
							<p className="text-[0.8rem] text-[#666] leading-relaxed max-w-md m-0 text-left">
								Du möchtest Deinen aktuellen Arbeitsplatz wechseln? Hier kannst Du einen anderen Standort oder ein anderes Vertriebsteam wählen.
							</p>
							<PremiumButton
								onClick={() => {
									setIsSwitcherOpen(true);
									setSwitcherStep(1);
								}}
								variant="secondary"
								className="h-11 px-4 text-[0.8rem] w-full sm:w-auto shadow-sm gap-2"
								icon={<MapPin className="w-4 h-4 text-[#e20074]" />}
							>
								Zuweisung ändern
							</PremiumButton>
						</div>
					</div>

					{/* Section 3: Technical Metadata Panel */}
					<div className="border border-[#eaedf0] bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex flex-col min-w-0 text-left">
							<span className="text-[0.7rem] font-bold text-[#888] uppercase tracking-wider flex items-center gap-1.5 font-sans">
								<Fingerprint className="w-3.5 h-3.5 text-[#e20074]" />
								Aktuelle Session-ID
							</span>
							<span className="text-[0.75rem] font-mono text-[#666] mt-1.5 truncate max-w-full sm:max-w-md">
								{session?.id ?? '—'}
							</span>
						</div>
						{session?.id && (
							<PremiumButton
								onClick={() => copyToClipboard(session.id, 'session')}
								variant="secondary"
								className="h-9 px-3 text-[0.72rem] self-start sm:self-auto shadow-sm gap-1.5 shrink-0 bg-white border border-[#eaedf0] hover:bg-[#eaedf0]"
							>
								{copiedField === 'session' ? (
									<>
										<Check className="w-3.5 h-3.5 text-[#00a878]" />
										Kopiert!
									</>
								) : (
									<>
										<Copy className="w-3.5 h-3.5" />
										Kopieren
									</>
								)}
							</PremiumButton>
						)}
					</div>
				</div>
			</motion.div>
		);
	};

	// Location Switcher Step 1
	const renderSwitcherStep1 = () => (
		<motion.div
			key="switcher-step-1"
			initial={{
 opacity: 0,
x: 15,
}}
			animate={{
 opacity: 1,
x: 0,
}}
			exit={{
 opacity: 0,
x: -15,
}}
			className="flex flex-col gap-6"
		>
			<ScreenHeader
				icon={<MapPin className="w-5 h-5 text-[#e20074]" />}
				title="Standort wechseln"
				subtitle="Suche und wähle Deinen neuen Arbeitsstandort aus."
			/>

			{/* Sub-step indicator */}
			<div className="flex justify-center gap-1.5 mb-2">
				{[
 1,
2,
].map((step) => (
					<div
						key={step}
						className={clsx(
							'h-1 rounded-full transition-all duration-300',
							switcherStep === step
								? 'w-6 bg-[#e20074]'
								: 'w-1.5 bg-[#eaedf0]',
						)}
					/>
				))}
			</div>

			<div className="mt-1">
				<PremiumInput
					label="Standort suchen"
					placeholder="Standort suchen (z.B. Berlin, München)..."
					value={locationSearch}
					onChange={(e) => setLocationSearch(e.target.value)}
					icon={<Search className="w-5 h-5 text-[#ccc]" />}
				/>
			</div>

			{isLocationsLoading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
					{Array.from({
 length: 4,
}).map((_, i) => (
						<Skeleton key={i} className="h-[52px] w-full rounded-xl" />
					))}
				</div>
			) : locations?.items?.length === 0 ? (
				<div className="text-center p-8 text-[0.85rem] text-[#aaa] bg-[#f7f8fa] border border-dashed border-[#eaedf0] rounded-2xl mt-1">
					Keine Standorte gefunden.
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 max-h-[220px] overflow-y-auto pr-1">
					<AnimatePresence mode="popLayout" initial={false}>
						{locations?.items?.filter((loc: LocationItem) => loc.isActive).map((loc: LocationItem, index: number) => (
							<SelectionTile
								key={loc.id}
								name={loc.name}
								subtitle={loc.address || ''}
								isSelected={selectedLocationId === loc.id}
								onClick={() => {
									setSelectedLocationId(loc.id);
									setSelectedTeamId(null);
								}}
								index={index}
							/>
						))}
					</AnimatePresence>
				</div>
			)}

			<div className="flex gap-3 mt-6">
				<PremiumButton
					onClick={() => {
						setIsSwitcherOpen(false);
						setLocationSearch('');
					}}
					variant="ghost"
					className="flex-1"
				>
					Abbrechen
				</PremiumButton>
				<PremiumButton
					onClick={() => setSwitcherStep(2)}
					disabled={!selectedLocationId}
					variant="primary"
					className="flex-1"
					icon={<ArrowRight className="w-4 h-4" />}
				>
					Weiter
				</PremiumButton>
			</div>
		</motion.div>
	);

	// Location Switcher Step 2
	const renderSwitcherStep2 = () => (
		<motion.div
			key="switcher-step-2"
			initial={{
 opacity: 0,
x: 15,
}}
			animate={{
 opacity: 1,
x: 0,
}}
			exit={{
 opacity: 0,
x: -15,
}}
			className="flex flex-col gap-6"
		>
			<ScreenHeader
				icon={<Users className="w-5 h-5 text-[#e20074]" />}
				title="Vertriebsteam wählen"
				subtitle="Wähle Dein neues Team an diesem Standort aus."
			/>

			{/* Sub-step indicator */}
			<div className="flex justify-center gap-1.5 mb-2">
				{[
 1,
2,
].map((step) => (
					<div
						key={step}
						className={clsx(
							'h-1 rounded-full transition-all duration-300',
							switcherStep === step
								? 'w-6 bg-[#e20074]'
								: 'w-1.5 bg-[#e20074]/30',
						)}
					/>
				))}
			</div>

			{isTeamsLoading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
					{Array.from({
 length: 4,
}).map((_, i) => (
						<Skeleton key={i} className="h-[52px] w-full rounded-xl" />
					))}
				</div>
			) : teams?.items?.length === 0 ? (
				<div className="text-center p-8 text-[0.85rem] text-[#aaa] bg-[#f7f8fa] border border-dashed border-[#eaedf0] rounded-2xl mt-1">
					An diesem Standort wurden noch keine Teams angelegt.
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 max-h-[220px] overflow-y-auto pr-1">
					<AnimatePresence mode="popLayout" initial={false}>
						{teams?.items?.map((team: TeamItem, index: number) => (
							<SelectionTile
								key={team.id}
								name={team.name}
								subtitle={team.email || undefined}
								isSelected={selectedTeamId === team.id}
								onClick={() => setSelectedTeamId(team.id)}
								index={index}
							/>
						))}
					</AnimatePresence>
				</div>
			)}

			{switcherError && <ErrorBanner message={switcherError} />}

			<div className="flex gap-3 mt-6">
				<PremiumButton
					onClick={() => setSwitcherStep(1)}
					variant="secondary"
					className="flex-1"
				>
					Zurück
				</PremiumButton>
				<PremiumButton
					onClick={handleSaveTeamChange}
					disabled={!selectedTeamId || isSwitcherSaving}
					loading={isSwitcherSaving}
					variant="primary"
					className="flex-1"
				>
					Speichern
				</PremiumButton>
			</div>
		</motion.div>
	);

	// Security/PIN Form tab content
	const renderSecurityView = () => (
		<motion.div
			key="security-view"
			initial={{
				opacity: 0,
				x: 15,
			}}
			animate={{
				opacity: 1,
				x: 0,
			}}
			exit={{
				opacity: 0,
				x: -15,
			}}
			className="flex flex-col gap-6 text-left"
		>
			<ScreenHeader
				icon={<Lock className="w-5 h-5 text-[#e20074]" />}
				title="Sicherheit"
				subtitle="Verwalte Deine Sicherheitseinstellungen, PINs und biometrische Anmeldungen."
			/>

			<div className="space-y-6">
				{/* Section 1: PIN Change Form */}
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-[#e20074]/10 text-[#e20074] flex items-center justify-center text-[0.75rem] font-extrabold shrink-0">
							1
						</div>
						<h4 className="text-[1rem] font-extrabold text-[#1a1a2e] m-0">6-stellige App-PIN</h4>
					</div>

					{pinSuccess ? (
						<div className="flex flex-col items-center justify-center p-6 bg-[#00a878]/10 border border-[#00a878]/20 rounded-2xl text-center gap-2 mt-4 shadow-sm">
							<CheckCircle2 className="w-10 h-10 text-[#00a878]" />
							<h4 className="text-[1rem] font-extrabold text-[#00a878] m-0">
								PIN erfolgreich geändert!
							</h4>
							<p className="text-[0.85rem] text-[#888] m-0">
								Deine neue PIN ist ab sofort aktiv.
							</p>
						</div>
					) : (
						<form onSubmit={(e) => handleSavePin(e)} className="space-y-5 mt-2">
							<div className="space-y-2">
								<label className="text-[0.75rem] font-bold text-[#888] uppercase tracking-wider pl-1">
									Neue PIN
								</label>
								<PremiumPinInput
									id="settings-new-pin"
									value={newPin}
									onChange={setNewPin}
									disabled={isPinSaving}
								/>
							</div>

							<div className="space-y-2">
								<label className="text-[0.75rem] font-bold text-[#888] uppercase tracking-wider pl-1">
									PIN bestätigen
								</label>
								<PremiumPinInput
									id="settings-new-pin-confirm"
									value={newPinConfirm}
									onChange={setNewPinConfirm}
									disabled={isPinSaving}
								/>
							</div>

							{pinError && <ErrorBanner message={pinError} />}

							<div className="flex justify-end mt-4">
								<PremiumButton
									type="submit"
									disabled={newPin.length !== 6 || newPinConfirm.length !== 6 || isPinSaving}
									loading={isPinSaving}
									variant="primary"
									className="w-full sm:w-auto"
								>
									PIN speichern
								</PremiumButton>
							</div>
						</form>
					)}
				</div>

				{/* Divider line */}
				<div className="h-px bg-[#eaedf0] my-6" />

				{/* Section 2: Biometric Login (Passkeys) */}
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-[#e20074]/10 text-[#e20074] flex items-center justify-center text-[0.75rem] font-extrabold shrink-0">
							2
						</div>
						<h4 className="text-[1rem] font-extrabold text-[#1a1a2e] m-0">Biometrischer Login</h4>
					</div>

					<p className="text-[0.82rem] text-[#666] leading-relaxed max-w-2xl m-0">
						Nutze Face ID, Touch ID oder Windows Hello für eine besonders schnelle und sichere Anmeldung direkt im Browser.
					</p>

					<div className="bg-[#f8f9fa] border border-[#eaedf0] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 mt-2">
						<div className="flex-1 text-left">
							<h5 className="text-[0.88rem] font-bold text-[#1a1a2e] m-0 flex items-center gap-2">
								<Fingerprint className="w-4 h-4 text-[#e20074]" />
								Passkey für dieses Gerät registrieren
							</h5>
							<p className="text-[0.8rem] text-[#888] leading-relaxed mt-1 m-0">
								Verknüpfe Deine Biometrie direkt mit Deinem Benutzerkonto ({session?.email || '—'}). Beim nächsten Login auf diesem Gerät kannst Du Dich einfach ohne PIN-Eingabe authentifizieren.
							</p>
						</div>
						<PremiumButton
							onClick={handleRegisterPasskey}
							disabled={isPasskeyRegistering}
							loading={isPasskeyRegistering}
							variant="primary"
							className="w-full sm:w-auto shrink-0 shadow-sm"
							icon={<Fingerprint className="w-4 h-4" />}
						>
							Gerät registrieren
						</PremiumButton>
					</div>

					{passkeySuccess && (
						<div className="flex items-center gap-3 p-4 bg-[#00a878]/10 border border-[#00a878]/20 rounded-2xl text-left mt-3">
							<CheckCircle2 className="w-5 h-5 text-[#00a878] shrink-0" />
							<div className="text-left">
								<span className="text-[0.82rem] font-bold text-[#00a878] block">Passkey erfolgreich registriert!</span>
								<span className="text-[0.75rem] text-[#666] block mt-0.5">Dein Gerät ist nun für den biometrischen Login bereit.</span>
							</div>
						</div>
					)}

					{passkeyError && <ErrorBanner message={passkeyError} />}
				</div>
			</div>
		</motion.div>
	);

	// Interface toggles tab content
	const renderInterfaceView = () => (
		<motion.div
			key="interface-view"
			initial={{
				opacity: 0,
				x: 15,
			}}
			animate={{
				opacity: 1,
				x: 0,
			}}
			exit={{
				opacity: 0,
				x: -15,
			}}
			className="flex flex-col gap-6 text-left"
		>
			<ScreenHeader
				icon={<Palette className="w-5 h-5 text-[#e20074]" />}
				title="Anzeige & Interface"
				subtitle="Passe das visuelle Verhalten und die Darstellung der Tarifübersicht an."
			/>

			<div className="space-y-6">
				{/* Section 1: UI-Toggles */}
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-[#e20074]/10 text-[#e20074] flex items-center justify-center text-[0.75rem] font-extrabold shrink-0">
							1
						</div>
						<h4 className="text-[1rem] font-extrabold text-[#1a1a2e] m-0">Darstellungsoptionen</h4>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
						<SelectionTile
							name="Kompakte Ansicht"
							subtitle="Zeigt Tarif-Karten kleiner an, für mehr Übersicht auf kleinen Bildschirmen."
							isSelected={compactView}
							onClick={() => setCompactView(!compactView)}
						/>
						<SelectionTile
							name="Animationen reduzieren"
							subtitle="Deaktiviert flüssige UI-Übergänge für maximale Performance auf älteren Geräten."
							isSelected={reduceAnimations}
							onClick={() => setReduceAnimations(!reduceAnimations)}
						/>
						<SelectionTile
							name="Hero-Image anzeigen"
							subtitle="Blendet das große Hintergrundbild im Header der Produktauswahl ein."
							isSelected={showHeroImage}
							onClick={() => setShowHeroImage(!showHeroImage)}
						/>
						<SelectionTile
							name="Auflösungswarnung umgehen"
							subtitle="Deaktiviert die Warnung bei Bildschirmauflösungen unter 1920x1080 Pixeln."
							isSelected={bypassResolutionGuard}
							onClick={() => setBypassResolutionGuard(!bypassResolutionGuard)}
						/>
					</div>
				</div>

				{/* Divider line */}
				<div className="h-px bg-[#eaedf0] my-6" />

				{/* Section 2: Product Sorting */}
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-[#e20074]/10 text-[#e20074] flex items-center justify-center text-[0.75rem] font-extrabold shrink-0">
							2
						</div>
						<h4 className="text-[1rem] font-extrabold text-[#1a1a2e] m-0">Standard-Produktsortierung</h4>
					</div>

					<p className="text-[0.82rem] text-[#666] leading-relaxed max-w-2xl m-0">
						Wähle aus, wie Tarifübersichten standardmäßig sortiert sein sollen, wenn Du ein Tarif-Verzeichnis öffnest.
					</p>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
						{[
							{ id: 'default', label: 'Standard', description: 'Behält die herstellerspezifische Sortierung bei.' },
							{ id: 'price-asc', label: 'Preis (günstigst zuerst)', description: 'Sortiert Tarife nach dem niedrigsten monatlichen Preis.' },
							{ id: 'price-desc', label: 'Preis (teuerst zuerst)', description: 'Sortiert Tarife nach dem höchsten monatlichen Preis.' },
							{ id: 'name-asc', label: 'Name (A bis Z)', description: 'Sortiert Tarife alphabetisch nach dem Namen.' },
							{ id: 'speed-desc', label: 'Geschwindigkeit (schnellste zuerst)', description: 'Sortiert Tarife nach der maximalen Übertragungsrate.' },
						].map((option, index) => (
							<SelectionTile
								key={option.id}
								name={option.label}
								subtitle={option.description}
								isSelected={sortOption === option.id}
								onClick={() => setSortOption(option.id)}
								index={index}
							/>
						))}
					</div>
				</div>
			</div>
		</motion.div>
	);

	// Template and export config tab content
	const renderTemplatesView = () => (
		<motion.div
			key="templates-view"
			initial={{
				opacity: 0,
				x: 15,
			}}
			animate={{
				opacity: 1,
				x: 0,
			}}
			exit={{
				opacity: 0,
				x: -15,
			}}
			className="flex flex-col gap-6 text-left"
		>
			<ScreenHeader
				icon={<FileText className="w-5 h-5 text-[#e20074]" />}
				title="Vorlagen & Verkauf"
				subtitle="Konfiguriere Deinen E-Mail-Inhalt für den PDF-Export und das Verhalten des Warenkorbs."
			/>

			<div className="flex flex-col gap-6 mt-2">
				{/* Textarea Editor & Info Row */}
				<div className="flex flex-col gap-3">
					<span className="text-[0.75rem] font-bold text-[#888] uppercase tracking-wider pl-1 font-sans">
						E-Mail Textentwurf
					</span>
					<Textarea
						value={offerTemplateText}
						onChange={(e) => setOfferTemplateText(e.target.value)}
						className="h-[140px] resize-none leading-relaxed text-[0.9rem] p-4 rounded-2xl border border-[#eaedf0] bg-[#f8f9fa] focus:bg-white transition-all focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 font-sans shadow-inner"
						placeholder="Standard-Begrüßung eingeben..."
					/>
					<p className="text-[0.72rem] text-[#666] leading-relaxed pl-1">
						Verwende <code className="font-mono text-[#e20074] bg-[#e20074]/5 px-1.5 py-0.5 rounded font-bold">{'{{salesRepName}}'}</code> als Platzhalter, um Deinen Vor- und Nachnamen automatisch in die E-Mail-Signatur einzubetten.
					</p>
				</div>

				{/* Visual Mock Email Preview Window */}
				<div className="flex flex-col gap-3">
					<span className="text-[0.75rem] font-bold text-[#888] uppercase tracking-wider flex items-center gap-1.5 pl-1 font-sans">
						<FileText className="w-3.5 h-3.5 text-[#e20074]" /> Live-Vorschau E-Mail
					</span>
					
					{/* Simulated Email Client Container */}
					<div className="border border-[#eaedf0] rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col">
						{/* Email Header Bar */}
						<div className="bg-[#f8f9fa] border-b border-[#eaedf0] px-4 py-3 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
								<div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
								<div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
							</div>
							<span className="text-[0.72rem] font-bold text-[#888] tracking-wider uppercase">Vorschau</span>
							<div className="w-12" /> {/* Balancing spacing */}
						</div>
						
						{/* Email Meta Information */}
						<div className="px-5 py-3 border-b border-[#eaedf0] text-[0.75rem] space-y-1 bg-white flex flex-col gap-0.5">
							<div className="flex items-baseline gap-2">
								<span className="font-bold text-[#888] w-12 block">Von:</span>
								<span className="text-[#1a1a2e] font-medium">{session?.email ?? 'sxp-angebot@telekom.de'}</span>
							</div>
							<div className="flex items-baseline gap-2">
								<span className="font-bold text-[#888] w-12 block">Betreff:</span>
								<span className="text-[#1a1a2e] font-bold">Dein persönliches Telekom Angebot</span>
							</div>
						</div>

						{/* Email Message Content Panel */}
						<div className="p-6 sm:p-8 bg-white min-h-[140px] max-h-[260px] overflow-y-auto scrollbar-none text-left">
							<p className="whitespace-pre-line text-[0.875rem] text-[#1a1a2e] leading-relaxed m-0 font-medium font-sans">
								{parsedTemplateText || <span className="text-[#ccc] italic font-normal">Der Vorlagentext ist leer... Bitte gib oben einen Entwurfstext ein.</span>}
							</p>
						</div>
					</div>
				</div>

				<div className="mt-2">
					<SelectionTile
						name="Warenkorb nach Export leeren"
						subtitle="Leert den Warenkorb automatisch, sobald ein PDF-Angebot erstellt und heruntergeladen wurde."
						isSelected={clearAfterExport}
						onClick={() => setClearAfterExport(!clearAfterExport)}
					/>
				</div>
			</div>
		</motion.div>
	);

	// System reset & assist tab content
	const renderSystemView = () => (
		<motion.div
			key="system-view"
			initial={{
 opacity: 0,
x: 15,
}}
			animate={{
 opacity: 1,
x: 0,
}}
			exit={{
 opacity: 0,
x: -15,
}}
			className="flex flex-col gap-6"
		>
			<ScreenHeader
				icon={<RotateCcw className="w-5 h-5 text-[#e20074]" />}
				title="System & Hilfe"
				subtitle="Starte interaktive Hilfen oder setze lokale Offline-Daten und Sitzungen zurück."
			/>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-left">
				{/* Tour Reset Card */}
				<div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-[#e20074]/10 flex items-center justify-center border border-[#e20074]/20 shadow-sm shrink-0">
							<BookOpen className="w-5 h-5 text-[#e20074]" />
						</div>
						<h4 className="text-[0.95rem] font-extrabold text-[#1a1a2e] m-0">
							App-Einführung
						</h4>
					</div>
					<p className="text-[0.8rem] text-[#888] m-0 leading-relaxed font-medium">
						Starte die interaktive Einführungstour beim nächsten Laden der Hauptseite erneut, um alle Funktionen kennenzulernen.
					</p>
					<PremiumButton
						onClick={handleRestartOnboarding}
						variant="secondary"
						className="mt-auto w-full h-11 text-[0.8rem]"
					>
						Tour erneut starten
					</PremiumButton>
				</div>

				{/* Cache Clear Card */}
				<div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-sm shrink-0">
							<RotateCcw className="w-5 h-5 text-red-600" />
						</div>
						<h4 className="text-[0.95rem] font-extrabold text-[#1a1a2e] m-0">
							Daten zurücksetzen
						</h4>
					</div>
					<p className="text-[0.8rem] text-[#888] m-0 leading-relaxed font-medium">
						Leert den lokalen Warenkorb, Cookies und Cache-Daten dieses Geräts und fordert eine erneute Einrichtung.
					</p>
					<div className="mt-auto flex gap-2 w-full">
						<PremiumButton
							onClick={handleReset}
							variant="ghost"
							className="flex-1 h-11 text-[0.8rem] hover:text-[#dc2626] hover:bg-red-50/50"
						>
							Abmelden
						</PremiumButton>
						<PremiumButton
							onClick={handleClearCache}
							variant="secondary"
							className="flex-1 h-11 text-[0.8rem] text-red-600 border-red-100 hover:bg-red-50/50 hover:border-red-200"
						>
							Alle Daten löschen
						</PremiumButton>
					</div>
				</div>
			</div>
		</motion.div>
	);

	return (
		<div className="h-screen w-full py-12 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074] scrollbar-none overflow-y-auto overflow-x-hidden fixed inset-0 bg-[#f7f8fa]">
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
}}
					className="flex flex-col items-center mb-10 text-center"
				>
					<TelekomLogo className="w-12 h-12 text-[#e20074] mb-8" />
					<h1 className="text-3xl sm:text-[2.5rem] font-extrabold text-[#1a1a2e] tracking-tight mb-3 leading-none">
						Einstellungen
					</h1>
					<p className="text-[1.05rem] text-[#888] font-normal leading-relaxed max-w-md mx-auto mt-1">
						Personalisiere Deine Sales Experience und verwalte Dein Profil.
					</p>
				</motion.div>

				{/* ─── Main Card with height-morphing ─── */}
				<motion.div
					initial={{
 opacity: 0,
y: 15,
}}
					animate={{
						opacity: 1,
						y: 0,
						height: typeof cardHeight === 'number' && cardHeight > 0 ? cardHeight : 'auto',
					}}
					transition={{
 duration: 0.4,
}}
					className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] overflow-hidden relative"
				>
					<div ref={cardRef} className="p-8 sm:p-12 space-y-8">
						{/* Horizontal Segmented Tab Control */}
						<div className="flex items-center justify-start sm:justify-center gap-2 pb-6 border-b border-[#eaedf0] overflow-x-auto scrollbar-none -mx-8 px-8 sm:mx-0 sm:px-0">
							{TABS.map((tab) => {
								const isActive = activeTab === tab.id;
								return (
									<button
										key={tab.id}
										onClick={() => {
											setActiveTab(tab.id);
											setIsSwitcherOpen(false);
											setSwitcherStep(1);
											setLocationSearch('');
										}}
										className={clsx(
											'h-11 px-4 rounded-xl font-bold text-[0.82rem] transition-all flex items-center gap-2 outline-none shrink-0 cursor-pointer active:scale-[0.98]',
											isActive
												? 'bg-[#e20074] text-white shadow-[0_6px_16px_-4px_rgba(226,0,116,0.3)]'
												: 'bg-[#f7f8fa] text-[#666] border border-[#eaedf0] hover:bg-[#eaedf0] hover:text-[#1a1a2e]',
										)}
									>
										{tab.icon}
										<span>{tab.label}</span>
									</button>
								);
							})}
						</div>

						{/* Active Tab Content Slider with copied 1:1 setup step-switching transitions */}
						<AnimatePresence mode="wait" initial={false}>
							{activeTab === 'profile' && !isSwitcherOpen && renderProfileView()}
							{activeTab === 'profile' && isSwitcherOpen && switcherStep === 1 && renderSwitcherStep1()}
							{activeTab === 'profile' && isSwitcherOpen && switcherStep === 2 && renderSwitcherStep2()}
							{activeTab === 'security' && renderSecurityView()}
							{activeTab === 'interface' && renderInterfaceView()}
							{activeTab === 'templates' && renderTemplatesView()}
							{activeTab === 'system' && renderSystemView()}
						</AnimatePresence>

						{/* Center-aligned full-width Back Button at bottom of card with NO divider line */}
						<div className="pt-4 flex justify-center w-full">
							<PremiumButton
								onClick={() => router.push('/products')}
								variant="ghost"
								className="w-full"
							>
								<ArrowLeft className="w-4 h-4 mr-2" /> Zurück zur App
							</PremiumButton>
						</div>
					</div>
				</motion.div>

				{/* Footnote matching Onboarding */}
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
}}
					className="flex flex-col items-center mt-5 text-center"
				>
					<p className="text-[1.05rem] text-[#888] font-normal leading-relaxed max-w-md mx-auto mt-1">
						Mit Liebe gemacht. Aus Chemnitz, für Euch alle. ❤️
					</p>
				</motion.div>
				<GlobalFooter
					className="pt-8 pb-0 mt-4 text-[#bbb]"
					linkColor="text-[#bbb]"
				/>
			</div>
		</div>
	);
}
