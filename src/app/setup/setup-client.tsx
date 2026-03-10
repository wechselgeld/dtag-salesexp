"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
	Check,
	ShieldAlert,
	ArrowRight,
	Users,
	User,
	Mail,
	CheckCircle2,
	RotateCcw,
	ChevronRight,
	MapPin,
	ArrowLeft,
	Globe
} from "lucide-react";
import clsx from "clsx";
import { TelekomLogo } from "@/components/shared/telekom-logo";
import { Skeleton } from "@/components/shared/skeleton";
import Link from "next/link";
import { GlobalFooter } from "@/components/shared/global-footer";
import { z } from "zod";

/* ──────────────────────────────────────────────
   Zod schema for form validation
   ────────────────────────────────────────────── */

const setupFormSchema = z.object({
	firstName: z.string().trim().min(1, "Vorname ist erforderlich"),
	lastName: z.string().trim().min(1, "Nachname ist erforderlich"),
	email: z
		.string()
		.email("Ungültige E-Mail-Adresse")
		.refine((val) => val.endsWith("@telekom.de"), {
			message: "Es sind nur interne Adressen erlaubt."
		}),
	odRegionId: z.string().min(1, "Bitte wähle einen OD-Bereich aus"),
	locationId: z.string().min(1, "Bitte wähle einen Standort aus"),
	teamId: z.string().min(1, "Bitte wähle ein Team aus"),
	acceptedTerms: z.literal(true),
	acceptedPrivacy: z.literal(true)
});

/* ──────────────────────────────────────────────
   LocalStorage helpers
   ────────────────────────────────────────────── */

const LS_KEY_FIRST_NAME = "setup-user-firstName";
const LS_KEY_LAST_NAME = "setup-user-lastName";
const LS_KEY_EMAIL = "setup-user-email";
const LS_KEY_SETUP_DONE = "setup-completed";

function getStoredUser(): {
	firstName: string;
	lastName: string;
	email: string;
} {
	if (typeof window === "undefined")
		return { firstName: "", lastName: "", email: "" };
	return {
		firstName: localStorage.getItem(LS_KEY_FIRST_NAME) ?? "",
		lastName: localStorage.getItem(LS_KEY_LAST_NAME) ?? "",
		email: localStorage.getItem(LS_KEY_EMAIL) ?? ""
	};
}

function persistName(firstName: string, lastName: string, email: string) {
	localStorage.setItem(LS_KEY_FIRST_NAME, firstName);
	localStorage.setItem(LS_KEY_LAST_NAME, lastName);
	localStorage.setItem(LS_KEY_EMAIL, email);
}

function markSetupComplete() {
	localStorage.setItem(LS_KEY_SETUP_DONE, new Date().toISOString());
}

function isSetupAlreadyDone(): boolean {
	if (typeof window === "undefined") return false;
	return !!localStorage.getItem(LS_KEY_SETUP_DONE);
}

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */

