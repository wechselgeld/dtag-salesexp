"use client";

import { Addon, AddonTier } from "@/types/product";
import {
	Check,
	LayoutList,
	PackagePlus,
	ShieldCheck,
	Tv,
	Router
} from "lucide-react";
import clsx from "clsx";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";

interface Props {
	addons: Addon[];
	selectedIds: string[];
	onChange: (ids: string[]) => void;
	isMagentaTVSelected: boolean;
	catColor?: string;
}

export function AddonSelector({
	addons,
	selectedIds,
	onChange,
	isMagentaTVSelected,
	catColor = "#e20074"
}: Props) {
	const { data: designSettings } = trpc.settings.getDesignSettings.useQuery(
		undefined,
		{
			staleTime: 10 * 60 * 1000
		}
	);

	// Filter out addons that require no MagentaTV when MagentaTV is selected
	const availableAddons = addons.filter((addon) => {
		if (addon.requiresNoMagentaTV && isMagentaTVSelected) {
			return false;
		}
		if (!addon.tiers || addon.tiers.length === 0) return false;
		return true;
	});

	if (availableAddons.length === 0) return null;

	const handleToggle = (addon: Addon, tierId: string) => {
		const tierIdsForThisAddon = addon.tiers.map((t) => t.id);

		if (selectedIds.includes(tierId)) {
			// Unselect if already selected
			onChange(selectedIds.filter((x) => x !== tierId));
		} else {
			// Remove any other selected tier of THIS addon, then add new tier
			const newIds = selectedIds.filter(
				(id) => !tierIdsForThisAddon.includes(id)
			);
			onChange([...newIds, tierId]);
		}
	};

	// Smart icon logic
	const getIcon = (name: string) => {
		const lower = name.toLowerCase();
		if (lower.includes("router") || lower.includes("speed")) return Router;
		if (lower.includes("security") || lower.includes("schutz"))
			return ShieldCheck;
		if (
			lower.includes("tv") ||
			lower.includes("netflix") ||
			lower.includes("disney")
		)
			return Tv;
		if (lower.includes("paket") || lower.includes("bundle")) return PackagePlus;
		return LayoutList;
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
			{availableAddons.map((addon) => {
				const Icon = getIcon(addon.name);

				const selectedTierId = addon.tiers.find((t) =>
					selectedIds.includes(t.id)
				)?.id;
				const isMultiTier = addon.tiers.length > 1;
				const hasSelected = !!selectedTierId;

				const isMagentaTV = addon.name.toLowerCase().includes("magentatv");
				const globalImageUrl = isMagentaTV
					? designSettings?.magentatv_background_image
					: null;
				const finalImageUrl = addon.imageUrl || globalImageUrl;
				const showImageBg = hasSelected && !!finalImageUrl;

				return (
					<div
						key={addon.id}
						className={clsx(
							"relative p-3.5 rounded-xl border transition-all duration-200 overflow-hidden",
							hasSelected && !showImageBg ? "bg-white" : "",
							!hasSelected ? "bg-white hover:border-[#ccc]" : "",
							showImageBg ? "text-white" : "",
							isMultiTier
								? "col-span-1 lg:col-span-2"
								: "col-span-1 flex flex-col justify-center"
						)}
						style={{
							borderColor: hasSelected ? catColor : "#eaedf0",
							boxShadow: hasSelected ? `0 0 0 1px ${catColor} inset` : "none"
						}}
					>
						{/* Background Image Overlay */}
						{finalImageUrl && (
							<div
								className={clsx(
									"absolute -inset-0.5 z-0 transition-opacity duration-400 pointer-events-none",
									hasSelected ? "opacity-100" : "opacity-0"
								)}
							>
								<div
									className="absolute inset-0 bg-cover bg-center blur-[2px] scale-110"
									style={{ backgroundImage: `url(${finalImageUrl})` }}
								/>
								<div className="absolute inset-0 bg-[#1a1a2e]/40" />
							</div>
						)}

						<div
							className={clsx(
								"flex gap-3 relative z-10",
								isMultiTier
									? "flex-col sm:flex-row sm:items-center"
									: "flex-row items-center justify-between"
							)}
						>
							<div className="flex items-center gap-3 flex-1 min-w-0">
								<div
									className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors"
									style={{
										backgroundColor: hasSelected ? catColor : "#f4f5f7",
										color: hasSelected ? "white" : catColor,
										border: hasSelected ? "none" : `1px solid ${catColor}20`
									}}
								>
									<Icon
										className="w-5 h-5"
										strokeWidth={hasSelected ? 2 : 1.5}
									/>
								</div>
								<div className="flex-1 min-w-0">
									<h3
										className={clsx(
											"font-bold text-[0.9rem] m-0 truncate leading-snug transition-colors",
											showImageBg ? "text-white" : "text-[#1a1a2e]"
										)}
									>
										{addon.name}
									</h3>
									<p
										className={clsx(
											"text-[0.72rem] m-0 line-clamp-1 leading-snug mt-0.5 transition-colors",
											showImageBg ? "text-[#ccc]" : "text-[#888]"
										)}
									>
										{addon.description || "Zusatzoption"}
									</p>
								</div>
							</div>

							{/* Single Tier Action */}
							{addon.tiers.length === 1 &&
								(() => {
									const tier = addon.tiers[0];
									const isSelected = selectedIds.includes(tier.id);
									return (
										<motion.button
											whileTap={{ scale: 0.98 }}
											onClick={() => handleToggle(addon, tier.id)}
											className="flex items-center justify-between gap-3 shrink-0 px-2 py-1.5 rounded-lg outline-none cursor-pointer group transition-colors hover:bg-black/5 border-none bg-transparent ml-auto"
										>
											<div className="text-right">
												<div
													className="text-[0.85rem] font-bold drop-shadow-sm"
													style={{ color: showImageBg ? "#fff" : catColor }}
												>
													+{tier.price.toFixed(2)} €
												</div>
											</div>
											<div
												className="w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-all duration-200"
												style={{
													borderColor: isSelected ? catColor : "#ccc",
													backgroundColor: isSelected ? catColor : "transparent"
												}}
											>
												{isSelected && (
													<Check
														className="w-2.5 h-2.5 text-white"
														strokeWidth={3}
													/>
												)}
											</div>
										</motion.button>
									);
								})()}
						</div>

						{/* Multi Tier Actions */}
						{addon.tiers.length > 1 && (
							<div className="mt-3 sm:pl-13 flex flex-wrap gap-2 relative z-10">
								{addon.tiers
									.sort((a, b) => a.price - b.price)
									.map((tier) => {
										const isSelected = selectedIds.includes(tier.id);
										return (
											<motion.button
												key={tier.id}
												whileTap={{ scale: 0.98 }}
												onClick={() => handleToggle(addon, tier.id)}
												className="px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all duration-200 text-[0.75rem] font-semibold flex-1 sm:flex-none justify-center cursor-pointer outline-none hover:-translate-y-px hover:shadow-sm active:scale-[0.98]"
												style={{
													borderColor: isSelected ? catColor : "#eaedf0",
													backgroundColor: isSelected ? catColor : "#fff",
													color: isSelected ? "white" : "#1a1a2e"
												}}
											>
												<span className="truncate">{tier.name}</span>
												<span
													className="opacity-90 font-bold shrink-0"
													style={{
														color: isSelected ? "white" : catColor
													}}
												>
													+{tier.price.toFixed(2)}€
												</span>
											</motion.button>
										);
									})}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
