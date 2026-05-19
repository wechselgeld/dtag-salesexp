'use client';

import {
	useState, useEffect,
} from 'react';
import {
	trpc,
} from '@/lib/trpc';
import {
	Lock,
	Shield,
	User,
	AlertTriangle,
	Check,
	Hammer,
	ArrowRight,
	Users,
	Box,
	Tag,
	ShieldAlert,
	Loader2,
	Save,
	Euro,
	Image as ImageIcon,
	Fingerprint,
} from 'lucide-react';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import clsx from 'clsx';
import {
	Input,
} from '@/components/shared/ui/input';
import {
	AdminPageHeader,
	AdminFormSection,
	AdminFormContainer,
} from '@/components/shared/ui/admin-ui';

export default function AdminSettingsPage() {
	const [
		activeTab,
		setActiveTab,
	] = useState<
		'profile' | 'security' | 'system' | 'pricing' | 'design'
	>('profile');

	const {
		data: user,
	} = trpc.admin.getCurrentUser.useQuery();
	const isAdmin = user?.role === 'ADMIN';

	const tabs = [
		{
			id: 'profile',
			label: 'Profil',
			icon: User,
			show: true,
		},
		{
			id: 'security',
			label: 'Sicherheit',
			icon: Lock,
			show: true,
		},
		{
			id: 'pricing',
			label: 'Preise',
			icon: Euro,
			show: isAdmin,
		},
		{
			id: 'design',
			label: 'Design',
			icon: ImageIcon,
			show: isAdmin,
		},
		{
			id: 'system',
			label: 'System',
			icon: Hammer,
			show: isAdmin,
		},
	].filter((t) => t.show);

	return (
		<div className="space-y-8 pb-12">
			<AdminPageHeader
				title="Einstellungen"
				subtitle="Verwalte Dein Profil und die globalen Systemeinstellungen."
				backHref="/admin"
			/>

			<div className="flex flex-col gap-8">
				<nav className="flex flex-wrap gap-2 p-1.5 bg-[#f0f2f5] border border-[#eaedf0] rounded-2xl w-fit">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id as any)}
							className={clsx(
								'flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[0.85rem] font-bold transition-all duration-300 cursor-pointer border-none',
								activeTab === tab.id
									? 'bg-white text-[#e20074] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#eaedf0]'
									: 'bg-transparent text-[#888] hover:text-[#1a1a2e] hover:bg-white/50',
							)}
						>
							<tab.icon className="w-4 h-4" />
							{tab.label}
						</button>
					))}
				</nav>

				<AdminFormContainer>
					<AnimatePresence mode="wait">
						{activeTab === 'profile' && (
							<ProfilePanel key="profile" user={user} />
						)}
						{activeTab === 'pricing' && <PricingPanel key="pricing" />}
						{activeTab === 'design' && <DesignPanel key="design" />}
						{activeTab === 'security' && (
							<SecurityPanel key="security" isAdmin={isAdmin} user={user} />
						)}
						{activeTab === 'system' && <SystemPanel key="system" />}
					</AnimatePresence>
				</AdminFormContainer>
			</div>
		</div>
	);
}

