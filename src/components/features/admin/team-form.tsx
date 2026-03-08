"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { Input } from "@/components/shared/ui/input";

const teamSchema = z.object({
	name: z.string().min(1, "Name ist erforderlich"),
	email: z
		.string()
		.email("Gültige E-Mail erforderlich")
		.optional()
		.or(z.literal(""))
});

type TeamFormData = z.infer<typeof teamSchema>;

interface TeamFormProps {
	mode: "create" | "edit";
	teamId?: string;
	initialData?: { name: string; email?: string | null };
}

export function TeamForm({ mode, teamId, initialData }: TeamFormProps) {
	const router = useRouter();
	const utils = trpc.useUtils();

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(teamSchema),
		mode: "onChange",
		defaultValues: {
			name: initialData?.name || "",
			email: initialData?.email || ""
		}
	});

	const createMutation = trpc.team.create.useMutation({
		onSuccess: () => {
			utils.team.list.invalidate();
			router.push("/admin/teams");
			router.refresh();
		}
	});

	const updateMutation = trpc.team.update.useMutation({
		onSuccess: () => {
			utils.team.list.invalidate();
			utils.team.getById.invalidate({ id: teamId! });
			router.push("/admin/teams");
			router.refresh();
		}
	});

	const onSubmit = (data: any) => {
		if (mode === "create") {
			createMutation.mutate(data);
		} else if (mode === "edit" && teamId) {
			updateMutation.mutate({ id: teamId, ...data });
		}
	};

	const isPending = createMutation.isPending || updateMutation.isPending;

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Link
					href="/admin/teams"
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
							label="Team-Name"
							placeholder="z.B. Team Berlin Süd"
							error={errors.name?.message as string}
							{...register("name")}
						/>

						<Input
							label="Team-E-Mail"
							type="email"
							placeholder="z.B. team06@telekom.de"
							error={errors.email?.message as string}
							{...register("email")}
						/>
						<p className="text-[0.7rem] text-[#888] m-0 -mt-2">
							Nach der Erstellung kannst du dem Team spezifische Fokus-Produkte
							/ Fokus-Optionen in der Übersicht zuweisen.
						</p>
					</div>
				</div>
			</div>
		</form>
	);
}
