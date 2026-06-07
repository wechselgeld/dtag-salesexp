import * as React from 'react';
import clsx from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	error?: string;
	label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({
		className, error, label, id, ...props
	}, ref) => {
		const generatedId = React.useId();
		const inputId = id || generatedId;

		return (
			<div className="space-y-1.5 w-full">
				{label && (
					<label
						htmlFor={inputId}
						className="block text-[0.75rem] font-semibold text-[#888]"
					>
						{label}
					</label>
				)}
				<textarea
					id={inputId}
					className={clsx(
						'w-full px-4 py-2.5 rounded-xl border bg-[#f7f8fa] focus:bg-white focus:outline-none transition-all text-[0.85rem] resize-y min-h-[80px]',
						error
							? 'border-[#dc2626] focus:border-[#dc2626]/30 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
							: 'border-[#eaedf0] focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)]',
						className,
					)}
					ref={ref}
					{...props}
				/>
				{error && (
					<p className="text-[0.65rem] text-[#dc2626] m-0 mt-1 font-medium">
						{error}
					</p>
				)}
			</div>
		);
	},
);
Textarea.displayName = 'Textarea';
