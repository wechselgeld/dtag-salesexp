import * as React from "react";
import clsx from "clsx";
import { Check } from "lucide-react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: React.ReactNode;
	description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
	({ className, label, description, id, ...props }, ref) => {
		const generatedId = React.useId();
		const inputId = id || generatedId;

		return (
			<label
				htmlFor={inputId}
				className={clsx(
					"flex items-start gap-3 cursor-pointer group",
					className
				)}
			>
				<div className="relative flex items-center pt-[2px]">
					<input
						type="checkbox"
						id={inputId}
						className="peer sr-only"
						ref={ref}
						{...props}
					/>
					<div className="w-4 h-4 rounded border-2 border-[#ddd] bg-white peer-checked:bg-[#e20074] peer-checked:border-[#e20074] peer-focus-visible:ring-2 peer-focus-visible:ring-[#e20074]/30 peer-focus-visible:ring-offset-1 transition-all flex items-center justify-center group-hover:border-[#e20074]/50">
						<Check
							className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
							strokeWidth={3}
						/>
					</div>
				</div>
				<div className="flex flex-col">
					<span className="text-[0.82rem] font-medium text-[#1a1a2e] leading-snug">
						{label}
					</span>
					{description && (
						<span className="text-[0.7rem] text-[#888]">{description}</span>
					)}
				</div>
			</label>
		);
	}
);
Checkbox.displayName = "Checkbox";
