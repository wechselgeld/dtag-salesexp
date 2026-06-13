'use client';

import {
    useState, useEffect, useCallback, useRef,
} from 'react';
import {
    useRouter,
} from 'next/navigation';
import {
    trpc,
} from '@/lib/trpc';
import {
    startRegistration, startAuthentication,
} from '@simplewebauthn/browser';
import {
    useOpenPanel,
} from '@openpanel/nextjs';
import {
    motion, AnimatePresence,
} from 'framer-motion';
import {
    ShieldAlert, ArrowRight, Users, User, Mail,
    CheckCircle2, RotateCcw, MapPin, ArrowLeft, Search, Key, Lock, LogIn, Fingerprint,
    Zap, ShieldCheck, KeyRound, Clock,
} from 'lucide-react';
import clsx from 'clsx';
import {
    TelekomLogo,
} from '@/components/shared/telekom-logo';
import {
    Skeleton,
} from '@/components/shared/skeleton';
import {
    useSettingsStore,
} from '@/lib/store/settings-store';
import Link from 'next/link';
import {
    GlobalFooter,
} from '@/components/shared/global-footer';
import {
    PremiumPinInput,
} from '@/components/shared/premium-pin-input';
import {
    PremiumInput, PremiumButton, ScreenHeader, SelectionTile, CheckboxRow, ErrorBanner,
} from '@/components/shared/form/form-suite';
import {
    PremiumGhostInput,
} from '@/components/shared/form/premium-ghost-input';
import {
    useSetupStore,
} from '@/lib/store/setup-store';
import {
    z,
} from 'zod';

const setupFormSchema = z.object({
    firstName: z.string().trim().min(1, 'Vorname ist erforderlich'),
    lastName: z.string().trim().min(1, 'Nachname ist erforderlich'),
    email: z
        .string()
        .email('Ungültige E-Mail-Adresse')
        .refine((val) => val.endsWith('@telekom.de'), {
            message: 'Es sind nur interne Adressen erlaubt (@telekom.de).',
        }),
    pin: z.string().length(6, 'Die PIN muss genau 6 Ziffern lang sein.'),
    locationId: z.string().min(1, 'Bitte wähle einen Standort aus'),
    teamId: z.string().min(1, 'Bitte wähle ein Team aus'),
    acceptedTerms: z.literal(true),
    acceptedPrivacy: z.literal(true),
    acceptedTracking: z.literal(true),
});

const LS_KEY_FIRST_NAME = 'setup-user-firstName';
const LS_KEY_LAST_NAME = 'setup-user-lastName';
const LS_KEY_EMAIL = 'setup-user-email';
const LS_KEY_SETUP_DONE = 'setup-completed';