function ProfilePanel({
	user,
}: { user: any }) {
	const {
		data: stats,
	} = trpc.admin.getDashboardStats.useQuery(undefined, {
		enabled: user?.role === 'ADMIN',
	});

	return (
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
				y: -10,
			}}
			className="space-y-6"
		>
			<div className="bg-white border border-[#eaedf0] rounded-2xl p-6 shadow-sm overflow-hidden">
				<div className="flex items-center gap-5 mb-6">
					<div className="w-16 h-16 bg-linear-to-br from-[#e20074] to-[#c70066] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#e20074]/20 border border-[#e20074]/10 shrink-0">
						{user?.email?.charAt(0).toUpperCase() || 'A'}
					</div>
					<div>
						<h3 className="text-[1.3rem] font-extrabold text-[#1a1a2e] m-0 tracking-tight">
							{user?.email?.split('@')[0] || 'Administrator'}
						</h3>
						<p className="text-[0.85rem] text-[#888] m-0 mb-2 font-medium">
							{user?.email || 'admin@telekom.de'}
						</p>
						<div className="flex gap-2">
							<span className="px-2.5 py-0.5 bg-[#e20074]/10 text-[#e20074] rounded-lg text-[0.65rem] font-bold uppercase tracking-wider">
								{user?.role || 'ADMIN'}
							</span>
							<span className="px-2.5 py-0.5 bg-[#f7f8fa] text-[#888] rounded-lg text-[0.65rem] font-bold uppercase tracking-wider border border-[#eaedf0]">
								{user?.team?.name
									? `Team: ${user.team.name}`
									: user?.location?.name
										? user.location.name
										: user?.odRegion?.name
											? user.odRegion.name
											: 'Globaler Zugriff'}
							</span>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-[#f0f0f0]">
					<div className="space-y-1 p-4 bg-[#f7f8fa] rounded-xl border border-[#eaedf0]">
						<div className="flex items-center gap-1.5 text-[#999] text-[0.65rem] font-bold uppercase tracking-widest mb-1">
							<Box className="w-3.5 h-3.5" /> Produkte
						</div>
						<p className="text-[1.5rem] font-black text-[#1a1a2e] m-0">
							{stats?.products || 0}
						</p>
					</div>
					<div className="space-y-1 p-4 bg-[#f7f8fa] rounded-xl border border-[#eaedf0]">
						<div className="flex items-center gap-1.5 text-[#999] text-[0.65rem] font-bold uppercase tracking-widest mb-1">
							<Users className="w-3.5 h-3.5" /> Teams
						</div>
						<p className="text-[1.5rem] font-black text-[#1a1a2e] m-0">
							{stats?.teams || 0}
						</p>
					</div>
					<div className="space-y-1 p-4 bg-[#f7f8fa] rounded-xl border border-[#eaedf0]">
						<div className="flex items-center gap-1.5 text-[#999] text-[0.65rem] font-bold uppercase tracking-widest mb-1">
							<User className="w-3.5 h-3.5" /> Nutzer
						</div>
						<p className="text-[1.5rem] font-black text-[#1a1a2e] m-0">
							{stats?.users || 0}
						</p>
					</div>
					<div className="space-y-1 p-4 bg-[#f7f8fa] rounded-xl border border-[#eaedf0]">
						<div className="flex items-center gap-1.5 text-[#999] text-[0.65rem] font-bold uppercase tracking-widest mb-1">
							<Tag className="w-3.5 h-3.5" /> Aktionen
						</div>
						<p className="text-[1.5rem] font-black text-[#1a1a2e] m-0">
							{stats?.specialPrices || 0}
						</p>
					</div>
				</div>
			</div>

			<div className="bg-[#1a1a2e] rounded-2xl p-6 text-white relative overflow-hidden shadow-sm">
				<div className="absolute top-0 right-0 w-64 h-64 bg-[#e20074]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
				<div className="relative z-10 flex items-center justify-between gap-6">
					<div>
						<h3 className="text-[1.1rem] font-extrabold mb-1.5 text-white tracking-tight m-0">
							System Architektur
						</h3>
						<p className="text-[#a1a1aa] text-[0.85rem] leading-relaxed max-w-xl m-0">
							Deine Instanz läuft auf der aktuellen Version der Sales
							Experience-Plattform. Alle Daten werden DSGVO-konform in der
							lokalen Datenbank verschlüsselt gespeichert.
						</p>
					</div>
					<div className="w-16 h-16 bg-white/5 rounded-2xl hidden md:flex items-center justify-center border border-white/10 shrink-0">
						<Shield className="w-8 h-8 text-white/40" />
					</div>
				</div>
			</div>
		</motion.div>
	);
}

