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
	CheckSquare
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { Input } from "@/components/shared/ui/input";
import { Checkbox } from "@/components/shared/ui/checkbox";

const tierSchema = z.object({
	price: z.number().min(0, "Preis darf nicht negativ sein"),
	fromMonth: z.number().min(1, "Minimum ist Monat 1"),
	toMonth: z.number().min(1, "Minimum ist Monat 1")
});

const specialPriceSchema = z.object({
	name: z.string().min(1, "Name ist erforderlich"),
	productIds: z.array(z.string()),
	requiresMagentaTV: z.boolean().default(false),
	requiresSpeedUp: z.boolean().default(false),
	requiresMove: z.boolean().default(false),
	priority: z.number().default(0),
	isActive: z.boolean().default(true),
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
	const { data: products } = trpc.product.getAllProducts.useQuery();

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

	const {
		register,
		control,
		handleSubmit,
		watch,
		setValue,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(specialPriceSchema),
		mode: "onChange",
		defaultValues: {
			name: initialData?.name || "",
			productIds: initialData?.products?.map((p: any) => p.id) || [],
			requiresMagentaTV: initialData?.requiresMagentaTV || false,
			requiresSpeedUp: initialData?.requiresSpeedUp || false,
			requiresMove: initialData?.requiresMove || false,
			priority: initialData?.priority || 0,
			isActive: initialData?.isActive ?? true,
			tiers:
				initialData?.tiers && initialData.tiers.length > 0
					? initialData.tiers
					: [{ price: 0, fromMonth: 1, toMonth: 6 }]
		}
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "tiers"
	});

	const productIds = watch("productIds");
	const cTiers = watch("tiers");

	const filteredProducts = products?.filter((p) => {
		const matchesSearch = p.name
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const matchesCategory =
			selectedCategory === "ALL" || p.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const toggleProduct = (productId: string) => {
		const currentProductIds = productIds || [];
		if (currentProductIds.includes(productId)) {
			setValue(
				"productIds",
				currentProductIds.filter((id) => id !== productId)
			);
		} else {
			setValue("productIds", [...currentProductIds, productId]);
		}
	};

	const toggleAllInCategory = () => {
		const currentProductIds = productIds || [];
		const filteredIds = filteredProducts?.map((p) => p.id) || [];

		const allSelected = filteredIds.every((id) =>
			currentProductIds.includes(id)
		);

		if (allSelected) {
			setValue(
				"productIds",
				currentProductIds.filter((id) => !filteredIds.includes(id))
			);
		} else {
			const newIds = [...new Set([...currentProductIds, ...filteredIds])];
			setValue("productIds", newIds);
		}
	};

	const addTier = () => {
		const lastTier =
			cTiers && cTiers.length > 0 ? cTiers[cTiers.length - 1] : null;
		append({
			price: 0,
			fromMonth: lastTier ? lastTier.toMonth + 1 : 1,
			toMonth: lastTier ? lastTier.toMonth + 6 : 6
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

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Link
					href="/admin/special-prices"
					className="text-[#999] hover:text-[#1a1a2e] flex items-center gap-2 transition-colors text-[0.85rem] no-underline"
				>
					<ArrowLeft className="w-4 h-4" /> Zurück
				</Link>
				<button
					type="submit"
					disabled={isPending || productIds?.length === 0}
					className={clsx(
						"px-5 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 transition-all duration-200 text-[0.82rem] cursor-pointer active:scale-95 shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5",
						isPending || productIds?.length === 0
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
				{/* Left Column — Base Data */}
				<div className="flex-1 space-y-6">
					<div className="bg-white rounded-2xl p-6 border border-[#eaedf0] space-y-5">
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] border-b border-[#f0f0f0] pb-2 m-0">
							Basisdaten
						</h3>

						<Input
							label="Name (Aktion)"
							placeholder="z.B. MagentaZuhause Aktion 1–6 Monate"
							error={errors.name?.message}
							{...register("name")}
						/>

						<Input
							label="Priorität (Höher gewinnt)"
							type="number"
							placeholder="0"
							error={errors.priority?.message}
							{...register("priority", { valueAsNumber: true })}
						/>

						{/* Conditions */}
						<div className="space-y-3 pt-2 border-t border-[#f0f0f0]">
							<h4 className="text-[0.8rem] font-bold text-[#1a1a2e] m-0 mb-3">
								Sichtbarkeit und Bedingungen
							</h4>
							<Checkbox
								label="Aktiv (für Verkäufer sichtbar)"
								{...register("isActive")}
							/>
							<Checkbox
								label="Benötigt MagentaTV"
								{...register("requiresMagentaTV")}
							/>
							<Checkbox
								label="Benötigt SpeedUp"
								{...register("requiresSpeedUp")}
							/>
							<Checkbox
								label="Benötigt Umzug/Neuanschluss"
								{...register("requiresMove")}
							/>
						</div>
					</div>

					{/* Produkte */}
					<div className="bg-white rounded-2xl p-6 border border-[#eaedf0] space-y-5">
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] border-b border-[#f0f0f0] pb-2 m-0 flex justify-between">
							<span>Produkte anwenden auf</span>
							<span className="text-[0.72rem] font-normal text-[#999]">
								({productIds?.length || 0} ausgewählt)
							</span>
						</h3>

						<div className="flex gap-2">
							<div className="relative flex-1">
								<Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
								<input
									type="text"
									placeholder="Produkte suchen..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] focus:bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.8rem]"
								/>
							</div>
							<select
								value={selectedCategory}
								onChange={(e) => setSelectedCategory(e.target.value)}
								className="w-1/3 px-3 py-2 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] focus:bg-white focus:outline-none focus:border-[#e20074]/30 transition-all text-[0.8rem]"
							>
								<option value="ALL">Alle Kategorien</option>
								<option value="MOBILE">Mobilfunk</option>
								<option value="FIBER">Glasfaser</option>
								<option value="DSL">DSL</option>
								<option value="MAGENTA_TV_OTT">MagentaTV (OTT)</option>
								<option value="DEVICE">Hardware</option>
							</select>
						</div>

						{filteredProducts && filteredProducts.length > 0 && (
							<button
								type="button"
								onClick={toggleAllInCategory}
								className="flex items-center gap-1.5 text-[0.7rem] font-bold text-[#1a1a2e] hover:text-[#e20074] transition-colors py-1 bg-transparent border-none cursor-pointer"
							>
								<CheckSquare className="w-3.5 h-3.5" />
								{filteredProducts.every((p) => productIds?.includes(p.id))
									? "Alle abwählen"
									: "Alle in aktueller Ansicht auswählen"}
							</button>
						)}

						<div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-xl p-4 max-h-[300px] overflow-y-auto space-y-1">
							{filteredProducts?.length === 0 ? (
								<div className="text-center py-6 text-[#888] text-[0.8rem]">
									Keine Produkte für diesen Filter gefunden.
								</div>
							) : (
								filteredProducts?.map((product) => {
									const isChecked = productIds?.includes(product.id);
									return (
										<label
											key={product.id}
											className={clsx(
												"flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all group hover:bg-white border",
												isChecked
													? "bg-[#e20074]/4 border border-[#e20074]/30 hover:border-[#e20074]/40"
													: "border-transparent"
											)}
										>
											<div className="relative flex items-center pt-[2px]">
												<input
													type="checkbox"
													checked={isChecked}
													onChange={() => toggleProduct(product.id)}
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
											<span
												className={clsx(
													"text-[0.82rem] font-medium",
													isChecked ? "text-[#1a1a2e]" : "text-[#666]"
												)}
											>
												{product.name}
											</span>
											<span className="text-[0.6rem] font-bold uppercase tracking-wider text-[#bbb] ml-auto">
												{product.category}
											</span>
										</label>
									);
								})
							)}
						</div>
						{errors.productIds?.message && (
							<p className="text-red-500 text-xs mt-1 font-medium">
								{errors.productIds?.message}
							</p>
						)}
					</div>
				</div>

				{/* Right Column — Tiers */}
				<div className="w-full md:w-[450px] space-y-6 self-start">
					<div className="bg-white rounded-2xl p-6 border border-[#eaedf0] shadow-sm space-y-4">
						<div className="flex justify-between items-center border-b border-[#f0f0f0] pb-2">
							<h3 className="text-[1rem] font-bold text-[#1a1a2e] m-0">
								Preisstufen
							</h3>
							<button
								type="button"
								onClick={addTier}
								className="flex items-center gap-1 text-[0.75rem] font-semibold text-[#e20074] hover:text-[#c70066] transition-colors cursor-pointer bg-transparent border-none"
							>
								<Plus className="w-3.5 h-3.5" />
								Stufe hinzufügen
							</button>
						</div>

						{errors.tiers?.root && (
							<p className="text-red-500 text-[0.7rem] font-medium mt-1 mb-2">
								{errors.tiers.root.message}
							</p>
						)}

						<div className="space-y-4">
							{fields.map((field, index) => (
								<div
									key={field.id}
									className="bg-[#f7f8fa] rounded-xl p-5 border border-[#eaedf0] relative group shadow-sm"
								>
									<div className="flex items-center justify-between mb-4">
										<span className="text-[0.72rem] font-bold text-[#999] uppercase tracking-wider">
											Stufe {index + 1}
										</span>
										{fields.length > 1 && (
											<button
												type="button"
												onClick={() => remove(index)}
												className="p-1 text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2]/40 rounded-lg transition-all cursor-pointer bg-transparent border-none active:scale-95"
												title="Stufe entfernen"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										)}
									</div>
									<div className="grid grid-cols-2 gap-4">
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
										<div className="col-span-2">
											<Input
												label="Preis (€ / Monat)"
												type="number"
												step="0.01"
												min={0}
												error={errors.tiers?.[index]?.price?.message}
												{...register(`tiers.${index}.price`, {
													valueAsNumber: true
												})}
											/>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Visual Summary */}
						{cTiers && cTiers.length > 0 && (
							<div className="bg-[#1a1a2e] rounded-xl p-5 mt-4 shadow-lg">
								<div className="text-[0.7rem] uppercase tracking-wider text-[#888] font-bold mb-3 flex items-center gap-2">
									<div className="w-1.5 h-1.5 rounded-full bg-[#ff6b00]"></div>
									Vorschau für Verkäufer
								</div>
								<div className="space-y-2">
									{cTiers.map((tier, i) => (
										<div
											key={i}
											className="flex justify-between text-[0.85rem]"
										>
											<span className="text-[#bbb]">
												Monat {tier.fromMonth || 1}–{tier.toMonth || "?"}
											</span>
											<span className="font-bold text-white">
												{tier.price?.toFixed(2) || "0.00"} €
											</span>
										</div>
									))}
									<div className="flex justify-between text-[0.82rem] pt-2 mt-2 border-t border-white/10">
										<span className="text-[#888]">danach</span>
										<span className="font-medium text-[#777]">
											regulärer Tarifpreis
										</span>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</form>
	);
}
