"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import {
	Loader2,
	Save,
	ArrowLeft,
	Plus,
	Trash2,
	Search,
	CheckSquare,
	Tag,
	Settings,
	Box,
	Layers,
	Eye,
	Euro,
	CheckCircle2
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { Input } from "@/components/shared/ui/input";
import {
	AdminPageHeader,
	AdminFormSection,
	AdminFormContainer
} from "@/components/shared/ui/admin-ui";

const tierSchema = z.object({
	price: z.number().min(0, "Preis darf nicht negativ sein"),
	fromMonth: z.number().min(1, "Minimum ist Monat 1"),
	toMonth: z.number().min(1, "Minimum ist Monat 1"),
	discountTarget: z.enum(["BASE_PRICE", "MAGENTA_TV"]).default("BASE_PRICE"),
	discountType: z.enum(["ABSOLUTE", "RELATIVE"]).default("ABSOLUTE")
});

const specialPriceSchema = z.object({
	name: z.string().min(1, "Name ist erforderlich"),
	description: z.string().optional(),
	internalNote: z.string().optional(),
	productIds: z.array(z.string()),
	requiresMagentaTV: z.boolean().default(false),
	requiresSpeedUp: z.boolean().default(false),
	requiresMove: z.boolean().default(false),
	requiresNewActivation: z.boolean().default(false),
	priority: z.number().default(0),
	isActive: z.boolean().default(true),
	discountTarget: z.enum(["BASE_PRICE", "MAGENTA_TV"]).default("BASE_PRICE"),
	discountType: z.enum(["ABSOLUTE", "RELATIVE"]).default("ABSOLUTE"),
	tiers: z.array(tierSchema).min(1, "Mindestens eine Preisstufe ist nötig")
});

type SpecialPriceFormData = z.infer<typeof specialPriceSchema>;

interface SpecialPriceFormProps {
	initialData?: any;
	mode: "create" | "edit";
}