export default function SetupPage() {
	const router = useRouter();

	// Form state
	const [currentStep, setCurrentStep] = useState(1);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [selectedOdRegionId, setSelectedOdRegionId] = useState<string | null>(
		null
	);
	const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
		null
	);
	const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
	const [acceptedTerms, setAcceptedTerms] = useState(false);
	const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	// Returning-user state
	const [hasCompletedBefore, setHasCompletedBefore] = useState(false);
	const [showReconfigure, setShowReconfigure] = useState(false);

	// Data fetching
	const { data: odRegions, isLoading: isOdRegionsLoading } =
		trpc.odRegion.list.useQuery();
	const { data: locations, isLoading: isLocationsLoading } =
		trpc.location.list.useQuery(
			selectedOdRegionId ? { odRegionId: selectedOdRegionId } : undefined,
			{ enabled: !!selectedOdRegionId }
		);
	const { data: teams, isLoading: isTeamsLoading } = trpc.team.list.useQuery(
		selectedLocationId ? { locationId: selectedLocationId } : undefined,
		{ enabled: !!selectedLocationId }
	);
	const {
		isLoading: isIpLoading,
		isError: isIpError,
		error: ipError
	} = trpc.session.verifyIp.useQuery(undefined, { retry: false });
	const { data: existingSession, refetch: refetchCurrentSession } =
		trpc.session.getCurrent.useQuery();

	const requestVerification = trpc.session.requestVerification.useMutation({
		onSuccess: (data) => {
			setIsSubmitting(false);
			if (data.bypassed) {
				finalizeLogin.mutate({ sessionId: data.sessionId });
			} else {
				setPendingSessionId(data.sessionId);
			}
		},
		onError: (error) => {
			console.error("Setup failed", error);
			setIsSubmitting(false);
		}
	});

	const { data: verificationStatus } = trpc.session.checkVerification.useQuery(
		{ sessionId: pendingSessionId as string },
		{
			enabled: !!pendingSessionId,
			refetchInterval: 3000 // Poll every 3 seconds
		}
	);

	const finalizeLogin = trpc.session.finalizeLogin.useMutation({
		onSuccess: (data) => {
			persistName(
				data.firstName?.trim() || "",
				data.lastName?.trim() || "",
				data.email?.trim() || ""
			);
			markSetupComplete();
			refetchCurrentSession().then(() => {
				router.push("/products");
				router.refresh();
			});
		},
		onError: console.error
	});

	const reloginReturningUser = trpc.session.reloginReturningUser.useMutation({
		onSuccess: (data) => {
			persistName(
				data.firstName?.trim() || "",
				data.lastName?.trim() || "",
				data.email?.trim() || ""
			);
			markSetupComplete();
			refetchCurrentSession().then(() => {
				router.push("/products");
				router.refresh();
			});
		},
		onError: (error) => {
			console.error("Relogin failed:", error);
			// Fallback to Reconfigure flow if re-login failed (e.g., cleared from DB)
			setShowReconfigure(true);
		}
	});

	// Hydrate stored user on mount
	useEffect(() => {
		const stored = getStoredUser();
		if (stored.firstName) setFirstName(stored.firstName);
		if (stored.lastName) setLastName(stored.lastName);
		if (stored.email) setEmail(stored.email);
		setHasCompletedBefore(isSetupAlreadyDone());
	}, []);

	// Listen for verification success
	useEffect(() => {
		if (
			verificationStatus?.verified &&
			pendingSessionId &&
			!finalizeLogin.isPending &&
			!finalizeLogin.isSuccess
		) {
			finalizeLogin.mutate({ sessionId: pendingSessionId });
		}
	}, [verificationStatus?.verified, pendingSessionId, finalizeLogin]);

	// Show welcome-back if user has completed setup before (localStorage persists
	// beyond the 30-day session cookie, so data survives across re-setups)
	const isReturningUser = hasCompletedBefore;

	const { data: isEmailRequiredGlobally } =
		trpc.session.getIsEmailRequired.useQuery();

	// Zod-based validation
	const validationResult = useMemo(
		() =>
			setupFormSchema.safeParse({
				firstName,
				lastName,
				email:
					isEmailRequiredGlobally === false ? "no-reply@telekom.de" : email,
				teamId: selectedTeamId ?? "",
				acceptedTerms,
				acceptedPrivacy
			}),
		[
			firstName,
			lastName,
			email,
			selectedTeamId,
			acceptedTerms,
			acceptedPrivacy,
			isEmailRequiredGlobally
		]
	);

	const anyFieldEmpty =
		!firstName.trim() ||
		!lastName.trim() ||
		(isEmailRequiredGlobally !== false && !email.trim()) ||
		!selectedOdRegionId ||
		!selectedLocationId ||
		!selectedTeamId ||
		!acceptedTerms ||
		!acceptedPrivacy;

	const canSubmitClick = !anyFieldEmpty && !isSubmitting && !pendingSessionId;

	const handleNextStep = () => {
		if (currentStep === 1 && selectedOdRegionId) {
			setCurrentStep(2);
		} else if (currentStep === 2 && selectedLocationId) {
			setCurrentStep(3);
		} else if (currentStep === 3 && selectedTeamId) {
			setCurrentStep(4);
		}
	};

	const handlePrevStep = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1);
	};

	const handleSubmit = useCallback(async () => {
		setFormErrors({});
		const result = setupFormSchema.safeParse({
			firstName,
			lastName,
			email: isEmailRequiredGlobally === false ? "no-reply@telekom.de" : email,
			odRegionId: selectedOdRegionId ?? "",
			locationId: selectedLocationId ?? "",
			teamId: selectedTeamId ?? "",
			acceptedTerms,
			acceptedPrivacy
		});

		if (!result.success) {
			const errors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const fieldName = String(issue.path[0]);
				errors[fieldName] = issue.message;
			}
			setFormErrors(errors);
			return;
		}

		setIsSubmitting(true);
		requestVerification.mutate({
			firstName: result.data.firstName,
			lastName: result.data.lastName,
			email: result.data.email,
			teamId: result.data.teamId,
			acceptedTerms: true
		});
	}, [
		selectedOdRegionId,
		selectedLocationId,
		selectedTeamId,
		acceptedTerms,
		acceptedPrivacy,
		firstName,
		lastName,
		email,
		isEmailRequiredGlobally,
		requestVerification
	]);

	/* ── Render Helpers ────────────────────────────── */

	const renderStep1 = () => (
		<motion.div
			key="step1"
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className="space-y-6"
		>
			<SectionHeader
				icon={<Globe className="w-5 h-5 text-[#e20074]" />}
				title="OD-Bereich wählen"
				step={1}
			/>

			{isOdRegionsLoading ? (
				<div className="grid grid-cols-2 gap-3 mt-5">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-[48px] w-full rounded-xl" />
					))}
				</div>
			) : odRegions?.items?.length === 0 ? (
				<div className="text-center p-8 text-[0.85rem] text-[#aaa] bg-[#f7f8fa] border border-dashed border-[#eaedf0] rounded-2xl mt-5">
					Bisher wurden keine OD-Bereiche angelegt.
				</div>
			) : (
				<div className="grid grid-cols-2 gap-3 mt-5">
					<AnimatePresence>
						{odRegions?.items
							?.filter((region: any) => region.isActive)
							.map((region: any, index: number) => (
								<SelectionTile
									key={region.id}
									name={region.name}
									isSelected={selectedOdRegionId === region.id}
									onClick={() => {
										setSelectedOdRegionId(region.id);
										setSelectedLocationId(null);
										setSelectedTeamId(null);
									}}
									index={index}
								/>
							))}
					</AnimatePresence>
				</div>
			)}

			<div className="flex justify-end pt-4 border-t border-[#eaedf0] mt-8">
				<button
					onClick={handleNextStep}
					disabled={!selectedOdRegionId}
					className={clsx(
						"px-6 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2",
						selectedOdRegionId
							? "bg-[#e20074] text-white hover:bg-[#c70066] cursor-pointer"
							: "bg-[#eaedf0] text-[#aaa] cursor-not-allowed"
					)}
				>
					Weiter
					<ArrowRight className="w-4 h-4" />
				</button>
			</div>
		</motion.div>
	);

	const renderStep2 = () => (
		<motion.div
			key="step2"
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className="space-y-6"
		>
			<SectionHeader
				icon={<MapPin className="w-5 h-5 text-[#e20074]" />}
				title="Standort wählen"
				step={2}
			/>

			{isLocationsLoading ? (
				<div className="grid grid-cols-2 gap-3 mt-5">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-[48px] w-full rounded-xl" />
					))}
				</div>
			) : locations?.items?.length === 0 ? (
				<div className="text-center p-8 text-[0.85rem] text-[#aaa] bg-[#f7f8fa] border border-dashed border-[#eaedf0] rounded-2xl mt-5">
					Bisher wurden keine Standorte angelegt.
				</div>
			) : (
				<div className="grid grid-cols-2 gap-3 mt-5">
					<AnimatePresence>
						{locations?.items
							?.filter((loc: any) => loc.isActive)
							.map((loc: any, index: number) => (
								<SelectionTile
									key={loc.id}
									name={loc.name}
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

			<div className="flex justify-between pt-4 border-t border-[#eaedf0] mt-8">
				<button
					onClick={handlePrevStep}
					className="px-5 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 text-[#666] bg-[#f7f8fa] hover:bg-[#eaedf0] cursor-pointer"
				>
					<ArrowLeft className="w-4 h-4" />
					Zurück
				</button>
				<button
					onClick={handleNextStep}
					disabled={!selectedLocationId}
					className={clsx(
						"px-6 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2",
						selectedLocationId
							? "bg-[#e20074] text-white hover:bg-[#c70066] cursor-pointer"
							: "bg-[#eaedf0] text-[#aaa] cursor-not-allowed"
					)}
				>
					Weiter
					<ArrowRight className="w-4 h-4" />
				</button>
			</div>
		</motion.div>
	);

	const renderStep3 = () => (
		<motion.div
			key="step3"
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className="space-y-6"
		>
			<SectionHeader
				icon={<Users className="w-5 h-5 text-[#e20074]" />}
				title="Vertriebsteam wählen"
				step={3}
			/>

			{isTeamsLoading ? (
				<div className="grid grid-cols-2 gap-3 mt-5">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-[48px] w-full rounded-xl" />
					))}
				</div>
			) : teams?.items?.length === 0 ? (
				<div className="text-center p-8 text-[0.85rem] text-[#aaa] bg-[#f7f8fa] border border-dashed border-[#eaedf0] rounded-2xl mt-5">
					In diesem Standort wurden noch keine Teams angelegt.
				</div>
			) : (
				<div className="grid grid-cols-2 gap-3 mt-5">
					<AnimatePresence>
						{teams?.items?.map((team: any, index: number) => (
							<SelectionTile
								key={team.id}
								name={team.name}
								isSelected={selectedTeamId === team.id}
								onClick={() => setSelectedTeamId(team.id)}
								index={index}
							/>
						))}
					</AnimatePresence>
				</div>
			)}

			<div className="flex justify-between pt-4 border-t border-[#eaedf0] mt-8">
				<button
					onClick={handlePrevStep}
					className="px-5 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 text-[#666] bg-[#f7f8fa] hover:bg-[#eaedf0] cursor-pointer"
				>
					<ArrowLeft className="w-4 h-4" />
					Zurück
				</button>
				<button
					onClick={handleNextStep}
					disabled={!selectedTeamId}
					className={clsx(
						"px-6 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2",
						selectedTeamId
							? "bg-[#e20074] text-white hover:bg-[#c70066] cursor-pointer"
							: "bg-[#eaedf0] text-[#aaa] cursor-not-allowed"
					)}
				>
					Weiter
					<ArrowRight className="w-4 h-4" />
				</button>
			</div>
		</motion.div>
	);

	const renderStep4 = () => (
		<motion.div
			key="step4"
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className="space-y-8"
		>
			<section>
				<SectionHeader
					icon={<User className="w-5 h-5 text-[#e20074]" />}
					title="Persönliche Daten"
					step={4}
				/>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
					<InputField
						id="setup-first-name"
						label="Vorname"
						placeholder="Max"
						value={firstName}
						onChange={setFirstName}
					/>
					<InputField
						id="setup-last-name"
						label="Nachname"
						placeholder="Mustermann"
						value={lastName}
						onChange={setLastName}
					/>
				</div>
				{isEmailRequiredGlobally !== false && (
					<div className="mt-4">
						<InputField
							id="setup-email"
							label="E-Mail-Adresse"
							placeholder="max.mustermann@telekom.de"
							value={email}
							onChange={setEmail}
						/>
					</div>
				)}
			</section>

			{/* Divider */}
			<div className="h-px bg-[#eaedf0]" />

			<section>
				{/* Notice box */}
				<div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl p-5 mb-6">
					<div className="flex gap-4">
						<ShieldAlert className="w-[18px] h-[18px] text-[#888] shrink-0 mt-[2px]" />
						<div className="flex flex-col gap-1.5">
							<h3 className="text-[0.85rem] font-bold text-[#1a1a2e] m-0 leading-none">
								Interner Nutzungshinweis
							</h3>
							<p className="text-[0.8rem] text-[#888] leading-relaxed m-0">
								Dieses Tool dient ausschließlich internen Beratungs- und
								Schulungszwecken. Es handelt sich um keine rechtsverbindliche
								Preisliste. Die Weitergabe an Dritte ist strikt untersagt.
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-stretch justify-between gap-6 flex-wrap">
					<div className="flex flex-col gap-2.5">
						<CheckboxRow
							checked={acceptedTerms}
							onChange={() => setAcceptedTerms(!acceptedTerms)}
							label="Nutzungshinweis akzeptiert"
						/>
						<CheckboxRow
							checked={acceptedPrivacy}
							onChange={() => setAcceptedPrivacy(!acceptedPrivacy)}
							label={
								<>
									<Link
										href="/privacy"
										className="text-[#1a1a2e] font-bold hover:text-[#e20074] transition-colors underline underline-offset-2"
									>
										Datenschutz
									</Link>{" "}
									akzeptiert
								</>
							}
						/>
					</div>

					<div className="flex flex-col items-end gap-2 self-stretch">
						<button
							id="setup-submit-btn"
							onClick={handleSubmit}
							disabled={!canSubmitClick}
							className={clsx(
								"h-[48px] px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 outline-none text-[0.88rem] whitespace-nowrap",
								canSubmitClick
									? "bg-[#e20074] hover:bg-[#c70066] text-white shadow-[0_6px_16px_-4px_rgba(226,0,116,0.3)] cursor-pointer active:scale-[0.98]"
									: "bg-[#f7f8fa] text-[#ccc] border border-[#eaedf0] cursor-not-allowed"
							)}
						>
							{isSubmitting ? (
								<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							) : (
								<span className="flex items-center gap-2">
									Setup abschließen
									<ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
								</span>
							)}
						</button>
						{Object.keys(formErrors).length > 0 && (
							<div className="text-right">
								{Object.values(formErrors).map((err, i) => (
									<p
										key={i}
										className="text-[#dc2626] text-[0.75rem] font-medium m-0"
									>
										{err}
									</p>
								))}
							</div>
						)}
					</div>
				</div>
			</section>

			<div className="flex justify-start pt-4 border-t border-[#eaedf0] mt-8">
				<button
					onClick={handlePrevStep}
					className="px-5 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 text-[#666] bg-[#f7f8fa] hover:bg-[#eaedf0] cursor-pointer"
				>
					<ArrowLeft className="w-4 h-4" />
					Zurück
				</button>
			</div>
		</motion.div>
	);

	return (
		<div className="min-h-screen py-12 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074]">
			<div className="max-w-3xl mx-auto">
				{/* ─── Header / Branding ─── */}
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
					className="flex flex-col items-center mb-10 text-center"
				>
					<TelekomLogo className="w-12 h-12 text-[#e20074] mb-8" />
					<h1 className="text-3xl sm:text-[2.5rem] font-extrabold text-[#1a1a2e] tracking-tight mb-3 leading-none">
						Sales Experience @ DTS
					</h1>
					<p className="text-[1.05rem] text-[#888] font-normal leading-relaxed max-w-md mx-auto mt-1">
						Willkommen bei der Sales Experience! 👋🏻
						<br />
						Sie hilft Dir interaktiv bei der Beratung im Gespräch.
					</p>
				</motion.div>

				{/* ─── Main Card ─── */}
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: 0.5,
						delay: 0.1,
						ease: [0.16, 1, 0.3, 1]
					}}
					className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] p-8 sm:p-12"
				>
					{/* Loading state */}
					{isIpLoading ? (
						<div className="flex flex-col items-center gap-4 py-12">
							<div className="w-8 h-8 border-4 border-[#eaedf0] border-t-[#e20074] rounded-full animate-spin" />
							<p className="text-[#888] text-[0.9rem] font-medium">
								Überprüfe Zugriffsberechtigung…
							</p>
						</div>
					) : isIpError ? (
						/* IP blocked */
						<IpBlockedCard error={ipError} />
					) : isReturningUser && !showReconfigure ? (
						/* Returning user – already set up */
						<WelcomeBackCard
							firstName={firstName}
							lastName={lastName}
							teamName={existingSession?.team?.name}
							isReloggingIn={reloginReturningUser.isPending}
							onContinue={() => {
								if (existingSession) {
									router.push("/products");
								} else if (!reloginReturningUser.isPending) {
									reloginReturningUser.mutate({ email });
								}
							}}
							onReconfigure={() => setShowReconfigure(true)}
						/>
					) : pendingSessionId ? (
						/* Waiting for Verification */
						<div className="flex flex-col items-center text-center gap-5 py-4">
							<div className="relative flex items-center justify-center mb-1">
								{/* Rotating outline */}
								<div className="absolute -inset-1.5 border-[3px] border-[#fdf2f8] border-t-[#e20074] rounded-full animate-spin" />
								{/* Inner circle with icon */}
								<div className="w-16 h-16 bg-[#fdf2f8] rounded-full flex items-center justify-center relative z-10">
									<Mail className="w-8 h-8 text-[#e20074]" />
								</div>
							</div>
							<div>
								<h3 className="text-[1.1rem] font-extrabold text-[#1a1a2e] mb-2 tracking-tight">
									Bitte überprüfe Dein Postfach
								</h3>
								<p className="text-[0.9rem] text-[#888] leading-relaxed max-w-md mx-auto">
									Wir haben einen Bestätigungslink an{" "}
									<strong className="font-medium text-[#1a1a2e]">
										{email}
									</strong>{" "}
									gesendet. Er ist 60 Minuten lang gültig.
									<br />
									<strong className="font-medium text-[#1a1a2e] underline underline-offset-2">
										Bitte schließe diese Seite nicht.
									</strong>
								</p>
							</div>
							<button
								onClick={() => setPendingSessionId(null)}
								className="mt-2 px-4 py-2 text-[0.85rem] font-medium text-[#e20074] hover:bg-[#fdf2f8] rounded-xl transition-colors cursor-pointer"
							>
								E-Mail korrigieren / Zurück
							</button>
						</div>
					) : (
						/* Multi-step form */
						<AnimatePresence mode="wait">
							{currentStep === 1 && renderStep1()}
							{currentStep === 2 && renderStep2()}
							{currentStep === 3 && renderStep3()}
							{currentStep === 4 && renderStep4()}
						</AnimatePresence>
					)}
				</motion.div>

				<GlobalFooter
					className="pt-8 pb-0 mt-4 text-[#bbb]"
					linkColor="text-[#bbb]"
				/>
			</div>
		</div>
	);
}

