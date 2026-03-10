"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Save, Loader2, ArrowLeft, Megaphone, Flag } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { Input } from "@/components/shared/ui/input";
import {
	AdminPageHeader,
	AdminFormSection,
	AdminFormContainer
} from "@/components/shared/ui/admin-ui";
import { Textarea } from "@/components/shared/ui/textarea";

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
	priority: z.enum(["INFO", "UPDATE", "IMPORTANT", "CRITICAL"]).default("INFO")
});

type NewsFormData = z.infer<typeof newsSchema>;

interface NewsFormProps {
	mode: "create" | "edit";
}

export function NewsForm({ mode }: NewsFormProps) {
	const router = useRouter();
	const utils = trpc.useUtils();

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
			priority: "INFO"
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
		if (mode === "create") {
			createMutation.mutate(data);
		}
	};

	const isPending = createMutation.isPending;
	const selectedPriority = watch("priority");

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
						? "Erstelle eine neue Ankündigung für alle Benutzer des Systems."
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