export function SpecialPriceForm({ initialData, mode }: SpecialPriceFormProps) {
	const router = useRouter();
	const utils = trpc.useUtils();
	const { data: productsData } = trpc.product.getAllProducts.useQuery();
	const products = productsData?.items || [];

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

	const {
		register,
		control,
		handleSubmit,
		watch,
		setValue,
		getValues,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(specialPriceSchema),
		mode: "onChange",
		defaultValues: {
			name: initialData?.name || "",
			description: initialData?.description || "",
			internalNote: initialData?.internalNote || "",
			productIds: initialData?.products?.map((p: any) => p.id) || [],
			requiresMagentaTV: initialData?.requiresMagentaTV || false,
			requiresSpeedUp: initialData?.requiresSpeedUp || false,
			requiresMove: initialData?.requiresMove || false,
			requiresNewActivation: initialData?.requiresNewActivation || false,
			priority: initialData?.priority || 0,
			isActive: initialData?.isActive ?? true,
			discountTarget: initialData?.discountTarget || "BASE_PRICE",
			discountType: initialData?.discountType || "ABSOLUTE",
			tiers:
				initialData?.tiers && initialData.tiers.length > 0
					? initialData.tiers.map((t: any) => ({
							...t,
							discountTarget: t.discountTarget || initialData.discountTarget || "BASE_PRICE",
							discountType: t.discountType || initialData.discountType || "ABSOLUTE"
					  }))
					: [{ price: 0, fromMonth: 1, toMonth: 6, discountTarget: "BASE_PRICE", discountType: "ABSOLUTE" }]
		}
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "tiers"
	});

	const productIdsValue = watch("productIds");
	const productIds = Array.isArray(productIdsValue) ? productIdsValue : [];
	const cTiers = watch("tiers") || [];

	const filteredProducts = products?.filter((p) => {
		const matchesSearch = p.name
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const matchesCategory =
			selectedCategory === "ALL" || p.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const toggleProduct = (productId: string) => {
		const currentProductIds = getValues("productIds") || [];
		const idsArray = Array.isArray(currentProductIds) ? currentProductIds : [];

		if (idsArray.includes(productId)) {
			setValue(
				"productIds",
				idsArray.filter((id) => id !== productId),
				{ shouldDirty: true }
			);
		} else {
			setValue("productIds", [...idsArray, productId], { shouldDirty: true });
		}
	};

	const toggleAllInCategory = () => {
		const currentProductIds = getValues("productIds") || [];
		const idsArray = Array.isArray(currentProductIds) ? currentProductIds : [];
		const filteredIds = filteredProducts?.map((p) => p.id) || [];

		const allSelected = filteredIds.every((id) => idsArray.includes(id));

		if (allSelected) {
			setValue(
				"productIds",
				idsArray.filter((id) => !filteredIds.includes(id)),
				{ shouldDirty: true }
			);
		} else {
			const newIds = [...new Set([...idsArray, ...filteredIds])];
			setValue("productIds", newIds, { shouldDirty: true });
		}
	};

	const addTier = () => {
		const lastTier =
			cTiers && cTiers.length > 0 ? cTiers[cTiers.length - 1] : null;
		append({
			price: 0,
			fromMonth: lastTier ? lastTier.toMonth + 1 : 1,
			toMonth: lastTier ? lastTier.toMonth + 6 : 6,
			discountTarget: lastTier ? lastTier.discountTarget : "BASE_PRICE",
			discountType: lastTier ? lastTier.discountType : "ABSOLUTE"
		});
	};

	const createMutation = trpc.admin.createSpecialPrice.useMutation({
		onSuccess: () => {
			utils.admin.getAllSpecialPrices.invalidate();
			utils.admin.getSpecialPriceById.invalidate();
			router.push("/admin/special-prices");
			router.refresh();
		}
	});

	const updateMutation = trpc.admin.updateSpecialPrice.useMutation({
		onSuccess: () => {
			utils.admin.getAllSpecialPrices.invalidate();
			utils.admin.getSpecialPriceById.invalidate();
			router.push("/admin/special-prices");
			router.refresh();
		}
	});

	const onSubmit = (data: SpecialPriceFormData) => {
		if (mode === "create") {
			createMutation.mutate(data);
		} else {
			updateMutation.mutate({
				id: initialData!.id,
				...data
			});
		}
	};

	const isPending = createMutation.isPending || updateMutation.isPending;

	const SaveButton = (
		<button
			type="submit"
			form="special-price-form"
			disabled={isPending || productIds?.length === 0}
			className={clsx(
				"px-6 py-2.5 rounded-2xl font-bold text-white flex items-center gap-2.5 transition-all duration-300 text-[0.85rem] cursor-pointer active:scale-95 shadow-[0_4px_14px_rgba(226,0,116,0.3)] hover:shadow-[0_8px_24px_rgba(226,0,116,0.4)] hover:-translate-y-0.5",
				isPending || productIds?.length === 0
					? "bg-[#ddd] shadow-none cursor-not-allowed text-[#999] opacity-50"
					: "bg-[#e20074] hover:bg-[#c70066]"
			)}
		>
			{isPending ? (
				<Loader2 className="w-4 h-4 animate-spin" />
			) : (
				<Save className="w-5 h-5" />
			)}
			Aktion speichern
		</button>
	);

	return (
		<div className="space-y-8 pb-12">
			<AdminPageHeader
				title={
					mode === "create" ? "Neue Aktion / Sonderpreis" : "Aktion bearbeiten"
				}
				subtitle={
					mode === "create"
						? "Erstelle eine neue Preisaktion mit zeitlich begrenzten Rabatten."
						: `Verwalte die Konfiguration für ${initialData?.name}`
				}
				backHref="/admin/special-prices"
				action={SaveButton}
			/>

			<form id="special-price-form" onSubmit={handleSubmit(onSubmit)}>
				<AdminFormContainer>
					<AdminFormSection
						title="Basisdaten"
						description="Name und interne Informationen."
						icon={Tag}
					>
						<Input
							label="Name der Aktion"
							placeholder="z.B. MagentaZuhause Aktion 1–6 Monate"
							error={errors.name?.message}
							{...register("name")}
						/>

						<div className="flex flex-col gap-1.5 pt-2">
							<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
								Beschreibung (für Verkäufer sichtbar)
							</label>
							<textarea
								placeholder="Kurze Beschreibung der Aktion..."
								rows={3}
								className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] focus:bg-white focus:outline-none focus:border-[#e20074] transition-all text-[0.9rem] font-medium resize-none"
								{...register("description")}
							/>
						</div>

						<div className="flex flex-col gap-1.5 pt-2">
							<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
								Interner Vermerk (nur Admin)
							</label>
							<textarea
								placeholder="Notizen zur Aktion..."
								rows={2}
								className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] focus:bg-white focus:outline-none focus:border-[#e20074] transition-all text-[0.9rem] font-medium resize-none opacity-80"
								{...register("internalNote")}
							/>
						</div>
					</AdminFormSection>

					<AdminFormSection
						title="Konfiguration"
						description="Steuere Logik und Priorität."
						icon={Settings}
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input
								label="Priorität (Höher gewinnt)"
								type="number"
								placeholder="0"
								error={errors.priority?.message}
								{...register("priority", { valueAsNumber: true })}
							/>
							<div className="flex flex-col gap-1.5">
								<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
									Rabatt-Status
								</label>
								<div className="flex items-center gap-3 p-3 bg-[#f7f8fa] rounded-xl border border-[#eaedf0]">
									<input
										type="checkbox"
										{...register("isActive")}
										className="w-5 h-5 rounded border-[#eaedf0] text-[#e20074] focus:ring-[#e20074]"
									/>
									<span className="text-[0.85rem] font-bold text-[#1a1a2e]">
										Aktion ist aktiv
									</span>
								</div>
							</div>
						</div>

						{/* Konfiguration selects moved to tiers */}
					</AdminFormSection>

					<AdminFormSection
						title="Bedingungen"
						description="Voraussetzungen für diese Aktion."
						icon={CheckCircle2}
					>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							{[
								{ id: "requiresMagentaTV", label: "Benötigt MagentaTV" },
								{ id: "requiresSpeedUp", label: "Benötigt SpeedUp" },
								{ id: "requiresNewActivation", label: "Neuanschluss" },
								{ id: "requiresMove", label: "Umzug" }
							].map((cond) => (
								<label
									key={cond.id}
									className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-[#f7f8fa] border border-[#eaedf0] cursor-pointer hover:bg-white hover:border-[#e20074]/30 hover:shadow-md transition-all group relative overflow-hidden"
								>
									<input
										type="checkbox"
										{...register(cond.id as any)}
										className="peer opacity-0 absolute w-0 h-0"
									/>
									<div className="w-6 h-6 rounded-lg border-2 border-[#ddd] bg-white peer-checked:bg-[#e20074] peer-checked:border-[#e20074] transition-all flex items-center justify-center group-hover:border-[#e20074]/50">
										<svg
											className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
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
									<span className="text-[0.75rem] font-extrabold text-[#1a1a2e] text-center uppercase tracking-wider relative z-10">
										{cond.label}
									</span>
								</label>
							))}
						</div>
					</AdminFormSection>

					<AdminFormSection
						title="Produkte"
						description="Auf welche Tarife soll die Aktion angewendet werden?"
						icon={Box}
						action={
							<span className="text-[0.7rem] font-extrabold text-[#1a1a2e] bg-[#f7f8fa] px-3 py-1.5 rounded-xl border border-[#eaedf0]">
								{productIds?.length || 0} ausgewählt
							</span>
						}
					>
						<div className="space-y-4">
							<div className="flex gap-3">
								<div className="relative flex-1">
									<Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" />
									<input
										type="text"
										placeholder="Produkte suchen..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#eaedf0] bg-[#f7f8fa] focus:bg-white focus:outline-none focus:border-[#e20074] transition-all text-[0.85rem]"
									/>
								</div>
								<select
									value={selectedCategory}
									onChange={(e) => setSelectedCategory(e.target.value)}
									className="px-4 py-3 rounded-2xl border border-[#eaedf0] bg-[#f7f8fa] focus:outline-none focus:border-[#e20074] transition-all text-[0.85rem] font-bold"
								>
									<option value="ALL">Alle Kategorien</option>
									<option value="MOBILE">Mobilfunk</option>
									<option value="FIBER">Glasfaser</option>
									<option value="DSL">DSL</option>
									<option value="MAGENTA_TV_OTT">MagentaTV — OTT</option>
									<option value="DEVICE">Hardware</option>
								</select>
							</div>

							<div className="bg-[#f7f8fa] border border-[#eaedf0] border-dashed rounded-[2rem] p-6 max-h-[400px] overflow-y-auto space-y-2 custom-scrollbar">
								{filteredProducts?.length === 0 ? (
									<div className="text-center py-12 text-[#999] bg-white rounded-3xl border border-[#eaedf0]">
										<Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
										<p className="text-[0.85rem] font-bold m-0">
											Keine Produkte gefunden
										</p>
										<p className="text-[0.75rem] m-0 mt-1 opacity-70">
											Passe deine Suche oder den Filter an.
										</p>
									</div>
								) : (
									<div className="space-y-2">
										<button
											type="button"
											onClick={toggleAllInCategory}
											className="w-full flex items-center justify-center gap-2 py-3 mb-2 rounded-2xl bg-white border border-[#eaedf0] text-[0.75rem] font-bold text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-all active:scale-[0.98]"
										>
											<CheckSquare className="w-4 h-4" />
											{filteredProducts?.every((p) =>
												productIds?.includes(p.id)
											)
												? "Alle abwählen"
												: `${filteredProducts?.length} in Ansicht auswählen`}
										</button>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
											{filteredProducts?.map((product) => {
												const isChecked = productIds?.includes(product.id);
												return (
													<label
														key={product.id}
														className={clsx(
															"flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer group",
															isChecked
																? "bg-white shadow-md border border-[#e20074]/10"
																: "hover:bg-white/50 border border-transparent"
														)}
													>
														<div className="relative flex items-center shrink-0">
															<input
																type="checkbox"
																checked={isChecked}
																onChange={() => toggleProduct(product.id)}
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
														<div className="flex flex-col flex-1 truncate">
															<span className="text-[0.85rem] font-bold text-[#1a1a2e] truncate">
																{product.name}
															</span>
															<span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#999] mt-0.5">
																{product.category}
															</span>
														</div>
													</label>
												);
											})}
										</div>
									</div>
								)}
							</div>
						</div>
					</AdminFormSection>

					<AdminFormSection
						title="Preisstufen"
						description="Definiere die zeitlichen Preisabschnitte."
						icon={Layers}
						action={
							<button
								type="button"
								onClick={addTier}
								className="text-[0.7rem] font-bold text-white bg-[#e20074] hover:bg-[#c70066] flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
							>
								<Plus className="w-3.5 h-3.5" /> Hinzufügen
							</button>
						}
					>
						<div className="space-y-4">
							{fields.map((field, index) => (
								<div
									key={field.id}
									className="p-6 border border-[#eaedf0] rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow relative group animate-in slide-in-from-bottom-2 duration-300"
								>
									<div className="flex justify-between items-center mb-5 pb-3 border-b border-[#f7f8fa]">
										<span className="text-[0.7rem] font-extrabold text-[#1a1a2e] uppercase tracking-widest bg-[#f7f8fa] px-3 py-1 rounded-lg">
											Stufe {index + 1}
										</span>
										{fields.length > 1 && (
											<button
												type="button"
												onClick={() => remove(index)}
												className="text-[#bbb] hover:text-[#dc2626] transition-colors p-2 hover:bg-red-50 rounded-xl active:scale-90"
											>
												<Trash2 className="w-4.5 h-4.5" />
											</button>
										)}
									</div>

									<div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
										<Input
											label="Von Monat"
											type="number"
											min={1}
											error={errors.tiers?.[index]?.fromMonth?.message}
											{...register(`tiers.${index}.fromMonth`, {
												valueAsNumber: true
											})}
										/>
										<Input
											label="Bis Monat"
											type="number"
											min={1}
											error={errors.tiers?.[index]?.toMonth?.message}
											{...register(`tiers.${index}.toMonth`, {
												valueAsNumber: true
											})}
										/>
										<div className="col-span-2 lg:col-span-1">
											<div className="flex flex-col gap-1.5">
												<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
													{watch(`tiers.${index}.discountType`) === "RELATIVE"
														? "Abzug (€)"
														: "Preis (€)"}
												</label>
												<div className="relative">
													<Input
														type="number"
														step="0.01"
														min={0}
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
										<div className="col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
											<div className="flex flex-col gap-1.5">
												<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
													Worauf anwenden?
												</label>
												<select
													className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] focus:outline-none focus:border-[#e20074] transition-all text-[0.9rem]"
													{...register(`tiers.${index}.discountTarget`)}
												>
													<option value="BASE_PRICE">Tarif (Grundpreis)</option>
													<option value="MAGENTA_TV">MagentaTV Paket</option>
												</select>
											</div>
											<div className="flex flex-col gap-1.5">
												<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
													Art des Rabatts
												</label>
												<select
													className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] focus:outline-none focus:border-[#e20074] transition-all text-[0.9rem]"
													{...register(`tiers.${index}.discountType`)}
												>
													<option value="ABSOLUTE">Absoluter (Fest-)Preis</option>
													<option value="RELATIVE">Zieht diesen Betrag ab</option>
												</select>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Preview Card */}
						<div className="bg-[#1a1a2e] rounded-[2rem] p-8 mt-4 shadow-xl border border-[#1a1a2e] relative overflow-hidden group">
							<div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
								<Eye className="w-24 h-24 text-white" />
							</div>

							<div className="relative z-10">
								<div className="text-[0.7rem] uppercase tracking-widest text-[#888] font-black mb-6 flex items-center gap-3">
									<div className="w-2 h-2 rounded-full bg-[#ff6b00] animate-pulse"></div>
									Live Vorschau für Verkäufer
								</div>

								{/* Global status info removed because settings are now per tier */}

								<div className="space-y-3 mt-4">
									{cTiers.map((tier, i) => (
										<div
											key={i}
											className="flex items-center justify-between group/row p-4 rounded-xl hover:bg-white/5 transition-colors"
										>
											<div className="flex items-center gap-4">
												<div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[0.75rem] font-black text-white group-hover/row:bg-[#e20074] transition-colors shrink-0">
													{i + 1}
												</div>
                                                <div className="flex flex-col">
    												<span className="text-[#bbb] font-bold text-[0.9rem]">
	    												Monat {tier.fromMonth || 1} – {tier.toMonth || "?"}
		    										</span>
                                                    <span className="text-[#888] text-[0.65rem] font-medium leading-tight mt-1">
                                                        {tier.discountTarget === "MAGENTA_TV" ? "MagentaTV Paket" : "Tarif Grundpreis"}
                                                        {' • '}
                                                        {tier.discountType === "RELATIVE" ? "Relativer Abzug" : "Absoluter Preis"}
                                                    </span>
                                                </div>
											</div>
											<div className="flex items-end flex-col shrink-0">
												<span className="font-black text-white text-[1.2rem] tracking-tight">
													{tier.discountType === "RELATIVE" ? "−" : ""}
													{tier.price?.toFixed(2) || "0.00"} €
												</span>
												<span className="text-[0.6rem] text-[#888] font-bold uppercase">
													Pro Monat
												</span>
											</div>
										</div>
									))}

									<div className="flex justify-between items-center py-4 mt-4 border-t border-white/10 border-dashed">
										<span className="text-[#888] font-bold text-[0.75rem] uppercase tracking-wider">
											Danach
										</span>
										<div className="text-right">
											<span className="font-bold text-[#666] text-[0.85rem]">
												Standard Listenpreis
											</span>
											<p className="text-[0.6rem] text-[#555] m-0">
												Gilt für die restliche Laufzeit
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</AdminFormSection>
				</AdminFormContainer>
			</form>
		</div>
	);
}
