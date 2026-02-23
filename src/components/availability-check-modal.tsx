"use client";

import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
	MapPin,
	Search,
	Loader2,
	CheckCircle2,
	XCircle,
	Zap,
	Wifi,
	X,
	ExternalLink,
	AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import Link from "next/link";

interface AvailabilityCheckModalProps {
	isOpen: boolean;
	onClose: () => void;
	onResult?: (availableTariffs: string[]) => void;
}

const CATEGORY_ROUTE_MAP: Record<string, string> = {
	MOBILE: "MOBILE",
	FIBER: "FIBER",
	DSL: "DSL",
	MAGENTA_TV_OTT: "MAGENTA_TV_OTT",
	DEVICE: "DEVICE",
	DATA: "DATA"
};

function TariffMatchList({ tariffNames }: { tariffNames: string[] }) {
	const { data: matches, isLoading } = trpc.product.matchTariffNames.useQuery(
		{ tariffNames },
		{ enabled: tariffNames.length > 0 }
	);

	return (
		<div className="space-y-3">
			<div className="text-[0.6rem] uppercase tracking-wider text-[#ccc] font-bold px-1">
				Verfügbare Leistungsklassen
			</div>
			<div className="grid grid-cols-1 gap-2">
				{isLoading
					? tariffNames.map((name, i) => (
							<div
								key={i}
								className="flex items-center justify-between p-3.5 bg-[#f7f8fa] border border-[#eaedf0] rounded-xl animate-pulse"
							>
								<div className="flex items-center gap-3">
									<div className="p-1.5 bg-white rounded-lg shadow-sm">
										{name.toLowerCase().includes("glasfaser") ? (
											<Zap className="w-3.5 h-3.5 text-[#0090d0]" />
										) : (
											<Wifi className="w-3.5 h-3.5 text-[#e20074]" />
										)}
									</div>
									<span className="text-[0.85rem] font-bold text-[#1a1a2e]">
										{name}
									</span>
								</div>
								<Loader2 className="w-4 h-4 text-[#ccc] animate-spin" />
							</div>
						))
					: (matches ?? []).map((entry, i) => {
							const isGlaserfaser = entry.tariffName
								.toLowerCase()
								.includes("glasfaser");

							if (entry.matched && entry.product) {
								const category =
									CATEGORY_ROUTE_MAP[entry.product.category] ??
									entry.product.category;
								return (
									<Link
										key={i}
										href={`/products/${category}`}
										className="flex items-center justify-between p-3.5 bg-[#f7f8fa] border border-[#eaedf0] rounded-xl group hover:border-[#e20074]/40 hover:bg-[#fdf2f8] transition-all no-underline cursor-pointer"
									>
										<div className="flex items-center gap-3">
											<div className="p-1.5 bg-white rounded-lg shadow-sm">
												{isGlaserfaser ? (
													<Zap className="w-3.5 h-3.5 text-[#0090d0]" />
												) : (
													<Wifi className="w-3.5 h-3.5 text-[#e20074]" />
												)}
											</div>
											<div className="flex flex-col">
												<span className="text-[0.85rem] font-bold text-[#1a1a2e] group-hover:text-[#e20074] transition-colors">
													{entry.tariffName}
												</span>
												<span className="text-[0.7rem] text-[#00a878] font-semibold flex items-center gap-1">
													<CheckCircle2 className="w-3 h-3" />
													Im System: {entry.product.name}
												</span>
											</div>
										</div>
										<ExternalLink className="w-4 h-4 text-[#bbb] group-hover:text-[#e20074] transition-colors shrink-0" />
									</Link>
								);
							}

							return (
								<div
									key={i}
									className="flex items-center justify-between p-3.5 bg-[#f7f8fa] border border-[#eaedf0] rounded-xl opacity-70"
								>
									<div className="flex items-center gap-3">
										<div className="p-1.5 bg-white rounded-lg shadow-sm">
											{isGlaserfaser ? (
												<Zap className="w-3.5 h-3.5 text-[#0090d0]" />
											) : (
												<Wifi className="w-3.5 h-3.5 text-[#e20074]" />
											)}
										</div>
										<span className="text-[0.85rem] font-bold text-[#1a1a2e]">
											{entry.tariffName}
										</span>
									</div>
									<span className="text-[0.65rem] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 flex items-center gap-1 shrink-0">
										<AlertCircle className="w-3 h-3" />
										Nicht im System
									</span>
								</div>
							);
						})}
			</div>
		</div>
	);
}

