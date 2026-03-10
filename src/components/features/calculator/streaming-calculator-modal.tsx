"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator, Plus, Minus, Check } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { trpc } from "@/lib/trpc";
import { DEFAULT_PRICING } from "@/hooks/use-cost-calculator";

interface StreamingCalculatorModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const STREAMING_SERVICES = [
	{
		id: "hd-tv",
		name: "HD-Fernsehen (Kabel, Waipu, etc.)",
		tierName: "Kabel, Waipu, etc.",
		price: 9.0,
		group: "tv",
		groupName: "HD-Fernsehen"
	},
	{
		id: "netflix-ads",
		name: "Netflix S. m. Werbung",
		tierName: "S. m. Werbung",
		price: 4.99,
		group: "netflix",
		groupName: "Netflix"
	},
	{
		id: "netflix-std",
		name: "Netflix Standard",
		tierName: "Standard",
		price: 13.99,
		group: "netflix",
		groupName: "Netflix"
	},
	{
		id: "netflix-prem",
		name: "Netflix Premium",
		tierName: "Premium",
		price: 19.99,
		group: "netflix",
		groupName: "Netflix"
	},
	{
		id: "disney-ads",
		name: "Disney+ S. m. Werbung",
		tierName: "S. m. Werbung",
		price: 5.99,
		group: "disney",
		groupName: "Disney+"
	},
	{
		id: "disney-std",
		name: "Disney+ Standard",
		tierName: "Standard",
		price: 8.99,
		group: "disney",
		groupName: "Disney+"
	},
	{
		id: "disney-prem",
		name: "Disney+ Premium",
		tierName: "Premium",
		price: 11.99,
		group: "disney",
		groupName: "Disney+"
	},
	{
		id: "rtl-prem",
		name: "RTL+ Premium",
		tierName: "Premium",
		price: 8.99,
		group: "rtl",
		groupName: "RTL+"
	},
	{
		id: "rtl-max",
		name: "RTL+ Max",
		tierName: "Max",
		price: 12.99,
		group: "rtl",
		groupName: "RTL+"
	},
	{
		id: "apple-tv",
		name: "AppleTV+",
		tierName: "AppleTV+",
		price: 9.99,
		group: "apple",
		groupName: "AppleTV+"
	}
];

const MAGENTA_PLANS = [
	{
		id: "mtv-smart",
		name: "MagentaTV Smart",
		price: 10.0,
		includes: [
			{ name: "HD-Fernsehen", id: "hd-tv", group: "tv" },
			{ name: "MagentaTV+", id: null, group: null },
			{ name: "RTL+ Premium", id: "rtl-prem", group: "rtl" }
		],
		includedServiceIds: ["hd-tv", "rtl-prem"] // Note: MagentaTV+ has no direct 1:1 competitor here
	},
	{
		id: "mtv-smartstream",
		name: "MagentaTV SmartStream",
		price: 17.0,
		includes: [
			{ name: "HD-Fernsehen", id: "hd-tv", group: "tv" },
			{ name: "MagentaTV+", id: null, group: null },
			{
				name: "Netflix S. m. Werbung",
				id: "netflix-ads",
				group: "netflix"
			},
			{ name: "Disney+ S. m. Werbung", id: "disney-ads", group: "disney" },
			{ name: "RTL+ Premium", id: "rtl-prem", group: "rtl" }
		],
		includedServiceIds: ["hd-tv", "netflix-ads", "disney-ads", "rtl-prem"]
	},
	{
		id: "mtv-megastream",
		name: "MagentaTV MegaStream",
		price: 30.0,
		includes: [
			{ name: "HD-Fernsehen", id: "hd-tv", group: "tv" },
			{ name: "MagentaTV+", id: null, group: null },
			{ name: "Netflix Standard", id: "netflix-std", group: "netflix" },
			{ name: "Disney+ Standard", id: "disney-std", group: "disney" },
			{ name: "RTL+ Premium", id: "rtl-prem", group: "rtl" },
			{ name: "AppleTV+", id: "apple-tv", group: "apple" }
		],
		includedServiceIds: [
			"hd-tv",
			"netflix-std",
			"disney-std",
			"rtl-prem",
			"apple-tv"
		]
	}
];

