'use client';

import React, { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';

interface PremiumGhostInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	onValueChange: (val: string) => void;
	error?: string | null;
}

export function PremiumGhostInput({
	label,
	value = '',
	onValueChange,
	error,
	className,
	id,
	...props
}: PremiumGhostInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [ghostText, setGhostText] = useState('');
	const [isFocused, setIsFocused] = useState(false);

	const DOMAIN = 'telekom.de';
	const SUFFIX = '@' + DOMAIN;

	useEffect(() => {
		const typed = String(value).toLowerCase();
		
		// Only display ghost suggestion if cursor is positioned at the very end
		const isCursorAtEnd = inputRef.current 
			? inputRef.current.selectionStart === typed.length 
			: true;

		if (!typed || !isCursorAtEnd) {
			setGhostText('');
			return;
		}

		if (!typed.includes('@')) {
			setGhostText(SUFFIX);
		} else {
			const parts = typed.split('@');
			if (parts.length === 2) {
				const typedDomain = parts[1];
				if (DOMAIN.startsWith(typedDomain)) {
					setGhostText(DOMAIN.substring(typedDomain.length));
				} else {
					setGhostText('');
				}
			} else {
				setGhostText('');
			}
		}
	}, [value]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onValueChange(e.target.value);
	};

	const inputId = id || label?.replace(/\s+/g, '-').toLowerCase() || 'ghost-input';

	return (
		<div className="flex flex-col gap-1.5 w-full text-left font-sans">
			{label && (
				<label htmlFor={inputId} className="text-[0.75rem] font-bold text-[#b0b0b0] uppercase tracking-wider pl-1 select-none">
					{label}
				</label>
			)}
			<div className="relative flex items-center w-full">
				{/* Mirror container rendering behind the input to align ghost text precisely */}
				<div 
					className="absolute inset-0 px-4 py-3.5 text-[0.95rem] font-medium leading-none flex items-center select-none pointer-events-none whitespace-pre border border-transparent font-sans"
				>
					{/* Transparent mirrored text pushing the ghost segment to the correct character width */}
					<span className="text-transparent font-sans">{value}</span>
					{/* Lower opacity appended domain ghost segment */}
					<span className="text-[#1a1a2e]/25 font-sans transition-all duration-150">
						{ghostText}
					</span>
				</div>

				<input
					ref={inputRef}
					id={inputId}
					type="text"
					value={value}
					onChange={handleChange}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					className={clsx(
						'w-full h-[48px] px-4 rounded-xl border font-medium text-[0.95rem] text-[#1a1a2e] transition-all bg-[#f7f8fa] outline-none font-sans',
						isFocused 
							? 'border-[#e20074] bg-white ring-2 ring-[#e20074]/15 shadow-sm' 
							: 'border-[#eaedf0] hover:border-[#c1c6cd]',
						error && 'border-red-300 bg-red-50/50 text-red-900 focus:border-red-500 focus:ring-red-500/30',
						props.disabled && 'opacity-50 cursor-not-allowed bg-[#eaedf0] text-[#888]',
						className
					)}
					{...props}
				/>
			</div>
			{error && <span className="text-[0.75rem] text-red-500 pl-1 font-semibold">{error}</span>}
		</div>
	);
}
