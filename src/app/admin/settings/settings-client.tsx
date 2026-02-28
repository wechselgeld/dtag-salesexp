"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
	Settings,
	Lock,
	Shield,
	User,
	AlertTriangle,
	Check,
	Hammer,
	ArrowRight,
	Users,
	Box,
	Tag,
	ShieldAlert,
	Loader2,
	Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
	const [activeTab, setActiveTab] = useState<"profile" | "security" | "system">(
		"profile"
	);

	const { data: user } = trpc.admin.getCurrentUser.useQuery();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-[1.6rem] font-extrabold text-[#1a1a2e] tracking-tight mb-1">
					Einstellungen
				</h1>
				<p className="text-[0.85rem] text-[#999] m-0">
					Verwalte Dein Profil und die globalen Systemeinstellungen.
				</p>
			</div>

			<nav className="flex gap-2 p-1 bg-[#f7f8fa] border border-[#eaedf0] rounded-xl w-fit">
				{[
					{ id: "profile", label: "Profil", icon: User },
					{ id: "security", label: "Sicherheit", icon: Lock },
					{ id: "system", label: "System", icon: Hammer }
				].map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id as any)}
						className={clsx(
							"flex items-center gap-2 px-5 py-2 rounded-lg text-[0.82rem] font-semibold transition-all duration-200 cursor-pointer border-none",
							activeTab === tab.id
								? "bg-white text-[#1a1a2e] shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#eaedf0]"
								: "bg-transparent text-[#888] hover:text-[#1a1a2e]"
						)}
					>
						<tab.icon className="w-3.5 h-3.5" />
						{tab.label}
					</button>
				))}
			</nav>

			<div className="min-h-[500px]">
				<AnimatePresence mode="wait">
					{activeTab === "profile" && (
						<ProfilePanel key="profile" user={user} />
					)}
					{activeTab === "security" && <SecurityPanel key="security" />}
					{activeTab === "system" && <SystemPanel key="system" />}
				</AnimatePresence>
			</div>
		</div>
	);
}

function ProfilePanel({ user }: { user: any }) {
	const { data: stats } = trpc.admin.getDashboardStats.useQuery();

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			className="space-y-6"
		>
			<div className="bg-white border border-[#eaedf0] rounded-2xl p-6 shadow-sm overflow-hidden">
				<div className="flex items-center gap-5 mb-6">
					<div className="w-16 h-16 bg-linear-to-br from-[#e20074] to-[#c70066] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#e20074]/20 border border-[#e20074]/10 shrink-0">
						{user?.email?.charAt(0).toUpperCase() || "A"}
					</div>
					<div>
						<h3 className="text-[1.3rem] font-extrabold text-[#1a1a2e] m-0 tracking-tight">
							{user?.email?.split("@")[0] || "Administrator"}
						</h3>
						<p className="text-[0.85rem] text-[#888] m-0 mb-2 font-medium">
							{user?.email || "admin@telekom.de"}
						</p>
						<div className="flex gap-2">
							<span className="px-2.5 py-0.5 bg-[#e20074]/10 text-[#e20074] rounded-lg text-[0.65rem] font-bold uppercase tracking-wider">
								{user?.role || "ADMIN"}
							</span>
							<span className="px-2.5 py-0.5 bg-[#f7f8fa] text-[#888] rounded-lg text-[0.65rem] font-bold uppercase tracking-wider border border-[#eaedf0]">
								Globaler Zugriff
							</span>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-[#f0f0f0]">
					<div className="space-y-1 p-4 bg-[#f7f8fa] rounded-xl border border-[#eaedf0]">
						<div className="flex items-center gap-1.5 text-[#999] text-[0.65rem] font-bold uppercase tracking-widest mb-1">
							<Box className="w-3.5 h-3.5" /> Produkte
						</div>
						<p className="text-[1.5rem] font-black text-[#1a1a2e] m-0">
							{stats?.products || 0}
						</p>
					</div>
					<div className="space-y-1 p-4 bg-[#f7f8fa] rounded-xl border border-[#eaedf0]">
						<div className="flex items-center gap-1.5 text-[#999] text-[0.65rem] font-bold uppercase tracking-widest mb-1">
							<Users className="w-3.5 h-3.5" /> Teams
						</div>
						<p className="text-[1.5rem] font-black text-[#1a1a2e] m-0">
							{stats?.teams || 0}
						</p>
					</div>
					<div className="space-y-1 p-4 bg-[#f7f8fa] rounded-xl border border-[#eaedf0]">
						<div className="flex items-center gap-1.5 text-[#999] text-[0.65rem] font-bold uppercase tracking-widest mb-1">
							<User className="w-3.5 h-3.5" /> Nutzer
						</div>
						<p className="text-[1.5rem] font-black text-[#1a1a2e] m-0">
							{stats?.users || 0}
						</p>
					</div>
					<div className="space-y-1 p-4 bg-[#f7f8fa] rounded-xl border border-[#eaedf0]">
						<div className="flex items-center gap-1.5 text-[#999] text-[0.65rem] font-bold uppercase tracking-widest mb-1">
							<Tag className="w-3.5 h-3.5" /> Aktionen
						</div>
						<p className="text-[1.5rem] font-black text-[#1a1a2e] m-0">
							{stats?.specialPrices || 0}
						</p>
					</div>
				</div>
			</div>

			<div className="bg-[#1a1a2e] rounded-2xl p-6 text-white relative overflow-hidden shadow-sm">
				<div className="absolute top-0 right-0 w-64 h-64 bg-[#e20074]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
				<div className="relative z-10 flex items-center justify-between gap-6">
					<div>
						<h3 className="text-[1.1rem] font-extrabold mb-1.5 text-white tracking-tight m-0">
							System Architektur
						</h3>
						<p className="text-[#a1a1aa] text-[0.85rem] leading-relaxed max-w-xl m-0">
							Deine Instanz läuft auf der aktuellen Version der Sales
							Experience-Plattform. Alle Daten werden DSGVO-konform in der
							lokalen Datenbank verschlüsselt gespeichert.
						</p>
					</div>
					<div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0 hidden md:flex">
						<Shield className="w-8 h-8 text-white/40" />
					</div>
				</div>
			</div>
		</motion.div>
	);
}

