"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

interface TooltipProps {
	content: React.ReactNode;
	children: React.ReactNode;
	className?: string;
	position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
	content,
	children,
	className,
	position = "top"
}: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false);

	const positionClasses = {
		top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
		bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
		left: "right-full top-1/2 -translate-y-1/2 mr-2",
		right: "left-full top-1/2 -translate-y-1/2 ml-2"
	};

	const arrowClasses = {
		top: "top-full left-1/2 -translate-x-1/2 border-t-[#1a1a2e]",
		bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-[#1a1a2e]",
		left: "left-full top-1/2 -translate-y-1/2 border-l-[#1a1a2e]",
		right: "right-full top-1/2 -translate-y-1/2 border-r-[#1a1a2e]"
	};

	return (
		<div
			className={clsx("relative inline-block", className)}
			onMouseEnter={() => setIsVisible(true)}
			onMouseLeave={() => setIsVisible(false)}
			onFocus={() => setIsVisible(true)}
			onBlur={() => setIsVisible(false)}
		>
			{children}
			<AnimatePresence>
				{isVisible && content && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
						className={clsx(
							"absolute z-50 px-3 py-2 bg-[#1a1a2e] text-white text-[0.72rem] font-medium rounded-xl shadow-xl whitespace-nowrap pointer-events-none border border-white/10 backdrop-blur-md",
							positionClasses[position]
						)}
					>
						{content}
						<div
							className={clsx(
								"absolute w-0 h-0 border-[6px] border-transparent",
								arrowClasses[position]
							)}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
