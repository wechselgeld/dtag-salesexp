'use client';

import {
 useState, useEffect, Suspense,
} from 'react';
import {
 useSearchParams, useRouter,
} from 'next/navigation';
import {
 Fingerprint, X, ShieldCheck, ArrowRight,
} from 'lucide-react';
import {
 motion, AnimatePresence,
} from 'framer-motion';
import {
 trpc,
} from '@/lib/trpc';
import clsx from 'clsx';
import {
	useOpenPanel,
} from '@openpanel/nextjs';

function PasskeyPromptInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const op = useOpenPanel();
    const [
 isOpen,
 setIsOpen,
] = useState(false);

    const {
 data: user,
} = trpc.auth.me.useQuery();
    const getRegOptions = trpc.webauthn.generateRegistrationOptions.useMutation();
    const verifyReg = trpc.webauthn.verifyRegistration.useMutation();
    const [
 isPending,
 setIsPending,
] = useState(false);

    useEffect(() => {
        if (searchParams.get('setupPasskey') === 'true') {
            setIsOpen(true);
        }
    }, [
 searchParams,
]);

    const handleClose = () => {
        setIsOpen(false);
        // Remove the query param without refreshing
        const params = new URLSearchParams(searchParams.toString());
        params.delete('setupPasskey');
        router.replace(`${window.location.pathname}?${params.toString()}`);
    };

    const handleRegister = async () => {
        if (!user?.email) return;
        setIsPending(true);
        op.track('passkey_registration_started', {
            email: user.email,
            location: 'admin_passkey_prompt',
            user_role: user.role || undefined,
        });
        try {
            const {
 startRegistration,
} = await import('@simplewebauthn/browser');
            const options = await getRegOptions.mutateAsync({
 email: user.email as string,
});
            const resp = await startRegistration({
 optionsJSON: options,
});
            await verifyReg.mutateAsync({
 email: user.email as string,
response: resp,
});

            op.track('passkey_registration_success', {
                email: user.email,
                location: 'admin_passkey_prompt',
                user_role: user.role || undefined,
            });

            // Success! 
            handleClose();
            alert('Passkey erfolgreich registriert! Du kannst Dich nun ohne Passwort anmelden.');
        }
 catch (err: any) {
            console.error('Passkey registration failed', err);
            op.track('passkey_registration_failed', {
                email: user.email,
                location: 'admin_passkey_prompt',
                user_role: user.role || undefined,
                error: err.message || String(err),
            });
            alert(`Fehler bei der Passkey-Registrierung: ${ err.message}`);
            setIsPending(false);
        }
    };

    const handleSkip = () => {
        op.track('passkey_setup_skipped', {
            email: user?.email || undefined,
            location: 'admin_passkey_prompt',
        });
        handleClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{
 opacity: 0,
}}
                        animate={{
 opacity: 1,
}}
                        exit={{
 opacity: 0,
}}
                        onClick={handleSkip}
                        className="absolute inset-0 bg-[#1a1a2e]/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{
 opacity: 0,
scale: 0.9,
y: 20,
}}
                        animate={{
 opacity: 1,
scale: 1,
y: 0,
}}
                        exit={{
 opacity: 0,
scale: 0.9,
y: 20,
}}
                        className="relative w-full max-w-[440px] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-white/20"
                    >
                        <button
                            onClick={handleSkip}
                            className="absolute top-6 right-6 p-2 text-[#aaa] hover:text-[#1a1a2e] hover:bg-[#f7f8fa] rounded-full transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 sm:p-10 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-[#e20074]/10 rounded-3xl flex items-center justify-center mb-8">
                                <Fingerprint className="w-10 h-10 text-[#e20074]" />
                            </div>

                            <h3 className="text-[1.5rem] font-extrabold text-[#1a1a2e] tracking-tight leading-tight mb-4">
                                Schneller & Sicherer anmelden
                            </h3>

                            <p className="text-[0.95rem] text-[#888] leading-relaxed mb-8">
                                Möchtest Du dieses Gerät mit einem Passkey registrieren? Danach kannst Du Dich bequem per Gesichtsscan oder Fingerabdruck anmelden – ganz ohne Passwort.
                            </p>

                            <div className="flex flex-col gap-4 w-full">
                                <button
                                    onClick={handleRegister}
                                    disabled={isPending}
                                    className={clsx(
                                        'w-full h-[56px] rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98]',
                                        isPending
                                            ? 'bg-[#f7f8fa] text-[#bbb] cursor-not-allowed'
                                            : 'bg-[#e20074] text-white hover:bg-[#c70066] shadow-[0_8px_20px_-6px_rgba(226,0,116,0.3)]',
                                    )}
                                >
                                    {isPending ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-5 h-5" />
                                            <span>Jetzt einrichten</span>
                                            <ArrowRight className="w-4 h-4 ml-1" strokeWidth={3} />
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleSkip}
                                    disabled={isPending}
                                    className="w-full h-[56px] rounded-2xl font-bold text-[#888] hover:text-[#1a1a2e] hover:bg-[#f7f8fa] transition-all"
                                >
                                    Vielleicht später
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function AdminPasskeyPrompt() {
    return (
        <Suspense fallback={null}>
            <PasskeyPromptInner />
        </Suspense>
    );
}