function getStoredUser(): { firstName: string; lastName: string; email: string } {
    if (typeof window === 'undefined') {
        return {
            firstName: '',
            lastName: '',
            email: '',
        };
    }
    return {
        firstName: localStorage.getItem(LS_KEY_FIRST_NAME) ?? '',
        lastName: localStorage.getItem(LS_KEY_LAST_NAME) ?? '',
        email: localStorage.getItem(LS_KEY_EMAIL) ?? '',
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
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(LS_KEY_SETUP_DONE);
}

function capitalizeWords(str: string): string {
    return str
        .split(/\s+/)
        .map((word) => {
            if (word.includes('-')) {
                return word
                    .split('-')
                    .map((sub) => sub.charAt(0).toUpperCase() + sub.slice(1).toLowerCase())
                    .join('-');
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

interface SetupPageProps {
    initialLocations: any; // Fallback to any if complex to infer, but let's try to type it nicely
    initialIsEmailRequired: boolean;
    initialIpError: string | null;
    initialSession: any;
}

export default function SetupPage({
    initialLocations,
    initialIsEmailRequired: _initialIsEmailRequired,
    initialIpError,
    initialSession,
}: SetupPageProps) {
    const router = useRouter();
    const op = useOpenPanel();
    const {
        currentStep,
        setCurrentStep,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        email,
        setEmail,
        pin,
        setPin,
        locationId,
        setLocationId,
        teamId,
        setTeamId,
        acceptedTerms,
        setAcceptedTerms,
        acceptedPrivacy,
        setAcceptedPrivacy,
        acceptedTracking,
        setAcceptedTracking,
        userExists,
        setUserExists,
        profileFirstName,
        profileLastName,
        profileTeamName,
        nextStep,
        prevStep,
        resetStore,
    } = useSetupStore();

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [reloginPin, setReloginPin] = useState('');
    const [isAlreadyRegisteredFlow, setIsAlreadyRegisteredFlow] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPin, setLoginPin] = useState('');
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const [isPinResetFlow, setIsPinResetFlow] = useState(false);
    const [pinResetOtp, setPinResetOtp] = useState('');
    const [pinResetError, setPinResetError] = useState<string | null>(null);

    const [isSettingNewPin, setIsSettingNewPin] = useState(false);
    const [newPin, setNewPin] = useState('');
    const [newPinConfirm, setNewPinConfirm] = useState('');
    const [newPinError, setNewPinError] = useState<string | null>(null);

    const [locationSearch, setLocationSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(locationSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [locationSearch]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingBindingToken, setPendingBindingToken] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [reloginError, setReloginError] = useState<string | null>(null);
    const [isAutoCheck, setIsAutoCheck] = useState(false);
    const [isSilentSuccess, setIsSilentSuccess] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);
    const [cardHeight, setCardHeight] = useState<number | 'auto'>('auto');

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
    }, []);

    const [hasCompletedBefore, setHasCompletedBefore] = useState(false);
    const [showReconfigure, setShowReconfigure] = useState(false);

    const {
        data: locations, isLoading: isLocationsLoading,
    } = trpc.location.list.useQuery(
        {
            search: debouncedSearch || undefined,
            limit: debouncedSearch ? 100 : 6,
        },
        {
            initialData: debouncedSearch ? undefined : initialLocations,
            refetchOnWindowFocus: false,
        },
    );

    const {
        data: teams, isLoading: isTeamsLoading,
    } = trpc.team.list.useQuery(
        locationId ? {
            locationId,
        } : undefined,
        {
            enabled: !!locationId,
        },
    );

    const isIpLoading = false;
    const isIpError = !!initialIpError;
    const ipError = initialIpError ? {
        message: initialIpError,
    } : null;

    const {
        data: existingSession, refetch: refetchCurrentSession,
    } = trpc.session.getCurrent.useQuery(undefined, {
        initialData: initialSession,
        refetchOnWindowFocus: false,
    });

    const getAuthOptions = trpc.webauthn.generateAuthenticationOptions.useMutation();
    const verifyAuth = trpc.webauthn.verifyAuthentication.useMutation();
    const getRegOptions = trpc.webauthn.generateRegistrationOptions.useMutation();
    const verifyReg = trpc.webauthn.verifyRegistration.useMutation();

    const requestPinReset = trpc.session.requestPinResetCode.useMutation();
    const verifyPinReset = trpc.session.verifyPinResetCode.useMutation();
    const updatePinMutation = trpc.session.updatePin.useMutation();

    const finalizeLogin = trpc.session.finalizeLogin.useMutation({
        onSuccess: (data) => {
            useSettingsStore.getState().setAcceptedTracking(acceptedTracking);
            op.track('agent_setup_success', {
                email: data.email?.trim() || '',
                location: 'setup_page',
                firstName: data.firstName?.trim() || '',
                lastName: data.lastName?.trim() || '',
                locationId: locationId ?? '',
                teamId: teamId ?? '',
            });
            persistName(data.firstName?.trim() || '', data.lastName?.trim() || '', data.email?.trim() || '');
            markSetupComplete();
            refetchCurrentSession().then(() => {
                setCurrentStep(4);
            });
        },
        onError: (error) => {
            console.error(error);
            op.track('agent_setup_failed', {
                email: email || undefined,
                location: 'setup_page',
                error: error.message || String(error),
            });
        },
    });

    const requestVerification = trpc.session.requestVerification.useMutation({
        onSuccess: (data) => {
            setIsSubmitting(false);
            if (data.bypassed) {
                finalizeLogin.mutate({
                    bindingToken: data.bindingToken,
                });
            }
            else {
                setPendingBindingToken(data.bindingToken);
            }
        },
        onError: (error) => {
            console.error('Setup failed', error);
            op.track('agent_setup_failed', {
                email: email || undefined,
                location: 'setup_page',
                error: error.message || String(error),
            });
            setIsSubmitting(false);
            setFormErrors({
                general: error.message,
            });
        },
    });

    const {
        data: verificationStatus,
    } = trpc.session.checkVerification.useQuery(
        {
            bindingToken: pendingBindingToken as string,
        },
        {
            enabled: !!pendingBindingToken,
            refetchInterval: 3000,
        },
    );

    const logoutMutation = trpc.session.logout.useMutation();

    const reloginReturningUser = trpc.session.reloginReturningUser.useMutation({
        onSuccess: (data) => {
            setReloginError(null);
            setLoginError(null);
            if (data.requiresVerification && !data.success && 'bindingToken' in data) {
                setPendingBindingToken(data.bindingToken as string);
                return;
            }

            if (data.success && 'firstName' in data) {
                if (isAutoCheck) {
                    setIsSilentSuccess(true);
                }
                op.track('agent_login_success', {
                    email: data.email || loginEmail || '',
                    location: 'setup_page',
                    type: 'pin',
                });
                persistName(data.firstName?.trim() || '', data.lastName?.trim() || '', data.email?.trim() || '');
                markSetupComplete();
                refetchCurrentSession().then(() => {
                    router.push('/products');
                    router.refresh();
                });
            }
        },
        onError: (error) => {
            console.error('Relogin failed:', error);
            if (isAutoCheck) {
                return;
            }
            op.track('agent_login_failed', {
                email: loginEmail,
                location: 'setup_page',
                type: 'pin',
                error: error.message || String(error),
            });
            const errMsg = error.message || 'PIN oder E-Mail ist falsch.';
            setReloginError(errMsg);
            setLoginError(errMsg);
        },
    });

    const handleLoginSubmit = (e?: React.FormEvent, overridePin?: string) => {
        if (e) e.preventDefault();
        setLoginError(null);
        if (!loginEmail) {
            setLoginError('Bitte gib Deine E-Mail-Adresse ein.');
            return;
        }
        const pinToSubmit = overridePin || loginPin;
        if (pinToSubmit.length !== 6) {
            setLoginError('Bitte gib Deine 6-stellige PIN ein.');
            return;
        }

        const isAuto = !!overridePin;
        setIsAutoCheck(isAuto);

        if (!isAuto) {
            setIsLoggingIn(true);
            op.track('agent_login_started', {
                email: loginEmail,
                location: 'setup_page',
                type: 'pin',
            });
        }

        reloginReturningUser.mutate({
            email: loginEmail,
            pin: pinToSubmit,
        }, {
            onSuccess: () => {
                setIsLoggingIn(false);
            },
            onError: (err) => {
                setIsLoggingIn(false);
                if (!isAuto) {
                    setLoginError(err.message || 'Die Anmeldung ist fehlgeschlagen.');
                }
            },
        });
    };

    const handleLoginWithPasskey = async () => {
        setLoginError(null);
        setIsLoggingIn(true);
        op.track('passkey_login_started', {
            email: loginEmail || undefined,
            location: 'setup_page',
            type: 'manual',
        });
        try {
            const {
                options,
            } = await getAuthOptions.mutateAsync({
                email: loginEmail || undefined,
            });
            const authResp = await startAuthentication({
                optionsJSON: options,
            });
            const verifyResp = await verifyAuth.mutateAsync({
                email: loginEmail || undefined,
                response: authResp,
            });
            if (verifyResp.success) {
                op.track('passkey_login_success', {
                    email: loginEmail || verifyResp.email || undefined,
                    location: 'setup_page',
                    type: 'manual',
                    user_role: verifyResp.isAdmin ? 'ADMIN' : 'USER',
                });
                if ('isAdmin' in verifyResp && verifyResp.isAdmin) {
                    router.push('/admin/products');
                    return;
                }
                const salesData = verifyResp as { firstName?: string, lastName?: string, email?: string };
                persistName(salesData.firstName?.trim() || '', salesData.lastName?.trim() || '', salesData.email?.trim() || '');
                markSetupComplete();
                refetchCurrentSession().then(() => {
                    router.push('/products');
                    router.refresh();
                });
            }
        }
        catch (err: any) {
            console.error('Passkey auth failed', err);
            op.track('passkey_login_failed', {
                email: loginEmail || undefined,
                location: 'setup_page',
                type: 'manual',
                error: err.message || String(err),
            });
            setLoginError('Passkey-Anmeldung fehlgeschlagen oder nicht registriert.');
        }
        finally {
            setIsLoggingIn(false);
        }
    };

    const handleRequestPinReset = async () => {
        const targetEmail = email || loginEmail;
        if (!targetEmail) {
            setReloginError('Bitte gib Deine E-Mail-Adresse ein.');
            setLoginError('Bitte gib Deine E-Mail-Adresse ein.');
            return;
        }
        setReloginError(null);
        setLoginError(null);
        try {
            await requestPinReset.mutateAsync({
                email: targetEmail,
            });
            setIsPinResetFlow(true);
            setPinResetOtp('');
            setPinResetError(null);
        }
        catch (err: any) {
            setReloginError(err.message || 'Verbindung zum Server fehlgeschlagen.');
            setLoginError(err.message || 'Verbindung zum Server fehlgeschlagen.');
        }
    };

    const handleVerifyPinResetOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const targetEmail = email || loginEmail;
        if (!pinResetOtp || pinResetOtp.length !== 6) {
            setPinResetError('Bitte gib den 6-stelligen Code ein.');
            return;
        }
        setPinResetError(null);
        try {
            const res = await verifyPinReset.mutateAsync({
                email: targetEmail,
                code: pinResetOtp,
            });
            if (res.success) {
                setIsSettingNewPin(true);
                setNewPin('');
                setNewPinConfirm('');
                setNewPinError(null);
            }
        }
        catch (err: any) {
            setPinResetError(err.message || 'Der eingegebene Code ist ungültig.');
        }
    };

    const handleSaveNewPin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPin.length !== 6) {
            setNewPinError('Die PIN muss genau 6 Ziffern lang sein.');
            return;
        }
        if (newPin !== newPinConfirm) {
            setNewPinError('Die PINs stimmen nicht überein.');
            return;
        }
        setNewPinError(null);
        try {
            await updatePinMutation.mutateAsync({
                pin: newPin,
            });

            const targetEmail = email || loginEmail;
            persistName(firstName || 'Vertrieb', lastName || 'Berater', targetEmail);
            markSetupComplete();

            refetchCurrentSession().then(() => {
                router.push('/products');
                router.refresh();
            });
        }
        catch (err: any) {
            setNewPinError(err.message || 'Fehler beim Speichern der neuen PIN.');
        }
    };

    useEffect(() => {
        const stored = getStoredUser();
        if (stored.firstName && !firstName) setFirstName(stored.firstName);
        if (stored.lastName && !lastName) setLastName(stored.lastName);
        if (stored.email && !email) setEmail(stored.email);
        setHasCompletedBefore(isSetupAlreadyDone());
    }, []);

    useEffect(() => {
        if (verificationStatus?.verified && pendingBindingToken && !finalizeLogin.isPending && !finalizeLogin.isSuccess) {
            finalizeLogin.mutate({
                bindingToken: pendingBindingToken,
            });
        }
    }, [
        verificationStatus?.verified,
        pendingBindingToken,
        finalizeLogin,
    ]);

    const isReturningUser = hasCompletedBefore;

    const {
        data: userExistsData, isLoading: isUserExistsLoading,
    } = trpc.session.checkUserExists.useQuery(
        {
            email,
        },
        {
            enabled: isReturningUser && !!email && !showReconfigure,
            refetchOnWindowFocus: false,
            retry: false,
        },
    );

    useEffect(() => {
        if (isReturningUser && !showReconfigure && email && userExistsData && !userExistsData.exists) {
            localStorage.removeItem(LS_KEY_FIRST_NAME);
            localStorage.removeItem(LS_KEY_LAST_NAME);
            localStorage.removeItem(LS_KEY_EMAIL);
            localStorage.removeItem(LS_KEY_SETUP_DONE);
            resetStore();
            setHasCompletedBefore(false);
            setShowReconfigure(true);
        }
    }, [
        isReturningUser,
        showReconfigure,
        email,
        userExistsData,
    ]);

    const autofillAttemptedRef = useRef(false);

    useEffect(() => {
        if (!isReturningUser || showReconfigure || !email) return;
        if (autofillAttemptedRef.current) return;
        autofillAttemptedRef.current = true;

        const runConditionalAutofill = async () => {
            if (typeof window !== 'undefined' && window.PublicKeyCredential && (await window.PublicKeyCredential.isConditionalMediationAvailable?.())) {
                try {
                    const {
                        startAuthentication,
                    } = await import('@simplewebauthn/browser');
                    const {
                        options, challengeId,
                    } = await getAuthOptions.mutateAsync({
                        email,
                    });
                    const authResp = await startAuthentication({
                        optionsJSON: options,
                        useBrowserAutofill: true,
                    });
                    op.track('passkey_login_started', {
                        email: email || undefined,
                        location: 'setup_page',
                        type: 'conditional_autofill',
                    });
                    const verifyResp = await verifyAuth.mutateAsync({
                        email,
                        challengeId,
                        response: authResp,
                    });
                    if (verifyResp.success) {
                        op.track('passkey_login_success', {
                            email: email || verifyResp.email || undefined,
                            location: 'setup_page',
                            type: 'conditional_autofill',
                            user_role: verifyResp.isAdmin ? 'ADMIN' : 'USER',
                        });
                        if ('isAdmin' in verifyResp && verifyResp.isAdmin) {
                            router.push('/admin/products');
                            return;
                        }
                        const salesData = verifyResp as { firstName?: string, lastName?: string, email?: string };
                        persistName(salesData.firstName?.trim() || '', salesData.lastName?.trim() || '', salesData.email?.trim() || '');
                        markSetupComplete();
                        refetchCurrentSession().then(() => {
                            router.push('/products');
                            router.refresh();
                        });
                    }
                }
                catch (err: any) {
                    console.log('Setup conditional UI autofill aborted or unavailable', err);
                    if (err.name !== 'AbortError') {
                        op.track('passkey_login_failed', {
                            email: email || undefined,
                            location: 'setup_page',
                            type: 'conditional_autofill',
                            error: err.message || String(err),
                        });
                    }
                }
            }
        };
        runConditionalAutofill();
    }, [
        isReturningUser,
        showReconfigure,
        email,
    ]);

    const anyFieldEmpty =
        !firstName.trim() ||
        !lastName.trim() ||
        !email.trim() ||
        pin.length !== 6 ||
        !locationId ||
        !teamId ||
        !acceptedTerms ||
        !acceptedPrivacy;

    const canSubmitClick = !anyFieldEmpty && !isSubmitting && !pendingBindingToken;

    const handleNextStep = () => {
        if (currentStep === 1 && locationId) {
            setCurrentStep(2);
        }
        else if (currentStep === 2 && teamId) {
            setCurrentStep(3);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = useCallback(() => {
        setFormErrors({});
        const result = setupFormSchema.safeParse({
            firstName,
            lastName,
            email,
            pin,
            locationId: locationId ?? '',
            teamId: teamId ?? '',
            acceptedTerms: acceptedTerms ? true : undefined,
            acceptedPrivacy: acceptedPrivacy ? true : undefined,
            acceptedTracking: acceptedTracking ? true : undefined,
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
        op.track('agent_setup_started', {
            email: result.data.email,
            location: 'setup_page',
        });
        requestVerification.mutate({
            locationId: result.data.locationId,
            teamId: result.data.teamId,
            firstName: result.data.firstName,
            lastName: result.data.lastName,
            email: result.data.email,
            pin: result.data.pin,
            acceptedTerms: true,
        });
    }, [
        locationId,
        teamId,
        acceptedTerms,
        acceptedPrivacy,
        acceptedTracking,
        firstName,
        lastName,
        email,
        pin,
        requestVerification,
        op,
    ]);

    const handlePasskeyEnrollment = async () => {
        const targetEmail = email || existingSession?.email || '';
        if (!targetEmail) return;
        op.track('passkey_registration_started', {
            email: targetEmail,
            location: 'setup_page',
            user_role: existingSession?.role || undefined,
        });
        try {
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
                location: 'setup_page',
                user_role: existingSession?.role || undefined,
            });
            alert('Passkey erfolgreich eingerichtet!');
            resetStore();
            router.push('/products');
            router.refresh();
        }
        catch (e: any) {
            console.error('Passkey failed', e);
            op.track('passkey_registration_failed', {
                email: targetEmail,
                location: 'setup_page',
                user_role: existingSession?.role || undefined,
                error: e.message || String(e),
            });
            alert(`Fehler bei der Passkey-Einrichtung: ${e.message}`);
        }
    };

    const [emailError, setEmailError] = useState<string | null>(null);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const utils = trpc.useUtils();

    const handleEmailSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setEmailError(null);

        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail) {
            setEmailError('Bitte gib Deine E-Mail-Adresse ein.');
            return;
        }

        let fullEmail = trimmedEmail;
        if (!fullEmail.includes('@')) {
            fullEmail = trimmedEmail + '@telekom.de';
        }

        const emailSchema = z.string().email('Ungültige E-Mail-Adresse').refine((val) => val.endsWith('@telekom.de'), {
            message: 'Es sind nur interne Adressen erlaubt (@telekom.de).',
        });

        const validation = emailSchema.safeParse(fullEmail);
        if (!validation.success) {
            setEmailError(validation.error.issues[0].message);
            return;
        }

        setEmail(fullEmail);

        try {
            setIsCheckingEmail(true);
            const data = await utils.session.checkUserExists.fetch({ email: fullEmail });
            if (data.exists) {
                setUserExists(true, data.firstName, data.lastName, data.teamName);
                setLoginEmail(fullEmail);
            } else {
                setUserExists(false);
                setCurrentStep(1);
            }
        } catch (err: any) {
            console.error('Email check failed:', err);
            setEmailError(err.message || 'Verbindung zum Server fehlgeschlagen.');
        } finally {
            setIsCheckingEmail(false);
        }
    };

    const renderStep0 = () => (
        <motion.div
            key="step0"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6 w-full"
        >
            <ScreenHeader
                icon={<Mail className="w-5 h-5 text-[#e20074]" />}
                title="E-Mail-Adresse eingeben"
                subtitle="Gib Deine geschäftliche E-Mail-Adresse ein, um fortzufahren."
            />
            <form onSubmit={handleEmailSubmit} className="space-y-6 mt-5">
                <PremiumGhostInput
                    id="setup-email-step0"
                    label="E-Mail-Adresse"
                    placeholder="max.mustermann"
                    value={email}
                    onValueChange={setEmail}
                    error={emailError}
                    disabled={isCheckingEmail}
                    autoComplete="username webauthn"
                />
                <div className="flex flex-col gap-3 pt-4 border-t border-[#eaedf0] mt-8">
                    <PremiumButton
                        type="submit"
                        disabled={isCheckingEmail || !email.trim()}
                        loading={isCheckingEmail}
                        variant="primary"
                        className="w-full"
                        icon={<ArrowRight className="w-4 h-4 ml-0.5" strokeWidth={2.5} />}
                    >
                        Weiter
                    </PremiumButton>
                    <PremiumButton
                        type="button"
                        onClick={() => {
                            setIsAlreadyRegisteredFlow(true);
                            setLoginEmail('');
                            setLoginPin('');
                            setLoginError(null);
                        }}
                        variant="ghost"
                        className="w-full"
                    >
                        <LogIn className="w-3.5 h-3.5" /> Bereits registriert? Hier anmelden
                    </PremiumButton>
                </div>
            </form>
        </motion.div>
    );

    const renderStep1 = () => (
        <motion.div
            key="step1"
            initial={{
                opacity: 0,
                x: 15,
            }} animate={{
                opacity: 1,
                x: 0,
            }} exit={{
                opacity: 0,
                x: -15,
            }}
            className="space-y-6 w-full"
        >
            <ScreenHeader icon={<MapPin className="w-5 h-5 text-[#e20074]" />} title="Standort wählen" subtitle="Wähle Deinen aktuellen Standort aus." />
            <div className="relative mt-5">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-[18px] h-[18px] text-[#ccc]" />
                </div>
                <input
                    type="text" value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)}
                    placeholder="Standort suchen (z.B. Berlin, München)..."
                    className="w-full h-[52px] pl-11 pr-4 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.95rem] text-[#1a1a2e] font-medium placeholder:text-[#ccc] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 focus:bg-white transition-all shadow-sm"
                />
            </div>
            {isLocationsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                    {Array.from({
                        length: 6,
                    }).map((_, i) => <Skeleton key={i} className="h-[52px] w-full rounded-xl" />)}
                </div>
            ) : locations?.items?.length === 0 ? (
                <div className="text-center p-8 text-[0.85rem] text-[#aaa] bg-[#f7f8fa] border border-dashed border-[#eaedf0] rounded-2xl mt-5">
                    Keine Standorte gefunden.
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 mt-5">
                    <AnimatePresence>
                        {locations?.items?.filter((loc: any) => loc.isActive).map((loc: any, index: number) => (
                            <SelectionTile
                                key={loc.id} name={loc.name} subtitle={loc.address || ''} isSelected={locationId === loc.id}
                                onClick={() => { setLocationId(loc.id); }} index={index}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
            <div className="flex gap-3 pt-4 border-t border-[#eaedf0] mt-8">
                <PremiumButton onClick={handlePrevStep} variant="secondary" className="flex-1">
                    Zurück
                </PremiumButton>
                <PremiumButton onClick={handleNextStep} disabled={!locationId} variant="primary" className="flex-1">
                    Weiter
                </PremiumButton>
            </div>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div
            key="step2" initial={{
                opacity: 0,
                x: 15,
            }} animate={{
                opacity: 1,
                x: 0,
            }} exit={{
                opacity: 0,
                x: -15,
            }}
            className="space-y-6 w-full"
        >
            <ScreenHeader icon={<Users className="w-5 h-5 text-[#e20074]" />} title="Vertriebsteam wählen" subtitle="Welchem Team gehörst Du an?" />
            {isTeamsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                    {Array.from({
                        length: 4,
                    }).map((_, i) => <Skeleton key={i} className="h-[52px] w-full rounded-xl" />)}
                </div>
            ) : teams?.items?.length === 0 ? (
                <div className="text-center p-8 text-[0.85rem] text-[#aaa] bg-[#f7f8fa] border border-dashed border-[#eaedf0] rounded-2xl mt-5">
                    In diesem Standort wurden noch keine Teams angelegt.
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 mt-5">
                    <AnimatePresence>
                        {teams?.items?.map((team: any, index: number) => (
                            <SelectionTile key={team.id} name={team.name} isSelected={teamId === team.id} onClick={() => setTeamId(team.id)} index={index} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
            <div className="flex gap-3 pt-4 border-t border-[#eaedf0] mt-8">
                <PremiumButton onClick={handlePrevStep} variant="secondary" className="flex-1">
                    Zurück
                </PremiumButton>
                <PremiumButton onClick={handleNextStep} disabled={!teamId} variant="primary" className="flex-1">
                    Weiter
                </PremiumButton>
            </div>
        </motion.div>
    );

    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentStep === 3) {
            setTimeout(() => {
                firstNameRef.current?.focus();
            }, 100);
        }
    }, [currentStep]);

    const handleFirstNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            lastNameRef.current?.focus();
        }
    };

    const handleLastNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const pinInputFirstDigit = document.querySelector('#setup-pin input') as HTMLInputElement;
            pinInputFirstDigit?.focus();
        }
    };

    const [gdprShouldShake, setGdprShouldShake] = useState(false);

    const triggerGdprShake = () => {
        setGdprShouldShake(true);
        setTimeout(() => setGdprShouldShake(false), 500);
        const termsCheckbox = document.querySelector('#setup-terms-checkbox') as HTMLInputElement;
        termsCheckbox?.focus();
    };

    const renderStep3 = () => (
        <motion.div
            key="step3" initial={{
                opacity: 0,
                x: 15,
            }} animate={{
                opacity: 1,
                x: 0,
            }} exit={{
                opacity: 0,
                x: -15,
            }}
            className="space-y-8 w-full"
        >
            <section>
                <ScreenHeader icon={<User className="w-5 h-5 text-[#e20074]" />} title="Persönliche Daten & PIN" subtitle="Lege Deine Zugangsdaten fest." />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                    <PremiumInput ref={firstNameRef} id="setup-first-name" label="Vorname" placeholder="Max" value={firstName} onChange={(e) => setFirstName(capitalizeWords(e.target.value))} onKeyDown={handleFirstNameKeyDown} />
                    <PremiumInput ref={lastNameRef} id="setup-last-name" label="Nachname" placeholder="Mustermann" value={lastName} onChange={(e) => setLastName(capitalizeWords(e.target.value))} onKeyDown={handleLastNameKeyDown} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <PremiumInput id="setup-email" label="E-Mail-Adresse" placeholder="max.mustermann@telekom.de" value={email} disabled={true} />
                    <div className="flex flex-col gap-1.5 text-left w-full">
                        <label htmlFor="setup-pin" className="text-[0.75rem] font-bold text-[#b0b0b0] uppercase tracking-wider pl-1 font-sans">
                            6-stellige PIN
                        </label>
                        <PremiumPinInput
                            id="setup-pin"
                            value={pin}
                            onChange={setPin}
                            disabled={isSubmitting}
                            onComplete={(val) => {
                                if (val.length === 6) {
                                    if (acceptedTerms && acceptedPrivacy) {
                                        handleSubmit();
                                    } else {
                                        triggerGdprShake();
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </section>
            <div className="h-px bg-[#eaedf0]" />
            <section>
                <motion.div
                    animate={gdprShouldShake ? {
                        x: [-6, 6, -6, 6, -3, 3, 0]
                    } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                >
                    <div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl p-5">
                        <div className="flex gap-4">
                            <ShieldAlert className="w-[18px] h-[18px] text-[#888] shrink-0 mt-[2px]" />
                            <div className="flex flex-col gap-1.5">
                                <h3 className="text-[0.85rem] font-bold text-[#1a1a2e] m-0 leading-none">Interner Nutzungshinweis</h3>
                                <p className="text-[0.8rem] text-[#888] leading-relaxed m-0">
                                    Dieses Tool dient ausschließlich internen Beratungs- und Schulungszwecken. Es handelt sich um keine rechtsverbindliche Preisliste. Die Weitergabe an Dritte ist strikt untersagt.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <CheckboxRow
                            id="setup-terms-checkbox"
                            checked={acceptedTerms}
                            onChange={() => setAcceptedTerms(!acceptedTerms)}
                            label={(
                                <>
                                    Ich akzeptiere den{' '}
                                    <span className="text-[#1a1a2e] font-bold">Nutzungshinweis</span> für dieses System.
                                </>
                            )}
                        />
                        <CheckboxRow
                            id="setup-privacy-checkbox"
                            checked={acceptedPrivacy}
                            onChange={() => setAcceptedPrivacy(!acceptedPrivacy)}
                            label={(
                                <>
                                    Ich habe die{' '}
                                    <Link
                                        href="/privacy"
                                        className="text-[#1a1a2e] font-bold hover:text-[#e20074] transition-colors underline underline-offset-2"
                                    >
                                        Datenschutzerklärung
                                    </Link>
                                    {' '}gelesen und willige in die Datenverarbeitung ein.
                                </>
                            )}
                        />
                        <CheckboxRow
                            id="setup-tracking-checkbox"
                            checked={acceptedTracking}
                            onChange={() => setAcceptedTracking(!acceptedTracking)}
                            label={(
                                <>
                                    Ich stimme der{' '}
                                    <Link
                                        href="/tracking"
                                        className="text-[#1a1a2e] font-bold hover:text-[#e20074] transition-colors underline underline-offset-2"
                                    >
                                        anonymen Nutzungsanalyse
                                    </Link>{' '}
                                    zu (optional).
                                </>
                            )}
                        />
                    </div>
                </motion.div>
            </section>
            <div className="flex gap-3 pt-4 border-t border-[#eaedf0] mt-8">
                <PremiumButton onClick={handlePrevStep} variant="secondary" className="flex-1">
                    Zurück
                </PremiumButton>
                <PremiumButton
                    onClick={handleSubmit}
                    disabled={!canSubmitClick}
                    loading={isSubmitting}
                    variant="primary"
                    className="flex-1"
                >
                    Registrierung abschließen
                </PremiumButton>
            </div>
        </motion.div>
    );

    const renderStep4 = () => {
        const handleSnooze = () => {
            const snoozeTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            localStorage.setItem('setup-passkey-snoozed-until', snoozeTime);
            router.push('/products');
        };

        return (
            <motion.div
                key="step4"
                className="space-y-6 w-full"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
            >
                <ScreenHeader
                    icon={<Fingerprint className="w-5 h-5 text-[#e20074]" />}
                    title="Anmeldung mit Passkey"
                    subtitle="Melde Dich in Zukunft blitzschnell per Bitwarden oder Windows Hello an – ganz ohne PIN!"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left my-8">
                    <div className="p-5 rounded-2xl bg-[#f7f8fa] border border-[#eaedf0] hover:border-[#e20074]/20 transition-all duration-300">
                        <div className="w-8 h-8 rounded-lg bg-[#e20074]/10 text-[#e20074] flex items-center justify-center mb-3">
                            <Zap className="w-4 h-4" />
                        </div>
                        <h4 className="text-[0.85rem] font-bold text-[#1a1a2e] mb-1.5">Schnellanmeldung</h4>
                        <p className="text-[0.78rem] text-[#666] leading-relaxed">Einfacher und schneller Zugriff mittels Gesichtserkennung oder Fingerabdruck.</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[#f7f8fa] border border-[#eaedf0] hover:border-[#e20074]/20 transition-all duration-300">
                        <div className="w-8 h-8 rounded-lg bg-[#e20074]/10 text-[#e20074] flex items-center justify-center mb-3">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <h4 className="text-[0.85rem] font-bold text-[#1a1a2e] mb-1.5">Höchste Sicherheit</h4>
                        <p className="text-[0.78rem] text-[#666] leading-relaxed">Kryptografisch gesichert und vollständig resistent gegen Phishing.</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[#f7f8fa] border border-[#eaedf0] hover:border-[#e20074]/20 transition-all duration-300">
                        <div className="w-8 h-8 rounded-lg bg-[#e20074]/10 text-[#e20074] flex items-center justify-center mb-3">
                            <KeyRound className="w-4 h-4" />
                        </div>
                        <h4 className="text-[0.85rem] font-bold text-[#1a1a2e] mb-1.5">Passwortloser Komfort</h4>
                        <p className="text-[0.78rem] text-[#666] leading-relaxed">Keine PINs oder Passwörter mehr merken. Sicherer Schutz auf Deinem Gerät.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-6 border-[#eaedf0] mt-6">
                    <PremiumButton
                        onClick={handlePasskeyEnrollment}
                        variant="primary"
                        className="w-full font-bold flex items-center justify-center gap-2"
                    >
                        <Fingerprint className="w-5 h-5" />
                        Sicher einrichten via Bitwarden oder Windows Hello
                    </PremiumButton>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <PremiumButton
                            onClick={handleSnooze}
                            variant="secondary"
                            className="flex-1 font-semibold text-[0.85rem] flex items-center justify-center gap-2"
                        >
                            <Clock className="w-4 h-4" />
                            In 7 Tagen erinnern
                        </PremiumButton>
                        <PremiumButton
                            onClick={() => {
                                resetStore();
                                router.push('/products');
                                router.refresh();
                            }}
                            variant="secondary"
                            className="flex-1 font-semibold text-[0.85rem] flex items-center justify-center gap-2"
                        >
                            <ArrowRight className="w-4 h-4" />
                            Später einrichten
                        </PremiumButton>
                    </div>
                </div>
            </motion.div>
        );
    };

    const isWizardFlow = !isIpLoading && !isIpError && !(isReturningUser && !showReconfigure) && !isAlreadyRegisteredFlow && !isPinResetFlow && !isSettingNewPin && !requestPinReset.isPending;

    return (
        <div className="h-screen w-full py-12 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074] scrollbar-none overflow-y-auto overflow-x-hidden fixed inset-0 bg-[#f7f8fa]">
            <div className="max-w-3xl mx-auto">
                <motion.div initial={{
                    opacity: 0,
                    y: 12,
                }} animate={{
                    opacity: 1,
                    y: 0,
                }} transition={{
                    duration: 0.5,
                }} className="flex flex-col items-center mb-10 text-center">
                    <TelekomLogo className="w-12 h-12 text-[#e20074] mb-8" />
                    <h1 className="text-3xl sm:text-[2.5rem] font-extrabold text-[#1a1a2e] tracking-tight mb-3 leading-none">Sales Experience</h1>
                    <p className="text-[1.05rem] text-[#888] font-normal leading-relaxed max-w-md mx-auto mt-1">
                        Willkommen bei der Sales Experience, kurz SXP! 👋🏻<br />Sie hilft Dir interaktiv bei der Beratung im Gespräch.
                    </p>
                </motion.div>

                <motion.div initial={{
                    opacity: 0,
                    y: 15,
                }} animate={{
                    opacity: 1,
                    y: 0,
                    height: typeof cardHeight === 'number' && cardHeight > 0 ? cardHeight : 'auto',
                }} transition={{
                    duration: 0.4,
                }} className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] overflow-hidden relative">
                    <div ref={cardRef} className="p-8 sm:p-12">
                        {isMounted && isWizardFlow && currentStep < 4 && (
                            <div className="flex justify-center gap-2 mb-8">
                                {[
                                    0,
                                    1,
                                    2,
                                    3,
                                ].map(step => (
                                    <div key={step} className={clsx('h-1.5 rounded-full transition-all duration-300', currentStep === step ? 'w-8 bg-[#e20074]' : currentStep > step ? 'w-8 bg-[#e20074]/30' : 'w-2 bg-[#eaedf0]')} />
                                ))}
                            </div>
                        )}
                        <AnimatePresence mode="wait" initial={false}>
                            {!isMounted ? (
                                <motion.div
                                    key="isMountedLoading"
                                    initial={{ opacity: 0, x: 15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -15 }}
                                    className="flex flex-col items-center gap-4 py-12"
                                >
                                    <div className="w-8 h-8 border-4 border-[#eaedf0] border-t-[#e20074] rounded-full animate-spin" />
                                    <p className="text-[#888] text-[0.9rem] font-medium">Laden…</p>
                                </motion.div>
                            ) : isIpLoading ? (
                                <motion.div key="ipLoading" initial={{
                                    opacity: 0,
                                    x: 15,
                                }} animate={{
                                    opacity: 1,
                                    x: 0,
                                }} exit={{
                                    opacity: 0,
                                    x: -15,
                                }} className="flex flex-col items-center gap-4 py-12">
                                    <div className="w-8 h-8 border-4 border-[#eaedf0] border-t-[#e20074] rounded-full animate-spin" />
                                    <p className="text-[#888] text-[0.9rem] font-medium">Überprüfe Zugriffsberechtigung…</p>
                                </motion.div>
                            ) : isIpError ? (
                                <motion.div key="ipError" initial={{
                                    opacity: 0,
                                    x: 15,
                                }} animate={{
                                    opacity: 1,
                                    x: 0,
                                }} exit={{
                                    opacity: 0,
                                    x: -15,
                                }} className="w-full">
                                    <IpBlockedCard error={ipError} />
                                </motion.div>
                            ) : requestPinReset.isPending ? (
                                <motion.div key="sendingReset" initial={{
                                    opacity: 0,
                                    x: 15,
                                }} animate={{
                                    opacity: 1,
                                    x: 0,
                                }} exit={{
                                    opacity: 0,
                                    x: -15,
                                }} className="flex flex-col items-center text-center gap-5 py-12">
                                    <div className="relative flex items-center justify-center mb-1">
                                        <div className="absolute -inset-1.5 border-[3px] border-[#fdf2f8] border-t-[#e20074] rounded-full animate-spin" />
                                        <div className="w-16 h-16 bg-[#fdf2f8] rounded-full flex items-center justify-center relative z-10">
                                            <Mail className="w-8 h-8 text-[#e20074] animate-pulse" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-[1.1rem] font-extrabold text-[#1a1a2e] mb-2 tracking-tight">Code wird gesendet…</h3>
                                        <p className="text-[0.9rem] text-[#888] leading-relaxed max-w-sm mx-auto">
                                            Wir generieren einen Sicherheitscode und senden diesen an <strong className="font-semibold text-[#1a1a2e]">{email || loginEmail}</strong>. Bitte hab einen kurzen Moment Geduld.
                                        </p>
                                    </div>
                                </motion.div>
                            ) : isSettingNewPin ? (
                                <motion.div key="settingNewPin" initial={{
                                    opacity: 0,
                                    x: 15,
                                }} animate={{
                                    opacity: 1,
                                    x: 0,
                                }} exit={{
                                    opacity: 0,
                                    x: -15,
                                }} className="flex flex-col gap-6 py-4">
                                    <ScreenHeader icon={<Lock className="w-5 h-5 text-[#e20074]" />} title="Neue PIN festlegen" subtitle="Vergib eine neue 6-stellige PIN für dieses Gerät." />
                                    <form onSubmit={handleSaveNewPin} className="w-full flex flex-col gap-4">
                                        <div className="flex flex-col gap-2 text-left">
                                            <label className="text-[0.75rem] font-bold text-[#b0b0b0] uppercase tracking-wider pl-1">Neue PIN (6 Ziffern)</label>
                                            <PremiumPinInput
                                                id="new-pin"
                                                value={newPin}
                                                onChange={setNewPin}
                                                disabled={updatePinMutation.isPending}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 text-left">
                                            <label className="text-[0.75rem] font-bold text-[#b0b0b0] uppercase tracking-wider pl-1 font-sans">PIN wiederholen</label>
                                            <PremiumPinInput
                                                id="new-pin-confirm"
                                                value={newPinConfirm}
                                                onChange={setNewPinConfirm}
                                                disabled={updatePinMutation.isPending}
                                            />
                                        </div>
                                        <ErrorBanner message={newPinError} />
                                        <PremiumButton type="submit" disabled={updatePinMutation.isPending || newPin.length !== 6 || newPin !== newPinConfirm} loading={updatePinMutation.isPending} variant="primary" className="w-full">
                                            PIN speichern & Anmelden
                                        </PremiumButton>
                                    </form>
                                </motion.div>
                            ) : isPinResetFlow ? (
                                <motion.div key="pinResetFlow" initial={{
                                    opacity: 0,
                                    x: 15,
                                }} animate={{
                                    opacity: 1,
                                    x: 0,
                                }} exit={{
                                    opacity: 0,
                                    x: -15,
                                }} className="flex flex-col gap-6 py-4">
                                    <ScreenHeader icon={<Mail className="w-5 h-5 text-[#e20074]" />} title="Sicherheitscode eingeben" subtitle="Wir haben einen 6-stelligen Bestätigungscode an Deine E-Mail-Adresse gesendet." />
                                    <form onSubmit={handleVerifyPinResetOtp} className="w-full flex flex-col gap-4">
                                        <div className="flex flex-col gap-2 text-left">
                                            <label className="text-[0.75rem] font-bold text-[#b0b0b0] uppercase tracking-wider pl-1 font-sans">Sicherheitscode</label>
                                            <PremiumPinInput
                                                id="pin-reset-otp"
                                                value={pinResetOtp}
                                                onChange={setPinResetOtp}
                                                disabled={verifyPinReset.isPending}
                                                onComplete={(val) => {
                                                    if (val.length === 6 && !verifyPinReset.isPending) {
                                                        verifyPinReset.mutate({
                                                            email: email || loginEmail,
                                                            code: val,
                                                        }, {
                                                            onSuccess: () => {
                                                                setIsSettingNewPin(true);
                                                                setNewPin('');
                                                                setNewPinConfirm('');
                                                                setNewPinError(null);
                                                            },
                                                            onError: (err) => {
                                                                setPinResetError(err.message || 'Der eingegebene Code ist ungültig.');
                                                            },
                                                        });
                                                    }
                                                }}
                                            />
                                            <ErrorBanner message={pinResetError} />
                                        </div>
                                        <div className="flex gap-3">
                                            <PremiumButton onClick={() => { setIsPinResetFlow(false); setPinResetError(null); }} variant="secondary" className="flex-1">
                                                Abbrechen
                                            </PremiumButton>
                                            <PremiumButton type="submit" disabled={verifyPinReset.isPending || pinResetOtp.length !== 6} loading={verifyPinReset.isPending} variant="primary" className="flex-1">
                                                Verifizieren
                                            </PremiumButton>
                                        </div>
                                    </form>
                                </motion.div>
                            ) : isReturningUser && !showReconfigure && isUserExistsLoading ? (
                                <motion.div key="userExistsLoading" initial={{
                                    opacity: 0,
                                    x: 15,
                                }} animate={{
                                    opacity: 1,
                                    x: 0,
                                }} exit={{
                                    opacity: 0,
                                    x: -15,
                                }} className="flex flex-col items-center gap-4 py-12">
                                    <div className="w-8 h-8 border-4 border-[#eaedf0] border-t-[#e20074] rounded-full animate-spin" />
                                    <p className="text-[#888] text-[0.9rem] font-medium">Profil wird geladen…</p>
                                </motion.div>
                            ) : ((isReturningUser && !showReconfigure) || userExists === true) ? (
                                <motion.div key="welcomeBack" initial={{
                                    opacity: 0,
                                    x: 15,
                                }} animate={{
                                    opacity: 1,
                                    x: 0,
                                }} exit={{
                                    opacity: 0,
                                    x: -15,
                                }}>
                                    <WelcomeBackCard
                                        firstName={profileFirstName || firstName}
                                        lastName={profileLastName || lastName}
                                        email={email || loginEmail}
                                        teamName={profileTeamName || existingSession?.team?.name}
                                        reloginPin={reloginPin} setReloginPin={setReloginPin} reloginError={reloginError}
                                        isReloggingIn={(reloginReturningUser.isPending && !isAutoCheck) || isSilentSuccess}
                                        onReloginWithPin={(overridePin?: string) => {
                                            const pinToSubmit = overridePin || reloginPin;
                                            const isAuto = !!overridePin;
                                            setIsAutoCheck(isAuto);
                                            if (!pinToSubmit || pinToSubmit.length !== 6) {
                                                if (!overridePin) {
                                                    setReloginError('Bitte gib Deine 6-stellige PIN ein.');
                                                }
                                                return;
                                            }
                                            reloginReturningUser.mutate({
                                                email: email || loginEmail,
                                                pin: pinToSubmit,
                                            });
                                        }}
                                        onReloginWithPasskey={async () => {
                                            try {
                                                const {
                                                    options,
                                                } = await getAuthOptions.mutateAsync({
                                                    email,
                                                });
                                                const authResp = await startAuthentication({
                                                    optionsJSON: options,
                                                });
                                                const verifyResp = await verifyAuth.mutateAsync({
                                                    email,
                                                    response: authResp,
                                                });
                                                if (verifyResp.success) {
                                                    if ('isAdmin' in verifyResp && verifyResp.isAdmin) {
                                                        router.push('/admin/products');
                                                        return;
                                                    }
                                                    const salesData = verifyResp as { firstName?: string, lastName?: string, email?: string };
                                                    persistName(salesData.firstName?.trim() || '', salesData.lastName?.trim() || '', salesData.email?.trim() || '');
                                                    markSetupComplete();
                                                    refetchCurrentSession().then(() => {
                                                        router.push('/products');
                                                        router.refresh();
                                                    });
                                                }
                                            }
                                            catch (err) {
                                                console.log('Passkey auth failed', err);
                                                setReloginError('Passkey-Anmeldung fehlgeschlagen oder nicht verfügbar.');
                                            }
                                        }}
                                        onForgotPassword={handleRequestPinReset}
                                        onReconfigure={async () => {
                                            try {
                                                await logoutMutation.mutateAsync();
                                            }
                                            catch (err) {
                                                console.error('Logout during reconfigure failed:', err);
                                            }
                                            localStorage.removeItem(LS_KEY_FIRST_NAME);
                                            localStorage.removeItem(LS_KEY_LAST_NAME);
                                            localStorage.removeItem(LS_KEY_EMAIL);
                                            localStorage.removeItem(LS_KEY_SETUP_DONE);
                                            resetStore();
                                            setHasCompletedBefore(false);
                                            setShowReconfigure(true);
                                        }}
                                        hasActiveSession={!!existingSession}
                                    />
                                </motion.div>
                            ) : isAlreadyRegisteredFlow ? (
                                <motion.div key="alreadyRegistered" initial={{
                                    opacity: 0,
                                    x: 15,
                                }} animate={{
                                    opacity: 1,
                                    x: 0,
                                }} exit={{
                                    opacity: 0,
                                    x: -15,
                                }} className="flex flex-col gap-6 py-4">
                                    <ScreenHeader icon={<User className="w-5 h-5 text-[#e20074]" />} title="Mit bestehendem Profil anmelden" subtitle="Gib Deine E-Mail-Adresse und Deine 6-stellige PIN ein, um Dich auf diesem Gerät anzumelden." />
                                    <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-4">
                                        <PremiumInput id="loginEmail" type="email" label="E-Mail-Adresse" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="max.mustermann@telekom.de" disabled={isLoggingIn || isSilentSuccess} autoComplete="username webauthn" />
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[0.75rem] font-bold text-[#b0b0b0] uppercase tracking-wider pl-1 font-sans">6-stellige PIN</label>
                                                <button
                                                    type="button"
                                                    onClick={handleRequestPinReset}
                                                    disabled={!loginEmail || isLoggingIn || isSilentSuccess}
                                                    className="text-[#e20074] hover:underline font-bold text-[0.72rem] focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                >
                                                    PIN vergessen?
                                                </button>
                                            </div>
                                            <PremiumPinInput
                                                id="login-pin-unrecognized"
                                                value={loginPin}
                                                onChange={setLoginPin}
                                                disabled={isLoggingIn || isSilentSuccess}
                                                error={!!loginError}
                                                onComplete={(val) => {
                                                    if (val.length === 6 && !isLoggingIn && !isSilentSuccess) {
                                                        handleLoginSubmit(undefined, val);
                                                    }
                                                }}
                                            />
                                            <ErrorBanner message={loginError} />
                                        </div>
                                        <div className="flex flex-col gap-3 mt-2">
                                            <PremiumButton type="submit" disabled={isLoggingIn || !loginEmail || loginPin.length !== 6 || isSilentSuccess} loading={isLoggingIn || isSilentSuccess} variant="primary" className="w-full" icon={<ArrowRight className="w-4 h-4 ml-0.5" strokeWidth={2.5} />}>
                                                Mit PIN anmelden
                                            </PremiumButton>
                                            <PremiumButton onClick={handleLoginWithPasskey} disabled={isLoggingIn || isSilentSuccess} variant="secondary" className="w-full">
                                                <Fingerprint className="w-4 h-4 text-[#e20074]" /> Mit Passkey anmelden
                                            </PremiumButton>
                                            <PremiumButton onClick={() => { setIsAlreadyRegisteredFlow(false); setLoginError(null); }} disabled={isLoggingIn || isSilentSuccess} variant="ghost" className="w-full">
                                                <ArrowLeft className="w-3.5 h-3.5" /> Zurück zum Setup
                                            </PremiumButton>
                                        </div>
                                    </form>
                                </motion.div>
                            ) : pendingBindingToken ? (
                                <motion.div key="pendingToken" initial={{
                                    opacity: 0,
                                    x: 15,
                                }} animate={{
                                    opacity: 1,
                                    x: 0,
                                }} exit={{
                                    opacity: 0,
                                    x: -15,
                                }} className="flex flex-col items-center text-center gap-5 py-4">
                                    <div className="relative flex items-center justify-center mb-1">
                                        <div className="absolute -inset-1.5 border-[3px] border-[#fdf2f8] border-t-[#e20074] rounded-full animate-spin" />
                                        <div className="w-16 h-16 bg-[#fdf2f8] rounded-full flex items-center justify-center relative z-10">
                                            <Mail className="w-8 h-8 text-[#e20074]" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-[1.1rem] font-extrabold text-[#1a1a2e] mb-2 tracking-tight">Bitte überprüfe Dein Postfach</h3>
                                        <p className="text-[0.9rem] text-[#888] leading-relaxed max-w-md mx-auto">
                                            Wir haben einen Bestätigungslink an <strong className="font-medium text-[#1a1a2e]">{email}</strong> gesendet. Er ist 60 Minuten lang gültig.<br /><strong className="font-medium text-[#1a1a2e] underline underline-offset-2">Bitte schließe diese Seite nicht.</strong>
                                        </p>
                                    </div>
                                    <button onClick={() => setPendingBindingToken(null)} className="mt-2 px-4 py-2 text-[0.85rem] font-medium text-[#e20074] hover:bg-[#fdf2f8] rounded-xl transition-colors cursor-pointer">
                                        E-Mail korrigieren / Zurück
                                    </button>
                                </motion.div>
                            ) : (
                                <>
                                    {currentStep === 0 && renderStep0()}
                                    {currentStep === 1 && renderStep1()}
                                    {currentStep === 2 && renderStep2()}
                                    {currentStep === 3 && renderStep3()}
                                    {currentStep === 4 && renderStep4()}
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                <motion.div initial={{
                    opacity: 0,
                    y: 12,
                }} animate={{
                    opacity: 1,
                    y: 0,
                }} transition={{
                    duration: 0.5,
                }} className="flex flex-col items-center mt-5 text-center">
                    <p className="text-[1.05rem] text-[#888] font-normal leading-relaxed max-w-md mx-auto mt-1">Mit Liebe gemacht. Aus Chemnitz, für Euch alle. ❤️</p>
                </motion.div>
                <GlobalFooter className="pt-8 pb-0 mt-4 text-[#bbb]" linkColor="text-[#bbb]" />
            </div>
        </div>
    );
}


function IpBlockedCard({
    error,
}: { error: { message: string } | null }) {
    return (
        <div className="flex flex-col gap-5 py-4">
            <ScreenHeader icon={<ShieldAlert className="w-5 h-5 text-[#e20074]" />} title="Zugriff verweigert" subtitle={error?.message || 'Dein aktueller Standort (IP-Adresse) ist für den Zugriff auf dieses System nicht autorisiert. Der Zugriff ist nur über das Konzernnetz möglich.'} />
        </div>
    );
}

function WelcomeBackCard({
    firstName, lastName, email: _email, teamName, reloginPin, setReloginPin, reloginError, isReloggingIn, onReloginWithPin, onReloginWithPasskey, onReconfigure, hasActiveSession: _hasActiveSession, onForgotPassword,
}: {
    firstName: string; lastName: string; email: string; teamName?: string; reloginPin: string; setReloginPin: (v: string) => void; reloginError: string | null; isReloggingIn?: boolean; onReloginWithPin: (pin?: string) => void; onReloginWithPasskey: () => void; onReconfigure: () => void; hasActiveSession?: boolean; onForgotPassword: () => void;
}) {
    return (
        <div className="flex flex-col gap-6 py-4">
            <ScreenHeader
                icon={<CheckCircle2 className="w-5 h-5 text-[#e20074]" />}
                title={<>Willkommen zurück{firstName ? `, ${firstName}` : ''}!</>}
                subtitle={<>Dein Setup ist bereits abgeschlossen{teamName ? <> und Du bist dem Team <span className="font-bold text-[#1a1a2e]">{teamName}</span> zugeordnet</> : null}. Bitte melde Dich mit Deiner PIN an, um fortzufahren.</>}
            />
            {teamName && (
                <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f7f8fa] border border-[#eaedf0] text-[0.8rem] font-medium text-[#666]"><Users className="w-3.5 h-3.5 text-[#e20074]" />{teamName}</div>
                    {firstName && <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f7f8fa] border border-[#eaedf0] text-[0.8rem] font-medium text-[#666]"><User className="w-3.5 h-3.5 text-[#e20074]" />{firstName} {lastName}</div>}
                </div>
            )}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="relogin-pin" className="text-[0.75rem] font-bold text-[#b0b0b0] uppercase tracking-wider pl-1">6-stellige PIN eingeben</label>
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            className="text-[#e20074] hover:underline font-bold text-[0.72rem] focus:outline-none cursor-pointer"
                        >
                            PIN vergessen?
                        </button>
                    </div>
                    <PremiumPinInput
                        id="relogin-pin"
                        value={reloginPin}
                        onChange={setReloginPin}
                        disabled={isReloggingIn}
                        error={!!reloginError}
                        onComplete={(val) => {
                            if (val.length === 6 && !isReloggingIn) {
                                onReloginWithPin(val);
                            }
                        }}
                    />
                    <ErrorBanner message={reloginError} />
                </div>
                <PremiumButton onClick={() => onReloginWithPin()} disabled={isReloggingIn || reloginPin.length !== 6} loading={isReloggingIn} variant="primary" className="w-full" icon={<ArrowRight className="w-4 h-4 ml-0.5" strokeWidth={2.5} />}>
                    Mit PIN anmelden
                </PremiumButton>
                <PremiumButton onClick={onReloginWithPasskey} disabled={isReloggingIn} variant="secondary" className="w-full">
                    <Fingerprint className="w-4 h-4 text-[#e20074]" /> Mit Passkey anmelden
                </PremiumButton>
                <PremiumButton onClick={onReconfigure} disabled={isReloggingIn} variant="ghost" className="w-full">
                    <RotateCcw className="w-3.5 h-3.5" /> Neu einrichten / Anderer Benutzer
                </PremiumButton>
            </div>
        </div>
    );
}