/* ──────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────── */

/** Section header with numbered step indicator */
function SectionHeader({
	icon,
	title,
	step
}: {
	icon: React.ReactNode;
	title: string;
	step: number;
}) {
	return (
		<div className="flex items-center gap-3">
			<div className="w-8 h-8 rounded-full bg-[#e20074]/10 text-[#e20074] flex items-center justify-center text-[0.75rem] font-extrabold shrink-0">
				{step}
			</div>
			<div className="flex items-center gap-2">
				{icon}
				<h2 className="text-[1.05rem] font-bold text-[#1a1a2e] m-0">{title}</h2>
			</div>
		</div>
	);
}

/** Text input field */
function InputField({
	id,
	label,
	placeholder,
	value,
	onChange
}: {
	id: string;
	label: string;
	placeholder: string;
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label
				htmlFor={id}
				className="text-[0.75rem] font-bold text-[#b0b0b0] uppercase tracking-wider pl-1"
			>
				{label}
			</label>
			<input
				id={id}
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="h-[48px] px-4 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.95rem] text-[#1a1a2e] font-medium placeholder:text-[#ccc] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 focus:bg-white transition-all"
			/>
		</div>
	);
}

/** Location or Team selection tile */
function SelectionTile({
	name,
	isSelected,
	onClick,
	index
}: {
	name: string;
	isSelected: boolean;
	onClick: () => void;
	index: number;
}) {
	return (
		<motion.button
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: 0.03 * index, duration: 0.25 }}
			onClick={onClick}
			className={clsx(
				"relative flex items-center gap-3 px-4 h-[48px] rounded-xl border transition-all duration-300 cursor-pointer outline-none group",
				isSelected
					? "border-[#e20074]/40 bg-[#e20074]/5 shadow-[0_4px_20px_rgba(226,0,116,0.08)] ring-1 ring-[#e20074]/30"
					: "border-[#eaedf0] bg-[#f7f8fa] hover:bg-white hover:border-[#d1d5db] hover:shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
			)}
		>
			{/* Checkmark indicator */}
			<div
				className={clsx(
					"w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200",
					isSelected
						? "bg-[#e20074] border-[#e20074]"
						: "border-[#d1d5db] bg-white group-hover:border-[#a3a8b4]"
				)}
			>
				<Check
					className={clsx(
						"w-2.5 h-2.5 text-white transition-transform duration-200",
						isSelected ? "scale-100" : "scale-0"
					)}
					strokeWidth={4}
				/>
			</div>

			<span
				className={clsx(
					"text-[0.88rem] font-bold transition-colors text-left leading-tight",
					isSelected ? "text-[#e20074]" : "text-[#1a1a2e]"
				)}
			>
				{name}
			</span>
		</motion.button>
	);
}

