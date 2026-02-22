"use client";

import { CategoryGrid } from "@/components/category-grid";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
	return (
		<div className="min-h-full">
			{/* Header Section */}
			<div className="text-center mb-10 pt-4">
				<motion.h1
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.05, duration: 0.4 }}
					className="text-[2.2rem] md:text-[2.8rem] font-extrabold text-[#1a1a2e] mb-2 tracking-tight"
				>
					Produktkategorien
				</motion.h1>
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1, duration: 0.4 }}
					className="text-[1rem] text-[#888] font-normal"
				>
					Wähle eine Kategorie, um den passenden Tarif zu finden.
				</motion.p>
			</div>

			{/* Centered Search Bar */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.15, duration: 0.4 }}
				className="max-w-[640px] mx-auto mb-12"
			>
				<div className="relative group">
					<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#e20074]/10 via-[#e20074]/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />
					<div className="relative flex items-center bg-[#f7f8fa] border border-[#e5e7eb] rounded-2xl px-5 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus-within:border-[#e20074]/40 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(226,0,116,0.06),0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-400">
						<Search className="text-[#b0b0b0] w-5 h-5 mr-3 flex-shrink-0 group-focus-within:text-[#e20074] transition-colors duration-300" />
						<input
							type="text"
							id="global-search-input"
							placeholder="Tarif, Produkt oder Option suchen..."
							className="border-none outline-none w-full font-sans text-[1rem] text-[#262626] bg-transparent placeholder:text-[#b0b0b0] placeholder:font-normal"
						/>
						<kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[0.7rem] font-medium text-[#b0b0b0] bg-white border border-[#e5e7eb] rounded-lg ml-3 flex-shrink-0 whitespace-nowrap">
							⌘ K
						</kbd>
					</div>
				</div>
			</motion.div>

			{/* Category Grid */}
			<CategoryGrid />
		</div>
	);
}
