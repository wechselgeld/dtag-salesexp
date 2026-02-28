"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Link
					href="/admin/news"
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

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Basic data */}
				<div className="space-y-6">
					<div className="bg-white rounded-2xl p-6 border border-[#eaedf0] space-y-5 shadow-sm">
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] border-b border-[#f0f0f0] pb-2 m-0">
							Basisdaten
						</h3>

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
							{...register("content")}
						/>

						<div className="space-y-1.5 pt-2 border-t border-[#f0f0f0]">
							<label className="text-[0.75rem] font-semibold text-[#888] block mb-3">
								Wichtigkeit
							</label>
							<div className="flex flex-wrap gap-2">
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
													"px-4 py-2 rounded-xl text-[0.75rem] font-semibold transition-all duration-200 border-2 active:scale-95 cursor-pointer",
													isSelected
														? "text-white"
														: "bg-transparent hover:bg-black/5"
												)}
												style={{
													backgroundColor: isSelected ? color : "transparent",
													borderColor: isSelected ? color : "#eaedf0",
													color: isSelected ? "#fff" : color
												}}
											>
												{PRIORITY_LABELS[p]}
											</button>
										);
									}
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</form>
	);
}
