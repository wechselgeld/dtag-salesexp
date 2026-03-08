"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Save, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { Input } from "@/components/shared/ui/input";
import { useState } from "react";

const userSchema = z.object({
	email: z.string().email("Gültige E-Mail erforderlich"),
	password: z.string(),
	role: z.enum(["ADMIN", "TEAM_LEADER"])
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
	mode: "create" | "edit";
	userId?: string;
	initialData?: { email: string; role: "ADMIN" | "TEAM_LEADER" };
}

export function UserForm({ mode, userId, initialData }: UserFormProps) {
	const router = useRouter();
	const utils = trpc.useUtils();
	const [errorMsg, setErrorMsg] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(userSchema),
		mode: "onChange",
		defaultValues: {
			email: initialData?.email || "",
			password: "",
			role: initialData?.role || "TEAM_LEADER"
		}
	});

	const createMutation = trpc.adminUsers.create.useMutation({
		onSuccess: () => {
			utils.adminUsers.list.invalidate();
			router.push("/admin/users");
			router.refresh();
		},
		onError: (err) => {
			setErrorMsg(err.message);
		}
	});

	const updateMutation = trpc.adminUsers.update.useMutation({
		onSuccess: () => {
			utils.adminUsers.list.invalidate();
			router.push("/admin/users");
			router.refresh();
		},
		onError: (err) => {
			setErrorMsg(err.message);
		}
	});

	const onSubmit = (data: any) => {
		setErrorMsg("");
		if (mode === "create") {
			if (data.password.length < 6) {
				setErrorMsg("Passwort muss mindestens 6 Zeichen lang sein");
				return;
			}
			createMutation.mutate(data);
		} else if (mode === "edit" && userId) {
			if (data.password && data.password.length < 6) {
				setErrorMsg("Passwort muss mindestens 6 Zeichen lang sein");
				return;
			}
			updateMutation.mutate({
				id: userId,
				email: data.email,
				role: data.role,
				password: data.password || ""
			});
		}
	};

	const isPending = createMutation.isPending || updateMutation.isPending;

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Link
					href="/admin/users"
					className="text-[#999] hover:text-[#1a1a2e] flex items-center gap-2 transition-colors text-[0.85rem] no-underline"
				>
					<ArrowLeft className="w-4 h-4" /> Zurück
				</Link>
				<button
					type="submit"
					disabled={isPending}
					className={clsx(
						"px-5 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 transition-all duration-200 text-[0.82rem] cursor-pointer active:scale-95 shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5",
						isPending
							? "bg-[#ddd] shadow-none cursor-not-allowed text-[#999] opacity-50"
							: "bg-[#e20074] hover:bg-[#c70066]"
					)}
				>
					{isPending ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						<Save className="w-4 h-4" />
					)}
					Speichern
				</button>
			</div>

			{errorMsg && (
				<div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-[0.9rem] font-medium border border-red-100 shadow-sm">
					<AlertCircle className="w-5 h-5 shrink-0" />
					{errorMsg}
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Basic data */}
				<div className="space-y-6">
					<div className="bg-white rounded-2xl p-6 border border-[#eaedf0] space-y-5 shadow-sm">
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] border-b border-[#f0f0f0] pb-2 m-0">
							Basisdaten
						</h3>

						<Input
							label="E-Mail"
							type="email"
							placeholder="z.B. admin@telekom.de"
							error={errors.email?.message as string}
							{...register("email")}
						/>

						<div className="flex flex-col gap-1.5">
							<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
								Passwort{" "}
								{mode === "edit" && (
									<span className="text-[#888] font-normal">
										(leer lassen, um nicht zu ändern)
									</span>
								)}
							</label>
							<input
								type="password"
								className="w-full px-4 py-2.5 rounded-xl border border-[#eaedf0] bg-white text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074] transition-all"
								placeholder={
									mode === "edit"
										? "Neues Passwort"
										: "Passwort (min. 6 Zeichen)"
								}
								{...register("password")}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
								Rolle
							</label>
							<select
								{...register("role")}
								className="w-full px-4 py-2.5 rounded-xl border border-[#eaedf0] bg-white text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074] transition-all text-[#1a1a2e]"
							>
								<option value="ADMIN">Administrator (Vollzugriff)</option>
								<option value="TEAM_LEADER">
									Teamleiter (Eingeschränkter Zugriff)
								</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		</form>
	);
}
