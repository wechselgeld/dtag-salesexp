"use client";

import { Trash2, ChevronDown, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Credit } from "@/hooks/use-cost-calculator";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Skeleton } from "../skeleton";

interface CreditSelectorProps {
	basketCredits: Credit[];
	setBasketCredits: (credits: Credit[]) => void;
}

export function CreditSelector({
	basketCredits,
	setBasketCredits
}: CreditSelectorProps) {
	const { data: credits, isLoading } =
		trpc.product.getOneTimeCredits.useQuery();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Handle click outside to close the dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	if (isLoading)
		return (
			<div className="py-2 flex flex-col gap-2">
				<Skeleton className="h-10 w-full rounded-lg" />
			</div>
		);

	const activeCredits = credits?.filter((c) => c.isActive) || [];

	if (activeCredits.length === 0 && basketCredits.length === 0) return null;

	const handleAdd = (id: string) => {
		const credit = activeCredits.find((c) => c.id === id);
		if (!credit) return;

		setBasketCredits([
			...basketCredits,
			{ id: credit.id, name: credit.name, value: credit.value }
		]);
		setIsOpen(false); // close after selection
	};

	const handleRemove = (id: string) => {
		setBasketCredits(basketCredits.filter((c) => c.id !== id));
	};

	// Credits that are not yet selected
	const availableCredits = activeCredits.filter(
		(ac) => !basketCredits.some((bc) => bc.id === ac.id)
	);

	return (
		<div className="space-y-2 mt-1">
			{/* Selected Credits */}
			{basketCredits.length > 0 && (
				<div className="flex flex-col gap-1.5">
					{basketCredits.map((credit) => (
						<div
							key={credit.id}
							className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#00a878]/20 bg-[#00a878]/3 shadow-sm"
						>
							<div className="flex flex-col">
								<span className="text-[0.75rem] font-bold text-[#00a878] leading-tight">
									{credit.name}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-[0.7rem] font-bold text-[#00a878]">
									-{credit.value.toFixed(2)} €
								</span>
								<button
									onClick={() => handleRemove(credit.id)}
									className="w-6 h-6 flex items-center justify-center rounded text-[#00a878]/60 hover:bg-[#fee2e2] hover:text-[#dc2626] transition-colors cursor-pointer border-none bg-transparent"
								>
									<Trash2 className="w-3.5 h-3.5" />
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Add Credit Custom Dropdown */}
			{availableCredits.length > 0 && (
				<div className="relative pt-1" ref={dropdownRef}>
					<button
						onClick={() => setIsOpen(!isOpen)}
						className={clsx(
							"w-full flex items-center justify-between bg-[#f7f8fa] border hover:border-[#d0d0d0] rounded-lg px-3 py-2.5 text-[0.75rem] font-medium text-[#1a1a2e] focus:outline-none transition-all cursor-pointer shadow-sm",
							isOpen
								? "border-[#00a878]/50 ring-2 ring-[#00a878]/10"
								: "border-[#eaedf0]"
						)}
					>
						<span className="flex items-center gap-1.5 text-[#555]">
							<Plus className="w-3.5 h-3.5 text-[#00a878]" />
							Gutschrift hinzufügen...
						</span>
						<ChevronDown
							className={clsx(
								"w-3.5 h-3.5 text-[#aaa] transition-transform duration-200",
								isOpen && "rotate-180 text-[#00a878]"
							)}
						/>
					</button>

					<AnimatePresence>
						{isOpen && (
							<motion.div
								initial={{ opacity: 0, y: -5, scale: 0.98 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: -5, scale: 0.98 }}
								transition={{ duration: 0.15, ease: "easeOut" }}
								className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-[#eaedf0] rounded-xl shadow-xl overflow-hidden"
							>
								<div className="max-h-[250px] overflow-y-auto py-1.5 flex flex-col scrollbar-thin scrollbar-thumb-[#eaedf0] scrollbar-track-transparent">
									{availableCredits.map((c) => (
										<button
											key={c.id}
											onClick={() => handleAdd(c.id)}
											className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-[#f7f8fa] transition-colors cursor-pointer border-none outline-none group"
										>
											<span className="text-[0.75rem] font-bold text-[#1a1a2e] group-hover:text-[#00a878] transition-colors">
												{c.name}
											</span>
											<span className="text-[0.7rem] font-bold text-[#00a878] group-hover:scale-105 transition-transform">
												-{c.value.toFixed(2)} €
											</span>
										</button>
									))}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			)}
		</div>
	);
}