/** Compact checkbox row with round filled checkmark */
function CheckboxRow({
	checked,
	onChange,
	label
}: {
	checked: boolean;
	onChange: () => void;
	label: React.ReactNode;
}) {
	return (
		<label className="flex items-center gap-2.5 group cursor-pointer select-none">
			<div className="relative flex items-center justify-center">
				<input
					type="checkbox"
					className="peer sr-only"
					checked={checked}
					onChange={onChange}
				/>
				<div
					className={clsx(
						"w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200",
						checked
							? "bg-[#e20074] border-[#e20074]"
							: "border-[#d1d5db] bg-white group-hover:border-[#e20074]/50"
					)}
				>
					<Check
						className={clsx(
							"w-3 h-3 text-white transition-transform duration-200",
							checked ? "scale-100" : "scale-0"
						)}
						strokeWidth={4}
					/>
				</div>
			</div>
			<span className="text-[0.85rem] text-[#555] font-medium group-hover:text-[#1a1a2e] transition-colors">
				{label}
			</span>
		</label>
	);
}

/** IP blocked error card */
function IpBlockedCard({ error }: { error: { message: string } | null }) {
	return (
		<div className="flex flex-col items-center text-center gap-5 py-4">
			<div className="w-16 h-16 bg-[#fdf2f8] rounded-full flex items-center justify-center">
				<ShieldAlert className="w-8 h-8 text-[#e20074]" />
			</div>
			<div>
				<h3 className="text-[1.1rem] font-extrabold text-[#1a1a2e] mb-2 tracking-tight">
					Zugriff verweigert
				</h3>
				<p className="text-[0.9rem] text-[#888] leading-relaxed max-w-md mx-auto">
					{error?.message ||
						"Dein aktueller Standort (IP-Adresse) ist für den Zugriff auf dieses System nicht autorisiert."}
				</p>
			</div>
		</div>
	);
}