function SecurityPanel({
	isAdmin, user,
}: { isAdmin: boolean, user: any }) {
	const [
		oldPassword,
		setOldPassword,
	] = useState('');
	const [
		newPassword,
		setNewPassword,
	] = useState('');
	const [
		confirmPassword,
		setConfirmPassword,
	] = useState('');
	const [
		status,
		setStatus,
	] = useState<
		'idle' | 'pending' | 'success' | 'error'
	>('idle');
	const [
		errorMsg,
		setErrorMsg,
	] = useState('');

	const mutation = trpc.admin.settings.changePassword.useMutation({
		onSuccess: () => {
			setStatus('success');
			setOldPassword('');
			setNewPassword('');
			setConfirmPassword('');
			setTimeout(() => {
				setStatus('idle');
				setErrorMsg('');
			}, 5000);
		},
		onError: (err) => {
			setStatus('error');
			setErrorMsg(err.message || 'Ein Fehler ist aufgetreten.');
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			setStatus('error');
			setErrorMsg('Die neuen Passwörter stimmen nicht überein.');
			return;
		}
		if (newPassword.length < 8) {
			setStatus('error');
			setErrorMsg('Das Passwort muss mindestens 8 Zeichen lang sein.');
			return;
		}
		setStatus('pending');
		setErrorMsg('');
		mutation.mutate({
			oldPassword,
			newPassword,
		});
	};

	const getRegOptions = trpc.webauthn.generateRegistrationOptions.useMutation();
	const verifyReg = trpc.webauthn.verifyRegistration.useMutation();
	const [
 isPasskeyRegistering,
setIsPasskeyRegistering,
] = useState(false);

	const handleRegisterPasskey = async () => {
		if (!user?.email) return;
		setIsPasskeyRegistering(true);
		try {
			const {
 startRegistration,
} = await import('@simplewebauthn/browser');
			const options = await getRegOptions.mutateAsync({
 email: user.email,
});
			const resp = await startRegistration({
 optionsJSON: options,
});
			await verifyReg.mutateAsync({
 email: user.email,
response: resp,
});
			alert('Passkey erfolgreich registriert!');
		}
 catch (err: any) {
			console.error('Passkey registration failed', err);
			alert(`Fehler bei der Passkey-Registrierung: ${ err.message}`);
		}
 finally {
			setIsPasskeyRegistering(false);
		}
	};

	const {
		data: securitySettingsData, refetch: refetchSecurity,
	} =
		trpc.admin.getSecuritySettings.useQuery(undefined, {
			enabled: isAdmin,
		});
	const updateSecurityMutation = trpc.admin.updateSecuritySettings.useMutation({
		onSuccess: () => refetchSecurity(),
	});

	const [
		allowedIps,
		setAllowedIps,
	] = useState('');
	const [
		requireEmailVerification,
		setRequireEmailVerification,
	] =
		useState(true);
	const [
		isSecurityPending,
		setIsSecurityPending,
	] = useState(false);
	const [
		securitySaved,
		setSecuritySaved,
	] = useState(false);

	useEffect(() => {
		if (securitySettingsData) {
			setAllowedIps(securitySettingsData.allowedIps);
			setRequireEmailVerification(
				securitySettingsData.requireEmailVerification,
			);
		}
	}, [
		securitySettingsData,
	]);

	const handleSaveSecurity = async () => {
		setIsSecurityPending(true);
		await updateSecurityMutation.mutateAsync({
			allowedIps,
			requireEmailVerification,
		});
		setIsSecurityPending(false);
		setSecuritySaved(true);
		setTimeout(() => setSecuritySaved(false), 3000);
	};

	return (
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
				y: -10,
			}}
			className="space-y-8"
		>
			<AdminFormSection
				title="Passwort ändern"
				description="Aktualisiere Deine Zugangsdaten regelmäßig."
				icon={Lock}
			>
				<form onSubmit={handleSubmit} className="space-y-6">
					<Input
						label="Aktuelles Passwort"
						type="password"
						required
						value={oldPassword}
						onChange={(e) => setOldPassword(e.target.value)}
						placeholder="••••••••••••"
						className="font-mono text-lg tracking-widest"
					/>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Input
							label="Neues Passwort"
							type="password"
							required
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder="••••••••••••"
							className="font-mono text-lg tracking-widest"
						/>
						<Input
							label="Passwort bestätigen"
							type="password"
							required
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="••••••••••••"
							className="font-mono text-lg tracking-widest"
						/>
					</div>

					{status === 'error' && (
						<div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[0.85rem] font-bold border border-red-100 flex gap-2 items-center">
							<AlertTriangle className="w-4 h-4 shrink-0" />
							{errorMsg}
						</div>
					)}

					{status === 'success' && (
						<div className="p-4 bg-green-50 text-green-700 rounded-2xl text-[0.85rem] font-bold border border-green-100 flex gap-2 items-center">
							<Check className="w-4 h-4 shrink-0" />
							Passwort wurde erfolgreich aktualisiert.
						</div>
					)}

					<button
						type="submit"
						disabled={status === 'pending'}
						className={clsx(
							'px-6 py-2.5 rounded-xl font-black text-white flex items-center gap-2 transition-all duration-300 text-[0.85rem] cursor-pointer shadow-md active:scale-95',
							status === 'pending'
								? 'bg-[#ddd] shadow-none cursor-not-allowed text-[#999] opacity-50'
								: 'bg-[#1a1a2e] hover:bg-[#2a2a3e] hover:shadow-lg hover:-translate-y-0.5',
						)}
					>
						{status === 'pending' ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Save className="w-4 h-4" />
						)}
						{status === 'pending' ? 'Speichere...' : 'Passwort aktualisieren'}
					</button>
				</form>
			</AdminFormSection>

			<AdminFormSection
				title="Biometrischer Login"
				description="Verwende Dein Gesicht oder Deinen Fingerabdruck für einen schnelleren Login."
				icon={Fingerprint}
			>
				<div className="p-6 bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
					<div className="flex-1">
						<h4 className="text-[1rem] font-bold text-[#1a1a2e] m-0 mb-1">
							Passkey (WebAuthn)
						</h4>
						<p className="text-[0.85rem] text-[#888] m-0 max-w-md leading-relaxed">
							Registriere dieses Gerät als sicheren Passkey. Danach kannst Du Dich ohne Passwort anmelden.
						</p>
					</div>
					<button
						onClick={handleRegisterPasskey}
						disabled={isPasskeyRegistering}
						className={clsx(
							'px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 outline-none cursor-pointer text-[0.85rem] shadow-md active:scale-95 whitespace-nowrap',
							isPasskeyRegistering
								? 'bg-[#ddd] text-[#999] cursor-not-allowed'
								: 'bg-[#e20074] text-white hover:bg-[#c70066]',
						)}
					>
						{isPasskeyRegistering ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Fingerprint className="w-4 h-4" />
						)}
						{isPasskeyRegistering ? 'Wird registriert...' : 'Gerät registrieren'}
					</button>
				</div>
			</AdminFormSection>

			{isAdmin && (
				<AdminFormSection
					title="Globale Sicherheit"
					description="IP-Beschränkungen und E-Mail Verifikation für das Setup."
					icon={Shield}
				>
					<div className="space-y-6">
						<div className="space-y-2">
							<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
								Erlaubte IP-Adressen (CIDR)
							</label>
							<textarea
								value={allowedIps}
								onChange={(e) => setAllowedIps(e.target.value)}
								placeholder="Beispiele:&#10;192.168.1.1&#10;10.0.0.0/8"
								className="w-full h-32 px-5 py-4 rounded-2xl border border-[#eaedf0] bg-[#f7f8fa] text-[#1a1a2e] focus:outline-none focus:bg-white focus:border-[#e20074] transition-all text-[0.9rem] font-mono resize-none"
							/>
							<p className="text-[0.7rem] text-[#888] font-medium">
								Lasse das Feld leer, um den Zugriff weltweit zu erlauben. Eine
								IP pro Zeile.
							</p>
						</div>

						<div className="p-6 bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl flex items-center justify-between">
							<div>
								<h4 className="text-[1rem] font-bold text-[#1a1a2e] m-0 mb-1">
									E-Mail Verifikation
								</h4>
								<p className="text-[0.8rem] text-[#888] m-0 max-w-sm">
									Verlangt einen Code per E-Mail beim Setup-Prozess. (Empfohlen)
								</p>
							</div>
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									className="sr-only peer"
									checked={requireEmailVerification}
									onChange={(e) =>
										setRequireEmailVerification(e.target.checked)
									}
								/>
								<div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e20074]"></div>
							</label>
						</div>

						<button
							onClick={handleSaveSecurity}
							disabled={isSecurityPending}
							className={clsx(
								'w-full px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 outline-none cursor-pointer text-[0.85rem] active:scale-95',
								isSecurityPending
									? 'bg-[#ddd] shadow-none text-[#999]'
									: securitySaved
										? 'bg-green-600 text-white shadow-md shadow-green-100'
										: 'bg-[#1a1a2e] text-white hover:bg-[#2a2a3e] shadow-md',
							)}
						>
							{isSecurityPending ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : securitySaved ? (
								<Check className="w-4 h-4" />
							) : (
								<Save className="w-4 h-4" />
							)}
							{securitySaved ? 'Gespeichert' : 'Sicherheit speichern'}
						</button>
					</div>
				</AdminFormSection>
			)}
		</motion.div>
	);
}

