"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import clsx from "clsx";
import { Save, Loader2, ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const addonSchema = z.object({
	name: z.string().min(1, "Name ist erforderlich"),
	description: z.string().optional(),
	category: z.string().optional(),
	isGlobal: z.boolean().default(false),
	isActive: z.boolean().default(true),
	requiresNoMagentaTV: z.boolean().default(false),
	tiers: z
		.array(
			z.object({
				id: z.string().optional(),
				name: z.string().min(1, "Varianten-Name erforderlich"),
				price: z.number().min(0, "Preis erforderlich")
			})
		)
		.min(1, "Mindestens eine Variante wird benötigt")
});

type AddonFormData = z.infer<typeof addonSchema>;

interface AddonFormProps {
	initialData?: any;
	isEditMode?: boolean;
}

export function AddonForm({ initialData, isEditMode = false }: AddonFormProps) {
	const router = useRouter();

	const { data: allProducts } = trpc.product.getAllProducts.useQuery();

	const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
		initialData?.productIds || []
	);

	const {
		register,
		control,
		handleSubmit,
		watch,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(addonSchema),
		defaultValues: {
			name: initialData?.name || "",
			description: initialData?.description || "",
			category: initialData?.category || "",
			isGlobal: initialData?.isGlobal || false,
			isActive: initialData?.isActive ?? true,
			requiresNoMagentaTV: initialData?.requiresNoMagentaTV || false,
			tiers: initialData?.tiers?.length
				? initialData.tiers
				: [{ name: "", price: 0 }]
		}
	});

	const {
		fields: tiers,
		append,
		remove
	} = useFieldArray({
		control,
		name: "tiers"
	});

	const isGlobal = watch("isGlobal");

	const createMutation = trpc.addon.create.useMutation({
		onSuccess: () => {
			router.push("/admin/addons");
			router.refresh();
		}
	});

	const updateMutation = trpc.addon.update.useMutation({
		onSuccess: () => {
			router.push("/admin/addons");
			router.refresh();
		}
	});

	const onSubmit = (data: AddonFormData) => {
		const payload = { ...data, productIds: selectedProductIds };
		if (isEditMode && initialData) {
			updateMutation.mutate({ ...payload, id: initialData.id });
		} else {
			createMutation.mutate(payload);
		}
	};

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	const handleProductToggle = (productId: string) => {
		setSelectedProductIds((prev) =>
			prev.includes(productId)
				? prev.filter((id) => id !== productId)
				: [...prev, productId]
		);
	};

	return (
		<div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6">
			{/* Left Column: Basic Settings */}
			<div className="flex-1 space-y-6">
				<div className="flex items-center justify-between mb-2">
					<Link
						href="/admin/addons"
						className="flex items-center text-sm text-[#888] hover:text-[#e20074] transition-colors"
					>
						<ArrowLeft className="w-4 h-4 mr-1" /> Zurück zur Übersicht
					</Link>
				</div>
				<h1 className="text-2xl font-bold text-[#1a1a2e]">
					{isEditMode ? "Zubuchoption bearbeiten" : "Neue Zubuchoption"}
				</h1>

				<form
					id="addonForm"
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-6"
				>
					<div className="bg-white p-6 rounded-2xl border border-[#eaedf0] shadow-sm space-y-5">
						<h2 className="text-[1rem] font-extrabold text-[#1a1a2e]">
							Basisdaten
						</h2>

						<div>
							<label className="block text-sm font-bold text-[#555] mb-1">
								Name (z.B. Netflix)
							</label>
							<input
								{...register("name")}
								className="w-full px-4 py-2 rounded-lg border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]"
								placeholder="Options-Gruppenname"
							/>
							{errors.name && (
								<p className="text-red-500 text-xs mt-1">
									{errors.name.message as string}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-bold text-[#555] mb-1">
								Beschreibung / Teaser (optional)
							</label>
							<input
								{...register("description")}
								className="w-full px-4 py-2 rounded-lg border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]"
								placeholder="Kurze Beschreibung..."
							/>
						</div>

						<div className="pt-2">
							<h3 className="text-sm font-bold text-[#1a1a2e] mb-3">
								Bedingungen
							</h3>

							{/* Active Status */}
							<div className="flex items-center gap-2 mb-3">
								<input
									type="checkbox"
									id="isActive"
									{...register("isActive")}
									className="w-4 h-4 rounded border-[#eaedf0] text-[#e20074] focus:ring-[#e20074]"
								/>
								<label
									htmlFor="isActive"
									className="text-sm font-medium text-[#1a1a2e]"
								>
									Aktiv (für Verkäufer auswählbar)
								</label>
							</div>

							{/* Requires NO MagentaTV Status */}
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="requiresNoMagentaTV"
									{...register("requiresNoMagentaTV")}
									className="w-4 h-4 rounded border-[#eaedf0] text-[#e20074] focus:ring-[#e20074]"
								/>
								<label
									htmlFor="requiresNoMagentaTV"
									className="text-sm font-medium text-[#1a1a2e]"
								>
									Nur ohne MagentaTV buchbar
								</label>
							</div>
						</div>
					</div>

					<div className="bg-white p-6 rounded-2xl border border-[#eaedf0] shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-[1rem] font-extrabold text-[#1a1a2e]">
								Produkte{" "}
								<span className="text-[#888] font-medium text-sm">
									(
									{isGlobal
										? "Alle"
										: `${selectedProductIds.length} ausgewählt`}
									)
								</span>
							</h2>
							<div className="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									id="isGlobal"
									{...register("isGlobal")}
									className="rounded border-zinc-300 text-[#e20074] focus:ring-[#e20074]"
								/>
								<label htmlFor="isGlobal" className="font-medium">
									Für alle Produkte (Global)
								</label>
							</div>
						</div>

						{!isGlobal && (
							<div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-xl p-4 max-h-[300px] overflow-y-auto space-y-1">
								{allProducts?.map(
									(product: { id: string; name: string; category: string }) => (
										<label
											key={product.id}
											className={clsx(
												"flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer",
												selectedProductIds.includes(product.id)
													? "bg-[#e20074]/5 border border-[#e20074]/20"
													: "hover:bg-white border border-transparent"
											)}
										>
											<input
												type="checkbox"
												checked={selectedProductIds.includes(product.id)}
												onChange={() => handleProductToggle(product.id)}
												className="rounded border-zinc-300 text-[#e20074] focus:ring-[#e20074]"
											/>
											<div className="flex flex-col">
												<span className="text-[0.85rem] font-bold text-[#1a1a2e]">
													{product.name}
												</span>
											</div>
											<span className="ml-auto text-[0.6rem] font-bold uppercase tracking-wider text-[#999]">
												{product.category}
											</span>
										</label>
									)
								)}
							</div>
						)}
					</div>
				</form>
			</div>

			{/* Right Column: Tiers / Variants */}
			<div className="w-full md:w-[450px] space-y-6">
				{/* Empty spacer to align with left column */}
				<div className="h-0 md:h-12 border-none"></div>

				<div className="bg-white p-6 rounded-2xl border border-[#eaedf0] shadow-sm space-y-4">
					<div className="flex items-center justify-between mb-2">
						<h2 className="text-[1rem] font-extrabold text-[#1a1a2e]">
							Varianten / Optionen
						</h2>
						<button
							type="button"
							onClick={() => append({ name: "", price: 0 })}
							className="text-[0.75rem] font-bold text-[#e20074] flex items-center gap-1 hover:bg-[#e20074]/10 px-2 py-1 rounded transition-colors"
						>
							<Plus className="w-3.5 h-3.5" /> Variante hinzufügen
						</button>
					</div>

					<p className="text-[0.75rem] text-[#888] leading-tight mb-4 m-0 mt-[-5px]">
						Erstelle eine oder mehrere Varianten (z.B. "Standard", "Premium")
						für diese Option. Der Benutzer kann genau eine davon auswählen.
					</p>

					{errors.tiers?.root && (
						<p className="text-red-500 text-xs mt-1 mb-2">
							{errors.tiers.root.message}
						</p>
					)}

					<div className="space-y-4">
						{tiers.map((field, index) => (
							<div
								key={field.id}
								className="p-4 border border-[#eaedf0] rounded-xl bg-[#fafafa] relative group"
							>
								<div className="flex justify-between items-center mb-3">
									<span className="text-[0.7rem] font-bold text-[#888] uppercase tracking-wider">
										Variante {index + 1}
									</span>
									{tiers.length > 1 && (
										<button
											type="button"
											onClick={() => remove(index)}
											className="text-[#bbb] hover:text-[#dc2626] transition-colors bg-transparent border-none cursor-pointer"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									)}
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="col-span-2">
										<label className="block text-[0.7rem] font-bold text-[#555] mb-1">
											Name (z.B. Premium)
										</label>
										<input
											{...register(`tiers.${index}.name`)}
											className="w-full px-3 py-1.5 text-sm rounded-lg border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]"
											placeholder="Varianten-Name"
										/>
										{errors.tiers?.[index]?.name && (
											<p className="text-red-500 text-[0.65rem] mt-1">
												{errors.tiers[index]?.name?.message}
											</p>
										)}
									</div>
									<div className="col-span-2">
										<label className="block text-[0.7rem] font-bold text-[#555] mb-1">
											Preis (€ / Monat)
										</label>
										<input
											type="number"
											step="0.01"
											{...register(`tiers.${index}.price`, {
												valueAsNumber: true
											})}
											className="w-full px-3 py-1.5 text-sm rounded-lg border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]"
											placeholder="10.00"
										/>
										{errors.tiers?.[index]?.price && (
											<p className="text-red-500 text-[0.65rem] mt-1">
												{errors.tiers[index]?.price?.message}
											</p>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="bg-white p-6 rounded-2xl border border-[#eaedf0] shadow-sm flex flex-col items-center">
					<button
						form="addonForm"
						type="submit"
						disabled={isSubmitting}
						className={clsx(
							"w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
							isSubmitting
								? "bg-[#ccc] cursor-not-allowed"
								: "bg-[#e20074] hover:bg-[#c70066] shadow-[0_4px_14px_rgba(226,0,116,0.25)]"
						)}
					>
						{isSubmitting ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : (
							<Save className="w-5 h-5" />
						)}
						{isEditMode ? "Änderungen speichern" : "Zubuchoption erstellen"}
					</button>
				</div>
			</div>
		</div>
	);
}
