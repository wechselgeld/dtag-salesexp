"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Save, Loader2, ArrowLeft, Megaphone, Flag, Target } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { Input } from "@/components/shared/ui/input";
import {
	AdminPageHeader,
	AdminFormSection,
	AdminFormContainer
} from "@/components/shared/ui/admin-ui";
import { Textarea } from "@/components/shared/ui/textarea";
import { useEffect, useMemo, useState } from "react";

const PRIORITY_COLORS: Record<string, string> = {
	INFO: "#00a878",
	UPDATE: "#0090d0",
	IMPORTANT: "#ff6b00",
	CRITICAL: "#dc2626"
};

const PRIORITY_LABELS: Record<string, string> = {
	INFO: "Info",
	UPDATE: "Update",
	IMPORTANT: "Wichtig",
	CRITICAL: "Kritisch"
};

const newsSchema = z.object({
	title: z.string().min(1, "Titel ist erforderlich"),
	content: z.string().min(1, "Inhalt ist erforderlich"),
	priority: z.enum(["INFO", "UPDATE", "IMPORTANT", "CRITICAL"]).default("INFO"),
	targetType: z.enum(["GLOBAL", "OD_REGION", "LOCATION", "TEAM"]).default("GLOBAL"),
	odRegionId: z.string().optional().nullable(),
	locationId: z.string().optional().nullable(),
	teamId: z.string().optional().nullable(),
});

type NewsFormData = z.infer<typeof newsSchema>;

interface NewsFormProps {
	mode: "create" | "edit";
}

