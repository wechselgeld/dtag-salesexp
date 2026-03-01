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
		id: "netflix-ads",
		name: "Netflix Standard (Werbung)",
		price: 4.99,
		group: "netflix"
	},
	{
		id: "netflix-std",
		name: "Netflix Standard",
		price: 13.99,
		group: "netflix"
	},
	{
		id: "netflix-prem",
		name: "Netflix Premium",
		price: 19.99,
		group: "netflix"
	},
	{ id: "disney-ads", name: "Disney+ (Werbung)", price: 5.99, group: "disney" },
	{ id: "disney-std", name: "Disney+ Standard", price: 8.99, group: "disney" },
	{ id: "disney-prem", name: "Disney+ Premium", price: 11.99, group: "disney" },
	{ id: "rtl-prem", name: "RTL+ Premium", price: 8.99, group: "rtl" },
	{ id: "rtl-max", name: "RTL+ Max", price: 12.99, group: "rtl" },
	{ id: "apple-tv", name: "AppleTV+", price: 9.99, group: "apple" },
	{
		id: "hd-tv",
		name: "HD-Fernsehen (Kabel, Waipu, etc.)",
		price: 10.0,
		group: "tv"
	}
];

const MAGENTA_PLANS = [
	{
		id: "mtv-smart",
		name: "MagentaTV Smart",
		price: 10.0,
		includes: ["HD-Fernsehen", "MagentaTV+", "RTL+ Premium"],
		includedServiceIds: ["hd-tv", "rtl-prem"] // Note: MagentaTV+ has no direct 1:1 competitor here
	},
	{
		id: "mtv-smartstream",
		name: "MagentaTV SmartStream",
		price: 17.0,
		includes: [
			"HD-Fernsehen",
			"Netflix Standard (Werbung)",
			"Disney+ Standard (Werbung)",
			"RTL+ Premium"
		],
		includedServiceIds: ["hd-tv", "netflix-ads", "disney-ads", "rtl-prem"]
	},
	{
		id: "mtv-megastream",
		name: "MagentaTV MegaStream",
		price: 30.0,
		includes: [
			"HD-Fernsehen",
			"Netflix Standard",
			"Disney+ Standard",
			"RTL+ Premium",
			"AppleTV+"
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

	const { data: pricingSettings } = trpc.settings.getPricingSettings.useQuery();
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
						className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[#eaedf0] overflow-hidden flex flex-col max-h-[90vh]"
					>
						{/* Header */}
						<div className="flex items-center justify-between px-8 py-6 border-b border-[#f0f0f0]">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-[1rem] bg-[#e20074]/10 text-[#e20074] flex items-center justify-center">
									<Calculator className="w-6 h-6" />
								</div>
								<div>
									<h2 className="text-[1.2rem] font-extrabold text-[#1a1a2e] mb-0.5 tracking-tight">
										Sparvorteil-Rechner
									</h2>
									<p className="text-[0.85rem] text-[#888] font-medium">
										Bestehende Streaming-Abos gegen MagentaTV gegenrechnen
									</p>
								</div>
							</div>
							<button
								onClick={onClose}
								className="w-10 h-10 rounded-full bg-white border border-[#eaedf0] flex items-center justify-center text-[#888] hover:text-[#1a1a2e] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Content */}
						<div className="flex-1 overflow-y-auto p-8">
							<div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 xl:gap-14">
								{/* Left: Current Services */}
								<div className="flex flex-col h-full">
									<h3 className="text-[1rem] font-bold text-[#1a1a2e] mb-5 pl-1 tracking-tight">
										Was nutzt der Kunde heute?
									</h3>
									<div className="flex flex-col gap-3 mb-8">
										{STREAMING_SERVICES.map((service) => {
											const isSelected = selectedServices.includes(service.id);
											return (
												<button
													key={service.id}
													onClick={() =>
														toggleService(service.id, service.group)
													}
													className={clsx(
														"w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group",
														isSelected
															? "border-[#eaedf0] bg-white shadow-sm"
															: "border-[#eaedf0] bg-white hover:border-[#d0d0d0]"
													)}
												>
													<div className="flex items-center gap-4">
														<div
															className={clsx(
																"w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-200",
																isSelected
																	? "bg-[#e20074] border-[#e20074]"
																	: "border-[#ccc] bg-white group-hover:border-[#aaa]"
															)}
														>
															{isSelected && (
																<Check
																	className="w-3.5 h-3.5 text-white"
																	strokeWidth={3}
																/>
															)}
														</div>
														<span
															className={clsx(
																"text-[0.9rem] font-medium transition-colors",
																isSelected ? "text-[#1a1a2e]" : "text-[#1a1a2e]"
															)}
														>
															{service.name}
														</span>
													</div>
													<span className="text-[0.9rem] font-medium text-[#888]">
														{service.price.toFixed(2)} €
													</span>
												</button>
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
														"w-full flex flex-col p-5 rounded-[1.25rem] border text-left transition-all duration-300 cursor-pointer relative",
														isSelected
															? "border-[#e20074] bg-[#e20074]/[0.02] shadow-[0_4px_20px_-8px_rgba(226,0,116,0.2)]"
															: "border-[#eaedf0] bg-white hover:border-[#d0d0d0]"
													)}
												>
													<div className="flex items-center justify-between mb-3 leading-none">
														<span
															className={clsx(
																"text-[1rem] font-extrabold tracking-tight",
																isSelected ? "text-[#e20074]" : "text-[#1a1a2e]"
															)}
														>
															{plan.name}
														</span>
														<span
															className={clsx(
																"text-[1rem] font-extrabold",
																isSelected ? "text-[#e20074]" : "text-[#888]"
															)}
														>
															{plan.price.toFixed(2)} €
														</span>
													</div>
													<div className="flex flex-wrap gap-2">
														{plan.includes.map((inc, i) => (
															<span
																key={i}
																className="text-[0.7rem] px-2 py-1 rounded-md bg-[#f0f0f0] text-[#555] font-medium"
															>
																{inc}
															</span>
														))}
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
												<span className="text-[0.65rem] text-white/50 uppercase tracking-widest font-bold mb-1.5">
													Neuer Tarif
												</span>
												<span className="text-[1.3rem] font-bold flex items-center overflow-hidden h-[1.8rem]">
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

										<div className="flex items-end justify-between">
											<div className="flex flex-col">
												<span className="text-[0.8rem] font-medium text-white/70 mb-1">
													{paysMore
														? "Kunde zahlt effektiv mehr:"
														: "Ersparnis pro Monat:"}
												</span>
												<span className="text-[0.65rem] text-white/40 max-w-[150px] leading-tight">
													Verglichen mit der Einzelbuchung der Dienste.
												</span>
											</div>
											<div
												className={clsx(
													"text-[2.5rem] font-extrabold tracking-tighter leading-none flex items-center overflow-hidden h-[3.2rem] pt-1",
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
