'use client';

import {
	motion,
} from 'framer-motion';
import {
	Smartphone, Wifi, Phone, Tv, PlusCircle, Router,
} from 'lucide-react';
import Link from 'next/link';

const categories = [
	{
		id: 'MOBILE',
		name: 'Mobilfunk',
		icon: Smartphone,
		href: '/products/MOBILE',
		sub: 'MagentaMobil Tarife für jeden Bedarf.',
		stats: '48 Tarife',
		color: '#e20074',
	},
	{
		id: 'FIBER',
		name: 'Glasfaser',
		icon: Wifi,
		href: '/products/FIBER',
		sub: 'Highspeed Internet mit bis zu 1.000 Mbit/s.',
		stats: '24 Tarife',
		color: '#0090d0',
	},
	{
		id: 'DSL',
		name: 'DSL & VDSL',
		icon: Phone,
		href: '/products/DSL',
		sub: 'Zuverlässiges Internet für Zuhause.',
		stats: '36 Tarife',
		color: '#7b61ff',
	},
	{
		id: 'MAGENTA_TV_OTT',
		name: 'MagentaTV',
		icon: Tv,
		href: '/products/MAGENTA_TV_OTT',
		sub: 'Fernsehen, Streaming und mehr.',
		stats: '12 Pakete',
		color: '#ff6b00',
	},
	{
		id: 'ADDON',
		name: 'Datentarife',
		icon: PlusCircle,
		href: '/products/ADDON',
		sub: 'Surfen mit Tablet oder Laptop.',
		stats: '28 Optionen',
		color: '#00a878',
	},
	{
		id: 'DEVICE',
		name: 'Endgeräte',
		icon: Router,
		href: '/products/DEVICE',
		sub: 'Hardware & Zubehör.',
		stats: '99+ Geräte',
		color: '#e67e22',
	},
];

export function CategoryGrid() {
	return (
		<div
			id="tour-categories"
			className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
		>
			{categories.map((category, index) => (
				<Link
					href={category.href}
					key={category.id}
					className="no-underline tour-category-card"
				>
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
							delay: index * 0.06,
							duration: 0.4,
							ease: 'easeOut',
						}}
						className="
							group relative bg-linear-to-br from-white to-[#fcfafc] border border-[#eaedf0] rounded-2xl p-6
							cursor-pointer flex flex-col justify-between min-h-[180px]
							transition-all duration-500 ease-out overflow-hidden
							hover:border-transparent hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]
						"
						style={
							{
								// CSS variable for per-card color
								'--card-accent': category.color,
							} as React.CSSProperties
						}
					>
						{/* Hover gradient overlay */}
						<div
							className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
							style={{
								background: `linear-gradient(135deg, ${category.color}08 0%, ${category.color}15 50%, ${category.color}05 100%)`,
							}}
						/>

						{/* Shimmer sweep effect on hover */}
						<div
							className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
							style={{
								background: `linear-gradient(105deg, transparent 40%, ${category.color}12 45%, ${category.color}18 50%, ${category.color}12 55%, transparent 60%)`,
								backgroundSize: '200% 100%',
								animation: 'shimmer 2s ease-in-out infinite',
							}}
						/>

						{/* Content */}
						<div className="relative z-10 flex flex-col h-full">
							{/* Icon + Title row */}
							<div className="flex items-start gap-4 mb-3">
								<category.icon
									className="w-7 h-7 shrink-0 mt-0.5 transition-all duration-300 group-hover:scale-110"
									style={{
										color: category.color,
									}}
									strokeWidth={1.8}
								/>
								<div className="flex-1 min-w-0">
									<h3 className="text-[1.1rem] font-semibold text-[#1a1a2e] m-0 leading-tight group-hover:text-(--card-accent) transition-colors duration-300">
										{category.name}
									</h3>
									<p className="text-[0.85rem] text-ds-text-light m-0 mt-1 leading-relaxed">
										{category.sub}
									</p>
								</div>
							</div>

							{/* Bottom: Stats + Arrow */}
							<div className="flex items-center justify-between mt-auto pt-4">
								<span className="text-[0.75rem] font-medium text-[#999] tracking-wide uppercase">
									{category.stats}
								</span>
								<div className="w-8 h-8 rounded-full flex items-center justify-center text-[#ccc] group-hover:text-(--card-accent) group-hover:translate-x-1 transition-all duration-300">
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										strokeWidth="2.5"
										strokeLinecap="round"
										strokeLinejoin="round"
										viewBox="0 0 24 24"
									>
										<path d="M5 12h14M12 5l7 7-7 7" />
									</svg>
								</div>
							</div>
						</div>
					</motion.div>
				</Link>
			))}
		</div>
	);
}
