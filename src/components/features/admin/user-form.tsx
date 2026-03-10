"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import {
	Save,
	Loader2,
	ArrowLeft,
	AlertCircle,
	Shield,
	Key,
	Share2
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { Input } from "@/components/shared/ui/input";
import { useState, useEffect } from "react";
import {
	AdminPageHeader,
	AdminFormSection,
	AdminFormContainer
} from "@/components/shared/ui/admin-ui";

const userSchema = z.object({
	email: z.string().email("Gültige E-Mail erforderlich"),
	password: z.string(),
	role: z.enum(["ADMIN", "OD_MANAGER", "LOCATION_MANAGER", "TEAM_LEADER"]),
	isEditor: z.boolean().default(false).optional(),
	odRegionId: z.string().optional().nullable(),
	locationId: z.string().optional().nullable(),
	teamId: z.string().optional().nullable()
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
	mode: "create" | "edit";
	userId?: string;
	initialData?: {
		email: string;
		role: "ADMIN" | "OD_MANAGER" | "LOCATION_MANAGER" | "TEAM_LEADER";
		isEditor?: boolean;
		odRegionId?: string | null;
		locationId?: string | null;
		teamId?: string | null;
	};
}

export function UserForm({ mode, userId, initialData }: UserFormProps) {
	const router = useRouter();
	const utils = trpc.useUtils();
	const [errorMsg, setErrorMsg] = useState("");

	const { data: currentUser } = trpc.auth.me.useQuery();

	const { data: odRegionsData, isLoading: isLoadingOdRegions } =
		trpc.odRegion.list.useQuery();
	const odRegions = odRegionsData?.items;

	const { data: locationsData, isLoading: isLoadingLocations } =
		trpc.location.list.useQuery();
	const locations = locationsData?.items;

	const { data: teamsData, isLoading: isLoadingTeams } =
		trpc.team.list.useQuery();
	const teams = teamsData?.items;

	const {
		register,
		watch,
		setValue,
		handleSubmit,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(userSchema),
		mode: "onChange",
		defaultValues: {
			email: initialData?.email || "",
			password: "",
			role: initialData?.role || "TEAM_LEADER",
			isEditor: initialData?.isEditor || false,
			odRegionId: initialData?.odRegionId || "",
			locationId: initialData?.locationId || "",
			teamId: initialData?.teamId || ""
		}
	});

	const selectedRole = watch("role");
	const selectedOdRegionId = watch("odRegionId");
	const selectedLocationId = watch("locationId");

	useEffect(() => {
		if (mode === "create" && currentUser) {
			if (currentUser.role === "OD_MANAGER" && currentUser.odRegionId) {
				setValue("odRegionId", currentUser.odRegionId);
			} else if (
				currentUser.role === "LOCATION_MANAGER" &&
				currentUser.locationId
			) {
				setValue("locationId", currentUser.locationId);
			} else if (currentUser.role === "TEAM_LEADER" && currentUser.teamId) {
				setValue("teamId", currentUser.teamId);
			}
		}
	}, [currentUser, mode, setValue]);

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
				password: data.password || undefined,
				isEditor: data.isEditor,
				odRegionId: data.odRegionId || null,
				locationId: data.locationId || null,
				teamId: data.teamId || null
			});
		}
	};

	const isPending = createMutation.isPending || updateMutation.isPending;

	const SaveButton = (
		<button
			type="submit"
			form="user-form"
			disabled={isPending}
			className={clsx(
				"px-6 py-2.5 rounded-2xl font-bold text-white flex items-center gap-2.5 transition-all duration-300 text-[0.85rem] cursor-pointer active:scale-95 shadow-[0_4px_14px_rgba(226,0,116,0.3)] hover:shadow-[0_8px_24px_rgba(226,0,116,0.4)] hover:-translate-y-0.5",
				isPending
					? "bg-[#ddd] shadow-none cursor-not-allowed text-[#999] opacity-50"
					: "bg-[#e20074] hover:bg-[#c70066]"
			)}
		>
			{isPending ? (
				<Loader2 className="w-4 h-4 animate-spin" />
			) : (
				<Save className="w-5 h-5" />
			)}
			Änderungen speichern
		</button>
	);

	return (
		<div className="space-y-8 pb-12">
			<AdminPageHeader
				title={mode === "create" ? "Neuer Benutzer" : "Benutzer bearbeiten"}
				subtitle={
					mode === "create"
						? "Erstelle einen neuen Zugangscode für das Admin-Dashboard."
						: `Verwalte die Berechtigungen für ${initialData?.email}`
				}
				backHref="/admin/users"
				action={SaveButton}
			/>

			{errorMsg && (
				<div className="bg-red-50 text-red-600 p-5 rounded-3xl flex items-center gap-4 text-[0.9rem] font-medium border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
					<div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
						<AlertCircle className="w-6 h-6" />
					</div>
					{errorMsg}
				</div>
			)}

			<form id="user-form" onSubmit={handleSubmit(onSubmit)}>
				<AdminFormContainer>
					<AdminFormSection
						title="Zugangsdaten"
						description="E-Mail und Passwort für den Login."
						icon={Key}
					>
						<Input
							label="E-Mail"
							type="email"
							placeholder="z.B. user@telekom.de"
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
								className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 transition-all"
								placeholder={
									mode === "edit"
										? "Neues Passwort"
										: "Passwort (min. 6 Zeichen)"
								}
								{...register("password")}
							/>
						</div>
					</AdminFormSection>

					<AdminFormSection
						title="Rollen & Berechtigungen"
						description="Definiere was dieser Benutzer darf."
						icon={Shield}
					>
						<div className="flex flex-col gap-1.5">
							<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
								Funktionsrolle
							</label>
							<div className="relative">
								<select
									{...register("role")}
									className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 transition-all text-[#1a1a2e] appearance-none cursor-pointer"
								>
									{(currentUser?.role === "ADMIN" || !currentUser?.role) && (
										<option value="ADMIN">
											Zentraler Administrator (Full Access)
										</option>
									)}
									{(currentUser?.role === "ADMIN" ||
										currentUser?.role === "OD_MANAGER") && (
										<option value="OD_MANAGER">
											OD-Leiter (Bereichszugriff)
										</option>
									)}
									{(currentUser?.role === "ADMIN" ||
										currentUser?.role === "OD_MANAGER" ||
										currentUser?.role === "LOCATION_MANAGER") && (
										<option value="LOCATION_MANAGER">
											Standortleiter (Regional-Fokus)
										</option>
									)}
									<option value="TEAM_LEADER">
										Teamleiter (Eingeschränkt)
									</option>
								</select>
								<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#bbb]">
									<svg
										width="12"
										height="8"
										viewBox="0 0 12 8"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M1.5 1.75L6 6.25L10.5 1.75"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</div>
							</div>
						</div>

						<div className="flex items-start gap-4 p-5 bg-[#fdf2f8] border border-[#fce7f3] rounded-[1.5rem] mt-2">
							<div className="relative flex items-center">
								<input
									type="checkbox"
									id="isEditor"
									{...register("isEditor")}
									className="peer w-6 h-6 rounded-lg border-[#fbcfe8] text-[#e20074] focus:ring-[#e20074] cursor-pointer appearance-none bg-white transition-all checked:bg-[#e20074] checked:border-[#e20074]"
								/>
								<div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white opacity-0 peer-checked:opacity-100 transition-opacity">
									<svg
										width="12"
										height="10"
										viewBox="0 0 12 10"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M1 5L4.5 8.5L11 1.5"
											stroke="currentColor"
											strokeWidth="3"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</div>
							</div>
							<div className="flex flex-col">
								<label
									htmlFor="isEditor"
									className="text-[0.85rem] font-bold text-[#1a1a2e] cursor-pointer"
								>
									Zusätzliche Editor-Rechte aktivieren
								</label>
								<p className="text-[0.75rem] text-[#be185d] m-0 leading-relaxed font-medium mt-0.5">
									Erlaubt das Bearbeiten von Produkten, Aktionen, Gutschriften
									und News – unabhängig von der Funktionsrolle.
								</p>
							</div>
						</div>
					</AdminFormSection>

					{(selectedRole === "OD_MANAGER" ||
						selectedRole === "LOCATION_MANAGER" ||
						selectedRole === "TEAM_LEADER") && (
						<AdminFormSection
							title="Hierarchie-Zuordnung"
							description="Definiere den Zuständigkeitsbereich des Benutzers."
							icon={Share2}
						>
							<div className="space-y-5">
								<div className="flex flex-col gap-1.5">
									<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
										OD-Bereich
									</label>
									<div className="relative">
										<select
											{...register("odRegionId")}
											disabled={
												isLoadingOdRegions || currentUser?.role === "OD_MANAGER"
											}
											className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 transition-all disabled:opacity-50 appearance-none cursor-pointer"
										>
											<option value="">(Kein OD-Bereich)</option>
											{odRegions
												?.filter(
													(r: any) =>
														currentUser?.role === "ADMIN" ||
														r.id === currentUser?.odRegionId
												)
												.map((r: any) => (
													<option key={r.id} value={r.id}>
														{r.name}
													</option>
												))}
										</select>
										<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#bbb]">
											<svg
												width="12"
												height="8"
												viewBox="0 0 12 8"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M1.5 1.75L6 6.25L10.5 1.75"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										</div>
									</div>
								</div>

								{(selectedRole === "LOCATION_MANAGER" ||
									selectedRole === "TEAM_LEADER") && (
									<div className="flex flex-col gap-1.5">
										<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
											Standort
										</label>
										<div className="relative">
											<select
												{...register("locationId")}
												disabled={
													isLoadingLocations ||
													currentUser?.role === "LOCATION_MANAGER"
												}
												className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 transition-all disabled:opacity-50 appearance-none cursor-pointer"
											>
												<option value="">(Kein Standort)</option>
												{locations
													?.filter(
														(l: any) =>
															(currentUser?.role === "ADMIN" ||
																currentUser?.role === "OD_MANAGER" ||
																l.id === currentUser?.locationId) &&
															(!selectedOdRegionId ||
																l.odRegionId === selectedOdRegionId)
													)
													.map((loc: any) => (
														<option key={loc.id} value={loc.id}>
															{loc.name} {loc.isActive ? "" : "(Inaktiv)"}
														</option>
													))}
											</select>
											<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#bbb]">
												<svg
													width="12"
													height="8"
													viewBox="0 0 12 8"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M1.5 1.75L6 6.25L10.5 1.75"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											</div>
										</div>
									</div>
								)}

								{selectedRole === "TEAM_LEADER" && (
									<div className="flex flex-col gap-1.5">
										<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
											Vertriebsteam
										</label>
										<div className="relative">
											<select
												{...register("teamId")}
												disabled={
													isLoadingTeams || currentUser?.role === "TEAM_LEADER"
												}
												className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 transition-all disabled:opacity-50 appearance-none cursor-pointer"
											>
												<option value="">(Kein Team)</option>
												{teams
													?.filter(
														(t: any) =>
															(currentUser?.role !== "TEAM_LEADER" ||
																t.id === currentUser?.teamId) &&
															(!selectedLocationId ||
																t.locationId === selectedLocationId)
													)
													.map((team: any) => (
														<option key={team.id} value={team.id}>
															{team.name}
														</option>
													))}
											</select>
											<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#bbb]">
												<svg
													width="12"
													height="8"
													viewBox="0 0 12 8"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M1.5 1.75L6 6.25L10.5 1.75"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											</div>
										</div>
									</div>
								)}
							</div>
						</AdminFormSection>
					)}
				</AdminFormContainer>
			</form>
		</div>
	);
}
