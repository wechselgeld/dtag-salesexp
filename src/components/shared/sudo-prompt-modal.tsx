'use client';

import React, {
 useState,
} from 'react';
import {
 motion, AnimatePresence,
} from 'framer-motion';
import {
 ShieldAlert, Key, X,
} from 'lucide-react';
import {
 PremiumInput, PremiumButton,
} from './form/form-suite';

interface SudoPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password: string) => Promise<void>;
    title?: string;
    description?: string;
    loading?: boolean;
}

export function SudoPromptModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Sicherheitsbestätigung erforderlich',
    description = 'Bitte gib Dein Administrator-Passwort ein, um diese kritische bzw. unwiderrufliche Aktion auszuführen.',
    loading = false,
}: SudoPromptModalProps) {
    const [
 password,
setPassword,
] = useState('');
    const [
 error,
setError,
] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!password) {
            setError('Bitte gib Dein Passwort ein.');
            return;
        }

        try {
            await onConfirm(password);
            setPassword('');
        }
 catch (err: any) {
            setError(err.message || 'Passwort falsch oder Bestätigung fehlgeschlagen.');
        }
    };

    const handleClose = () => {
        setPassword('');
        setError(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
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
 duration: 0.2,
}}
                        className="bg-white rounded-3xl shadow-2xl border border-[#eaedf0] w-full max-w-md overflow-hidden relative"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#eaedf0]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#dc2626]/10 text-[#dc2626] flex items-center justify-center shrink-0">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <h3 className="text-[1.15rem] font-extrabold text-[#1a1a2e] m-0">{title}</h3>
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={loading}
                                type="button"
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[#888] hover:bg-[#f7f8fa] hover:text-[#1a1a2e] transition-colors cursor-pointer outline-none"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <p className="text-[0.9rem] text-[#666] leading-relaxed m-0 text-left">
                                {description}
                            </p>

                            <PremiumInput
                                label="Administrator-Passwort"
                                type="password"
                                placeholder="Passwort eingeben..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={error}
                                disabled={loading}
                                icon={<Key className="w-[18px] h-[18px]" />}
                                autoFocus
                            />

                            {/* Footer Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <PremiumButton
                                    type="button"
                                    variant="secondary"
                                    onClick={handleClose}
                                    disabled={loading}
                                >
                                    Abbrechen
                                </PremiumButton>
                                <PremiumButton
                                    type="submit"
                                    variant="danger"
                                    loading={loading}
                                >
                                    Aktion bestätigen
                                </PremiumButton>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