export function StreamingCalculatorModal({
	isOpen,
	onClose
}: StreamingCalculatorModalProps) {
	const [selectedServices, setSelectedServices] = useState<string[]>([]);
	const [selectedPlan, setSelectedPlan] = useState<string>("mtv-smartstream");
	const [mounted, setMounted] = useState(false);

	const { data: pricingSettings } = trpc.settings.getPricingSettings.useQuery(
		undefined,
		{
			staleTime: 10 * 60 * 1000
		}
	);
	const settings = pricingSettings || DEFAULT_PRICING;

	const dynamicPlans = useMemo(
		() =>
			MAGENTA_PLANS.map((plan) => {
				if (plan.id === "mtv-smart")
					return { ...plan, price: settings.magentatv_smart_price };
				if (plan.id === "mtv-smartstream")
					return { ...plan, price: settings.magentatv_smartstream_price };
				if (plan.id === "mtv-megastream")
					return { ...plan, price: settings.magentatv_megastream_price };
				return plan;
			}),
		[settings]
	);

	useEffect(() => setMounted(true), []);

	const groupedServices = useMemo(() => {
		const groups: {
			[key: string]: { name: string; tiers: typeof STREAMING_SERVICES };
		} = {};
		STREAMING_SERVICES.forEach((service) => {
			if (!groups[service.group]) {
				groups[service.group] = {
					name: service.groupName,
					tiers: []
				};
			}
			groups[service.group].tiers.push(service);
		});
		return Object.entries(groups).map(([groupId, data]) => ({
			groupId,
			name: data.name,
			tiers: data.tiers
		}));
	}, []);

	const toggleService = (id: string, group: string) => {
		setSelectedServices((prev) => {
			if (prev.includes(id)) return prev.filter((s) => s !== id);

			const filtered = prev.filter((sId) => {
				const service = STREAMING_SERVICES.find((s) => s.id === sId);
				return service?.group !== group;
			});
			return [...filtered, id];
		});
	};

	const currentCosts = useMemo(() => {
		return selectedServices.reduce((sum, id) => {
			const service = STREAMING_SERVICES.find((s) => s.id === id);
			return sum + (service?.price || 0);
		}, 0);
	}, [selectedServices]);

	const targetPlan = useMemo(() => {
		return dynamicPlans.find((p) => p.id === selectedPlan);
	}, [selectedPlan, dynamicPlans]);

	const coveredValue = useMemo(() => {
		return selectedServices.reduce((sum, currentServiceId) => {
			const currentService = STREAMING_SERVICES.find(
				(s) => s.id === currentServiceId
			);
			if (!currentService || !targetPlan) return sum;

			const includedServiceIdForGroup = targetPlan.includedServiceIds.find(
				(incId) => {
					const incService = STREAMING_SERVICES.find((s) => s.id === incId);
					return incService?.group === currentService.group;
				}
			);

			if (includedServiceIdForGroup) {
				const includedService = STREAMING_SERVICES.find(
					(s) => s.id === includedServiceIdForGroup
				)!;
				return sum + Math.min(currentService.price, includedService.price);
			}
			return sum;
		}, 0);
	}, [selectedServices, targetPlan]);

	const savings = coveredValue - (targetPlan?.price || 0);
	const paysMore = savings < 0;

	if (!mounted) return null;

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="absolute inset-0 bg-white/60 backdrop-blur-md"
					/>

					{/* Modal */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
						className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[#eaedf0] overflow-hidden flex flex-col max-h-[90vh]"
					>
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 rounded-[0.8rem] bg-[#e20074]/10 text-[#e20074] flex items-center justify-center">
									<Calculator className="w-5 h-5" />
								</div>
								<div>
									<h2 className="text-[1.1rem] font-extrabold text-[#1a1a2e] mb-0 tracking-tight">
										Sparvorteil-Rechner
									</h2>
									<p className="text-[0.75rem] text-[#888] font-medium">
										Bestehende Streaming-Abos gegen MagentaTV gegenrechnen
									</p>
								</div>
							</div>
							<button
								onClick={onClose}
								className="w-8 h-8 rounded-full bg-white border border-[#eaedf0] flex items-center justify-center text-[#888] hover:text-[#1a1a2e] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						{/* Content */}
						<div className="flex-1 overflow-y-auto px-6 py-5">
							<div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6 xl:gap-8">
								{/* Left: Current Services */}
								<div className="flex flex-col h-full">
									<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] mb-4 pl-1 tracking-tight">
										Was nutzt der Kunde heute?
									</h3>
									<div className="flex flex-col gap-3.5 mb-2">
										{groupedServices.map((group) => {
											return (
												<div
													key={group.groupId}
													className="bg-[#f7f8fa] px-4 py-3.5 rounded-[1.25rem] border border-[#eaedf0] flex flex-col gap-2.5"
												>
													<span className="font-bold text-[#1a1a2e] text-[0.8rem] px-1 tracking-wide">
														{group.name}
													</span>
													<div className="flex flex-wrap gap-2">
														{group.tiers.map((tier) => {
															const isSelected = selectedServices.includes(
																tier.id
															);
															return (
																<button
																	key={tier.id}
																	onClick={() =>
																		toggleService(tier.id, tier.group)
																	}
																	className={clsx(
																		"flex-1 min-w-[120px] flex items-center justify-between px-3.5 py-2.5 rounded-[0.8rem] border bg-white transition-all duration-200 cursor-pointer overflow-hidden",
																		isSelected
																			? "border-[#e20074] ring-1 ring-[#e20074] bg-[#e20074]/5 shadow-[0_2px_10px_-4px_rgba(226,0,116,0.2)]"
																			: "border-[#eaedf0] hover:border-[#d0d0d0] shadow-sm"
																	)}
																>
																	<span
																		className={clsx(
																			"text-[0.75rem] font-semibold whitespace-nowrap overflow-hidden text-ellipsis mr-2 transition-colors",
																			isSelected
																				? "text-[#e20074]"
																				: "text-[#1a1a2e]"
																		)}
																	>
																		{tier.tierName}
																	</span>
																	<span
																		className={clsx(
																			"text-[0.75rem] font-bold whitespace-nowrap transition-colors",
																			isSelected
																				? "text-[#e20074]"
																				: "text-[#888]"
																		)}
																	>
																		{tier.price.toFixed(2)} €
																	</span>
																</button>
															);
														})}
													</div>
												</div>
											);
										})}
									</div>
								</div>

								{/* Right: MagentaTV Plans & Result */}
								<div className="flex flex-col h-full">
									<h3 className="text-[1rem] font-bold text-[#1a1a2e] mb-5 pl-1 tracking-tight">
										Gewünschter Tarif
									</h3>
									<div className="flex flex-col gap-4 mb-8">
										{dynamicPlans.map((plan) => {
											const isSelected = selectedPlan === plan.id;
											return (
												<button
													key={plan.id}
													onClick={() => setSelectedPlan(plan.id)}
													className={clsx(
														"w-full flex flex-col p-3.5 rounded-[1rem] border text-left transition-all duration-300 cursor-pointer relative",
														isSelected
															? "border-[#e20074] bg-[#e20074]/[0.02] shadow-[0_4px_15px_-8px_rgba(226,0,116,0.2)] z-10"
															: "border-[#eaedf0] bg-white hover:border-[#d0d0d0]"
													)}
												>
													<div className="flex items-center justify-between mb-2.5 leading-none">
														<span
															className={clsx(
																"text-[0.95rem] font-extrabold tracking-tight",
																isSelected ? "text-[#e20074]" : "text-[#1a1a2e]"
															)}
														>
															{plan.name}
														</span>
														<span
															className={clsx(
																"text-[0.95rem] font-extrabold",
																isSelected ? "text-[#e20074]" : "text-[#888]"
															)}
														>
															{plan.price.toFixed(2)} €
														</span>
													</div>
													<div className="flex flex-wrap gap-1.5">
														{plan.includes.map((inc, i) => {
															const isGroupSelected =
																inc.group &&
																selectedServices.some((sId) => {
																	const s = STREAMING_SERVICES.find(
																		(x) => x.id === sId
																	);
																	return s && s.group === inc.group;
																});
															return (
																<span
																	key={i}
																	className={clsx(
																		"text-[0.65rem] px-1.5 py-0.5 rounded transition-colors",
																		isGroupSelected
																			? "bg-[#dcfce7] text-[#16a34a] font-bold"
																			: "bg-[#f0f0f0] text-[#555] font-medium"
																	)}
																>
																	{inc.name}
																</span>
															);
														})}
													</div>
													<div className="mt-2 text-[0.65rem] text-[#888] font-medium border-t border-[#f0f0f0] pt-1.5">
														Preis bei Einzelbuchung:{" "}
														<span className="text-[#555] font-semibold">
															{plan.includedServiceIds
																.reduce((sum, id) => {
																	const s = STREAMING_SERVICES.find(
																		(x) => x.id === id
																	);
																	return sum + (s?.price || 0);
																}, 0)
																.toFixed(2)}{" "}
															€
														</span>
													</div>
												</button>
											);
										})}
									</div>

									{/* Total calculation Box */}
									<div className="mt-auto bg-[#181822] rounded-[1.25rem] p-6 text-white shadow-xl flex flex-col justify-between">
										<div className="flex items-start justify-between border-b border-white/10 pb-5 mb-5">
											<div className="flex flex-col">
												<span className="text-[0.65rem] text-white/50 uppercase tracking-widest font-bold mb-1.5">
													Bisherige Kosten
												</span>
												<span className="text-[1.3rem] font-bold flex items-center overflow-hidden h-[1.8rem]">
													<AnimatePresence mode="popLayout">
														<motion.span
															key={currentCosts}
															initial={{ opacity: 0, y: -20 }}
															animate={{ opacity: 1, y: 0 }}
															exit={{ opacity: 0, y: 20 }}
															transition={{
																duration: 0.2,
																type: "spring",
																stiffness: 300,
																damping: 25
															}}
															className="inline-block"
														>
															{currentCosts.toFixed(2)}
														</motion.span>
													</AnimatePresence>
													<span className="ml-[3px]">€</span>
												</span>
											</div>

											{/* Divider line instead of explicit minus */}
											<div className="h-px w-8 bg-white/20 mt-5 mx-2" />

											<div className="flex flex-col items-end">
												<span className="text-[0.6rem] text-white/50 uppercase tracking-wider font-bold mb-1">
													Neuer Tarif
												</span>
												<span className="text-[1.1rem] font-bold flex items-center overflow-hidden h-[1.5rem]">
													<AnimatePresence mode="popLayout">
														<motion.span
															key={targetPlan?.price || 0}
															initial={{ opacity: 0, y: -20 }}
															animate={{ opacity: 1, y: 0 }}
															exit={{ opacity: 0, y: 20 }}
															transition={{
																duration: 0.2,
																type: "spring",
																stiffness: 300,
																damping: 25
															}}
															className="inline-block"
														>
															{targetPlan?.price.toFixed(2)}
														</motion.span>
													</AnimatePresence>
													<span className="ml-[3px]">€</span>
												</span>
											</div>
										</div>

										<div className="flex items-end justify-between relative z-10">
											<div className="flex flex-col">
												<span className="text-[0.75rem] font-medium text-white/70 mb-0.5">
													{paysMore
														? "Kunde zahlt effektiv mehr:"
														: "Ersparnis pro Monat:"}
												</span>
												<span className="text-[0.6rem] text-white/40 max-w-[150px] leading-tight">
													Verglichen mit der Einzelbuchung der gebündelten
													Dienste.
												</span>
											</div>
											<div
												className={clsx(
													"text-[2rem] font-extrabold tracking-tighter leading-none flex items-center overflow-hidden h-[2.5rem] pt-1",
													paysMore ? "text-[#FFB020]" : "text-[#00a878]"
												)}
											>
												{paysMore ? "+" : ""}
												<AnimatePresence mode="popLayout">
													<motion.span
														key={savings}
														initial={{ opacity: 0, y: -30 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: 30 }}
														transition={{
															duration: 0.2,
															type: "spring",
															stiffness: 300,
															damping: 25
														}}
														className="inline-block"
													>
														{Math.abs(savings).toFixed(2)}
													</motion.span>
												</AnimatePresence>
												<span className="ml-[5px]">€</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body
	);
}