export function AvailabilityCheckModal({
	isOpen,
	onClose,
	onResult
}: AvailabilityCheckModalProps) {
	const [step, setStep] = useState<"address" | "checking" | "result">(
		"address"
	);
	const [zip, setZip] = useState("");
	const [city, setCity] = useState("");
	const [street, setStreet] = useState("");
	const [houseNumber, setHouseNumber] = useState("");
	const [mounted, setMounted] = useState(false);

	const [activeField, setActiveField] = useState<
		"zip" | "street" | "houseNumber" | null
	>(null);

	const [checkResult, setCheckResult] = useState<{
		status: string;
		availableTariffNames: string[];
		fiberStatus?: string | null;
	} | null>(null);

	useEffect(() => setMounted(true), []);

	const checkMutation = trpc.availability.check.useMutation({
		onSuccess: (data: any) => {
			setCheckResult({
				status: data.status || "UNKNOWN",
				availableTariffNames: data.availableTariffNames || [],
				fiberStatus: data.fiberStatus || null
			});
			setStep("result");
			if (onResult) onResult(data.availableTariffNames || []);
		},
		onError: () => {
			setStep("address");
			alert("Fehler bei der Prüfung. Bitte Eingaben kontrollieren.");
		}
	});

	const { data: zipSuggestions } = trpc.availability.suggestAddress.useQuery(
		{ searchTerm: zip, searchTarget: "placeAndZip" },
		{ enabled: activeField === "zip" && zip.length >= 3 }
	);

	const { data: streetSuggestions } = trpc.availability.suggestAddress.useQuery(
		{
			searchTerm: street,
			searchTarget: "streetName",
			selectedAddress: { city, postCode: zip }
		},
		{ enabled: activeField === "street" && street.length >= 2 && city !== "" }
	);

	const { data: hnSuggestions } = trpc.availability.suggestAddress.useQuery(
		{
			searchTerm: houseNumber,
			searchTarget: "houseNumber",
			selectedAddress: { city, postCode: zip, streetName: street }
		},
		{ enabled: activeField === "houseNumber" && street !== "" }
	);

	const handleCheck = () => {
		if (!zip || !street || !houseNumber) return;
		setStep("checking");
		checkMutation.mutate({ zip, city, street, houseNumber });
	};

	if (!mounted) return null;

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="absolute inset-0 bg-black/40 backdrop-blur-sm"
					/>

					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
					>
						{/* Header */}
						<div className="px-8 pt-8 pb-4 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-[#e20074]/10 rounded-xl text-[#e20074]">
									<MapPin className="w-5 h-5" />
								</div>
								<div>
									<h2 className="text-xl font-extrabold text-[#1a1a2e] m-0">
										Verfügbarkeitsprüfung
									</h2>
									<p className="text-[0.85rem] text-[#666] m-0">
										Echtzeit-Abfrage direkt bei der Telekom.
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

						<div className="px-8 pb-8 flex-1 overflow-y-auto max-h-[70vh] scrollbar-none">
							<AnimatePresence mode="wait">
								{step === "address" && (
									<motion.div
										key="address"
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 20 }}
										className="space-y-4 pt-4"
									>
										{/* PLZ / Ort */}
										<div className="relative">
											<label className="text-[0.7rem] font-bold text-[#aaa] uppercase tracking-wider mb-1.5 block px-1">
												PLZ / Ort
											</label>
											<div className="flex gap-2">
												<input
													value={zip}
													onChange={(e) => {
														setZip(e.target.value);
														setActiveField("zip");
													}}
													placeholder="z.B. 09112"
													className="flex-1 bg-[#f7f8fa] border border-[#eaedf0] rounded-xl px-4 py-3 text-[0.9rem] outline-none focus:border-[#e20074]/30 focus:bg-white transition-all"
												/>
											</div>
											{activeField === "zip" &&
												zipSuggestions &&
												(zipSuggestions as any[]).length > 0 && (
													<div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-[#eaedf0] rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1">
														{(zipSuggestions as any[]).map((s, idx) => (
															<button
																key={idx}
																onClick={() => {
																	setZip(s.postCode ?? "");
																	setCity(s.city ?? "");
																	setActiveField(null);
																}}
																className="w-full text-left px-4 py-2.5 text-[0.85rem] hover:bg-[#f7f8fa] transition-colors border-none bg-transparent cursor-pointer"
															>
																{s.postCode} {s.city}
															</button>
														))}
													</div>
												)}
										</div>

										{/* Straße */}
										<div className="relative">
											<label className="text-[0.7rem] font-bold text-[#aaa] uppercase tracking-wider mb-1.5 block px-1">
												Straße
											</label>
											<input
												disabled={!city}
												value={street}
												onChange={(e) => {
													setStreet(e.target.value);
													setActiveField("street");
												}}
												placeholder="z.B. Walter-Oertel-Str."
												className="w-full bg-[#f7f8fa] border border-[#eaedf0] rounded-xl px-4 py-3 text-[0.9rem] outline-none focus:border-[#e20074]/30 focus:bg-white transition-all disabled:opacity-50"
											/>
											{activeField === "street" &&
												streetSuggestions &&
												(streetSuggestions as any[]).length > 0 && (
													<div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-[#eaedf0] rounded-xl shadow-lg overflow-hidden">
														{(streetSuggestions as any[]).map((s, idx) => (
															<button
																key={idx}
																onClick={() => {
																	setStreet(s.streetName ?? "");
																	setActiveField(null);
																}}
																className="w-full text-left px-4 py-2.5 text-[0.85rem] hover:bg-[#f7f8fa] transition-colors border-none bg-transparent cursor-pointer"
															>
																{s.streetName}
															</button>
														))}
													</div>
												)}
										</div>

										{/* Hausnummer */}
										<div className="relative">
											<label className="text-[0.7rem] font-bold text-[#aaa] uppercase tracking-wider mb-1.5 block px-1">
												Hausnummer
											</label>
											<input
												disabled={!street}
												value={houseNumber}
												onChange={(e) => {
													setHouseNumber(e.target.value);
													setActiveField("houseNumber");
												}}
												placeholder="z.B. 3"
												className="w-32 bg-[#f7f8fa] border border-[#eaedf0] rounded-xl px-4 py-3 text-[0.9rem] outline-none focus:border-[#e20074]/30 focus:bg-white transition-all disabled:opacity-50"
											/>
											{activeField === "houseNumber" &&
												hnSuggestions &&
												(hnSuggestions as any[]).length > 0 && (
													<div className="absolute z-10 top-full left-0 mt-1 bg-white border border-[#eaedf0] rounded-xl shadow-lg overflow-hidden min-w-[120px]">
														{(hnSuggestions as any[]).map((s, idx) => (
															<button
																key={idx}
																onClick={() => {
																	setHouseNumber(s.houseNumber ?? "");
																	setActiveField(null);
																}}
																className="w-full text-left px-4 py-2.5 text-[0.85rem] hover:bg-[#f7f8fa] transition-colors border-none bg-transparent cursor-pointer"
															>
																{s.houseNumber}
															</button>
														))}
													</div>
												)}
										</div>

										<button
											onClick={handleCheck}
											disabled={!zip || !street || !houseNumber}
											className="w-full bg-[#e20074] text-white font-bold py-4 rounded-2xl mt-4 shadow-[0_8px_20px_rgba(226,0,116,0.2)] hover:bg-[#c2005c] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
										>
											Echtzeit-Check starten
											<Search className="w-4 h-4" />
										</button>
									</motion.div>
								)}

								{step === "checking" && (
									<motion.div
										key="checking"
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										className="py-20 flex flex-col items-center gap-6"
									>
										<div className="relative">
											<Loader2
												className="w-16 h-16 text-[#e20074] animate-spin"
												strokeWidth={1.5}
											/>
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: [0, 1, 0] }}
												transition={{ repeat: Infinity, duration: 1.5 }}
												className="absolute inset-0 bg-[#e20074]/20 blur-2xl rounded-full"
											/>
										</div>
										<div className="text-center">
											<h3 className="text-[1.1rem] font-bold text-[#1a1a2e] mb-2">
												Frage Telekom-Server ab...
											</h3>
											<p className="text-[0.85rem] text-[#999] max-w-[240px]">
												Wir rufen die aktuellsten Ausbau- und
												Verfügbarkeitsinfos für dich ab.
											</p>
										</div>
									</motion.div>
								)}

								{step === "result" && checkResult && (
									<motion.div
										key="result"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										className="space-y-6 pt-4"
									>
										{checkResult.status === "SUCCESS" ? (
											<div className="bg-[#00a878]/10 rounded-2xl p-5 border border-[#00a878]/20 flex items-start gap-4">
												<CheckCircle2 className="w-8 h-8 text-[#00a878] shrink-0 mt-0.5" />
												<div>
													<h3 className="text-[1.05rem] font-bold text-[#1a1a2e] mb-1">
														Check erfolgreich
													</h3>
													<p className="text-[0.8rem] text-[#666] leading-relaxed">
														Die Telekom liefert für diese Adresse positive
														Rückmeldungen.
													</p>
												</div>
											</div>
										) : (
											<div className="bg-amber-50/80 rounded-2xl p-5 border border-amber-200 flex items-start gap-4">
												<Wifi className="w-8 h-8 text-amber-500 shrink-0 mt-0.5" />
												<div>
													<h3 className="text-[1.05rem] font-bold text-[#b45309] mb-1">
														Adresse teilweise erkannt
													</h3>
													<p className="text-[0.8rem] text-[#92400e] leading-relaxed">
														Die exakte Adresse wurde nicht vollständig
														qualifiziert. Allgemeine Tarife für die Region
														werden angezeigt.
													</p>
												</div>
											</div>
										)}

										{checkResult.availableTariffNames.length > 0 ? (
											<TariffMatchList
												tariffNames={checkResult.availableTariffNames}
											/>
										) : (
											<div className="space-y-3">
												<div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 flex items-start gap-4">
													<XCircle className="w-8 h-8 text-amber-500 shrink-0 mt-0.5" />
													<div>
														<h3 className="text-[1.05rem] font-bold text-[#b45309] mb-1">
															Tarife konnten nicht geladen werden
														</h3>
														<p className="text-[0.8rem] text-[#92400e] leading-relaxed">
															Die Telekom liefert temporär keine Tarifdaten an
															die Sales Experience. Dies ist meist ein
															vorübergehendes Problem. Bitte versuche es in
															einigen Minuten erneut.
														</p>
													</div>
												</div>
												{checkResult.fiberStatus && (
													<div className="mt-6 bg-[#0092d027] rounded-2xl p-5 border border-[#0092d052] flex items-start gap-4">
														<Zap className="w-8 h-8 text-[#0090d0] shrink-0 mt-0.5" />
														<div>
															<h3 className="text-[1.05rem] font-bold text-[#0090d0] mb-1">
																Glasfaser-Status
															</h3>
															<p className="text-[0.8rem] text-[#0090d0] leading-relaxed">
																{checkResult.fiberStatus === "CONNECTED"
																	? "Angeschlossen"
																	: checkResult.fiberStatus}
															</p>
														</div>
													</div>
												)}
											</div>
										)}

										<button
											onClick={onClose}
											className="w-full bg-[#1a1a2e] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
										>
											Fertig
										</button>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body
	);
}
