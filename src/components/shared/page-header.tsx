'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { TelekomLogo } from '@/components/shared/telekom-logo';

interface PageHeaderProps {
	title: string;
	description: string;
	className?: string;
	logoClassName?: string;
}

export function PageHeader({
	title,
	description,
	className,
	logoClassName,
}: PageHeaderProps) {
	return (
		<motion.div
			initial={{
				opacity: 0,
				y: 12,
			}}
			animate={{
				opacity: 1,
				y: 0,
			}}
			transition={{
				duration: 0.5,
				ease: [
					0.16,
					1,
					0.3,
					1,
				],
			}}
			className={clsx('flex flex-col items-center mb-10 text-center', className)}
		>
			<TelekomLogo className={clsx('w-12 h-12 text-[#e20074] mb-8', logoClassName)} />
			<h1 className="text-3xl sm:text-[2.5rem] font-extrabold text-[#1a1a2e] tracking-tight mb-3 leading-none">
				{title}
			</h1>
			<p className="text-[1.05rem] text-[#888] font-normal leading-relaxed max-w-xl mx-auto mt-1">
				{description}
			</p>
		</motion.div>
	);
}
