'use client';

import React from 'react';
import clsx from 'clsx';
import {
 motion, AnimatePresence,
} from 'framer-motion';
import {
 Check,
} from 'lucide-react';

// --- Screen Header (inline, compact: icon badge + title/subtitle) ---
export function ScreenHeader({
 icon, title, subtitle,
}: { icon: React.ReactNode; title: React.ReactNode; subtitle?: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-5 pb-2">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#e20074]/10 rounded-full flex items-center justify-center shrink-0">
                    {icon}
                </div>
                <div className="text-left">
                    <h3 className="text-[1.15rem] font-extrabold text-[#1a1a2e] tracking-tight leading-tight">{title}</h3>
                    {subtitle && <p className="text-[0.875rem] text-[#999] leading-snug mt-0.5">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
}

// --- Section Header (legacy inline with step number badge) ---
export function SectionHeader({
    icon, title, step,
}: { icon: React.ReactNode; title: string; step?: number }) {
    return (
        <div className="flex items-center gap-3">
            {step !== undefined && (
                <div className="w-8 h-8 rounded-full bg-[#e20074]/10 text-[#e20074] flex items-center justify-center text-[0.75rem] font-extrabold shrink-0">
                    {step}
                </div>
            )}
            <div className="flex items-center gap-2">
                {icon}
                <h2 className="text-[1.05rem] font-bold text-[#1a1a2e] m-0">{title}</h2>
            </div>
        </div>
    );
}

// --- Animated Error (inline field error, small) ---
export function AnimatedError({
 message,
}: { message?: string | null }) {
    return (
        <AnimatePresence>
            {message && (
                <motion.p
                    initial={{
 opacity: 0,
y: -4,
}}
                    animate={{
 opacity: 1,
y: 0,
}}
                    exit={{
 opacity: 0,
y: -4,
}}
                    className="text-[#dc2626] text-[0.75rem] font-medium m-0 mt-1 text-left"
                >
                    {message}
                </motion.p>
            )}
        </AnimatePresence>
    );
}

// --- Error Banner (full-width block error, e.g. form-level) ---
export function ErrorBanner({
 message,
}: { message?: string | null }) {
    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{
 opacity: 0,
y: -6,
scale: 0.99,
}}
                    animate={{
 opacity: 1,
y: 0,
scale: 1,
}}
                    exit={{
 opacity: 0,
y: -6,
scale: 0.99,
}}
                    className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-2xl text-[0.85rem] text-red-700 font-medium leading-snug"
                >
                    <svg className="w-4 h-4 text-red-500 shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span>{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// --- Premium Input ---
export interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string | null;
    icon?: React.ReactNode;
    rightAction?: React.ReactNode;
}

export const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
    ({
 label, error, icon, rightAction, className, id, ...props
}, ref) => {
        const inputId = id || label?.replace(/\s+/g, '-').toLowerCase() || 'premium-input';

        return (
            <div className="flex flex-col gap-1.5 w-full text-left">
                {label && (
                    <label htmlFor={inputId} className="text-[0.75rem] font-bold text-[#b0b0b0] uppercase tracking-wider pl-1 font-sans">
                        {label}
                    </label>
                )}
                <div className="relative flex items-center">
                    {icon && <div className="absolute left-4 text-[#ccc] pointer-events-none flex items-center justify-center">{icon}</div>}
                    <input
                        ref={ref}
                        id={inputId}
                        className={clsx(
                            'h-[48px] w-full rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.95rem] text-[#1a1a2e] font-medium placeholder:text-[#ccc] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 focus:bg-white transition-all',
                            icon ? 'pl-11' : 'pl-4',
                            rightAction ? 'pr-12' : 'pr-4',
                            error && 'border-red-300 bg-red-50/50 text-red-900 focus:border-red-500 focus:ring-red-500/30',
                            props.disabled && 'opacity-50 cursor-not-allowed bg-[#eaedf0] text-[#888]',
                            className,
                        )}
                        {...props}
                    />
                    {rightAction && <div className="absolute right-4 flex items-center justify-center">{rightAction}</div>}
                </div>
                <AnimatedError message={error} />
            </div>
        );
    },
);

PremiumInput.displayName = 'PremiumInput';

