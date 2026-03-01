"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldAlert, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { TelekomLogo } from "@/components/shared/telekom-logo";
import { Skeleton } from "@/components/shared/skeleton";
import Link from "next/link";

export default function SetupPage() {
	const router = useRouter();
	const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
	const [acceptedTerms, setAcceptedTerms] = useState(false);
	const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { data: teams, isLoading: isTeamsLoading } = trpc.team.list.useQuery();

	const {
		data: ipVerification,
		isLoading: isIpLoading,
		isError: isIpError,
		error: ipError
	} = trpc.session.verifyIp.useQuery(undefined, {
		retry: false
	});

	const createSession = trpc.session.create.useMutation({
		onSuccess: () => {
			router.push("/products");
			router.refresh();
		}
	});

	const handleSubmit = async () => {
		if (!selectedTeamId || !acceptedTerms || !acceptedPrivacy) return;

		setIsSubmitting(true);
		try {
			await createSession.mutateAsync({
				teamId: selectedTeamId,
				acceptedTerms: true
			});
		} catch (error) {
			console.error("Setup failed", error);
			setIsSubmitting(false);
		}
	};

	const canSubmit =
		selectedTeamId && acceptedTerms && acceptedPrivacy && !isSubmitting;

	return (
		<div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-[#e20074]/20 selection:text-[#e20074]">
			<motion.div
				initial={{ opacity: 0, y: 15 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
				className="w-full max-w-[480px] flex flex-col items-center"
			>
				{/* Top Branding - Removed the box, increased logo slightly */}
				<div className="mb-10 flex flex-col items-center text-center">
					<TelekomLogo className="w-12 h-12 text-[#e20074] mb-8" />

					<h1 className="text-[2.2rem] sm:text-[2.5rem] font-extrabold text-[#1a1a2e] tracking-tight mb-3 leading-none">
						Sales Experience @ DTS
					</h1>
					<p className="text-[1.05rem] text-[#888] font-normal leading-relaxed max-w-[90%] mx-auto mt-2">
						Willkommen bei der Sales Experience! 👋🏻
						<br />
						Sie hilft Dir interaktiv bei der Beratung im Gespräch.
					</p>
				</div>

				{isIpLoading ? (
					<div className="w-full flex flex-col items-center gap-4 py-8">
						<div className="w-8 h-8 border-4 border-[#eaedf0] border-t-[#e20074] rounded-full animate-spin" />
						<p className="text-[#888] text-[0.9rem] font-medium">
							Überprüfe Zugriffsberechtigung...
						</p>
					</div>
				) : isIpError ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="w-full bg-[#fdf2f8] border border-[#fbcfe8] rounded-2xl p-6 flex flex-col items-center text-center gap-4"
					>
						<div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
							<ShieldAlert className="w-8 h-8 text-[#e20074]" />
						</div>
						<div>
							<h3 className="text-[1.1rem] font-extrabold text-[#1a1a2e] mb-2 tracking-tight">
								Zugriff verweigert
							</h3>
							<p className="text-[0.9rem] text-[#888] leading-relaxed">
								{ipError?.message ||
									"Dein aktueller Standort (IP-Adresse) ist für den Zugriff auf dieses System nicht autorisiert."}
							</p>
						</div>
					</motion.div>
				) : (
					<div className="w-full flex flex-col gap-8">
						<p className="text-[1.05rem] text-[#888] font-normal leading-relaxed text-center mx-auto m-0 mt-[-10px]">
							Wähle bitte Dein Team aus, um zu starten.
						</p>

						{/* Team Selection */}
						<div className="flex flex-col gap-3">
							<label className="text-[0.75rem] font-bold text-[#b0b0b0] uppercase tracking-wider pl-1 font-sans">
								Dein Vertriebsteam
							</label>

							{isTeamsLoading ? (
								<div className="flex flex-col gap-3">
									<Skeleton className="h-[68px] w-full rounded-2xl" />
									<Skeleton className="h-[68px] w-full rounded-2xl" />
								</div>
							) : (
								<div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#eaedf0] scrollbar-track-transparent">
									<AnimatePresence>
										{teams?.map((team) => {
											const isSelected = selectedTeamId === team.id;
											return (
												<button
													key={team.id}
													onClick={() => setSelectedTeamId(team.id)}
													className={clsx(
														"relative flex items-center justify-between p-4 px-5 rounded-2xl border transition-all duration-300 w-full text-left group outline-none cursor-pointer",
														isSelected
															? "border-[#e20074]/40 bg-white shadow-[0_4px_20px_rgba(226,0,116,0.08)] ring-1 ring-[#e20074]/30"
															: "border-[#eaedf0] bg-[#f7f8fa] hover:bg-white hover:border-[#d1d5db] hover:shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
													)}
												>
													<span
														className={clsx(
															"text-[1rem] font-bold transition-colors",
															isSelected ? "text-[#e20074]" : "text-[#1a1a2e]"
														)}
													>
														{team.name}
													</span>
													<div
														className={clsx(
															"w-[22px] h-[22px] rounded-full border flex items-center justify-center transition-all duration-300",
															isSelected
																? "border-[#e20074] bg-[#e20074] text-white scale-110"
																: "border-[#d1d5db] bg-transparent group-hover:border-[#a3a8b4]"
														)}
													>
														{isSelected && (
															<Check
																className="w-3.5 h-3.5"
																strokeWidth={3.5}
															/>
														)}
													</div>
												</button>
											);
										})}
									</AnimatePresence>
									{teams?.length === 0 && (
										<div className="text-center p-6 text-[0.85rem] text-[#aaa] bg-[#f7f8fa] border border-dashed border-[#eaedf0] rounded-2xl">
											Bisher wurden keine Teams angelegt.
										</div>
									)}
								</div>
							)}
						</div>

						{/* Subtle Disclaimer instead of bright yellow box */}
						<div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl p-5">
							<div className="flex gap-4">
								<ShieldAlert className="w-[18px] h-[18px] text-[#888] shrink-0 mt-[2px]" />
								<div className="flex flex-col gap-1.5">
									<h3 className="text-[0.85rem] font-bold text-[#1a1a2e] m-0 leading-none">
										Interner Nutzungshinweis
									</h3>
									<p className="text-[0.8rem] text-[#888] leading-relaxed m-0">
										Dieses Tool dient ausschließlich internen Beratungs- und
										Schulungszwecken. Es handelt sich um keine
										rechtsverbindliche Preisliste. Die Weitergabe an Dritte ist
										strikt untersagt.
									</p>
								</div>
							</div>
						</div>

						{/* Agreements */}
						<div className="flex flex-col gap-4">
							{/* Terms Checkbox */}
							<label className="flex items-start gap-3.5 group cursor-pointer relative">
								<div className="relative flex items-center justify-center mt-0.5">
									<input
										type="checkbox"
										className="peer sr-only"
										checked={acceptedTerms}
										onChange={() => setAcceptedTerms(!acceptedTerms)}
									/>
									<div className="w-[20px] h-[20px] rounded-[6px] border-[1.5px] border-[#d1d5db] bg-white transition-all peer-checked:bg-[#e20074] peer-checked:border-[#e20074] group-hover:border-[#e20074]/50 flex items-center justify-center shadow-sm">
										<Check
											className={clsx(
												"w-3 h-3 text-white transition-transform duration-200",
												acceptedTerms ? "scale-100" : "scale-0"
											)}
											strokeWidth={4}
										/>
									</div>
								</div>
								<div className="text-[0.90rem] mt-0.5 text-[#555] font-medium leading-snug pt-px group-hover:text-[#1a1a2e] transition-colors select-none">
									Ich erkläre mich mit dem Nutzungshinweis einverstanden.
								</div>
							</label>

							{/* Privacy Checkbox */}
							<label className="flex items-start gap-3.5 group cursor-pointer relative">
								<div className="relative flex items-center justify-center mt-0.5">
									<input
										type="checkbox"
										className="peer sr-only"
										checked={acceptedPrivacy}
										onChange={() => setAcceptedPrivacy(!acceptedPrivacy)}
									/>
									<div className="w-[20px] h-[20px] rounded-[6px] border-[1.5px] border-[#d1d5db] bg-white transition-all peer-checked:bg-[#e20074] peer-checked:border-[#e20074] group-hover:border-[#e20074]/50 flex items-center justify-center shadow-sm">
										<Check
											className={clsx(
												"w-3 h-3 text-white transition-transform duration-200",
												acceptedPrivacy ? "scale-100" : "scale-0"
											)}
											strokeWidth={4}
										/>
									</div>
								</div>
								<div className="text-[0.90rem] mt-0.5 text-[#555] font-medium leading-snug pt-px group-hover:text-[#1a1a2e] transition-colors select-none">
									Ich erkläre mich mit der{" "}
									<Link
										href="/privacy"
										className="text-[#1a1a2e] font-bold hover:text-[#e20074] transition-colors underline underline-offset-2"
									>
										Datenschutzerklärung
									</Link>{" "}
									einverstanden.
								</div>
							</label>
						</div>

						{/* Action */}
						<button
							onClick={handleSubmit}
							disabled={!canSubmit}
							className={clsx(
								"w-full h-[56px] rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 mt-2 outline-none",
								canSubmit
									? "bg-[#e20074] hover:bg-[#c70066] text-white shadow-[0_8px_20px_-6px_rgba(226,0,116,0.35)] cursor-pointer"
									: "bg-[#f7f8fa] text-[#bbb] border border-[#eaedf0] cursor-not-allowed"
							)}
						>
							{isSubmitting ? (
								<div className="w-5 h-5 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
							) : (
								<span className="flex items-center gap-2 text-[1rem]">
									Sales Experience starten{" "}
									<ArrowRight className="w-4 h-4 ml-0.5" strokeWidth={2.5} />
								</span>
							)}
						</button>
					</div>
				)}

				<div className="mt-14 text-center text-[0.75rem] font-medium text-[#c0c0c0]">
					&copy; {new Date().getFullYear()} Felix Kinze für Deutsche Telekom
					Service GmbH &bull; Via www.flxk.nz
				</div>
			</motion.div>
		</div>
	);
}
