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
import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { Checkbox } from "@/components/shared/ui/checkbox";

const addonSchema = z.object({
	name: z.string().min(1, "Name ist erforderlich"),
	description: z.string().optional(),
	category: z.string().optional(),
	imageUrl: z.string().optional(),
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
	const utils = trpc.useUtils();

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
		mode: "onChange",
		defaultValues: {
			name: initialData?.name || "",
			description: initialData?.description || "",
			category: initialData?.category || "",
			imageUrl: initialData?.imageUrl || "",
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
			utils.addon.list.invalidate();
			utils.addon.getById.invalidate();
			router.push("/admin/addons");
			router.refresh();
		}
	});

	const updateMutation = trpc.addon.update.useMutation({
		onSuccess: () => {
			utils.addon.list.invalidate();
			utils.addon.getById.invalidate();
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
		<form
			id="addonForm"
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-8"
		>
			{/* Header */}
			<div className="flex items-center justify-between">
				<Link
					href="/admin/addons"
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

			<div className="flex flex-col md:flex-row gap-6">
				{/* Left Column: Basic Settings */}
				<div className="flex-1 space-y-6">
					<div className="bg-white p-6 rounded-2xl border border-[#eaedf0] shadow-sm space-y-5">
						<h2 className="text-[1rem] font-extrabold text-[#1a1a2e]">
							Basisdaten
						</h2>

						<Input
							label="Name (z.B. Netflix)"
							placeholder="Options-Gruppenname"
							error={errors.name?.message as string}
							{...register("name")}
						/>

						<Textarea
							label="Beschreibung / Teaser (optional)"
							placeholder="Kurze Beschreibung..."
							error={errors.description?.message as string}
							{...register("description")}
						/>

						<Input
							label="Bild-URL (z. B. für MagentaTV Logo im Hintergrund)"
							placeholder="https://example.com/image.png"
							error={errors.imageUrl?.message as string}
							{...register("imageUrl")}
						/>

						<div className="space-y-3 pt-2 border-t border-[#f0f0f0]">
							<h4 className="text-[0.8rem] font-bold text-[#1a1a2e] m-0 mb-3">
								Bedingungen
							</h4>

							<Checkbox
								label="Aktiv (für Verkäufer auswählbar)"
								{...register("isActive")}
							/>

							<Checkbox
								label="Nur ohne MagentaTV buchbar"
								{...register("requiresNoMagentaTV")}
							/>
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
							<div className="flex items-center gap-2 text-sm pt-1">
								<Checkbox
									label="Für alle Produkte (Global)"
									{...register("isGlobal")}
								/>
							</div>
						</div>

						{!isGlobal && (
							<div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-xl p-4 max-h-[300px] overflow-y-auto space-y-1">
								{allProducts?.map(
									(product: { id: string; name: string; category: string }) => (
										<label
											key={product.id}
											className={clsx(
												"flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer group",
												selectedProductIds.includes(product.id)
													? "bg-[#e20074]/5 border border-[#e20074]/20"
													: "hover:bg-white border border-transparent"
											)}
										>
											<div className="relative flex items-center pt-[2px]">
												<input
													type="checkbox"
													checked={selectedProductIds.includes(product.id)}
													onChange={() => handleProductToggle(product.id)}
													className="peer sr-only"
												/>
												<div className="w-4 h-4 rounded border-2 border-[#ddd] bg-white peer-checked:bg-[#e20074] peer-checked:border-[#e20074] transition-all flex items-center justify-center group-hover:border-[#e20074]/50">
													<svg
														className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
														viewBox="0 0 14 10"
														fill="none"
													>
														<path
															d="M1 5L4.5 8.5L13 1"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>
												</div>
											</div>
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
				</div>
				<div className="w-full md:w-[450px] space-y-6">
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

									<div className="space-y-4">
										<Input
											label="Name (z.B. Premium)"
											placeholder="Varianten-Name"
											error={errors.tiers?.[index]?.name?.message}
											{...register(`tiers.${index}.name`)}
										/>
										<Input
											label="Preis (€ / Monat)"
											type="number"
											step="0.01"
											placeholder="10.00"
											error={errors.tiers?.[index]?.price?.message}
											{...register(`tiers.${index}.price`, {
												valueAsNumber: true
											})}
										/>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</form>
	);
}
