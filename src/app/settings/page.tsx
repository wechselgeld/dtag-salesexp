"use client";

import {
	ArrowLeft,
	Palette,
	ShoppingBag,
	Info,
	RotateCcw,
	Trash2,
	Users,
	Fingerprint,
	Eye,
	BookOpen,
	Copy,
	Check,
	Repeat,
	ChevronDown,
	Loader2,
	FileText,
	MonitorPlay
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBasketStore } from "@/hooks/use-basket-store";
import { useSettingsStore } from "@/hooks/use-settings-store";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useState, useCallback } from "react";

export default function SettingsPage() {
	const { clearBasket } = useBasketStore();
	const {
		compactView,
		setCompactView,
		clearAfterExport,
		setClearAfterExport,
		reduceAnimations,
		setReduceAnimations,
		offerTemplateText,
		setOfferTemplateText
	} = useSettingsStore();
	const router = useRouter();
	const { data: session } = trpc.session.getCurrent.useQuery();
	const { data: teams } = trpc.team.list.useQuery();
	const createSession = trpc.session.create.useMutation({
		onSuccess: () => {
			router.refresh();
			setTeamSwitchOpen(false);
			setSwitchingTeam(null);
			window.location.reload();
		}
	});
	const [copiedField, setCopiedField] = useState<string | null>(null);
	const [teamSwitchOpen, setTeamSwitchOpen] = useState(false);
	const [switchingTeam, setSwitchingTeam] = useState<string | null>(null);

	const handleReset = () => {
		clearBasket();
		localStorage.removeItem("dts-splash-timestamp");
		router.push("/");
	};

	const handleClearCache = () => {
		// Clear all app-specific localStorage entries
		const keysToRemove = [
			"basket-storage",
			"dts-splash-timestamp",
			"onboarding_completed_v3",
			"dts-settings"
		];
		keysToRemove.forEach((key) => localStorage.removeItem(key));
		clearBasket();
		window.location.reload();
	};

	const handleRestartOnboarding = () => {
		localStorage.removeItem("onboarding_completed_v3");
		router.push("/");
		// The onboarding component will auto-start on next mount
		setTimeout(() => window.location.reload(), 100);
	};

	const copyToClipboard = useCallback((text: string, field: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
	}, []);

	return (
		<div className="min-h-full max-w-[700px]">
			<Link
				href="/"
				className="inline-flex items-center gap-2 text-[#999] hover:text-[#e20074] transition-colors mb-6 text-[0.8rem] font-semibold uppercase tracking-wider no-underline"
			>
				<ArrowLeft className="w-4 h-4" />
				<span className="text-[#e20074]">Zurück</span>
			</Link>

			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.35 }}
			>
				<h1 className="text-[2rem] font-extrabold text-[#1a1a2e] tracking-tight mb-2">
					Einstellungen
				</h1>
				<p className="text-[0.85rem] text-[#999] mb-8">
					Konfiguriere Deine Sales Experience
				</p>

				<div className="space-y-4">
					{/* Team & Session Info */}
					<div className="bg-white rounded-2xl border border-[#eaedf0] p-5">
						<div className="flex items-center gap-3 mb-4">
							<Users className="w-4 h-4 text-[#e20074]" />
							<h2 className="text-[0.88rem] font-bold text-[#1a1a2e] m-0">
								Sitzung & Team
							</h2>
						</div>
						<div className="space-y-2.5">
							<div className="flex items-center justify-between py-1">
								<span className="text-[0.78rem] text-[#999]">Team</span>
								<div className="flex items-center gap-2">
									<span className="text-[0.78rem] font-semibold text-[#1a1a2e]">
										{session?.team?.name ?? "—"}
									</span>
									<button
										onClick={() => setTeamSwitchOpen(!teamSwitchOpen)}
										className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f7f8fa] border border-[#eaedf0] text-[0.7rem] font-semibold text-[#999] hover:bg-[#e20074]/5 hover:text-[#e20074] hover:border-[#e20074]/30 transition-all cursor-pointer"
									>
										<Repeat className="w-3 h-3" />
										Wechseln
										<ChevronDown
											className={`w-3 h-3 transition-transform duration-200 ${teamSwitchOpen ? "rotate-180" : ""}`}
										/>
									</button>
								</div>
							</div>

							{/* Team Switcher Dropdown */}
							{teamSwitchOpen && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									className="overflow-hidden"
								>
									<div className="bg-[#f7f8fa] rounded-xl border border-[#eaedf0] p-1.5 flex flex-col gap-1">
										{teams?.map((team) => {
											const isCurrent = session?.teamId === team.id;
											const isSwitching = switchingTeam === team.id;
											return (
												<button
													key={team.id}
													disabled={isCurrent || !!switchingTeam}
													onClick={async () => {
														setSwitchingTeam(team.id);
														createSession.mutate({
															teamId: team.id,
															acceptedTerms: true
														});
													}}
													className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[0.8rem] font-medium transition-all cursor-pointer border-none w-full text-left ${
														isCurrent
															? "bg-[#e20074]/10 text-[#e20074] font-bold cursor-default"
															: "bg-transparent text-[#1a1a2e] hover:bg-white"
													}`}
												>
													<span>{team.name}</span>
													{isCurrent && (
														<span className="text-[0.65rem] bg-[#e20074] text-white px-2 py-0.5 rounded-full font-bold">
															Aktuell
														</span>
													)}
													{isSwitching && (
														<Loader2 className="w-3.5 h-3.5 text-[#e20074] animate-spin" />
													)}
												</button>
											);
										})}
									</div>
								</motion.div>
							)}
							<div className="flex items-center justify-between py-1">
								<span className="text-[0.78rem] text-[#999] flex items-center gap-1.5">
									<Fingerprint className="w-3 h-3" />
									Session-ID
								</span>
								<div className="flex items-center gap-2">
									<span className="text-[0.72rem] font-mono text-[#aaa] bg-[#f7f8fa] px-2 py-0.5 rounded-md border border-[#eaedf0] max-w-[180px] truncate">
										{session?.id ?? "—"}
									</span>
									{session?.id && (
										<button
											onClick={() => copyToClipboard(session.id, "session")}
											className="w-6 h-6 rounded-md flex items-center justify-center bg-transparent border border-[#eaedf0] hover:bg-[#f7f8fa] text-[#bbb] hover:text-[#1a1a2e] transition-all cursor-pointer"
											title="Session-ID kopieren"
										>
											{copiedField === "session" ? (
												<Check className="w-3 h-3 text-[#00a878]" />
											) : (
												<Copy className="w-3 h-3" />
											)}
										</button>
									)}
								</div>
							</div>
							<div className="flex items-center justify-between py-1">
								<span className="text-[0.78rem] text-[#999]">Status</span>
								<span
									className={`text-[0.72rem] font-semibold px-2 py-0.5 rounded-full ${
										session?.isActive
											? "text-[#00a878] bg-[#00a878]/10"
											: "text-[#dc2626] bg-[#dc2626]/10"
									}`}
								>
									{session?.isActive ? "Aktiv" : "Inaktiv"}
								</span>
							</div>
						</div>
					</div>

					{/* Anzeige */}
					<div className="bg-white rounded-2xl border border-[#eaedf0] p-5">
						<div className="flex items-center gap-3 mb-4">
							<Palette className="w-4 h-4 text-[#7b61ff]" />
							<h2 className="text-[0.88rem] font-bold text-[#1a1a2e] m-0">
								Anzeige
							</h2>
						</div>
						<div className="space-y-4">
							<ToggleRow
								label="Kompakte Ansicht"
								description="Zeigt Tarif-Karten kleiner und kompakter an, damit mehr Inhalte sichtbar sind."
								icon={<Eye className="w-3.5 h-3.5 text-[#7b61ff]" />}
								checked={compactView}
								onChange={setCompactView}
							/>
							<div className="h-px bg-[#eaedf0] w-full" />
							<ToggleRow
								label="Animationen reduzieren"
								description="Deaktiviert aufwändige UI-Animationen und Übergänge."
								icon={<MonitorPlay className="w-3.5 h-3.5 text-[#7b61ff]" />}
								checked={reduceAnimations}
								onChange={setReduceAnimations}
							/>
						</div>
					</div>

					{/* Beratung & Verkauf */}
					<div className="bg-white rounded-2xl border border-[#eaedf0] p-5">
						<div className="flex items-center gap-3 mb-4">
							<FileText className="w-4 h-4 text-[#00a878]" />
							<h2 className="text-[0.88rem] font-bold text-[#1a1a2e] m-0">
								Beratung & Verkauf
							</h2>
						</div>
						<div className="space-y-4">
							<div className="flex flex-col gap-2">
								<h3 className="text-[0.82rem] font-semibold text-[#1a1a2e] m-0">
									Angebotsvorlage-Text
								</h3>
								<p className="text-[0.72rem] text-[#999] m-0 leading-relaxed max-w-[90%]">
									Dieser Text wird als E-Mail-Inhalt verwendet, wenn Du den
									Angebotsexport im Warenkorb ausführst.
								</p>
								<textarea
									value={offerTemplateText}
									onChange={(e) => setOfferTemplateText(e.target.value)}
									className="w-full h-[140px] mt-2 p-3 text-[0.78rem] text-[#1a1a2e] bg-[#f7f8fa] border border-[#eaedf0] rounded-xl focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074] transition-all resize-none font-sans"
								/>
							</div>
						</div>
					</div>

					{/* Warenkorb */}
					<div className="bg-white rounded-2xl border border-[#eaedf0] p-5">
						<div className="flex items-center gap-3 mb-4">
							<ShoppingBag className="w-4 h-4 text-[#ff6b00]" />
							<h2 className="text-[0.88rem] font-bold text-[#1a1a2e] m-0">
								Warenkorb
							</h2>
						</div>
						<div className="space-y-4">
							<ToggleRow
								label="Nach Export leeren"
								description="Der Warenkorb wird automatisch geleert, nachdem ein Angebot als PDF erstellt wurde."
								icon={<Trash2 className="w-3.5 h-3.5 text-[#ff6b00]" />}
								checked={clearAfterExport}
								onChange={setClearAfterExport}
							/>
						</div>
					</div>

					{/* Onboarding & Help */}
					<div className="bg-white rounded-2xl border border-[#eaedf0] p-5">
						<div className="flex items-center gap-3 mb-4">
							<BookOpen className="w-4 h-4 text-[#0090d0]" />
							<h2 className="text-[0.88rem] font-bold text-[#1a1a2e] m-0">
								Hilfe & Einführung
							</h2>
						</div>
						<p className="text-[0.78rem] text-[#999] mb-4 m-0">
							Starte die interaktive Tour erneut, die Dir die wichtigsten
							Funktionen der App zeigt.
						</p>
						<button
							onClick={handleRestartOnboarding}
							className="px-4 py-2.5 rounded-xl bg-[#f7f8fa] border border-[#eaedf0] text-[0.78rem] font-medium text-[#999] hover:bg-[#dbeafe] hover:text-[#0090d0] hover:border-[#93c5fd] transition-all duration-200 cursor-pointer flex items-center gap-2"
						>
							<BookOpen className="w-3.5 h-3.5" />
							Onboarding-Tour erneut starten
						</button>
					</div>

					{/* App Info */}
					<div className="bg-white rounded-2xl border border-[#eaedf0] p-5">
						<div className="flex items-center gap-3 mb-4">
							<Info className="w-4 h-4 text-[#e20074]" />
							<h2 className="text-[0.88rem] font-bold text-[#1a1a2e] m-0">
								App-Informationen
							</h2>
						</div>
						<div className="space-y-2.5">
							<InfoRow label="Version" value="2.0.0" />
							<InfoRow label="Build" value="2026.02.23" />
							<InfoRow label="Umgebung" value="Produktion" />
						</div>
					</div>

					{/* Reset & Cache */}
					<div className="bg-white rounded-2xl border border-[#eaedf0] p-5">
						<div className="flex items-center gap-3 mb-4">
							<RotateCcw className="w-4 h-4 text-[#dc2626]" />
							<h2 className="text-[0.88rem] font-bold text-[#1a1a2e] m-0">
								Sitzung & Daten
							</h2>
						</div>
						<p className="text-[0.78rem] text-[#999] mb-4 m-0">
							Cache leeren entfernt alle lokal gespeicherten Daten (Warenkorb,
							Einstellungen, Onboarding-Status). Die Seite wird danach neu
							geladen.
						</p>
						<div className="flex gap-2.5 flex-wrap">
							<button
								onClick={handleReset}
								className="px-4 py-2.5 rounded-xl bg-[#f7f8fa] border border-[#eaedf0] text-[0.78rem] font-medium text-[#999] hover:bg-[#fee2e2] hover:text-[#dc2626] hover:border-[#fca5a5] transition-all duration-200 cursor-pointer flex items-center gap-2"
							>
								<RotateCcw className="w-3.5 h-3.5" />
								Sitzung zurücksetzen
							</button>
							<button
								onClick={handleClearCache}
								className="px-4 py-2.5 rounded-xl bg-[#f7f8fa] border border-[#eaedf0] text-[0.78rem] font-medium text-[#999] hover:bg-[#fee2e2] hover:text-[#dc2626] hover:border-[#fca5a5] transition-all duration-200 cursor-pointer flex items-center gap-2"
							>
								<Trash2 className="w-3.5 h-3.5" />
								Cache leeren
							</button>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between py-1">
			<span className="text-[0.78rem] text-[#999]">{label}</span>
			<span className="text-[0.78rem] font-semibold text-[#1a1a2e]">
				{value}
			</span>
		</div>
	);
}

function ToggleRow({
	label,
	description,
	icon,
	checked,
	onChange
}: {
	label: string;
	description: string;
	icon: React.ReactNode;
	checked: boolean;
	onChange: (value: boolean) => void;
}) {
	return (
		<div className="flex items-start gap-3">
			<div className="pt-0.5 shrink-0">{icon}</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between">
					<span className="text-[0.82rem] font-semibold text-[#1a1a2e]">
						{label}
					</span>
					<button
						onClick={() => onChange(!checked)}
						className={`relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
							checked ? "bg-[#e20074]" : "bg-[#ddd]"
						}`}
						role="switch"
						aria-checked={checked}
					>
						<span
							className={`pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
								checked ? "translate-x-[18px]" : "translate-x-0"
							}`}
						/>
					</button>
				</div>
				<p className="text-[0.72rem] text-[#999] mt-0.5 m-0 leading-relaxed pr-12">
					{description}
				</p>
			</div>
		</div>
	);
}
