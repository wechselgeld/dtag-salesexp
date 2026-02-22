"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const loginMutation = trpc.auth.login.useMutation({
		onSuccess: () => {
			router.push("/admin/products");
			router.refresh(); // Refresh to update server components/middleware state
		},
		onError: (err) => {
			setError(err.message);
		}
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		loginMutation.mutate({ email, password });
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8"
			>
				<div className="flex items-center justify-center mb-8">
					<div className="p-3 bg-magenta-100 dark:bg-magenta-900/30 rounded-xl text-magenta-600">
						<Lock className="w-8 h-8" />
					</div>
				</div>

				<h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-2">
					Admin Login
				</h1>
				<p className="text-center text-zinc-500 dark:text-zinc-400 mb-8">
					Bitte melde Dich an, um fortzufahren.
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
							Email Adresse
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-magenta-500 transition-all"
							placeholder="admin@telekom.de"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
							Passwort
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-magenta-500 transition-all"
							placeholder="••••••••"
							required
						/>
					</div>

					{error && (
						<div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
							{error}
						</div>
					)}

					<button
						type="submit"
						disabled={loginMutation.isPending}
						className="w-full py-3 bg-magenta-600 hover:bg-magenta-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loginMutation.isPending ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : (
							<>
								Anmelden <ArrowRight className="w-5 h-5" />
							</>
						)}
					</button>
				</form>
			</motion.div>
		</div>
	);
}