function SystemPanel() {
	const {
		data: isMaintenance, refetch,
	} =
		trpc.admin.getMaintenanceStatus.useQuery();
	const toggleMutation = trpc.admin.toggleMaintenanceMode.useMutation({
		onSuccess: () => {
			refetch();
		},
	});

	const [
		isPending,
		setIsPending,
	] = useState(false);

	const handleToggle = async () => {
		setIsPending(true);
		await toggleMutation.mutateAsync({
			enabled: !isMaintenance,
		});
		setIsPending(false);
	};

	if (!isMaintenance && isMaintenance === undefined) {
		return (
			<div className="flex items-center gap-2 text-[0.85rem] text-[#888]">
				<Loader2 className="w-4 h-4 animate-spin" /> Lade Systemstatus...
			</div>
		);
	}

	return (
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
				y: -10,
			}}
			className="space-y-6"
		>
			<AdminFormSection
				title="Wartungsarbeiten"
				description="Steuere die Verfügbarkeit des Sales-Tools."
				icon={Hammer}
			>
				<div className="p-8 border-2 border-dashed border-[#eaedf0] rounded-3xl flex flex-col items-center text-center">
					<div
						className={clsx(
							'w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all duration-500',
							isMaintenance
								? 'bg-red-50 text-red-600 shadow-lg shadow-red-100 animate-pulse'
								: 'bg-green-50 text-green-600 shadow-lg shadow-green-100',
						)}
					>
						{isMaintenance ? (
							<ShieldAlert className="w-10 h-10" />
						) : (
							<Check className="w-10 h-10" />
						)}
					</div>

					<h3 className="text-[1.3rem] font-extrabold text-[#1a1a2e] m-0 mb-2">
						{isMaintenance ? 'Wartungsmodus ist AKTIV' : 'Tool ist BEREIT'}
					</h3>
					<p className="text-[0.9rem] text-[#888] max-w-sm m-0 mb-8 leading-relaxed">
						{isMaintenance
							? 'Das Sales-Tool ist aktuell für alle Nutzer gesperrt. Nur Administratoren haben Zugriff.'
							: 'Das Tool ist für alle registrierten Mitarbeiter uneingeschränkt nutzbar.'}
					</p>

					<button
						onClick={handleToggle}
						disabled={isPending}
						className={clsx(
							'px-8 py-3.5 rounded-2xl font-black text-[0.85rem] transition-all duration-300 flex items-center gap-3 active:scale-95 shadow-md',
							isMaintenance
								? 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
								: 'bg-[#1a1a2e] text-white hover:bg-[#2a2a3e] hover:shadow-lg hover:-translate-y-0.5',
						)}
					>
						{isPending ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : isMaintenance ? (
							'Wartungsmodus beenden'
						) : (
							'Wartungsmodus aktivieren'
						)}
						{!isPending && !isMaintenance && <ArrowRight className="w-4 h-4" />}
					</button>
				</div>
			</AdminFormSection>

			<div className="bg-[#1a1a2e] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
				<div className="absolute top-0 right-0 w-64 h-64 bg-[#e20074]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
				<div className="relative z-10 flex items-center justify-between gap-6">
					<div>
						<h3 className="text-[1.2rem] font-extrabold mb-2 text-white tracking-tight m-0">
							System Architektur
						</h3>
						<p className="text-[#a1a1aa] text-[0.9rem] leading-relaxed max-w-xl m-0">
							Deine Instanz läuft auf der aktuellen Version der Sales
							Experience-Plattform. Alle Daten werden DSGVO-konform in der
							lokalen Datenbank verschlüsselt gespeichert.
						</p>
					</div>
					<div className="w-20 h-20 bg-white/5 rounded-3xl hidden md:flex items-center justify-center border border-white/10 shrink-0">
						<Shield className="w-10 h-10 text-white/20" />
					</div>
				</div>
			</div>
		</motion.div>
	);
}

