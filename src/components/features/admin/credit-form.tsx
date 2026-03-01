"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import clsx from "clsx";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/shared/ui/input";
import { Checkbox } from "@/components/shared/ui/checkbox";

const creditSchema = z.object({
	name: z.string().min(1, "Name ist erforderlich"),
	value: z.number().min(0, "Wert muss positiv sein"),
	isActive: z.boolean().default(true)
});

type CreditFormData = z.infer<typeof creditSchema>;

interface CreditFormProps {
	initialData?: { name: string; value: number; isActive: boolean; id: string };
	isEditMode?: boolean;
}

export function CreditForm({
	initialData,
	isEditMode = false
}: CreditFormProps) {
	const router = useRouter();
	const utils = trpc.useUtils();

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(creditSchema),
		mode: "onChange",
		defaultValues: {
			name: initialData ? initialData.name : "",
			value: initialData ? initialData.value : 0,
			isActive: initialData ? initialData.isActive : true
		}
	});

	const createMutation = trpc.admin.oneTimeCredit.create.useMutation({
		onSuccess: () => {
			utils.admin.oneTimeCredit.list.invalidate();
			utils.admin.oneTimeCredit.getById.invalidate();
			router.push("/admin/credits");
			router.refresh();
		}
	});

	const updateMutation = trpc.admin.oneTimeCredit.update.useMutation({
		onSuccess: () => {
			utils.admin.oneTimeCredit.list.invalidate();
			utils.admin.oneTimeCredit.getById.invalidate();
			router.push("/admin/credits");
			router.refresh();
		}
	});

	const onSubmit = (data: CreditFormData) => {
		if (isEditMode && initialData) {
			updateMutation.mutate({ ...data, id: initialData.id });
		} else {
			createMutation.mutate(data);
		}
	};

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Link
					href="/admin/credits"
					className="text-[#999] hover:text-[#1a1a2e] flex items-center gap-2 transition-colors text-[0.85rem] no-underline"
				>
					<ArrowLeft className="w-4 h-4" /> Zurück
				</Link>
				<button
					type="submit"
					disabled={isSubmitting}
					className={clsx(
						"px-5 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 transition-all duration-200 text-[0.82rem] cursor-pointer active:scale-95",
						isSubmitting
							? "bg-[#ddd] cursor-not-allowed"
							: "bg-[#e20074] hover:bg-[#c70066]"
					)}
				>
					{isSubmitting ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						<Save className="w-4 h-4" />
					)}
					Speichern
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-6">
					<div className="bg-white rounded-2xl p-6 border border-[#eaedf0] space-y-5">
						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] border-b border-[#f0f0f0] pb-2 m-0">
							Basisdaten
						</h3>

						{/* Name */}
						<Input
							label="Bezeichnung"
							placeholder="z.B. Anschlusspreisbefreiung"
							error={errors.name?.message as string}
							{...register("name")}
						/>

						{/* Value */}
						<Input
							label="Wert (€)"
							type="number"
							step="0.01"
							placeholder="0.00"
							error={errors.value?.message as string}
							{...register("value", { valueAsNumber: true })}
						/>

						{/* Active Status */}
						<div className="space-y-3 pt-2 border-t border-[#f0f0f0]">
							<h4 className="text-[0.8rem] font-bold text-[#1a1a2e] m-0 mb-3">
								Sichtbarkeit
							</h4>
							<Checkbox
								label="Aktiv (für Verkäufer sichtbar)"
								{...register("isActive")}
							/>
						</div>
					</div>
				</div>
			</div>
		</form>
	);
}
