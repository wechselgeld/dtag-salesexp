"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import clsx from "clsx";
import {
	Save,
	Loader2,
	ArrowLeft,
	Plus,
	Trash2,
	Settings,
	Box,
	ListChecks,
	Layers,
	Globe,
	Euro
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import {
	AdminPageHeader,
	AdminFormSection,
	AdminFormContainer
} from "@/components/shared/ui/admin-ui";

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

	const { data: allProductsData } = trpc.product.getAllProducts.useQuery();
	const allProducts = allProductsData?.items;

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

	const SaveButton = (
		<button
			type="submit"
			form="addon-form"
			disabled={isSubmitting}
			className={clsx(
				"px-6 py-2.5 rounded-2xl font-bold text-white flex items-center gap-2.5 transition-all duration-300 text-[0.85rem] cursor-pointer active:scale-95 shadow-[0_4px_14px_rgba(226,0,116,0.3)] hover:shadow-[0_8px_24px_rgba(226,0,116,0.4)] hover:-translate-y-0.5",
				isSubmitting
					? "bg-[#ddd] shadow-none cursor-not-allowed text-[#999] opacity-50"
					: "bg-[#e20074] hover:bg-[#c70066]"
			)}
		>
			{isSubmitting ? (
				<Loader2 className="w-4 h-4 animate-spin" />
			) : (
				<Save className="w-5 h-5" />
			)}
			Option speichern
		</button>
	);

	const handleProductToggle = (productId: string) => {
		setSelectedProductIds((prev) =>
			prev.includes(productId)
				? prev.filter((id) => id !== productId)
				: [...prev, productId]
		);
	};

	return (
		<div className="space-y-8 pb-12">
			<AdminPageHeader
				title={isEditMode ? "Zusatzoption bearbeiten" : "Neue Zusatzoption"}
				subtitle={
					isEditMode
						? `Verwalte die Konfiguration für ${initialData?.name}`
						: "Erstelle eine neue Option (z.B. Netflix, MagentaTV One), die zu Produkten hinzu gebucht werden kann."
				}
				backHref="/admin/addons"
				action={SaveButton}
			/>

			<form id="addon-form" onSubmit={handleSubmit(onSubmit)}>
				<AdminFormContainer>
					<AdminFormSection
						title="Basisdaten"
						description="Name und Beschreibung der Option."
						icon={Settings}
					>
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
							label="Bild-URL (Für Hintergrundbilder)"
							placeholder="https://example.com/image.png"
							error={errors.imageUrl?.message as string}
							{...register("imageUrl")}
						/>
					</AdminFormSection>

					<AdminFormSection
						title="Bedingungen"
						description="Steuere die Sichtbarkeit und Abhängigkeiten."
						icon={ListChecks}
					>
						<div className="space-y-4">
							<div className="flex items-start gap-4 p-5 bg-[#f7f8fa] border border-[#eaedf0] rounded-[1.5rem]">
								<div className="relative flex items-center">
									<input
										type="checkbox"
										id="isActive"
										{...register("isActive")}
										className="peer w-6 h-6 rounded-lg border-[#eaedf0] text-[#e20074] focus:ring-[#e20074] cursor-pointer appearance-none bg-white transition-all checked:bg-[#e20074] checked:border-[#e20074]"
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
								<div>
									<label
										htmlFor="isActive"
										className="text-[0.85rem] font-bold text-[#1a1a2e] cursor-pointer"
									>
										Option ist aktiv
									</label>
									<p className="text-[0.75rem] text-[#888] m-0 mt-0.5 leading-relaxed">
										Inaktive Optionen werden den Verkäufern nicht zur Auswahl
										angeboten.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-4 p-5 bg-[#fff8f1] border border-[#ffedd5] rounded-[1.5rem]">
								<div className="relative flex items-center">
									<input
										type="checkbox"
										id="requiresNoMagentaTV"
										{...register("requiresNoMagentaTV")}
										className="peer w-6 h-6 rounded-lg border-[#fed7aa] text-[#f97316] focus:ring-[#f97316] cursor-pointer appearance-none bg-white transition-all checked:bg-[#f97316] checked:border-[#f97316]"
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
								<div>
									<label
										htmlFor="requiresNoMagentaTV"
										className="text-[0.7rem] font-bold text-[#1a1a2e] cursor-pointer uppercase tracking-wider"
									>
										Ausschluss-Logik
									</label>
									<p className="text-[0.75rem] text-[#9a3412] m-0 mt-0.5 leading-relaxed font-bold">
										Nur ohne MagentaTV buchbar
									</p>
									<p className="text-[0.65rem] text-[#9a3412] m-0 mt-0.5 opacity-70">
										Option wird ausgeblendet, sobald MagentaTV im Warenkorb
										liegt.
									</p>
								</div>
							</div>
						</div>
					</AdminFormSection>

					<AdminFormSection
						title="Produkte"
						description="Für welche Tarife ist diese Option verfügbar?"
						icon={Box}
						action={
							<div className="flex items-center gap-2 bg-[#f7f8fa] px-3 py-1.5 rounded-xl border border-[#eaedf0]">
								<input
									type="checkbox"
									id="isGlobal"
									{...register("isGlobal")}
									className="w-4 h-4 rounded border-[#eaedf0] text-[#e20074] focus:ring-[#e20074]"
								/>
								<label
									htmlFor="isGlobal"
									className="text-[0.75rem] font-bold text-[#1a1a2e] cursor-pointer"
								>
									Global (Alle)
								</label>
							</div>
						}
					>
						{!isGlobal ? (
							<div className="bg-[#f7f8fa] border border-[#eaedf0] border-dashed rounded-[2rem] p-6 max-h-[400px] overflow-y-auto space-y-2 custom-scrollbar">
								{allProducts?.map((product: any) => (
									<label
										key={product.id}
										className={clsx(
											"flex items-center gap-4 p-4 rounded-3xl transition-all cursor-pointer group",
											selectedProductIds.includes(product.id)
												? "bg-white shadow-md border border-[#e20074]/10"
												: "hover:bg-white/50 border border-transparent"
										)}
									>
										<div className="relative flex items-center shrink-0">
											<input
												type="checkbox"
												checked={selectedProductIds.includes(product.id)}
												onChange={() => handleProductToggle(product.id)}
												className="peer sr-only"
											/>
											<div className="w-5 h-5 rounded-lg border-2 border-[#ddd] bg-white peer-checked:bg-[#e20074] peer-checked:border-[#e20074] transition-all flex items-center justify-center group-hover:border-[#e20074]/50">
												<svg
													className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
													viewBox="0 0 14 10"
													fill="none"
												>
													<path
														d="M1 5L4.5 8.5L13 1"
														stroke="currentColor"
														strokeWidth="3"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											</div>
										</div>
										<div className="flex flex-col flex-1">
											<span className="text-[0.85rem] font-bold text-[#1a1a2e]">
												{product.name}
											</span>
											<span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#999] mt-0.5">
												{product.category}
											</span>
										</div>
									</label>
								))}
							</div>
						) : (
							<div className="bg-[#e20074]/5 border border-[#e20074]/10 rounded-[2rem] p-8 text-center">
								<Globe className="w-8 h-8 text-[#e20074] mx-auto mb-3 opacity-50" />
								<p className="text-[0.85rem] font-bold text-[#e20074] m-0">
									Globale Verfügbarkeit aktiv
								</p>
								<p className="text-[0.75rem] text-[#e20074] m-0 mt-1 opacity-70 italic text-center mx-auto">
									Diese Option wird bei absolut jedem Tarif angezeigt.
								</p>
							</div>
						)}
					</AdminFormSection>

					<AdminFormSection
						title="Varianten & Preise"
						description="Erstelle verschiedene Ausführungen dieser Option."
						icon={Layers}
						action={
							<button
								type="button"
								onClick={() => append({ name: "", price: 0 })}
								className="text-[0.7rem] font-bold text-white bg-[#e20074] hover:bg-[#c70066] flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
							>
								<Plus className="w-3.5 h-3.5" /> Hinzufügen
							</button>
						}
					>
						<p className="text-[0.75rem] text-[#888] leading-relaxed mb-6 -mt-3">
							Der Benutzer kann zur Laufzeit genau eine dieser Varianten
							auswählen (z.B. Standard 2 Geräte vs Premium 4 Geräte).
						</p>

						{errors.tiers?.root && (
							<div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-[0.8rem] border border-red-100 font-medium">
								{errors.tiers.root.message}
							</div>
						)}

						<div className="space-y-4">
							{tiers.map((field, index) => (
								<div
									key={field.id}
									className="p-6 border border-[#eaedf0] rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow relative group animate-in slide-in-from-bottom-2 duration-300"
								>
									<div className="flex justify-between items-center mb-5 pb-3 border-b border-[#f7f8fa]">
										<span className="text-[0.7rem] font-extrabold text-[#1a1a2e] uppercase tracking-widest bg-[#f7f8fa] px-3 py-1 rounded-lg">
											Variante {index + 1}
										</span>
										{tiers.length > 1 && (
											<button
												type="button"
												onClick={() => remove(index)}
												className="text-[#bbb] hover:text-[#dc2626] transition-colors p-2 hover:bg-red-50 rounded-xl active:scale-90"
											>
												<Trash2 className="w-4.5 h-4.5" />
											</button>
										)}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<Input
											label="Name (z.B. Premium)"
											placeholder="Varianten-Name"
											error={errors.tiers?.[index]?.name?.message}
											{...register(`tiers.${index}.name`)}
										/>
										<div className="flex flex-col gap-1.5">
											<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
												Preis (€ / Monat)
											</label>
											<div className="relative">
												<Input
													type="number"
													step="0.01"
													placeholder="10.00"
													error={errors.tiers?.[index]?.price?.message}
													{...register(`tiers.${index}.price`, {
														valueAsNumber: true
													})}
													className="pl-10"
												/>
												<div className="absolute left-4 top-[38px] text-[#bbb]">
													<Euro className="w-4 h-4" />
												</div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</AdminFormSection>
				</AdminFormContainer>
			</form>
		</div>
	);
}