function SecurityPanel() {
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [status, setStatus] = useState<
		"idle" | "pending" | "success" | "error"
	>("idle");
	const [errorMsg, setErrorMsg] = useState("");

	const mutation = trpc.admin.settings.changePassword.useMutation({
		onSuccess: () => {
			setStatus("success");
			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setTimeout(() => {
				setStatus("idle");
				setErrorMsg("");
			}, 5000);
		},
		onError: (err) => {
			setStatus("error");
			setErrorMsg(err.message || "Ein Fehler ist aufgetreten.");
		}
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			setStatus("error");
			setErrorMsg("Die neuen Passwörter stimmen nicht überein.");
			return;
		}
		if (newPassword.length < 8) {
			setStatus("error");
			setErrorMsg("Das Passwort muss mindestens 8 Zeichen lang sein.");
			return;
		}
		setStatus("pending");
		setErrorMsg("");
		mutation.mutate({ oldPassword, newPassword });
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			className="space-y-6"
		>
			<form
				onSubmit={handleSubmit}
				className="bg-white border border-[#eaedf0] rounded-2xl p-6 shadow-sm max-w-2xl space-y-6"
			>
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-[#f7f8fa] rounded-xl flex items-center justify-center border border-[#eaedf0]">
						<Lock className="w-5 h-5 text-[#888]" />
					</div>
					<h3 className="text-[1.1rem] font-extrabold text-[#1a1a2e] m-0">
						Passwort ändern
					</h3>
				</div>

				<div className="space-y-5">
					<Input
						label="Aktuelles Passwort"
						type="password"
						required
						value={oldPassword}
						onChange={(e) => setOldPassword(e.target.value)}
						placeholder="••••••••••••"
						className="font-mono text-lg tracking-widest"
					/>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<Input
							label="Neues Passwort"
							type="password"
							required
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder="••••••••••••"
							className="font-mono text-lg tracking-widest"
						/>
						<Input
							label="Passwort bestätigen"
							type="password"
							required
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="••••••••••••"
							className="font-mono text-lg tracking-widest"
						/>
					</div>
				</div>

				{status === "error" && (
					<motion.div
						initial={{ opacity: 0, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						className="p-3.5 bg-red-50 text-red-600 rounded-xl text-[0.85rem] font-semibold flex gap-2 items-center border border-red-100"
					>
						<AlertTriangle className="w-4 h-4 shrink-0" />
						{errorMsg}
					</motion.div>
				)}

				{status === "success" && (
					<motion.div
						initial={{ opacity: 0, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						className="p-3.5 bg-green-50 text-green-700 rounded-xl text-[0.85rem] font-semibold flex gap-2 items-center border border-green-100"
					>
						<Check className="w-4 h-4 shrink-0" />
						Passwort wurde erfolgreich aktualisiert.
					</motion.div>
				)}

				<div className="pt-2">
					<button
						type="submit"
						disabled={status === "pending"}
						className={clsx(
							"px-5 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 transition-all duration-200 text-[0.82rem] cursor-pointer shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95",
							status === "pending"
								? "bg-[#ddd] shadow-none cursor-not-allowed text-[#999] opacity-50"
								: "bg-[#e20074] hover:bg-[#c70066]"
						)}
					>
						{status === "pending" ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Save className="w-4 h-4" />
						)}
						{status === "pending"
							? "Wird gespeichert..."
							: "Änderungen speichern"}
					</button>
				</div>
			</form>
		</motion.div>
	);
}

function SystemPanel() {
	const { data: isMaintenance, refetch } =
		trpc.admin.getMaintenanceStatus.useQuery();
	const toggleMutation = trpc.admin.toggleMaintenanceMode.useMutation({
		onSuccess: () => {
			refetch();
		}
	});

	const [isPending, setIsPending] = useState(false);

	const handleToggle = async () => {
		setIsPending(true);
		await toggleMutation.mutateAsync({ enabled: !isMaintenance });
		setIsPending(false);
	};

	const { data: allowedIpsData, refetch: refetchIps } =
		trpc.admin.getSecuritySettings.useQuery();
	const updateIpsMutation = trpc.admin.updateSecuritySettings.useMutation({
		onSuccess: () => refetchIps()
	});

	const [allowedIps, setAllowedIps] = useState("");
	const [isIpsPending, setIsIpsPending] = useState(false);
	const [ipsSaved, setIpsSaved] = useState(false);

	// Update local state when data loads

	useEffect(() => {
		if (allowedIpsData !== undefined) setAllowedIps(allowedIpsData);
	}, [allowedIpsData]);

	const handleSaveIps = async () => {
		setIsIpsPending(true);
		await updateIpsMutation.mutateAsync({ allowedIps });
		setIsIpsPending(false);
		setIpsSaved(true);
		setTimeout(() => setIpsSaved(false), 3000);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			className="space-y-6 max-w-3xl"
		>
			<div className="bg-white border border-[#eaedf0] rounded-2xl p-6 md:p-8 shadow-sm overflow-hidden relative">
				{isMaintenance && (
					<div className="absolute top-0 right-0 p-5">
						<div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[0.7rem] font-bold border border-red-100 uppercase tracking-wider animate-pulse">
							<div className="w-1.5 h-1.5 rounded-full bg-red-500" />
							Aktiv
						</div>
					</div>
				)}

				<div className="max-w-xl">
					<div className="w-14 h-14 bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl flex items-center justify-center mb-6">
						<Hammer className="w-6 h-6 text-[#1a1a2e]" />
					</div>

					<h2 className="text-[1.4rem] font-extrabold text-[#1a1a2e] mb-2 tracking-tight">
						Wartungsmodus
					</h2>
					<p className="text-[0.85rem] text-[#888] leading-relaxed mb-8">
						Wenn der Wartungsmodus aktiviert ist, wird der Zugriff auf das
						Sales-Tool für alle nicht-administrativen Nutzer gesperrt.
					</p>

					<div className="mb-8">
						<div className="flex gap-3 items-start p-4 bg-[#f7f8fa] rounded-xl border border-[#eaedf0]">
							<ShieldAlert className="w-5 h-5 text-[#999] shrink-0 mt-0.5" />
							<p className="text-[0.8rem] text-[#666] m-0 leading-relaxed">
								<span className="font-bold text-[#1a1a2e]">
									Sicherheits-Sperre:
								</span>{" "}
								Laufende Beratungsvorgänge werden unterbrochen und Agenten
								können keine neuen Angebote erstellen.
							</p>
						</div>
					</div>

					<button
						onClick={handleToggle}
						disabled={isPending}
						className={clsx(
							"px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 outline-none cursor-pointer text-[0.85rem] active:scale-95",
							isMaintenance
								? "bg-white text-red-600 border-2 border-red-200 hover:bg-red-50"
								: "bg-[#1a1a2e] text-white hover:bg-[#2a2a3e] shadow-[0_4px_14px_rgba(26,26,46,0.2)] hover:shadow-[0_6px_20px_rgba(26,26,46,0.3)] hover:-translate-y-0.5 border-2 border-transparent"
						)}
					>
						{isPending ? (
							<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
						) : (
							<>
								{isMaintenance
									? "Wartungsmodus deaktivieren"
									: "Wartungsmodus jetzt aktivieren"}
								{!isMaintenance && <ArrowRight className="w-4 h-4" />}
							</>
						)}
					</button>
				</div>
			</div>

			<div className="bg-white border border-[#eaedf0] rounded-2xl p-6 md:p-8 shadow-sm overflow-hidden relative">
				<div className="max-w-xl">
					<div className="w-14 h-14 bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl flex items-center justify-center mb-6">
						<Shield className="w-6 h-6 text-[#1a1a2e]" />
					</div>

					<h2 className="text-[1.4rem] font-extrabold text-[#1a1a2e] mb-2 tracking-tight">
						IP-Zugriffsbeschränkung
					</h2>
					<p className="text-[0.85rem] text-[#888] leading-relaxed mb-6">
						Lege hier fest, aus welchen IP-Adressen oder IP-Ranges (CIDR) der
						Zugriff auf die Setup-Seite erlaubt ist. Ist diese Liste leer, ist
						der Zugriff weltweit aus allen Netzen gestattet.
					</p>

					<div className="space-y-4 mb-6">
						<textarea
							value={allowedIps}
							onChange={(e) => setAllowedIps(e.target.value)}
							placeholder="Beispiele:&#10;192.168.1.1&#10;10.0.0.0/8&#10;2001:db8::/32"
							className="w-full h-32 px-5 py-4 rounded-2xl border border-[#eaedf0] bg-[#f7f8fa] text-[#1a1a2e] focus:outline-none focus:bg-white focus:border-[#e20074]/30 focus:shadow-[0_0_0_4px_rgba(226,0,116,0.06)] transition-all text-[0.95rem] font-mono resize-none placeholder:text-[#ccc]"
						/>
						<p className="text-[0.75rem] text-[#999] m-0">
							Trage eine IPv4/IPv6-Adresse oder ein CIDR-Subnetz pro Zeile ein.
						</p>
					</div>

					<button
						onClick={handleSaveIps}
						disabled={isIpsPending}
						className={clsx(
							"px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 outline-none cursor-pointer text-[0.85rem] active:scale-95",
							isIpsPending
								? "bg-[#ddd] shadow-none cursor-not-allowed text-[#999] opacity-50"
								: ipsSaved
									? "bg-green-600 text-white hover:bg-green-700 shadow-[0_4px_14px_rgba(22,163,74,0.2)]"
									: "bg-[#1a1a2e] text-white hover:bg-[#2a2a3e] shadow-[0_4px_14px_rgba(26,26,46,0.2)] hover:shadow-[0_6px_20px_rgba(26,26,46,0.3)] hover:-translate-y-0.5 border-2 border-transparent"
						)}
					>
						{isIpsPending ? (
							<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
						) : ipsSaved ? (
							<>
								<Check className="w-4 h-4" />
								Gespeichert
							</>
						) : (
							<>
								<Save className="w-4 h-4" />
								IP-Liste speichern
							</>
						)}
					</button>
				</div>
			</div>

			<div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-2xl p-6 flex gap-4 items-center">
				<div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-[#eaedf0]">
					<Shield className="w-5 h-5 text-[#888]" />
				</div>
				<div>
					<h4 className="text-[#1a1a2e] font-bold m-0 text-[0.9rem] mb-1">
						Admin-Privileg
					</h4>
					<p className="text-[#888] m-0 text-[0.8rem]">
						Du als Administrator kannst das Tool auch während der
						Wartungsarbeiten weiterhin nutzen, um Änderungen zu testen.
					</p>
				</div>
			</div>
		</motion.div>
	);
}
