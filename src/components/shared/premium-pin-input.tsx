'use client';

import React, {
	useRef, useEffect, useState,
} from 'react';
import clsx from 'clsx';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	Eye, EyeOff,
} from 'lucide-react';

interface PremiumPinInputProps {
	value: string;
	onChange: (val: string) => void;
	length?: number;
	onComplete?: (val: string) => void;
	error?: boolean;
	disabled?: boolean;
	id?: string;
}

export function PremiumPinInput({
	value,
	onChange,
	length = 6,
	onComplete,
	error = false,
	disabled = false,
	id = 'pin-input',
}: PremiumPinInputProps) {
	const inputRefs = useRef<(HTMLInputElement | null)[]>([
]);
	const [
 focusedIndex,
setFocusedIndex,
] = useState<number | null>(null);
	const [
 showPin,
setShowPin,
] = useState(false);
	const [
 shouldShake,
setShouldShake,
] = useState(false);
	const [
 visibleDigits,
setVisibleDigits,
] = useState<Record<number, boolean>>({
});
	const timersRef = useRef<Record<number, NodeJS.Timeout>>({
});

	const digits = value.split('');
	const paddedDigits = Array.from({
 length,
}, (_, i) => digits[i] ?? '');

	// Shake container on error to give physical feedback
	useEffect(() => {
		if (error) {
			setShouldShake(true);
			const timer = setTimeout(() => setShouldShake(false), 500);
			return () => clearTimeout(timer);
		}
	}, [
 error,
]);

	// Cleanup timers on unmount
	useEffect(() => {
		const currentTimers = timersRef.current;
		return () => {
			Object.values(currentTimers).forEach((timer) => clearTimeout(timer));
		};
	}, [
]);

	const updateValue = (newDigits: string[]) => {
		const val = newDigits.join('');
		onChange(val);
		if (val.length === length && onComplete) {
			onComplete(val);
		}
	};

	const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
		const inputVal = e.target.value.replace(/\D/g, '');
		if (!inputVal) return;

		// Use the last typed character
		const char = inputVal.slice(-1);

		const newDigits = [
 ...paddedDigits,
];
		newDigits[index] = char;
		updateValue(newDigits);

		// Temporarily show the newly typed digit for 1 second
		setVisibleDigits((prev) => ({
			...prev,
			[index]: true,
		}));
		if (timersRef.current[index]) clearTimeout(timersRef.current[index]);
		timersRef.current[index] = setTimeout(() => {
			setVisibleDigits((prev) => ({
				...prev,
				[index]: false,
			}));
		}, 1000);

		// Move focus to next input
		if (index < length - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace') {
			e.preventDefault();
			const newDigits = [
 ...paddedDigits,
];

			if (paddedDigits[index]) {
				// Clear current digit and immediately focus previous input (highly intuitive backspacing)
				newDigits[index] = '';
				updateValue(newDigits);
				if (index > 0) {
					inputRefs.current[index - 1]?.focus();
				}
			}
 else if (index > 0) {
				// Current digit is empty, move to previous and clear it
				newDigits[index - 1] = '';
				updateValue(newDigits);
				inputRefs.current[index - 1]?.focus();
			}
		}
 else if (e.key === 'ArrowLeft' && index > 0) {
			e.preventDefault();
			inputRefs.current[index - 1]?.focus();
		}
 else if (e.key === 'ArrowRight' && index < length - 1) {
			e.preventDefault();
			inputRefs.current[index + 1]?.focus();
		}
 else if (e.key === 'Delete') {
			e.preventDefault();
			const newDigits = [
 ...paddedDigits,
];
			newDigits[index] = '';
			updateValue(newDigits);
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
		if (!pastedData) return;

		const newDigits = [
 ...paddedDigits,
];
		pastedData.split('').forEach((char, i) => {
			if (i < length) newDigits[i] = char;
		});

		updateValue(newDigits);

		// Show all pasted digits temporarily
		const newVisible: Record<number, boolean> = {
};
		pastedData.split('').forEach((_, i) => {
			if (i < length) {
				newVisible[i] = true;
				if (timersRef.current[i]) clearTimeout(timersRef.current[i]);
				timersRef.current[i] = setTimeout(() => {
					setVisibleDigits((prev) => ({
						...prev,
						[i]: false,
					}));
				}, 1000);
			}
		});
		setVisibleDigits((prev) => ({
			...prev,
			...newVisible,
		}));

		// Focus the next empty input or the last input
		const nextEmptyIndex = newDigits.findIndex((d) => !d);
		const targetIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
		inputRefs.current[targetIndex]?.focus();
	};

	return (
		<motion.div
			className="flex items-center gap-1.5 sm:gap-2 w-full py-0"
			id={id}
			role="group"
			aria-label="PIN Eingabe"
			animate={shouldShake ? {
 x: [
 -6,
6,
-6,
6,
-3,
3,
0,
],
} : {
 x: 0,
}}
			transition={{
 duration: 0.4,
}}
		>
			<div className="flex items-center gap-1.5 sm:gap-2 flex-1">
				{paddedDigits.map((digit, index) => {
					const isFocused = focusedIndex === index;
					const hasValue = !!digit;
					const isVisible = showPin || visibleDigits[index];

					return (
						<motion.div
							key={index}
							initial={{
 opacity: 0,
y: 8,
}}
							animate={{
 opacity: 1,
y: 0,
}}
							transition={{
								delay: index * 0.03,
								duration: 0.25,
							}}
							className="relative flex-1"
						>
							<input
								ref={(el) => {
									inputRefs.current[index] = el;
								}}
								type={isVisible ? 'text' : 'password'}
								inputMode="numeric"
								pattern="[0-9]*"
								maxLength={2}
								value={digit}
								disabled={disabled}
								onChange={(e) => handleChange(index, e)}
								onKeyDown={(e) => handleKeyDown(index, e)}
								onPaste={handlePaste}
								onFocus={() => setFocusedIndex(index)}
								onBlur={() => setFocusedIndex(null)}
								autoComplete="one-time-code"
								aria-invalid={error}
								aria-label={`PIN Ziffer ${index + 1}`}
								className={clsx(
									'w-full h-[48px] rounded-xl text-center text-transparent caret-transparent transition-all duration-200 outline-none select-none cursor-text font-mono border',
									disabled
										? 'opacity-50 cursor-not-allowed bg-[#eaedf0] border-[#d1d5db]'
										: error
										? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
										: isFocused
										? 'border-[#e20074] bg-white ring-2 ring-[#e20074]/20 shadow-[0_0_12px_rgba(226,0,116,0.15)] scale-[1.02]'
										: hasValue
										? 'border-[#c1c6cd] bg-white focus:border-[#e20074]'
										: 'border-[#eaedf0] bg-[#f7f8fa] hover:border-[#d1d5db] hover:bg-white',
								)}
							/>

							{/* Custom Premium Visual Overlay Layer */}
							<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
								<AnimatePresence mode="wait">
									{!hasValue ? (
										// Placeholder dot in the absolute center
										(!isFocused || disabled) && (
											<motion.div
												key="placeholder"
												initial={{
 opacity: 0,
}}
												animate={{
 opacity: 1,
}}
												exit={{
 opacity: 0,
}}
												transition={{
 duration: 0.12,
ease: 'easeInOut',
}}
												className={clsx(
													'w-2 h-2 rounded-full',
													disabled ? 'bg-[#888]/30' : 'bg-[#1a1a2e]/30',
												)}
											/>
										)
									) : (
										// Filled value (either digit or password dot)
										<motion.div
											key={isVisible ? `digit-${digit}` : 'dot'}
											initial={isVisible ? {
 opacity: 1,
} : {
 opacity: 0,
}}
											animate={{
 opacity: 1,
}}
											exit={{
 opacity: 0,
}}
											transition={{
 duration: 0.12,
ease: 'easeInOut',
}}
											className="flex items-center justify-center"
										>
											{isVisible ? (
												<span className="text-[1.25rem] font-extrabold text-[#e20074] font-mono leading-none select-none">
													{digit}
												</span>
											) : (
												// Beautiful custom password dot
												<div className={clsx(
													'w-2.5 h-2.5 rounded-full transition-colors duration-200',
													disabled ? 'bg-[#888]' : 'bg-[#1a1a2e]',
												)} />
											)}
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</motion.div>
					);
				})}
			</div>

			<button
				type="button"
				onClick={() => setShowPin(!showPin)}
				disabled={disabled}
				className={clsx(
					'h-[48px] w-[48px] rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer outline-none shrink-0',
					disabled
						? 'opacity-50 cursor-not-allowed bg-[#eaedf0] border-[#d1d5db] text-[#888]'
						: showPin
						? 'bg-[#e20074]/10 border-[#e20074]/30 text-[#e20074] hover:bg-[#e20074]/20 ring-2 ring-[#e20074]/10'
						: 'bg-[#f7f8fa] border-[#eaedf0] text-[#888] hover:text-[#1a1a2e] hover:bg-white hover:border-[#d1d5db]',
				)}
				title={showPin ? 'PIN verbergen' : 'PIN anzeigen'}
				aria-label={showPin ? 'PIN verbergen' : 'PIN anzeigen'}
			>
				{showPin ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
			</button>
		</motion.div>
	);
}
