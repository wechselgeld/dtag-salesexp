'use client';

import {
	useState, useRef, useEffect,
} from 'react';
import {
	useRouter,
} from 'next/navigation';
import {
	trpc,
} from '@/lib/trpc';
import {
	useOpenPanel,
} from '@openpanel/nextjs';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	ArrowRight,
	AlertTriangle,
	Eye,
	EyeOff,
	Fingerprint,
	Lock,
	UserCheck,
	ArrowLeft,
	Mail,
	Key,
} from 'lucide-react';
import {
	TelekomLogo,
} from '@/components/shared/telekom-logo';
import {
	GlobalFooter,
} from '@/components/shared/global-footer';
import {
	useForm,
} from 'react-hook-form';
import {
	zodResolver,
} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
	PremiumPinInput,
} from '@/components/shared/premium-pin-input';
import {
	PremiumInput,
	PremiumButton,
	ScreenHeader,
	ErrorBanner,
} from '@/components/shared/form/form-suite';

const loginSchema = z.object({
	email: z
		.string()
		.min(1, 'E-Mail ist erforderlich')
		.email('Bitte gib eine gültige E-Mail-Adresse ein'),
	password: z.string().min(1, 'Passwort ist erforderlich'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const router = useRouter();
	const utils = trpc.useUtils();
	const op = useOpenPanel();
	const [
		error,
		setError,
	] = useState('');
	const [
		showPassword,
		setShowPassword,
	] = useState(false);

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

	const {
		data: currentUser,
	} = trpc.auth.me.useQuery();

	const {
		data: passwordSetupInfo,
	} = trpc.auth.checkAdminPasswordSetup.useQuery(undefined, {
		enabled: !!currentUser,
	});

	const {
		register,
		handleSubmit,
		formState: {
			errors, isValid,
		},
		watch,
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		mode: 'onChange',
		defaultValues: {
			email: '',
			password: '',
		},
	});

	// First time admin password setup state
	const [
		isSettingUpPassword,
		setIsSettingUpPassword,
	] = useState(false);
	const [
		setupEmail,
		setSetupEmail,
	] = useState('');
	const [
		setupPin,
		setSetupPin,
	] = useState('');
	const [
		setupPassword,
		setSetupPassword,
	] = useState('');
	const [
		setupPasswordConfirm,
		setSetupPasswordConfirm,
	] = useState('');
	const [
		setupError,
		setSetupError,
	] = useState('');
	const [
		showSetupPassword,
		setShowSetupPassword,
	] = useState(false);

	// Passkey setup state
	const [
		showPasskeyStep,
		setShowPasskeyStep,
	] = useState(false);
	const [
		passkeyEmail,
		setPasskeyEmail,
	] = useState('');
	const [
		isEnrollingPasskey,
		setIsEnrollingPasskey,
	] = useState(false);

	// tRPC WebAuthn mutations
	const getRegOptions = trpc.webauthn.generateRegistrationOptions.useMutation();
	const verifyReg = trpc.webauthn.verifyRegistration.useMutation();

	const setupMutation = trpc.auth.setupAdminPassword.useMutation({
		onSuccess: async (data) => {
			op.track('admin_setup_success', {
				email: setupEmail,
				location: 'login_page',
			});
			await utils.auth.me.refetch();
			if (data.suggestPasskey) {
				setPasskeyEmail(setupEmail || '');
				setShowPasskeyStep(true);
			}
			else {
				router.push('/admin/products');
				router.refresh();
			}
		},
		onError: (err) => {
			op.track('admin_setup_failed', {
				email: setupEmail,
				location: 'login_page',
				error: err.message || String(err),
			});
			setSetupError(err.message);
		},
	});

	const handleSetupSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSetupError('');
		if (!setupEmail) {
			setSetupError('Bitte gib Deine E-Mail-Adresse ein.');
			return;
		}
		if (setupPin.length !== 6) {
			setSetupError('Bitte gib Deine 6-stellige PIN ein.');
			return;
		}
		if (setupPassword.length < 8) {
			setSetupError('Das Passwort muss mindestens 8 Zeichen lang sein.');
			return;
		}
		if (setupPassword !== setupPasswordConfirm) {
			setSetupError('Die Passwörter stimmen nicht überein.');
			return;
		}
		op.track('admin_setup_started', {
			email: setupEmail,
			location: 'login_page',
		});
		setupMutation.mutate({
			email: setupEmail,
			pin: setupPin,
			password: setupPassword,
		});
	};

	const loginMutation = trpc.auth.login.useMutation({
		onSuccess: async (data) => {
			op.track('admin_login_success', {
				email: watch('email') || '',
				location: 'login_page',
				type: 'password',
			});
			await utils.auth.me.refetch();
			if (data.suggestPasskey) {
				setPasskeyEmail(watch('email') || '');
				setShowPasskeyStep(true);
			}
			else {
				router.push('/admin/products');
				router.refresh();
			}
		},
		onError: (err) => {
			op.track('admin_login_failed', {
				email: watch('email') || '',
				location: 'login_page',
				type: 'password',
				error: err.message || String(err),
			});
			setError(err.message);
			if (err.message.includes('noch kein Passwort')) {
				const currentEmail = watch('email');
				if (currentEmail && !setupEmail) setSetupEmail(currentEmail);
			}
		},
	});

	const handlePasskeyEnrollment = async () => {
		const targetEmail = passkeyEmail || currentUser?.email || setupEmail || watch('email');
		if (!targetEmail) {
			setError('E-Mail-Adresse fehlt.');
			return;
		}
		setIsEnrollingPasskey(true);
		op.track('passkey_registration_started', {
			email: targetEmail,
			location: 'login_page',
			user_role: currentUser?.role || undefined,
		});
		try {
			const {
				startRegistration,
			} = await import('@simplewebauthn/browser');
			const options = await getRegOptions.mutateAsync({
				email: targetEmail,
			});
			const resp = await startRegistration({
				optionsJSON: options,
			});
			await verifyReg.mutateAsync({
				email: targetEmail,
				response: resp,
			});
			op.track('passkey_registration_success', {
				email: targetEmail,
				location: 'login_page',
				user_role: currentUser?.role || undefined,
			});
			alert('Passkey erfolgreich eingerichtet!');
			router.push('/admin/products');
			router.refresh();
		}
		catch (err: any) {
			console.error('Passkey failed', err);
			op.track('passkey_registration_failed', {
				email: targetEmail,
				location: 'login_page',
				user_role: currentUser?.role || undefined,
				error: err.message || String(err),
			});
			alert(`Fehler bei der Passkey-Einrichtung: ${err.message}`);
		}
		finally {
			setIsEnrollingPasskey(false);
		}
	};

	const handleSkipPasskey = () => {
		const targetEmail = passkeyEmail || currentUser?.email || setupEmail || watch('email');
		op.track('passkey_setup_skipped', {
			email: targetEmail || undefined,
			location: 'login_page',
		});
		router.push('/admin/products');
		router.refresh();
	};

	const [
		isPasskeyLoading,
		setIsPasskeyLoading,
	] = useState(false);
	const getAuthOptions =
		trpc.webauthn.generateAuthenticationOptions.useMutation();
	const verifyAuth = trpc.webauthn.verifyAuthentication.useMutation();

	const autofillAttemptedRef = useRef(false);

	// Conditional UI (Passkey Autofill) hook
	useEffect(() => {
		if (autofillAttemptedRef.current) return;
		autofillAttemptedRef.current = true;

		const runConditionalAutofill = async () => {
			if (
				typeof window !== 'undefined' &&
				window.PublicKeyCredential &&
				(await window.PublicKeyCredential.isConditionalMediationAvailable?.())
			) {
				try {
					const {
						startAuthentication,
					} =
						await import('@simplewebauthn/browser');
					const {
						options, challengeId,
					} = await getAuthOptions.mutateAsync({
					});
					const authResp = await startAuthentication({
						optionsJSON: options,
						useBrowserAutofill: true,
					});
					op.track('passkey_login_started', {
						location: 'login_page',
						type: 'conditional_autofill',
					});
					const verifyResp = await verifyAuth.mutateAsync({
						challengeId,
						response: authResp,
					});

					if (verifyResp.success) {
						op.track('passkey_login_success', {
							email: verifyResp.email || undefined,
							location: 'login_page',
							type: 'conditional_autofill',
							user_role: verifyResp.isAdmin ? 'ADMIN' : 'USER',
						});
						await utils.auth.me.refetch();
						router.push('/admin/products');
						router.refresh();
					}
				}
				catch (err: any) {
					console.log('Conditional UI autofill aborted or unavailable', err);
					if (err.name !== 'AbortError') {
						op.track('passkey_login_failed', {
							location: 'login_page',
							type: 'conditional_autofill',
							error: err.message || String(err),
						});
					}
				}
			}
		};
		runConditionalAutofill();
	}, [
	]);

	const handlePasskeyLogin = async () => {
		setError('');
		setIsPasskeyLoading(true);
		op.track('passkey_login_started', {
			location: 'login_page',
			type: 'manual',
		});
		try {
			const {
				startAuthentication,
			} = await import('@simplewebauthn/browser');
			const {
				options, challengeId,
			} = await getAuthOptions.mutateAsync({
			});
			const authResp = await startAuthentication({
				optionsJSON: options,
			});
			const verifyResp = await verifyAuth.mutateAsync({
				challengeId,
				response: authResp,
			});

			if (verifyResp.success) {
				op.track('passkey_login_success', {
					email: verifyResp.email || undefined,
					location: 'login_page',
					type: 'manual',
					user_role: verifyResp.isAdmin ? 'ADMIN' : 'USER',
				});
				await utils.auth.me.refetch();
				router.push('/admin/products');
				router.refresh();
			}
		}
		catch (err: any) {
			console.error('Passkey login failed', err);
			op.track('passkey_login_failed', {
				location: 'login_page',
				type: 'manual',
				error: err.message || String(err),
			});
			if (err.message?.includes('No passkeys registered')) {
				setError('Für diese E-Mail ist noch kein Passkey registriert.');
			}
			else {
				setError('Passkey-Login fehlgeschlagen. Bitte verwende Dein Passwort.');
			}
		}
		finally {
			setIsPasskeyLoading(false);
		}
	};

	const onSubmit = (data: LoginFormData) => {
		setError('');
		op.track('admin_login_started', {
			email: data.email,
			location: 'login_page',
			type: 'password',
		});
		loginMutation.mutate({
			email: data.email,
			password: data.password,
		});
	};

	return (
		<div className="h-screen w-full py-12 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074] scrollbar-none overflow-y-auto overflow-x-hidden fixed inset-0 bg-[#f7f8fa]">
			<div className="max-w-3xl mx-auto">
				{/* Top Branding matching Onboarding */}
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
						System Login
					</h1>
					<p className="text-[1.05rem] text-[#888] font-normal leading-relaxed max-w-md mx-auto mt-1">
						Bitte melde Dich an, um den Administrationsbereich zu betreten.
					</p>
				</motion.div>

				{/* Elevated Premium Card matching Onboarding */}
				<motion.div
					initial={{
						opacity: 0,
						y: 15,
					}}
					animate={{
						opacity: 1,
						y: 0,
						height:
							typeof cardHeight === 'number' && cardHeight > 0
								? cardHeight
								: 'auto',
					}}
					transition={{
						duration: 0.4,
					}}
					className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] overflow-hidden relative"
				>
					<div ref={cardRef} className="p-8 sm:p-12">
						<div className="flex justify-center gap-2 mb-8">
							{[
								1,
								2,
							].map((step) => {
								const isCurrent = (showPasskeyStep ? 2 : 1) === step;
								const isCompleted = (showPasskeyStep ? 2 : 1) > step;
								return (
									<div
										key={step}
										className={`h-1.5 rounded-full transition-all duration-300 ${isCurrent
												? 'w-8 bg-[#e20074]'
												: isCompleted
													? 'w-8 bg-[#e20074]/30'
													: 'w-2 bg-[#eaedf0]'
											}`}
									/>
								);
							})}
						</div>
						<AnimatePresence mode="wait" initial={false}>
							{showPasskeyStep ? (
								<motion.div
									key="passkey-setup"
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
									className="space-y-6 w-full text-left"
								>
									<ScreenHeader
										icon={<Key className="w-5 h-5 text-[#e20074]" />}
										title="Gerät sicher merken (Passkey)"
										subtitle="Melde Dich in Zukunft blitzschnell per Bitwarden oder Windows Hello an – ganz ohne PIN oder Passwort!"
									/>

									<div className="flex flex-col gap-3 w-full mt-4">
										<PremiumButton
											type="button"
											onClick={handlePasskeyEnrollment}
											loading={isEnrollingPasskey}
											disabled={isEnrollingPasskey}
											icon={<Key className="w-4 h-4 mr-2" />}
											className="w-full"
										>
											Passkey einrichten
										</PremiumButton>
										<PremiumButton
											type="button"
											onClick={handleSkipPasskey}
											disabled={isEnrollingPasskey}
											variant="secondary"
											icon={<ArrowRight className="w-3.5 h-3.5 ml-1" />}
											className="w-full"
										>
											Überspringen
										</PremiumButton>
									</div>
								</motion.div>
							) : isSettingUpPassword ? (
								<motion.div
									key="setup-form"
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
									className="space-y-6 w-full"
								>
									<ScreenHeader
										icon={<UserCheck className="w-5 h-5 text-[#e20074]" />}
										title="Erst-Einrichtung des Passworts"
										subtitle="Gib Deine E-Mail und Deine 6-stellige PIN ein, um Deine Identität zu bestätigen und Dein neues Administrator-Passwort festzulegen."
									/>

									<form
										onSubmit={handleSetupSubmit}
										className="w-full flex flex-col gap-6"
									>
										{/* Mail & PIN next to each other */}
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<PremiumInput
												label="E-Mail Adresse"
												type="email"
												value={setupEmail}
												onChange={(e) => {
													setSetupEmail(e.target.value);
													if (setupError) setSetupError('');
												}}
												placeholder="max.mustermann@telekom.de"
												disabled={setupMutation.isPending}
												icon={<Mail className="w-[18px] h-[18px]" />}
												autoComplete="username webauthn"
											/>

											<div className="flex flex-col gap-1.5 relative text-left">
												<label className="text-[0.75rem] font-bold text-[#b0b0b0] uppercase tracking-wider pl-1 font-sans">
													6-stellige PIN
												</label>
												<PremiumPinInput
													id="admin-setup-pin"
													value={setupPin}
													onChange={(val) => {
														setSetupPin(val);
														if (setupError) setSetupError('');
													}}
													disabled={setupMutation.isPending}
												/>
											</div>
										</div>

										{/* Under that the password forms */}
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
											<PremiumInput
												label="Neues Passwort (min. 8 Zeichen)"
												type={showSetupPassword ? 'text' : 'password'}
												value={setupPassword}
												onChange={(e) => {
													setSetupPassword(e.target.value);
													if (setupError) setSetupError('');
												}}
												placeholder="••••••••"
												disabled={setupMutation.isPending}
												icon={<Key className="w-[18px] h-[18px]" />}
												rightAction={
													<button
														type="button"
														onClick={() =>
															setShowSetupPassword(!showSetupPassword)
														}
														className="text-[#888] hover:text-[#1a1a2e] transition-colors focus:outline-none cursor-pointer"
													>
														{showSetupPassword ? (
															<EyeOff className="w-5 h-5" />
														) : (
															<Eye className="w-5 h-5" />
														)}
													</button>
												}
											/>

											<PremiumInput
												label="Passwort wiederholen"
												type={showSetupPassword ? 'text' : 'password'}
												value={setupPasswordConfirm}
												onChange={(e) => {
													setSetupPasswordConfirm(e.target.value);
													if (setupError) setSetupError('');
												}}
												placeholder="••••••••"
												disabled={setupMutation.isPending}
												icon={<Key className="w-[18px] h-[18px]" />}
											/>
										</div>

										<ErrorBanner message={setupError} />

										<div className="flex gap-3 mt-4">
											<PremiumButton
												type="button"
												variant="secondary"
												onClick={() => {
													setIsSettingUpPassword(false);
													setSetupError('');
												}}
												className="flex-1"
											>
												<ArrowLeft className="w-4 h-4" /> Zurück
											</PremiumButton>
											<PremiumButton
												type="submit"
												loading={setupMutation.isPending}
												disabled={
													setupMutation.isPending ||
													!setupEmail ||
													setupPin.length !== 6 ||
													setupPassword.length < 8 ||
													setupPassword !== setupPasswordConfirm
												}
												icon={
													<ArrowRight
														className="w-3.5 h-3.5 ml-1"
														strokeWidth={2.5}
													/>
												}
												className="flex-1"
											>
												Speichern & Anmelden
											</PremiumButton>
										</div>
									</form>
								</motion.div>
							) : (
								<motion.div
									key="login-form"
									initial={{
										opacity: 0,
										x: -15,
									}}
									animate={{
										opacity: 1,
										x: 0,
									}}
									exit={{
										opacity: 0,
										x: 15,
									}}
									className="space-y-6 w-full"
								>
									{currentUser && passwordSetupInfo && (passwordSetupInfo.role === 'USER' || !passwordSetupInfo.hasPassword) && (
										<motion.div
											initial={{
												opacity: 0,
												scale: 0.98,
											}}
											animate={{
												opacity: 1,
												scale: 1,
											}}
											className="p-4 bg-amber-50 text-amber-800 rounded-2xl text-[0.85rem] font-medium flex gap-3 items-center border border-amber-200 mb-6 w-full shadow-sm leading-relaxed text-left"
										>
											<AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
											<div>
												Du bist aktuell als Sales-Agent angemeldet. Dieser
												Bereich ist nur für Administratoren zugänglich. Bitte
												melde Dich mit einem Administratorkonto an (oder melde
												Dich erneut an, falls Deine Berechtigungen kürzlich
												geändert wurden).
											</div>
										</motion.div>
									)}

									<ScreenHeader
										icon={<Lock className="w-5 h-5 text-[#e20074]" />}
										title="Administrator-Anmeldung"
										subtitle="Bitte melde Dich mit Deinem Administrator-Konto an."
									/>

									<form
										onSubmit={handleSubmit(onSubmit)}
										className="w-full flex flex-col gap-6"
									>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<PremiumInput
												label="E-Mail Adresse"
												type="email"
												{...register('email', {
													onChange: () => {
														if (error) setError('');
													},
												})}
												disabled={loginMutation.isPending || isPasskeyLoading}
												placeholder="max.mustermann@telekom.de"
												error={errors.email?.message}
												icon={<Mail className="w-[18px] h-[18px]" />}
												autoComplete="username webauthn"
											/>

											<PremiumInput
												label="Passwort"
												type={showPassword ? 'text' : 'password'}
												{...register('password', {
													onChange: () => {
														if (error) setError('');
													},
												})}
												disabled={loginMutation.isPending || isPasskeyLoading}
												placeholder="••••••••"
												error={errors.password?.message}
												icon={<Key className="w-[18px] h-[18px]" />}
												rightAction={
													<button
														type="button"
														onClick={() => setShowPassword(!showPassword)}
														className="text-[#888] hover:text-[#1a1a2e] transition-colors focus:outline-none cursor-pointer"
													>
														{showPassword ? (
															<EyeOff className="w-5 h-5" />
														) : (
															<Eye className="w-5 h-5" />
														)}
													</button>
												}
											/>
										</div>

										<ErrorBanner message={error} />

										{/* Primary Submit Button */}
										<PremiumButton
											type="submit"
											loading={loginMutation.isPending}
											disabled={
												loginMutation.isPending || isPasskeyLoading || !isValid
											}
											icon={
												<ArrowRight
													className="w-4 h-4 ml-0.5"
													strokeWidth={2.5}
												/>
											}
										>
											Anmelden
										</PremiumButton>

										<div className="relative flex items-center gap-4 py-4 w-full">
											<div className="h-[1px] flex-1 bg-[#eaedf0]" />
											<span className="text-[0.75rem] font-bold text-[#bbb] uppercase tracking-widest">
												Oder
											</span>
											<div className="h-[1px] flex-1 bg-[#eaedf0]" />
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<PremiumButton
												type="button"
												variant="secondary"
												onClick={handlePasskeyLogin}
												disabled={loginMutation.isPending || isPasskeyLoading}
												loading={isPasskeyLoading}
												icon={
													<Fingerprint className="w-4 h-4 text-[#e20074]" />
												}
											>
												Mit Passkey anmelden
											</PremiumButton>
											<PremiumButton
												type="button"
												variant="secondary"
												onClick={() => {
													const currentEmail = watch('email');
													if (currentEmail && !setupEmail) { setSetupEmail(currentEmail); }
													setIsSettingUpPassword(true);
													setError('');
												}}
												icon={<UserCheck className="w-4 h-4 text-[#e20074]" />}
											>
												Passwort einrichten
											</PremiumButton>
										</div>
									</form>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</motion.div>

				{/* Bottom Footer matching Onboarding */}
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
