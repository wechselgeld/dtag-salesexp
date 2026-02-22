"use client";

import { useState } from "react";
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
	ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function AdminSettingsPage() {
	const [activeTab, setActiveTab] = useState<"profile" | "security" | "system">(
		"profile"
	);

	const { data: user } = trpc.admin.getCurrentUser.useQuery();

	return (
		<div className="max-w-4xl mx-auto space-y-8">
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-extrabold text-[#1a1a2e] tracking-tight m-0">
						Einstellungen
					</h1>
					<p className="text-zinc-500 mt-1">
						Verwalte Dein Profil und die globalen Systemeinstellungen.
					</p>
				</div>
				<div className="w-12 h-12 bg-magenta-500/10 rounded-2xl flex items-center justify-center">
					<Settings className="w-6 h-6 text-magenta-500" />
				</div>
			</header>

			<nav className="flex gap-2 p-1 bg-zinc-100 rounded-2xl w-fit">
				{[
					{ id: "profile", label: "Profil", icon: User },
					{ id: "security", label: "Sicherheit", icon: Shield },
					{ id: "system", label: "System", icon: Hammer }
				].map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id as any)}
						className={clsx(
							"flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer",
							activeTab === tab.id
								? "bg-white text-magenta-500 shadow-sm"
								: "text-zinc-500 hover:text-zinc-800"
						)}
					>
						<tab.icon className="w-4 h-4" />
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
			<div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
				<div className="flex items-center gap-6 mb-8">
					<div className="w-20 h-20 bg-linear-to-br from-magenta-500 to-magenta-600 rounded-[28px] flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-magenta-500/20 translate-y-[-4px]">
						{user?.email?.charAt(0).toUpperCase() || "A"}
					</div>
					<div>
						<h3 className="text-2xl font-black text-[#1a1a2e] m-0">
							{user?.email?.split("@")[0] || "Administrator"}
						</h3>
						<p className="text-zinc-500 m-0 font-medium">
							{user?.email || "admin@telekom.de"}
						</p>
						<div className="mt-3 flex gap-2">
							<span className="px-3 py-1 bg-magenta-50 text-magenta-600 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border border-magenta-100">
								{user?.role || "ADMIN"}
							</span>
							<span className="px-3 py-1 bg-zinc-100 text-zinc-500 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border border-zinc-200">
								Globaler Zugriff
							</span>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-4 gap-6 pt-8 border-t border-zinc-100">
					<div className="space-y-1">
						<div className="flex items-center gap-2 text-zinc-400 text-[0.65rem] font-bold uppercase tracking-widest">
							<Box className="w-3 h-3" /> Produkte
						</div>
						<p className="text-3xl font-black text-[#1a1a2e]">
							{stats?.products || 0}
						</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center gap-2 text-zinc-400 text-[0.65rem] font-bold uppercase tracking-widest">
							<Users className="w-3 h-3" /> Teams
						</div>
						<p className="text-3xl font-black text-[#1a1a2e]">
							{stats?.teams || 0}
						</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center gap-2 text-zinc-400 text-[0.65rem] font-bold uppercase tracking-widest">
							<User className="w-3 h-3" /> Nutzer
						</div>
						<p className="text-3xl font-black text-[#1a1a2e]">
							{stats?.users || 0}
						</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center gap-2 text-zinc-400 text-[0.65rem] font-bold uppercase tracking-widest">
							<Tag className="w-3 h-3" /> Aktionen
						</div>
						<p className="text-3xl font-black text-[#1a1a2e]">
							{stats?.specialPrices || 0}
						</p>
					</div>
				</div>
			</div>

			<div className="bg-linear-to-br from-[#1a1a2e] to-[#2a2a4e] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-[#1a1a2e]/10">
				<div className="absolute top-0 right-0 w-64 h-64 bg-magenta-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
				<div className="relative z-10 flex items-center justify-between">
					<div className="max-w-md">
						<h3 className="text-xl font-bold mb-2 text-white">
							System Architektur
						</h3>
						<p className="text-white/60 text-sm leading-relaxed">
							Deine Instanz läuft auf der aktuellen Version der Sales
							Experience-Plattform. Alle Daten werden DSGVO-konform in der
							lokalen Datenbank verschlüsselt gespeichert.
						</p>
					</div>
					<div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
						<Shield className="w-10 h-10 text-white/20" />
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
			setTimeout(() => setStatus("idle"), 5000);
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
		setStatus("pending");
		mutation.mutate({ oldPassword, newPassword });
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			className="space-y-6"
		>
			<div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm max-w-2xl">
				<div className="flex items-center gap-3 mb-8">
					<div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
						<Lock className="w-5 h-5 text-zinc-600" />
					</div>
					<h3 className="text-xl font-bold text-[#1a1a2e] m-0">
						Passwort ändern
					</h3>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<label className="text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest pl-1">
							Aktuelles Passwort
						</label>
						<input
							type="password"
							required
							value={oldPassword}
							onChange={(e) => setOldPassword(e.target.value)}
							className="w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-magenta-500 outline-none transition-all placeholder:text-zinc-300 font-mono"
							placeholder="••••••••••••"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4 pt-2">
						<div className="space-y-2">
							<label className="text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest pl-1">
								Neues Passwort
							</label>
							<input
								type="password"
								required
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-magenta-500 outline-none transition-all placeholder:text-zinc-300 font-mono"
								placeholder="••••••••••••"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest pl-1">
								Bestätigen
							</label>
							<input
								type="password"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-magenta-500 outline-none transition-all placeholder:text-zinc-300 font-mono"
								placeholder="••••••••••••"
							/>
						</div>
					</div>

					{status === "error" && (
						<motion.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold flex gap-2 items-center border border-red-100"
						>
							<AlertTriangle className="w-4 h-4 shrink-0" />
							{errorMsg}
						</motion.div>
					)}

					{status === "success" && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							className="p-4 bg-green-50 text-green-700 rounded-2xl text-sm font-semibold flex gap-2 items-center border border-green-100"
						>
							<Check className="w-4 h-4 shrink-0" />
							Passwort wurde erfolgreich aktualisiert.
						</motion.div>
					)}

					<div className="pt-4">
						<button
							type="submit"
							disabled={status === "pending"}
							className="w-full sm:w-auto px-10 py-4 bg-magenta-500 hover:bg-magenta-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-magenta-500/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 group"
						>
							{status === "pending"
								? "Wird gespeichert..."
								: "Änderungen speichern"}
							<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
						</button>
					</div>
				</form>
			</div>
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

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			className="space-y-6"
		>
			<div className="bg-white border border-zinc-200 rounded-[32px] p-10 shadow-sm overflow-hidden relative">
				{isMaintenance && (
					<div className="absolute top-0 right-0 p-8">
						<div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 animate-pulse">
							<div className="w-2 h-2 rounded-full bg-red-500" />
							AKTIV
						</div>
					</div>
				)}

				<div className="max-w-xl">
					<div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-8">
						<Hammer className="w-8 h-8 text-zinc-900" />
					</div>

					<h2 className="text-3xl font-black text-[#1a1a2e] mb-4 tracking-tight">
						Wartungsmodus
					</h2>
					<p className="text-zinc-500 text-lg leading-relaxed mb-10">
						Wenn der Wartungsmodus aktiviert ist, wird der Zugriff auf das
						Sales-Tool für alle nicht-administrativen Nutzer gesperrt.
					</p>

					<div className="space-y-4 mb-10">
						<div className="flex gap-4 items-start p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
							<ShieldAlert className="w-5 h-5 text-zinc-400 shrink-0 mt-1" />
							<p className="text-sm text-zinc-600 m-0 leading-relaxed">
								<span className="font-bold text-zinc-800">
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
							"w-full sm:w-auto h-[64px] px-10 rounded-2xl font-black transition-all duration-300 flex items-center justify-center gap-3 outline-none cursor-pointer",
							isMaintenance
								? "bg-white text-red-600 border-2 border-red-200 hover:bg-red-50"
								: "bg-zinc-900 hover:bg-black text-white shadow-xl shadow-zinc-900/20"
						)}
					>
						{isPending ? (
							<div className="w-6 h-6 border-[3px] border-current border-t-transparent rounded-full animate-spin" />
						) : (
							<>
								{isMaintenance
									? "Wartungsmodus deaktivieren"
									: "Wartungsmodus jetzt aktivieren"}
								{!isMaintenance && <ArrowRight className="w-5 h-5" />}
							</>
						)}
					</button>
				</div>
			</div>

			<div className="bg-magenta-50 border border-magenta-100 rounded-3xl p-8 flex gap-6 items-center">
				<div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-magenta-100">
					<Shield className="w-8 h-8 text-magenta-500" />
				</div>
				<div>
					<h4 className="text-magenta-900 font-bold m-0 text-lg">
						Admin-Privileg
					</h4>
					<p className="text-magenta-700/70 m-0 text-sm mt-1">
						Du als Administrator kannst das Tool auch während der
						Wartungsarbeiten weiterhin nutzen, um Änderungen zu testen.
					</p>
				</div>
			</div>
		</motion.div>
	);
}
