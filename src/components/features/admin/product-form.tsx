"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import clsx from "clsx";
import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { Checkbox } from "@/components/shared/ui/checkbox";

const productSchema = z.object({
	name: z.string().min(1, "Name ist erforderlich"),
	category: z.string().min(1, "Kategorie ist erforderlich"),
	basePrice: z.number().min(0, "Preis muss positiv sein").default(0),
	description: z.string().optional(),
	dataVolume: z.string().optional(),
	downloadSpeed: z.number().optional().default(0),
	uploadSpeed: z.number().optional().default(0),
	contractDuration: z.number().optional().default(24),
	allowNewActivation: z.boolean().default(true),
	allowMove: z.boolean().default(true),
	allowPlanChange: z.boolean().default(true),
	allowSpeedUp: z.boolean().default(false),
	activationFeeNew: z.number().optional().default(0),
	activationFeeMove: z.number().optional().default(0),
	activationFeePlanChange: z.number().optional().default(0),
	activationFeeSpeedUp: z.number().optional().default(0),
	allowMagentaTV: z.boolean().default(false),
	hasMagentaTVBundle: z.boolean().default(false),
	magentaTVBundleName: z.string().optional(),
	magentaTVBundlePrice: z.number().optional().default(0),
	deviceManufacturer: z.string().optional(),
	purchasePrice: z.number().optional().default(0),
	rentalPrice: z.number().optional().default(0),
	features: z.array(z.string()).default([]),
	targetGroups: z.array(z.string()).default([]),
	salesArguments: z.array(z.string()).default([]),
	salesScript: z.string().optional()
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
	initialData?: any;
	mode: "create" | "edit";
}

export function ProductForm({ initialData, mode }: ProductFormProps) {
	const router = useRouter();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(productSchema),
		mode: "onChange",
		defaultValues: {
			name: initialData?.name || "",
			category: initialData?.category || "MOBILE",
			basePrice: initialData?.basePrice || 0,
			description: initialData?.description || "",
			dataVolume: initialData?.dataVolume || "",
			downloadSpeed: initialData?.downloadSpeed || 0,
			uploadSpeed: initialData?.uploadSpeed || 0,
			contractDuration: initialData?.contractDuration || 24,
			allowNewActivation: initialData?.allowNewActivation ?? true,
			allowMove: initialData?.allowMove ?? true,
			allowPlanChange: initialData?.allowPlanChange ?? true,
			allowSpeedUp: initialData?.allowSpeedUp ?? false,
			activationFeeNew: initialData?.activationFeeNew || 0,
			activationFeeMove: initialData?.activationFeeMove || 0,
			activationFeePlanChange: initialData?.activationFeePlanChange || 0,
			activationFeeSpeedUp: initialData?.activationFeeSpeedUp || 0,
			allowMagentaTV: initialData?.allowMagentaTV || false,
			hasMagentaTVBundle: initialData?.hasMagentaTVBundle || false,
			magentaTVBundleName: initialData?.magentaTVBundleName || "",
			magentaTVBundlePrice: initialData?.magentaTVBundlePrice || 0,
			deviceManufacturer: initialData?.deviceManufacturer || "",
			purchasePrice: initialData?.purchasePrice || 0,
			rentalPrice: initialData?.rentalPrice || 0,
			features: initialData?.features || [],
			targetGroups: initialData?.targetGroups || [],
			salesArguments:
				initialData?.salesArguments?.map((a: any) => a.text) || [],
			salesScript: initialData?.salesScript || ""
		}
	});

	const [newFeature, setNewFeature] = useState("");
	const [newSalesArgument, setNewSalesArgument] = useState("");

	const createMutation = trpc.admin.createProduct.useMutation({
		onSuccess: () => {
			router.push("/admin/products");
			router.refresh();
		}
	});

	const updateMutation = trpc.admin.updateProduct.useMutation({
		onSuccess: () => {
			router.push("/admin/products");
			router.refresh();
		}
	});

	const onSubmit = (data: ProductFormData) => {
		if (mode === "create") {
			createMutation.mutate(data);
		} else {
			updateMutation.mutate({
				id: initialData.id,
				...data
			});
		}
	};

	const addFeature = () => {
		if (newFeature.trim()) {
			const currentFeatures = watch("features") || [];
			setValue("features", [...currentFeatures, newFeature.trim()]);
			setNewFeature("");
		}
	};

	const removeFeature = (idx: number) => {
		const currentFeatures = watch("features") || [];
		setValue(
			"features",
			currentFeatures.filter((_, i) => i !== idx)
		);
	};

	const addSalesArgument = () => {
		if (newSalesArgument.trim()) {
			const currentArgs = watch("salesArguments") || [];
			setValue("salesArguments", [...currentArgs, newSalesArgument.trim()]);
			setNewSalesArgument("");
		}
	};

	const removeSalesArgument = (idx: number) => {
		const currentArgs = watch("salesArguments") || [];
		setValue(
			"salesArguments",
			currentArgs.filter((_, i) => i !== idx)
		);
	};

	const toggleTargetGroup = (id: string) => {
		const currentGroups = watch("targetGroups") || [];
		if (currentGroups.includes(id)) {
			setValue(
				"targetGroups",
				currentGroups.filter((tg) => tg !== id)
			);
		} else {
			setValue("targetGroups", [...currentGroups, id]);
		}
	};

	const isPending = createMutation.isPending || updateMutation.isPending;

	const category = watch("category");
	const cAllowNewActivation = watch("allowNewActivation");
	const cAllowMove = watch("allowMove");
	const cAllowPlanChange = watch("allowPlanChange");
	const cAllowSpeedUp = watch("allowSpeedUp");
	const cFeatures = watch("features") || [];
	const cTargetGroups = watch("targetGroups") || [];
	const cSalesArguments = watch("salesArguments") || [];

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Link
					href="/admin/products"
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

			<div className="flex flex-col md:flex-row gap-6">
				{/* Left Column */}
				<div className="flex-1 space-y-6">
					{/* Basic Info */}
					<div className="bg-white rounded-2xl p-6 border border-[#eaedf0] space-y-5">
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] border-b border-[#f0f0f0] pb-2 m-0">
							Basisdaten
						</h3>

						<Input
							label="Name"
							placeholder="z.B. MagentaMobil M"
							error={errors.name?.message}
							{...register("name")}
						/>

						<Textarea
							label="Beschreibung"
							placeholder="Kurze Beschreibung des Tarifs..."
							error={errors.description?.message}
							{...register("description")}
						/>

						<Textarea
							label="Gesprächsleitfaden / Überleitung (Sales Script)"
							placeholder="z.B. „Herr [Name], ich sehe, dass Ihr aktueller Vertrag noch mit DSL 50 läuft...“"
							error={errors.salesScript?.message}
							{...register("salesScript")}
						/>

						<div className="space-y-1.5 w-full">
							<label className="block text-[0.75rem] font-semibold text-[#888]">
								Kategorie
							</label>
							<select
								{...register("category")}
								className="w-full px-4 py-2.5 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] focus:bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
							>
								<option value="MOBILE">Mobilfunk</option>
								<option value="FIBER">Glasfaser</option>
								<option value="DSL">DSL</option>
								<option value="MAGENTA_TV_OTT">MagentaTV (OTT)</option>
								<option value="DEVICE">Hardware</option>
							</select>
						</div>

						{category !== "DEVICE" && (
							<Input
								label="Basispreis (€)"
								type="number"
								step="0.01"
								placeholder="0.00"
								error={errors.basePrice?.message}
								{...register("basePrice", { valueAsNumber: true })}
							/>
						)}

						<Input
							label="Laufzeit (Monate)"
							type="number"
							placeholder="24"
							error={errors.contractDuration?.message}
							{...register("contractDuration", { valueAsNumber: true })}
						/>
					</div>

					{/* Technical Specs */}
					<div className="bg-white rounded-2xl p-6 border border-[#eaedf0] space-y-5">
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] border-b border-[#f0f0f0] pb-2 m-0">
							Leistungsdaten
						</h3>

						<Input
							label="Datenvolumen (z.B. 20 GB)"
							placeholder="20 GB"
							error={errors.dataVolume?.message}
							{...register("dataVolume")}
						/>

						<div className="grid grid-cols-2 gap-4">
							<Input
								label="Download (Mbit/s)"
								type="number"
								placeholder="0"
								error={errors.downloadSpeed?.message}
								{...register("downloadSpeed", { valueAsNumber: true })}
							/>
							<Input
								label="Upload (Mbit/s)"
								type="number"
								placeholder="0"
								error={errors.uploadSpeed?.message}
								{...register("uploadSpeed", { valueAsNumber: true })}
							/>
						</div>
					</div>

					{category === "DEVICE" && (
						<div className="bg-white rounded-2xl p-6 border border-[#eaedf0] space-y-5">
							<h3 className="text-[1rem] font-bold text-[#1a1a2e] border-b border-[#f0f0f0] pb-2 m-0">
								Geräte-Spezifikationen
							</h3>
							<p className="text-[0.7rem] text-[#888] mb-4 m-0 mt-[-5px]">
								Hier kannst Du Einmal- und Mietpreise für Hardware definieren.
								Einer von beiden Werten kann `0` bleiben, wenn die Kaufart nicht
								angeboten wird.
							</p>

							<Input
								label="Hersteller"
								placeholder="z.B. Apple, AVM"
								error={errors.deviceManufacturer?.message}
								{...register("deviceManufacturer")}
							/>

							<div className="grid grid-cols-2 gap-4">
								<Input
									label="Kaufpreis (€)"
									type="number"
									step="0.01"
									placeholder="0.00"
									error={errors.purchasePrice?.message}
									{...register("purchasePrice", { valueAsNumber: true })}
								/>
								<Input
									label="Mietpreis (€/Monat)"
									type="number"
									step="0.01"
									placeholder="0.00"
									error={errors.rentalPrice?.message}
									{...register("rentalPrice", { valueAsNumber: true })}
								/>
							</div>
						</div>
					)}
				</div>

				{/* Right Column */}
				<div className="w-full md:w-[450px] space-y-6">
					{/* Business Cases & Fees */}
					<div className="bg-white rounded-2xl p-6 border border-[#eaedf0] shadow-sm space-y-5">
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] border-b border-[#f0f0f0] pb-2 m-0">
							Geschäftsfälle & Gebühren
						</h3>

						<div className="space-y-4">
							<div className="p-4 bg-[#f7f8fa] rounded-xl border border-[#eaedf0] space-y-3">
								<Checkbox
									label="Neubereitstellung erlauben"
									{...register("allowNewActivation")}
								/>
								<Input
									label="Anschlussgebühr (€)"
									type="number"
									step="0.01"
									disabled={!cAllowNewActivation}
									{...register("activationFeeNew", { valueAsNumber: true })}
								/>
							</div>

							<div className="p-4 bg-[#f7f8fa] rounded-xl border border-[#eaedf0] space-y-3">
								<Checkbox label="Umzug erlauben" {...register("allowMove")} />
								<Input
									label="Umzugsgebühr (€)"
									type="number"
									step="0.01"
									disabled={!cAllowMove}
									{...register("activationFeeMove", { valueAsNumber: true })}
								/>
							</div>

							<div className="p-4 bg-[#f7f8fa] rounded-xl border border-[#eaedf0] space-y-3">
								<Checkbox
									label="Tarifwechsel erlauben"
									{...register("allowPlanChange")}
								/>
								<Input
									label="Wechselgebühr (€)"
									type="number"
									step="0.01"
									disabled={!cAllowPlanChange}
									{...register("activationFeePlanChange", {
										valueAsNumber: true
									})}
								/>
							</div>

							<div className="p-4 bg-[#f7f8fa] rounded-xl border border-[#eaedf0] space-y-3">
								<Checkbox
									label="Speed Up erlauben"
									{...register("allowSpeedUp")}
								/>
								<Input
									label="Speed Up Gebühr (€)"
									type="number"
									step="0.01"
									disabled={!cAllowSpeedUp}
									{...register("activationFeeSpeedUp", {
										valueAsNumber: true
									})}
								/>
							</div>
						</div>
					</div>

					{/* MagentaTV Options */}
					<div className="bg-white rounded-2xl p-6 border border-[#eaedf0] space-y-5">
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] border-b border-[#f0f0f0] pb-2 m-0">
							MagentaTV Optionen
						</h3>
						<Checkbox
							label="MagentaTV zubuchbar"
							{...register("allowMagentaTV")}
						/>
					</div>

					{/* Extras */}
					<div className="bg-white rounded-2xl p-6 border border-[#eaedf0] space-y-6">
						<div>
							<h3 className="text-[1rem] font-bold text-[#1a1a2e] border-b border-[#f0f0f0] pb-2 m-0 mb-3">
								Zielgruppen (Filter)
							</h3>

							<div className="flex flex-wrap gap-2">
								{[
									{ id: "student", label: "Student & Young" },
									{ id: "family", label: "Familie mit Kids" },
									{ id: "senior", label: "Ältere Personen" },
									{ id: "power", label: "Stream/Gaming" },
									{ id: "business", label: "Home-Office" }
								].map((tg) => (
									<label
										key={tg.id}
										className={clsx(
											"flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer hover:border-[#ff69b4] transition-colors",
											cTargetGroups.includes(tg.id)
												? "border-[#e20074] bg-[#e20074]/5"
												: "border-[#eaedf0] bg-white"
										)}
									>
										<input
											type="checkbox"
											checked={cTargetGroups.includes(tg.id)}
											onChange={() => toggleTargetGroup(tg.id)}
											className="sr-only"
										/>
										<span
											className={clsx(
												"text-sm font-medium",
												cTargetGroups.includes(tg.id)
													? "text-[#e20074]"
													: "text-[#555]"
											)}
										>
											{tg.label}
										</span>
									</label>
								))}
							</div>
						</div>

						<div>
							<h3 className="text-[1rem] font-bold text-[#1a1a2e] border-b border-[#f0f0f0] pb-2 m-0 mb-3">
								Features
							</h3>
							<div className="flex gap-2">
								<Input
									placeholder="Feature hinzufügen..."
									value={newFeature}
									onChange={(e) => setNewFeature(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											addFeature();
										}
									}}
								/>
								<button
									type="button"
									onClick={addFeature}
									className="bg-zinc-800 text-white p-2.5 rounded-xl hover:bg-zinc-700 transition active:scale-95 h-[42px] mt-[1.5px]"
								>
									<Plus className="w-4 h-4" />
								</button>
							</div>

							<div className="flex flex-wrap gap-2 mt-4">
								{cFeatures.map((feature: string, idx: number) => (
									<div
										key={idx}
										className="flex items-center gap-2 bg-[#f7f8fa] border border-[#eaedf0] pl-3 pr-2 py-1.5 rounded-lg text-[0.85rem]"
									>
										<span>{feature}</span>
										<button
											type="button"
											onClick={() => removeFeature(idx)}
											className="text-[#aaa] hover:text-[#dc2626] ml-2"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								))}
							</div>
						</div>

						<div>
							<h3 className="text-[1rem] font-bold text-[#1a1a2e] border-b border-[#f0f0f0] pb-2 m-0 mb-3">
								Verkaufsargumente
							</h3>
							<div className="flex gap-2">
								<Input
									placeholder="z.B. Bestes Netz laut Connect..."
									value={newSalesArgument}
									onChange={(e) => setNewSalesArgument(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											addSalesArgument();
										}
									}}
								/>
								<button
									type="button"
									onClick={addSalesArgument}
									className="bg-[#e20074] text-white p-2.5 rounded-xl hover:bg-[#c70066] transition active:scale-95 h-[42px] mt-[1.5px]"
								>
									<Plus className="w-4 h-4" />
								</button>
							</div>

							<div className="flex flex-wrap gap-2 mt-4">
								{cSalesArguments.map((arg: string, idx: number) => (
									<div
										key={idx}
										className="flex items-center justify-between w-full bg-[#f7f8fa] border border-[#eaedf0] px-3 py-2.5 rounded-lg text-[0.85rem]"
									>
										<span>{arg}</span>
										<button
											type="button"
											onClick={() => removeSalesArgument(idx)}
											className="text-[#aaa] hover:text-[#dc2626] ml-2"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</form>
	);
}