/** Welcome-back card for returning users */
function WelcomeBackCard({
	firstName,
	lastName,
	teamName,
	isReloggingIn,
	onContinue,
	onReconfigure
}: {
	firstName: string;
	lastName: string;
	teamName?: string;
	isReloggingIn?: boolean;
	onContinue: () => void;
	onReconfigure: () => void;
}) {
	return (
		<div className="flex flex-col items-center text-center gap-6 py-4">
			<div className="w-16 h-16 bg-[#e20074]/10 rounded-full flex items-center justify-center">
				<CheckCircle2 className="w-8 h-8 text-[#e20074]" />
			</div>

			<div>
				<h3 className="text-[1.25rem] font-extrabold text-[#1a1a2e] mb-2 tracking-tight">
					Willkommen zurück{firstName ? `, ${firstName}` : ""}!
				</h3>
				<p className="text-[0.95rem] text-[#888] leading-relaxed max-w-md mx-auto">
					Dein Setup ist bereits abgeschlossen
					{teamName ? (
						<>
							{" "}
							und Du bist dem Team{" "}
							<span className="font-bold text-[#1a1a2e]">{teamName}</span>{" "}
							zugeordnet
						</>
					) : null}
					. Du kannst direkt weiterarbeiten.
				</p>
			</div>

			{/* Info badges */}
			{teamName && (
				<div className="flex flex-wrap gap-3 justify-center">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f7f8fa] border border-[#eaedf0] text-[0.8rem] font-medium text-[#666]">
						<Users className="w-3.5 h-3.5 text-[#e20074]" />
						{teamName}
					</div>
					{firstName && (
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f7f8fa] border border-[#eaedf0] text-[0.8rem] font-medium text-[#666]">
							<User className="w-3.5 h-3.5 text-[#e20074]" />
							{firstName} {lastName}
						</div>
					)}
				</div>
			)}

			<div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
				<button
					onClick={onReconfigure}
					disabled={isReloggingIn}
					className="flex-1 h-[52px] rounded-2xl bg-[#f7f8fa] border border-[#eaedf0] text-[#666] font-bold text-[0.9rem] hover:bg-[#eaedf0] transition-all cursor-pointer flex items-center justify-center gap-2 outline-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<RotateCcw className="w-4 h-4" />
					Neu einrichten
				</button>
				<button
					onClick={onContinue}
					disabled={isReloggingIn}
					className="flex-[1.5] h-[52px] rounded-2xl bg-[#e20074] hover:bg-[#c70066] text-white font-bold text-[0.9rem] shadow-[0_8px_20px_-6px_rgba(226,0,116,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 outline-none hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isReloggingIn ? (
						<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
					) : (
						<>
							Weiter zur Sales Experience
							<ChevronRight className="w-4 h-4" strokeWidth={2.5} />
						</>
					)}
				</button>
			</div>
		</div>
	);
}
