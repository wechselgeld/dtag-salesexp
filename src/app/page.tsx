'use client';

import {
	CategoryGrid,
} from '@/components/features/products/category-grid';
import {
	SearchBar,
} from '@/components/features/search/search-bar';
import {
	motion,
} from 'framer-motion';

export default function Home() {
	return (
		<div className="min-h-full">
			{/* Header Section */}
			<div className="text-center mb-10 pt-4">
				<motion.h1
					initial={{
						opacity: 0,
						y: 10,
					}}
					animate={{
						opacity: 1,
						y: 0,
					}}
					transition={{
						delay: 0.05,
						duration: 0.4,
					}}
					className="text-[2.2rem] md:text-[2.8rem] font-extrabold text-[#1a1a2e] mb-2 tracking-tight"
				>
					Produktkategorien
				</motion.h1>
				<motion.p
					initial={{
						opacity: 0,
						y: 10,
					}}
					animate={{
						opacity: 1,
						y: 0,
					}}
					transition={{
						delay: 0.1,
						duration: 0.4,
					}}
					className="text-[1rem] text-[#888] font-normal"
				>
					Wähle eine Kategorie, um den passenden Tarif zu finden.
				</motion.p>
			</div>

			{/* Centered Search Bar */}
			<motion.div
				initial={{
					opacity: 0,
					y: 10,
				}}
				animate={{
					opacity: 1,
					y: 0,
				}}
				transition={{
					delay: 0.15,
					duration: 0.4,
				}}
				className="max-w-[640px] mx-auto mb-12"
			>
				<SearchBar />
			</motion.div>

			{/* Category Grid */}
			<CategoryGrid />
		</div>
	);
}
