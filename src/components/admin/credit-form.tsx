"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import clsx from "clsx";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

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

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(creditSchema),
		defaultValues: {
			name: initialData ? initialData.name : "",
			value: initialData ? initialData.value : 0,
			isActive: initialData ? initialData.isActive : true
		}
	});

	const createMutation = trpc.admin.oneTimeCredit.create.useMutation({
		onSuccess: () => {
			router.push("/admin/credits");
			router.refresh();
		}
	});

	const updateMutation = trpc.admin.oneTimeCredit.update.useMutation({
		onSuccess: () => {
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
		<div className="max-w-2xl mx-auto">
			<div className="mb-6 flex items-center justify-between">
				<Link
					href="/admin/credits"
					className="flex items-center text-sm text-zinc-500 hover:text-zinc-900:text-zinc-300 transition-colors"
				>
					<ArrowLeft className="w-4 h-4 mr-1" /> Zurück zur Übersicht
				</Link>
				<h1 className="text-2xl font-bold text-zinc-900">
					{isEditMode ? "Gutschrift bearbeiten" : "Neue Gutschrift"}
				</h1>
			</div>

			<form
				onSubmit={handleSubmit(onSubmit)}
				className="space-y-6 bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm"
			>
				{/* Name */}
				<div>
					<label className="block text-sm font-medium text-zinc-700 mb-1">
						Bezeichnung
					</label>
					<input
						{...register("name")}
						className="w-full px-4 py-2 rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-magenta-500"
						placeholder="z.B. Anschlusspreisbefreiung"
					/>
					{errors.name && (
						<p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
					)}
				</div>

				{/* Value */}
				<div>
					<label className="block text-sm font-medium text-zinc-700 mb-1">
						Wert (€)
					</label>
					<input
						type="number"
						step="0.01"
						{...register("value", { valueAsNumber: true })}
						className="w-full px-4 py-2 rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-magenta-500"
						placeholder="0.00"
					/>
					{errors.value && (
						<p className="text-red-500 text-xs mt-1">{errors.value.message}</p>
					)}
				</div>

				{/* Active Status */}
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="isActive"
						{...register("isActive")}
						className="rounded border-zinc-300 text-magenta-600 focus:ring-magenta-500"
					/>
					<label
						htmlFor="isActive"
						className="text-sm text-zinc-700"
					>
						Aktiv (für Verkäufer sichtbar)
					</label>
				</div>

				{/* Submit Button */}
				<div className="pt-4 border-t border-zinc-200 flex justify-end">
					<button
						type="submit"
						disabled={isSubmitting}
						className={clsx(
							"px-6 py-2 rounded-lg font-bold text-white transition-all flex items-center gap-2",
							isSubmitting
								? "bg-zinc-400 cursor-not-allowed"
								: "bg-magenta-600 hover:bg-magenta-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
						)}
					>
						{isSubmitting ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : (
							<Save className="w-5 h-5" />
						)}
						{isEditMode ? "Speichern" : "Erstellen"}
					</button>
				</div>
			</form>
		</div>
	);
}
