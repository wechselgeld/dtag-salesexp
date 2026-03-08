"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { TelekomLogo } from "@/components/shared/telekom-logo";
import { GlobalFooter } from "@/components/shared/global-footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
	email: z
		.string()
		.min(1, "E-Mail ist erforderlich")
		.email("Bitte gib eine gültige E-Mail-Adresse ein"),
	password: z.string().min(1, "Passwort ist erforderlich")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const router = useRouter();
	const [error, setError] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors, isValid }
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		mode: "onChange",
		defaultValues: {
			email: "",
			password: ""
		}
	});

	const loginMutation = trpc.auth.login.useMutation({
		onSuccess: () => {
			router.push("/admin/products");
			router.refresh(); // Refresh to update server components/middleware state
		},
		onError: (err) => {
			setError(err.message);
		}
	});

	const onSubmit = (data: LoginFormData) => {
		setError("");
		loginMutation.mutate({ email: data.email, password: data.password });
	};

	return (
		<div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-[#e20074]/20 selection:text-[#e20074]">
			<motion.div
				initial={{ opacity: 0, y: 15 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
				className="w-full max-w-[480px] flex flex-col items-center"
			>
				{/* Top Branding */}
				<div className="mb-10 flex flex-col items-center text-center">
					<TelekomLogo className="w-12 h-12 text-[#e20074] mb-8" />

					<h1 className="text-[2.2rem] sm:text-[2.5rem] font-extrabold text-[#1a1a2e] tracking-tight mb-3 leading-none">
						System Login
					</h1>
					<p className="text-[1.05rem] text-[#888] font-normal leading-relaxed max-w-[90%] mx-auto mt-2">
						Bitte melde Dich an, um den Administrationsbereich zu betreten.
					</p>
				</div>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="w-full flex flex-col gap-6"
				>
					<div className="flex flex-col gap-2.5 relative">
						<div className="flex justify-between items-baseline mb-[-4px]">
							<label className="text-[0.75rem] font-bold text-[#b0b0b0] uppercase tracking-wider pl-1 font-sans">
								E-Mail Adresse
							</label>
							{errors.email && (
								<motion.span
									initial={{ opacity: 0, y: 2 }}
									animate={{ opacity: 1, y: 0 }}
									className="text-[0.65rem] font-bold text-red-500 uppercase tracking-widest px-2"
								>
									{errors.email.message}
								</motion.span>
							)}
						</div>
						<input
							type="email"
							{...register("email")}
							className={clsx(
								"w-full px-5 py-4 rounded-2xl border bg-[#f7f8fa] text-[#1a1a2e] focus:outline-none focus:bg-white transition-all text-[0.95rem] font-medium placeholder:text-[#ccc]",
								errors.email
									? "border-red-300 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
									: "border-[#eaedf0] focus:border-[#e20074]/30 focus:shadow-[0_0_0_4px_rgba(226,0,116,0.06)]"
							)}
							placeholder="admin@telekom.de"
						/>
					</div>

					<div className="flex flex-col gap-2.5 relative">
						<div className="flex justify-between items-baseline mb-[-4px]">
							<label className="text-[0.75rem] font-bold text-[#b0b0b0] uppercase tracking-wider pl-1 font-sans">
								Passwort
							</label>
							{errors.password && (
								<motion.span
									initial={{ opacity: 0, y: 2 }}
									animate={{ opacity: 1, y: 0 }}
									className="text-[0.65rem] font-bold text-red-500 uppercase tracking-widest px-2"
								>
									{errors.password.message}
								</motion.span>
							)}
						</div>
						<input
							type="password"
							{...register("password")}
							className={clsx(
								"w-full px-5 py-4 rounded-2xl border bg-[#f7f8fa] text-[#1a1a2e] focus:outline-none focus:bg-white transition-all font-mono tracking-widest text-[1rem] placeholder:text-[#ccc]",
								errors.password
									? "border-red-300 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
									: "border-[#eaedf0] focus:border-[#e20074]/30 focus:shadow-[0_0_0_4px_rgba(226,0,116,0.06)]"
							)}
							placeholder="••••••••"
						/>
					</div>

					{error && (
						<motion.div
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							className="p-4 bg-red-50 text-red-600 rounded-2xl text-[0.85rem] font-semibold flex gap-3 items-center border border-red-100 mt-2"
						>
							<AlertTriangle className="w-5 h-5 shrink-0" />
							{error}
						</motion.div>
					)}

					<button
						type="submit"
						disabled={loginMutation.isPending || !isValid}
						className={clsx(
							"w-full h-[56px] rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 mt-4 outline-none",
							!loginMutation.isPending && isValid
								? "bg-[#e20074] hover:bg-[#c70066] text-white shadow-[0_8px_20px_-6px_rgba(226,0,116,0.35)] cursor-pointer"
								: "bg-[#f7f8fa] text-[#bbb] border border-[#eaedf0] cursor-not-allowed"
						)}
					>
						{loginMutation.isPending ? (
							<div className="w-5 h-5 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
						) : (
							<span className="flex items-center gap-2 text-[1rem]">
								Anmelden{" "}
								<ArrowRight className="w-4 h-4 ml-0.5" strokeWidth={2.5} />
							</span>
						)}
					</button>
				</form>

				<GlobalFooter
					className="pt-10 pb-0 mt-4 text-[#c0c0c0]"
					linkColor="text-[#c0c0c0]"
				/>
			</motion.div>
		</div>
	);
}