function PricingPanel() {
	const utils = trpc.useUtils();
	const {
		data: pricingSettings, isLoading,
	} =
		trpc.settings.getPricingSettings.useQuery();

	const [
		status,
		setStatus,
	] = useState<
		'idle' | 'pending' | 'success' | 'error'
	>('idle');

	const updateMutation = trpc.settings.updateMany.useMutation({
		onSuccess: () => {
			utils.settings.getPricingSettings.invalidate();
			setStatus('success');
			setTimeout(() => setStatus('idle'), 3000);
		},
		onError: () => {
			setStatus('error');
			setTimeout(() => setStatus('idle'), 3000);
		},
	});

	const [
		form,
		setForm,
	] = useState({
		magentatv_smart_price: '10.00',
		magentatv_smartstream_price: '17.00',
		magentatv_megastream_price: '30.00',
		shipping_hardware_fee: '6.95',
		plus_karte_first_price: '19.95',
		plus_karte_following_price: '9.95',
		mobile_tier_smartphone: '10.00',
		mobile_tier_top: '20.00',
		mobile_tier_premium: '30.00',
		mobile_tier_premium_plus: '40.00',
	});

	useEffect(() => {
		if (pricingSettings) {
			setForm({
				magentatv_smart_price: pricingSettings.magentatv_smart_price.toFixed(2),
				magentatv_smartstream_price:
					pricingSettings.magentatv_smartstream_price.toFixed(2),
				magentatv_megastream_price:
					pricingSettings.magentatv_megastream_price.toFixed(2),
				shipping_hardware_fee: pricingSettings.shipping_hardware_fee.toFixed(2),
				plus_karte_first_price:
					pricingSettings.plus_karte_first_price.toFixed(2),
				plus_karte_following_price:
					pricingSettings.plus_karte_following_price.toFixed(2),
				mobile_tier_smartphone:
					pricingSettings.mobile_tier_smartphone.toFixed(2),
				mobile_tier_top:
					pricingSettings.mobile_tier_top.toFixed(2),
				mobile_tier_premium:
					pricingSettings.mobile_tier_premium.toFixed(2),
				mobile_tier_premium_plus:
					pricingSettings.mobile_tier_premium_plus.toFixed(2),
			});
		}
	}, [
		pricingSettings,
	]);

	const handleChange = (key: keyof typeof form, value: string) => {
		setForm((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		setStatus('pending');
		const changes = Object.entries(form).map(([
			key,
			value,
		]) => ({
			key,
			value: value.replace(',', '.'),
		}));
		updateMutation.mutate(changes);
	};

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 text-[0.85rem] text-[#888]">
				<Loader2 className="w-4 h-4 animate-spin" /> Lade Preise...
			</div>
		);
	}

	const SaveButton = (
		<button
			onClick={handleSave}
			disabled={status === 'pending'}
			className={clsx(
				'px-6 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 outline-none cursor-pointer text-[0.85rem] active:scale-95',
				status === 'pending'
					? 'bg-[#ddd] shadow-none cursor-not-allowed text-[#999] opacity-50'
					: 'bg-[#e20074] hover:bg-[#c70066] text-white shadow-[0_4px_14px_rgba(226,0,116,0.3)] hover:-translate-y-0.5',
			)}
		>
			{status === 'pending' ? (
				<Loader2 className="w-4 h-4 animate-spin" />
			) : (
				<Save className="w-4 h-4" />
			)}
			Preise speichern
		</button>
	);

	return (
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
				y: -10,
			}}
			className="space-y-6"
		>
			<AdminFormSection
				title="MagentaTV Pakete"
				description="Monatliche Grundpreise der TV-Optionen."
				icon={Euro}
			>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Input
						label="MagentaTV Smart"
						type="number"
						step="0.01"
						value={form.magentatv_smart_price}
						onChange={(e) =>
							handleChange('magentatv_smart_price', e.target.value)
						}
					/>
					<Input
						label="MagentaTV SmartStream"
						type="number"
						step="0.01"
						value={form.magentatv_smartstream_price}
						onChange={(e) =>
							handleChange('magentatv_smartstream_price', e.target.value)
						}
					/>
					<Input
						label="MagentaTV MegaStream"
						type="number"
						step="0.01"
						value={form.magentatv_megastream_price}
						onChange={(e) =>
							handleChange('magentatv_megastream_price', e.target.value)
						}
					/>
				</div>
			</AdminFormSection>

			<AdminFormSection
				title="Zusatzkarten & Gebühren"
				description="Preise für PlusKarten und Versand."
				icon={Tag}
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Input
						label="PlusKarte (Erste)"
						type="number"
						step="0.01"
						value={form.plus_karte_first_price}
						onChange={(e) =>
							handleChange('plus_karte_first_price', e.target.value)
						}
					/>
					<Input
						label="PlusKarte (Jede weitere)"
						type="number"
						step="0.01"
						value={form.plus_karte_following_price}
						onChange={(e) =>
							handleChange('plus_karte_following_price', e.target.value)
						}
					/>
					<Input
						label="Hardware Versandpauschale"
						type="number"
						step="0.01"
						value={form.shipping_hardware_fee}
						onChange={(e) =>
							handleChange('shipping_hardware_fee', e.target.value)
						}
					/>
				</div>
			</AdminFormSection>

			<AdminFormSection
				title="Mobilfunk — Smartphone-Aufschläge"
				description="Monatliche Aufschläge pro Hardware-Stufe auf den Mobilfunktarif-Grundpreis."
				icon={Euro}
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Input
						label="Smartphone"
						type="number"
						step="0.01"
						value={form.mobile_tier_smartphone}
						onChange={(e) =>
							handleChange('mobile_tier_smartphone', e.target.value)
						}
					/>
					<Input
						label="Top-Smartphone"
						type="number"
						step="0.01"
						value={form.mobile_tier_top}
						onChange={(e) =>
							handleChange('mobile_tier_top', e.target.value)
						}
					/>
					<Input
						label="Premium-Smartphone"
						type="number"
						step="0.01"
						value={form.mobile_tier_premium}
						onChange={(e) =>
							handleChange('mobile_tier_premium', e.target.value)
						}
					/>
					<Input
						label="Premium-Plus-Smartphone"
						type="number"
						step="0.01"
						value={form.mobile_tier_premium_plus}
						onChange={(e) =>
							handleChange('mobile_tier_premium_plus', e.target.value)
						}
					/>
				</div>
			</AdminFormSection>

			<div className="flex items-center justify-between p-6 bg-[#f7f8fa] border border-[#eaedf0] rounded-3xl">
				<div className="flex flex-col">
					{(status === 'success' && (
						<p className="text-green-600 font-bold text-[0.85rem] m-0 flex items-center gap-2">
							<Check className="w-4 h-4" /> Änderungen gespeichert
						</p>
					)) ||
						(status === 'error' && (
							<p className="text-red-500 font-bold text-[0.85rem] m-0 flex items-center gap-2">
								<AlertTriangle className="w-4 h-4" /> Fehler beim Speichern
							</p>
						)) || (
						<p className="text-[#888] font-medium text-[0.8rem] m-0">
								Änderungen werden sofort für alle Nutzer übernommen.
						</p>
					)}
				</div>
				{SaveButton}
			</div>
		</motion.div>
	);
}

