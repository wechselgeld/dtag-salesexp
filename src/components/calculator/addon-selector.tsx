"use client";

import { Addon, AddonTier } from "@/hooks/use-cost-calculator";
import {
	Check,
	LayoutList,
	PackagePlus,
	Plus,
	ShieldCheck,
	Tv,
	Router
} from "lucide-react";
import clsx from "clsx";

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
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
			{availableAddons.map((addon) => {
				const Icon = getIcon(addon.name);

				// If Addon only has 1 tier, render simple card
				if (addon.tiers.length === 1) {
					const tier = addon.tiers[0];
					const isSelected = selectedIds.includes(tier.id);
					return (
						<AddonCard
							key={addon.id}
							addon={addon}
							tier={tier}
							isSelected={isSelected}
							onToggle={() => handleToggle(addon, tier.id)}
							catColor={catColor}
							icon={Icon}
						/>
					);
				}

				// If Addon has multiple tiers, render grouped card
				const selectedTierId = addon.tiers.find((t) =>
					selectedIds.includes(t.id)
				)?.id;
				const hasSelected = !!selectedTierId;

				return (
					<div
						key={addon.id}
						className="col-span-1 sm:col-span-2 relative p-4 rounded-xl border transition-all duration-200"
						style={{
							borderColor: hasSelected ? catColor : "#eaedf0",
							backgroundColor: hasSelected ? `${catColor}03` : "#fafafa",
							boxShadow: hasSelected ? `0 0 0 1px ${catColor} inset` : "none"
						}}
					>
						<div className="flex items-center gap-3 mb-4">
							<div
								className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
								style={{
									backgroundColor: hasSelected ? catColor : "white",
									color: hasSelected ? "white" : catColor,
									border: hasSelected ? "none" : `1px solid ${catColor}30`,
									boxShadow: hasSelected ? `0 4px 12px ${catColor}40` : "none"
								}}
							>
								<Icon className="w-5 h-5" strokeWidth={hasSelected ? 2 : 1.5} />
							</div>
							<div>
								<h3 className="font-bold text-[0.95rem] text-[#1a1a2e] m-0">
									{addon.name}
								</h3>
								<p className="text-[0.75rem] text-[#888] m-0">
									Wähle eine Variante
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{addon.tiers
								.sort((a, b) => a.price - b.price)
								.map((tier) => {
									const isSelected = selectedTierId === tier.id;
									return (
										<button
											key={tier.id}
											onClick={() => handleToggle(addon, tier.id)}
											className="relative text-left p-3 rounded-xl border flex items-center justify-between gap-3 transition-all duration-200 group bg-white hover:bg-[#f7f8fa]"
											style={{
												borderColor: isSelected ? catColor : "#eaedf0",
												boxShadow: isSelected
													? `0 0 0 1px ${catColor} inset`
													: "none"
											}}
										>
											<div className="flex-1 min-w-0 pr-8">
												<div className="font-bold text-[0.8rem] text-[#1a1a2e] mb-0.5 truncate">
													{tier.name}
												</div>
												<div
													className="text-[0.78rem] font-extrabold"
													style={{ color: catColor }}
												>
													+{tier.price.toFixed(2)} €{" "}
													<span className="text-[0.65rem] font-medium opacity-70">
														/Monat
													</span>
												</div>
											</div>

											{/* Selection Radio Circle */}
											<div
												className="absolute top-1/2 -translate-y-1/2 right-3 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0"
												style={{
													borderColor: isSelected ? catColor : "#ccc",
													backgroundColor: isSelected ? catColor : "transparent"
												}}
											>
												{isSelected && (
													<div className="w-[6px] h-[6px] rounded-full bg-white" />
												)}
											</div>
										</button>
									);
								})}
						</div>
					</div>
				);
			})}
		</div>
	);
}

function AddonCard({
	addon,
	tier,
	isSelected,
	onToggle,
	catColor,
	icon: Icon
}: {
	addon: Addon;
	tier: AddonTier;
	isSelected: boolean;
	onToggle: () => void;
	catColor: string;
	icon: any;
}) {
	return (
		<button
			onClick={onToggle}
			className="relative text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all duration-200 group col-span-1"
			style={{
				borderColor: isSelected ? catColor : "#eaedf0",
				backgroundColor: isSelected ? `${catColor}08` : "#fafafa",
				boxShadow: isSelected ? `0 0 0 1px ${catColor} inset` : "none"
			}}
		>
			{/* Icon */}
			<div
				className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200"
				style={{
					backgroundColor: isSelected ? catColor : "white",
					color: isSelected ? "white" : catColor,
					border: isSelected ? "none" : `1px solid ${catColor}30`,
					boxShadow: isSelected ? `0 4px 12px ${catColor}40` : "none"
				}}
			>
				<Icon className="w-5 h-5" strokeWidth={isSelected ? 2 : 1.5} />
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0 pr-8">
				<div className="flex items-center gap-2 mb-0.5">
					<h3 className="font-bold text-[0.85rem] text-[#1a1a2e] m-0 leading-snug">
						{addon.name}
					</h3>
				</div>

				<div className="text-[0.72rem] text-[#888] line-clamp-2 leading-tight">
					{addon.description || tier.name || "Zusätzliche Option hinzubuchen"}
				</div>

				<div
					className="mt-2 text-[0.78rem] font-extrabold"
					style={{ color: catColor }}
				>
					+{tier.price.toFixed(2)} €{" "}
					<span className="text-[0.65rem] font-medium opacity-70">/Monat</span>
				</div>
			</div>

			{/* Selection Check Circle */}
			<div
				className="absolute top-1/2 -translate-y-1/2 right-3 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0"
				style={{
					borderColor: isSelected ? catColor : "#ccc",
					backgroundColor: isSelected ? catColor : "transparent"
				}}
			>
				{isSelected && (
					<Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
				)}
				{!isSelected && (
					<Plus className="w-2.5 h-2.5 text-[#ccc] group-hover:text-[#aaa]" />
				)}
			</div>
		</button>
	);
}