export function NewsForm({ mode }: NewsFormProps) {
	const router = useRouter();
	const utils = trpc.useUtils();

	const { data: currentUser } = trpc.auth.me.useQuery();
	
	const { data: regionsData, isLoading: isLoadingRegions } = trpc.odRegion.list.useQuery();
	const { data: locationsData, isLoading: isLoadingLocations } = trpc.location.list.useQuery(
		(currentUser?.role === "OD_MANAGER" && currentUser.odRegionId) 
			? { odRegionId: currentUser.odRegionId } 
			: (currentUser?.role === "LOCATION_MANAGER" && currentUser.locationId)
				? { locationId: currentUser.locationId }
				: undefined
	);
	const { data: teamsData, isLoading: isLoadingTeams } = trpc.team.list.useQuery(
		(currentUser?.role === "OD_MANAGER" && currentUser.odRegionId)
			? { odRegionId: currentUser.odRegionId }
			: (currentUser?.role === "LOCATION_MANAGER" && currentUser.locationId)
				? { locationId: currentUser.locationId }
				: undefined
	);

	const [teamSearch, setTeamSearch] = useState("");

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(newsSchema),
		mode: "onChange",
		defaultValues: {
			title: "",
			content: "",
			priority: "INFO",
			targetType: "GLOBAL",
			odRegionId: "",
			locationId: "",
			teamId: ""
		}
	});

	const createMutation = trpc.admin.news.create.useMutation({
		onSuccess: () => {
			utils.admin.news.list.invalidate();
			router.push("/admin/news");
			router.refresh();
		}
	});

	const onSubmit = (data: any) => {
		const payload = {
			title: data.title,
			content: data.content,
			priority: data.priority,
			odRegionId: data.targetType === "OD_REGION" ? (data.odRegionId || null) : null,
			locationId: data.targetType === "LOCATION" ? (data.locationId || null) : null,
			teamId: data.targetType === "TEAM" ? (data.teamId || null) : null,
		};
		if (mode === "create") {
			createMutation.mutate(payload);
		}
	};

	const isPending = createMutation.isPending;
	const selectedPriority = watch("priority");
	const targetType = watch("targetType");

	const availableTargetTypes = useMemo(() => {
		if (!currentUser) return [];
		return [
			{ value: "GLOBAL", label: "Global (Alle)", roles: ["ADMIN"] },
			{ value: "OD_REGION", label: "OD-Bereich", roles: ["ADMIN", "OD_MANAGER"] },
			{ value: "LOCATION", label: "Standort", roles: ["ADMIN", "OD_MANAGER", "LOCATION_MANAGER"] },
			{ value: "TEAM", label: "Team", roles: ["ADMIN", "OD_MANAGER", "LOCATION_MANAGER", "TEAM_LEADER"] }
		].filter(t => t.roles.includes(currentUser.role));
	}, [currentUser]);

	useEffect(() => {
		if (currentUser && mode === "create" && targetType === "GLOBAL" && currentUser.role !== "ADMIN") {
			if (currentUser.role === "OD_MANAGER") {
				setValue("targetType", "OD_REGION" as any);
				if (currentUser.odRegionId) setValue("odRegionId", currentUser.odRegionId);
			} else if (currentUser.role === "LOCATION_MANAGER") {
				setValue("targetType", "LOCATION" as any);
				if (currentUser.locationId) setValue("locationId", currentUser.locationId);
			} else if (currentUser.role === "TEAM_LEADER") {
				setValue("targetType", "TEAM" as any);
				if (currentUser.teamId) setValue("teamId", currentUser.teamId);
			}
		}
	}, [currentUser, mode, setValue, targetType]);

	const SaveButton = (
		<button
			type="submit"
			form="news-form"
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
			News veröffentlichen
		</button>
	);

	return (
		<div className="space-y-8 pb-12">
			<AdminPageHeader
				title={mode === "create" ? "Neue News" : "News bearbeiten"}
				subtitle={
					mode === "create"
						? "Erstelle eine neue Ankündigung für die Benutzer des Systems."
						: "Verwalte die Inhalte der News."
				}
				backHref="/admin/news"
				action={SaveButton}
			/>

			<form id="news-form" onSubmit={handleSubmit(onSubmit)}>
				<AdminFormContainer>
					<AdminFormSection
						title="Inhalt"
						description="Titel und Text der Ankündigung."
						icon={Megaphone}
					>
						<Input
							label="Titel"
							placeholder="z.B. Wartungsarbeiten am Wochenende"
							error={errors.title?.message as string}
							{...register("title")}
						/>

						<Textarea
							label="Inhalt"
							placeholder="Beschreibung der Neuigkeit..."
							error={errors.content?.message as string}
							rows={6}
							{...register("content")}
						/>
					</AdminFormSection>

					<AdminFormSection
						title="Zielgruppe"
						description="Lege fest, wer diese Neuigkeit sehen soll."
						icon={Target}
					>
						<div className="flex flex-col gap-4">
							<div className="flex flex-wrap gap-3">
								{availableTargetTypes.map((t) => {
									const isSelected = targetType === t.value;
									return (
										<button
											key={t.value}
											type="button"
											onClick={() => setValue("targetType", t.value as any)}
											className={clsx(
												"px-5 py-3 rounded-2xl text-[0.85rem] font-bold transition-all duration-300 active:scale-95 flex items-center gap-2.5 flex-1 min-w-[140px] justify-center",
												isSelected
													? "bg-[#1a1a2e] text-white shadow-lg"
													: "bg-white border-2 border-[#eaedf0] text-[#1a1a2e] hover:border-[#ddd]"
											)}
										>
											{t.label}
										</button>
									);
								})}
							</div>

							{targetType === "OD_REGION" && (
								<div className="flex flex-col gap-1.5 mt-2 animate-in fade-in zoom-in-95 duration-200">
									<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
										OD-Bereich auswählen
									</label>
									<div className="relative">
										<select
											{...register("odRegionId")}
											disabled={isLoadingRegions || currentUser?.role === "OD_MANAGER"}
											className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 transition-all cursor-pointer appearance-none disabled:opacity-50"
										>
											<option value="">(Bitte OD-Bereich wählen)</option>
											{regionsData?.items
												.filter(r => currentUser?.role === "ADMIN" || r.id === currentUser?.odRegionId)
												.map((region) => (
												<option key={region.id} value={region.id}>
													{region.name}
												</option>
											))}
										</select>
										<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#bbb]">
											<ArrowLeft className="w-4 h-4 -rotate-90" />
										</div>
									</div>
								</div>
							)}

							{targetType === "LOCATION" && (
								<div className="flex flex-col gap-1.5 mt-2 animate-in fade-in zoom-in-95 duration-200">
									<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
										Standort auswählen
									</label>
									<div className="relative">
										<select
											{...register("locationId")}
											disabled={isLoadingLocations}
											className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 transition-all cursor-pointer appearance-none disabled:opacity-50"
										>
											<option value="">(Bitte Standort wählen)</option>
											{locationsData?.items
												.filter(l => {
													if (currentUser?.role === "ADMIN") return true;
													if (currentUser?.role === "OD_MANAGER") {
														// Backup filter in case trpc list returns more (it shouldn't, but let's be safe)
														return !currentUser.odRegionId || l.odRegionId === currentUser.odRegionId;
													}
													if (currentUser?.role === "LOCATION_MANAGER") {
														return l.id === currentUser.locationId;
													}
													return true; 
												})
												.map((location) => (
												<option key={location.id} value={location.id}>
													{location.name} {location.address ? `(${location.address})` : ""}
												</option>
											))}
										</select>
										<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#bbb]">
											<ArrowLeft className="w-4 h-4 -rotate-90" />
										</div>
									</div>
								</div>
							)}

							{targetType === "TEAM" && (
								<div className="flex flex-col gap-1.5 mt-2 animate-in fade-in zoom-in-95 duration-200">
									<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
										Team auswählen
									</label>
									<div className="relative">
										<div className="flex flex-col gap-2 mb-2">
											<input
												type="text"
												placeholder="Team suchen..."
												value={teamSearch}
												onChange={(e) => setTeamSearch(e.target.value)}
												className="w-full px-4 py-2 rounded-xl border border-[#eaedf0] bg-white text-[0.85rem] focus:outline-none focus:border-[#e20074]/30 transition-all"
											/>
										</div>
										<select
											{...register("teamId")}
											disabled={isLoadingTeams}
											className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 transition-all cursor-pointer appearance-none disabled:opacity-50"
										>
											<option value="">(Bitte Team wählen)</option>
											{teamsData?.items
												.filter(t => {
													if (currentUser?.role === "ADMIN") return true;
													if (currentUser?.role === "OD_MANAGER") return t.location?.odRegionId === currentUser.odRegionId;
													if (currentUser?.role === "LOCATION_MANAGER") return t.locationId === currentUser.locationId;
													return t.id === currentUser?.teamId;
												})
												.filter(t => {
													if (!teamSearch) return true;
													const label = `${t.name} ${t.location?.name || ""} ${t.location?.address || ""}`.toLowerCase();
													return label.includes(teamSearch.toLowerCase());
												})
												.map((team) => (
												<option key={team.id} value={team.id}>
													{team.name} {team.location?.name ? `- ${team.location.name}` : ""} {team.location?.address ? `(${team.location.address})` : ""}
												</option>
											))}
										</select>
										<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#bbb]">
											<ArrowLeft className="w-4 h-4 -rotate-90" />
										</div>
									</div>
								</div>
							)}
						</div>
					</AdminFormSection>

					<AdminFormSection
						title="Wichtigkeit"
						description="Wähle die passende Dringlichkeitsstufe."
						icon={Flag}
					>
						<div className="flex flex-wrap gap-3">
							{(["INFO", "UPDATE", "IMPORTANT", "CRITICAL"] as const).map(
								(p) => {
									const color = PRIORITY_COLORS[p];
									const isSelected = selectedPriority === p;
									return (
										<button
											key={p}
											type="button"
											onClick={() => setValue("priority", p)}
											className={clsx(
												"px-5 py-3 rounded-2xl text-[0.8rem] font-bold transition-all duration-300 active:scale-95 flex items-center gap-2.5 flex-1 min-w-[140px] justify-center",
												isSelected
													? "text-white shadow-lg"
													: "bg-white border-2 border-[#eaedf0] text-[#1a1a2e] hover:border-[#ddd]"
											)}
											style={{
												backgroundColor: isSelected ? color : "transparent",
												borderColor: isSelected ? color : "#eaedf0",
												boxShadow: isSelected ? `0 8px 16px ${color}22` : "none"
											}}
										>
											<div
												className={clsx(
													"w-2 h-2 rounded-full",
													isSelected
														? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
														: ""
												)}
												style={{ backgroundColor: isSelected ? "#fff" : color }}
											></div>
											{PRIORITY_LABELS[p]}
										</button>
									);
								}
							)}
						</div>
					</AdminFormSection>
				</AdminFormContainer>
			</form>
		</div>
	);
}