function DesignPanel() {
	const utils = trpc.useUtils();
	const {
		data: designSettings, isLoading,
	} =
		trpc.settings.getDesignSettings.useQuery();

	const [
		status,
		setStatus,
	] = useState<
		'idle' | 'pending' | 'success' | 'error'
	>('idle');

	const updateMutation = trpc.settings.updateMany.useMutation({
		onSuccess: () => {
			utils.settings.getDesignSettings.invalidate();
			setStatus('success');
			setTimeout(() => setStatus('idle'), 3000);
		},
		onError: () => {
			setStatus('error');
			setTimeout(() => setStatus('idle'), 3000);
		},
	});

	const [
		form,
		setForm,
	] = useState({
		magentatv_background_image: '',
		smartphone_background_image: '',
		header_background_image: '',
		category_image_MOBILE: '',
		category_image_FIBER: '',
		category_image_DSL: '',
		category_image_MAGENTA_TV_OTT: '',
		category_image_DEVICE: '',
	});

	useEffect(() => {
		if (designSettings) {
			setForm({
				magentatv_background_image:
					designSettings.magentatv_background_image || '',
				smartphone_background_image:
					designSettings.smartphone_background_image || '',
				header_background_image: designSettings.header_background_image || '',
				category_image_MOBILE: designSettings.category_image_MOBILE || '',
				category_image_FIBER: designSettings.category_image_FIBER || '',
				category_image_DSL: designSettings.category_image_DSL || '',
				category_image_MAGENTA_TV_OTT:
					designSettings.category_image_MAGENTA_TV_OTT || '',
				category_image_DEVICE: designSettings.category_image_DEVICE || '',
			});
		}
	}, [
		designSettings,
	]);

	const handleChange = (key: keyof typeof form, value: string) => {
		setForm((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		setStatus('pending');
		const changes = Object.entries(form).map(([
			key,
			value,
		]) => ({
			key,
			value,
		}));
		updateMutation.mutate(changes);
	};

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 text-[0.85rem] text-[#888]">
				<Loader2 className="w-4 h-4 animate-spin" /> Lade Design
				Einstellungen...
			</div>
		);
	}

	const SaveButton = (
		<button
			onClick={handleSave}
			disabled={status === 'pending'}
			className={clsx(
				'px-6 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 outline-none cursor-pointer text-[0.85rem] active:scale-95',
				status === 'pending'
					? 'bg-[#ddd] shadow-none cursor-not-allowed text-[#999] opacity-50'
					: 'bg-[#e20074] hover:bg-[#c70066] text-white shadow-[0_4px_14px_rgba(226,0,116,0.3)] hover:-translate-y-0.5',
			)}
		>
			{status === 'pending' ? (
				<Loader2 className="w-4 h-4 animate-spin" />
			) : (
				<Save className="w-4 h-4" />
			)}
			Design speichern
		</button>
	);

	return (
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
				y: -10,
			}}
			className="space-y-6"
		>
			<AdminFormSection
				title="Hintergrundbilder"
				description="Bilder für Header und MagentaTV-Bereiche."
				icon={ImageIcon}
			>
				<div className="space-y-6">
					<div>
						<Input
							label="MagentaTV Hintergrundbild (URL)"
							type="text"
							placeholder="https://test.com/magentatv-bg.png"
							value={form.magentatv_background_image}
							onChange={(e) =>
								handleChange('magentatv_background_image', e.target.value)
							}
						/>
						<p className="text-[#888] text-[0.75rem] mt-2 font-medium">
							Wird für Zubuchoptionen mit &quot;MagentaTV&quot; im Namen
							verwendet.
						</p>
					</div>

					<div>
						<Input
							label="Smartphone Hintergrundbild (URL)"
							type="text"
							placeholder="https://test.com/smartphone-bg.png"
							value={form.smartphone_background_image}
							onChange={(e) =>
								handleChange('smartphone_background_image', e.target.value)
							}
						/>
						<p className="text-[#888] text-[0.75rem] mt-2 font-medium">
							Wird für die Option &quot;Mit Smartphone buchen&quot; im Konfigurator
							verwendet.
						</p>
					</div>

					<div>
						<Input
							label="Header Hintergrundbild (URL)"
							type="text"
							placeholder="https://test.com/header-bg.png"
							value={form.header_background_image}
							onChange={(e) =>
								handleChange('header_background_image', e.target.value)
							}
						/>
						<p className="text-[#888] text-[0.75rem] mt-2 font-medium">
							Hintergrund für den Grußtext auf der Startseite.
						</p>
					</div>
				</div>
			</AdminFormSection>

			<AdminFormSection
				title="Kategorien (Hover-Effekte)"
				description="Bilder für die Auswahl-Karten auf der Startseite."
				icon={Tag}
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Input
						label="Mobilfunk"
						type="text"
						value={form.category_image_MOBILE}
						onChange={(e) =>
							handleChange('category_image_MOBILE', e.target.value)
						}
					/>
					<Input
						label="Glasfaser"
						type="text"
						value={form.category_image_FIBER}
						onChange={(e) =>
							handleChange('category_image_FIBER', e.target.value)
						}
					/>
					<Input
						label="Festnetz (DSL)"
						type="text"
						value={form.category_image_DSL}
						onChange={(e) => handleChange('category_image_DSL', e.target.value)}
					/>
					<Input
						label="MagentaTV"
						type="text"
						value={form.category_image_MAGENTA_TV_OTT}
						onChange={(e) =>
							handleChange('category_image_MAGENTA_TV_OTT', e.target.value)
						}
					/>
					<Input
						label="Endgeräte"
						type="text"
						value={form.category_image_DEVICE}
						onChange={(e) =>
							handleChange('category_image_DEVICE', e.target.value)
						}
					/>
				</div>
			</AdminFormSection>

			<div className="flex items-center justify-between p-6 bg-[#f7f8fa] border border-[#eaedf0] rounded-3xl">
				<div className="flex flex-col">
					{(status === 'success' && (
						<p className="text-green-600 font-bold text-[0.85rem] m-0 flex items-center gap-2">
							<Check className="w-4 h-4" /> Änderungen gespeichert
						</p>
					)) ||
						(status === 'error' && (
							<p className="text-red-500 font-bold text-[0.85rem] m-0 flex items-center gap-2">
								<AlertTriangle className="w-4 h-4" /> Fehler beim Speichern
							</p>
						)) || (
						<p className="text-[#888] font-medium text-[0.8rem] m-0">
								Bilder werden sofort im Tool aktualisiert.
						</p>
					)}
				</div>
				{SaveButton}
			</div>
		</motion.div>
	);
}