// --- Premium Button ---
export interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    icon?: React.ReactNode;
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
    ({
 children, loading, variant = 'primary', icon, className, disabled, ...props
}, ref) => {
        const isPrimary = variant === 'primary';
        const isSecondary = variant === 'secondary';
        const isGhost = variant === 'ghost';
        const isDanger = variant === 'danger';

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={clsx(
                    'h-[48px] px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 outline-none text-[0.88rem] whitespace-nowrap cursor-pointer active:scale-[0.98]',
                    isPrimary && !disabled && 'bg-[#e20074] hover:bg-[#c70066] text-white shadow-[0_6px_16px_-4px_rgba(226,0,116,0.3)]',
                    isSecondary && !disabled && 'bg-[#f7f8fa] text-[#1a1a2e] border border-[#eaedf0] hover:bg-[#eaedf0]',
                    isGhost && !disabled && 'bg-transparent text-[#666] hover:bg-[#f7f8fa] hover:text-[#1a1a2e]',
                    isDanger && !disabled && 'bg-[#dc2626] hover:bg-[#b91c1c] text-white shadow-[0_6px_16px_-4px_rgba(220,38,38,0.3)]',
                    disabled && 'bg-[#f7f8fa] text-[#ccc] border border-[#eaedf0] cursor-not-allowed shadow-none active:scale-100',
                    className,
                )}
                {...props}
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        {children}
                        {icon && icon}
                    </>
                )}
            </button>
        );
    },
);

PremiumButton.displayName = 'PremiumButton';

// --- Checkbox Row ---
export function CheckboxRow({
 checked, onChange, label, disabled,
}: { checked: boolean; onChange: () => void; label: React.ReactNode; disabled?: boolean }) {
    return (
        <label className={clsx('flex items-center gap-2.5 group select-none text-left', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}>
            <div className="relative flex items-center justify-center shrink-0">
                <input type="checkbox" className="peer sr-only" checked={checked} onChange={disabled ? undefined : onChange} disabled={disabled} />
                <div
                    className={clsx(
                        'w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200',
                        checked ? 'bg-[#e20074] border-[#e20074]' : 'border-[#d1d5db] bg-white group-hover:border-[#e20074]/50',
                    )}
                >
                    <Check className={clsx('w-3 h-3 text-white transition-transform duration-200', checked ? 'scale-100' : 'scale-0')} strokeWidth={4} />
                </div>
            </div>
            <span className="text-[0.85rem] text-[#555] font-medium group-hover:text-[#1a1a2e] transition-colors">{label}</span>
        </label>
    );
}

// --- Selection Tile ---
export function SelectionTile({
    name,
    subtitle,
    isSelected,
    onClick,
    index = 0,
    disabled,
}: {
    name: string;
    subtitle?: string;
    isSelected: boolean;
    onClick: () => void;
    index?: number;
    disabled?: boolean;
}) {
    return (
        <motion.button
            initial={{
 opacity: 0,
scale: 0.95,
}}
            animate={{
 opacity: 1,
scale: 1,
}}
            transition={{
 delay: 0.03 * index,
duration: 0.25,
}}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            type="button"
            className={clsx(
                'relative flex items-center gap-3 px-4 h-auto min-h-[52px] py-2 rounded-xl border transition-all duration-300 outline-none group text-left w-full',
                disabled ? 'opacity-50 cursor-not-allowed bg-[#eaedf0] border-[#d1d5db]' : 'cursor-pointer',
                isSelected && !disabled
                    ? 'border-[#e20074]/40 bg-[#e20074]/5 shadow-[0_4px_20px_rgba(226,0,116,0.08)] ring-1 ring-[#e20074]/30'
                    : !disabled && 'border-[#eaedf0] bg-[#f7f8fa] hover:bg-white hover:border-[#d1d5db] hover:shadow-[0_2px_10px_rgba(0,0,0,0.03)]',
            )}
        >
            <div
                className={clsx(
                    'w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200 mt-0.5',
                    isSelected && !disabled ? 'bg-[#e20074] border-[#e20074]' : 'border-[#d1d5db] bg-white group-hover:border-[#a3a8b4]',
                )}
            >
                <Check className={clsx('w-2.5 h-2.5 text-white transition-transform duration-200', isSelected ? 'scale-100' : 'scale-0')} strokeWidth={4} />
            </div>
            <div className="flex flex-col items-start gap-0.5 text-left overflow-hidden">
                <span className={clsx('text-[0.88rem] font-bold transition-colors leading-tight truncate w-full', isSelected ? 'text-[#e20074]' : 'text-[#1a1a2e]')}>
                    {name}
                </span>
                {subtitle && <span className="text-[0.7rem] text-[#888] font-medium leading-[1.2] truncate w-full">{subtitle}</span>}
            </div>
        </motion.button>
    );
}
