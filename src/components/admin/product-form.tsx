"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";

interface ProductFormProps {
	initialData?: any; // Type strictly if possible, for now any is fine for speed
	mode: "create" | "edit";
}

export function ProductForm({ initialData, mode }: ProductFormProps) {
	const router = useRouter();
	const [formData, setFormData] = useState({
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
		salesArguments: initialData?.salesArguments?.map((a: any) => a.text) || []
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (mode === "create") {
			createMutation.mutate(formData);
		} else {
			updateMutation.mutate({
				id: initialData.id,
				...formData
			});
		}
	};

	const addFeature = () => {
		if (newFeature.trim()) {
			setFormData({
				...formData,
				features: [...formData.features, newFeature.trim()]
			});
			setNewFeature("");
		}
	};

	const removeFeature = (idx: number) => {
		setFormData({
			...formData,
			features: formData.features.filter((_: string, i: number) => i !== idx)
		});
	};

	const addSalesArgument = () => {
		if (newSalesArgument.trim()) {
			setFormData({
				...formData,
				salesArguments: [...formData.salesArguments, newSalesArgument.trim()]
			});
			setNewSalesArgument("");
		}
	};

	const removeSalesArgument = (idx: number) => {
		setFormData({
			...formData,
			salesArguments: formData.salesArguments.filter(
				(_: string, i: number) => i !== idx
			)
		});
	};

	const toggleTargetGroup = (id: string) => {
		setFormData((prev) => {
			if (prev.targetGroups.includes(id)) {
				return {
					...prev,
					targetGroups: prev.targetGroups.filter((tg: string) => tg !== id)
				};
			} else {
				return { ...prev, targetGroups: [...prev.targetGroups, id] };
			}
		});
	};

	const isPending = createMutation.isPending || updateMutation.isPending;

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Link
					href="/admin/products"
					className="text-zinc-500 hover:text-zinc-900:text-white flex items-center gap-2 transition-colors"
				>
					<ArrowLeft className="w-4 h-4" /> Zurück
				</Link>
				<button
					type="submit"
					disabled={isPending}
					className="bg-magenta-600 hover:bg-magenta-700 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
				>
					{isPending ? (
						<Loader2 className="w-5 h-5 animate-spin" />
					) : (
						<Save className="w-5 h-5" />
					)}
					Speichern
				</button>
			</div>

			<div className="bg-white rounded-2xl p-8 border border-zinc-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* Basic Info */}
				<div className="space-y-4">
					<h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-2">
						Basisdaten
					</h3>

					<div>
						<label className="block text-sm font-medium text-zinc-700 mb-1">
							Name
						</label>
						<input
							type="text"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-magenta-500 outline-none"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-zinc-700 mb-1">
							Beschreibung
						</label>
						<textarea
							value={formData.description || ""}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-magenta-500 outline-none min-h-[80px]"
							placeholder="Kurze Beschreibung des Tarifs..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-zinc-700 mb-1">
							Kategorie
						</label>
						<select
							value={formData.category}
							onChange={(e) =>
								setFormData({ ...formData, category: e.target.value })
							}
							className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-magenta-500 outline-none"
						>
							<option value="MOBILE">Mobilfunk</option>
							<option value="FIBER">Glasfaser</option>
							<option value="DSL">DSL</option>
							<option value="MAGENTA_TV_OTT">MagentaTV (OTT)</option>
							<option value="DEVICE">Hardware</option>
						</select>
					</div>

					{formData.category !== "DEVICE" && (
						<div>
							<label className="block text-sm font-medium text-zinc-700 mb-1">
								Basispreis (€)
							</label>
							<input
								type="number"
								step="0.01"
								value={formData.basePrice}
								onChange={(e) =>
									setFormData({
										...formData,
										basePrice: parseFloat(e.target.value) || 0
									})
								}
								className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-magenta-500 outline-none"
								required
							/>
						</div>
					)}

					<div>
						<label className="block text-sm font-medium text-zinc-700 mb-1">
							Laufzeit (Monate)
						</label>
						<input
							type="number"
							value={formData.contractDuration}
							onChange={(e) =>
								setFormData({
									...formData,
									contractDuration: parseInt(e.target.value)
								})
							}
							className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-magenta-500 outline-none"
						/>
					</div>
				</div>

				{/* Technical Specs */}
				<div className="space-y-4">
					<h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-2">
						Leistungsdaten
					</h3>

					<div>
						<label className="block text-sm font-medium text-zinc-700 mb-1">
							Datenvolumen (z.B. "20 GB")
						</label>
						<input
							type="text"
							value={formData.dataVolume}
							onChange={(e) =>
								setFormData({ ...formData, dataVolume: e.target.value })
							}
							className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-magenta-500 outline-none"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-zinc-700 mb-1">
								Download (Mbit/s)
							</label>
							<input
								type="number"
								value={formData.downloadSpeed}
								onChange={(e) =>
									setFormData({
										...formData,
										downloadSpeed: parseInt(e.target.value)
									})
								}
								className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-magenta-500 outline-none"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-zinc-700 mb-1">
								Upload (Mbit/s)
							</label>
							<input
								type="number"
								value={formData.uploadSpeed}
								onChange={(e) =>
									setFormData({
										...formData,
										uploadSpeed: parseInt(e.target.value)
									})
								}
								className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-magenta-500 outline-none"
							/>
						</div>
					</div>
				</div>

				{/* Business Cases & Fees */}
				<div className="md:col-span-2 space-y-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm mt-4">
					<h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-2">
						Geschäftsfälle & Gebühren
					</h3>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Neubereitstellung */}
						<div className="flex flex-col gap-2 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.allowNewActivation}
									onChange={(e) =>
										setFormData({
											...formData,
											allowNewActivation: e.target.checked
										})
									}
									className="w-4 h-4 rounded border-zinc-300 text-magenta-600 focus:ring-magenta-500"
								/>
								<label className="text-sm font-semibold text-zinc-900">
									Neubereitstellung erlauben
								</label>
							</div>
							<div>
								<label className="block text-xs text-zinc-500 mb-1">
									Anschlussgebühr (€)
								</label>
								<input
									type="number"
									step="0.01"
									value={formData.activationFeeNew}
									onChange={(e) =>
										setFormData({
											...formData,
											activationFeeNew: parseFloat(e.target.value) || 0
										})
									}
									disabled={!formData.allowNewActivation}
									className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white focus:ring-2 focus:ring-magenta-500 outline-none disabled:opacity-50"
								/>
							</div>
						</div>

						{/* Umzug */}
						<div className="flex flex-col gap-2 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.allowMove}
									onChange={(e) =>
										setFormData({ ...formData, allowMove: e.target.checked })
									}
									className="w-4 h-4 rounded border-zinc-300 text-magenta-600 focus:ring-magenta-500"
								/>
								<label className="text-sm font-semibold text-zinc-900">
									Umzug erlauben
								</label>
							</div>
							<div>
								<label className="block text-xs text-zinc-500 mb-1">
									Umzugsgebühr (€)
								</label>
								<input
									type="number"
									step="0.01"
									value={formData.activationFeeMove}
									onChange={(e) =>
										setFormData({
											...formData,
											activationFeeMove: parseFloat(e.target.value) || 0
										})
									}
									disabled={!formData.allowMove}
									className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white focus:ring-2 focus:ring-magenta-500 outline-none disabled:opacity-50"
								/>
							</div>
						</div>

						{/* Tarifwechsel */}
						<div className="flex flex-col gap-2 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.allowPlanChange}
									onChange={(e) =>
										setFormData({
											...formData,
											allowPlanChange: e.target.checked
										})
									}
									className="w-4 h-4 rounded border-zinc-300 text-magenta-600 focus:ring-magenta-500"
								/>
								<label className="text-sm font-semibold text-zinc-900">
									Tarifwechsel erlauben
								</label>
							</div>
							<div>
								<label className="block text-xs text-zinc-500 mb-1">
									Wechselgebühr (€)
								</label>
								<input
									type="number"
									step="0.01"
									value={formData.activationFeePlanChange}
									onChange={(e) =>
										setFormData({
											...formData,
											activationFeePlanChange: parseFloat(e.target.value) || 0
										})
									}
									disabled={!formData.allowPlanChange}
									className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white focus:ring-2 focus:ring-magenta-500 outline-none disabled:opacity-50"
								/>
							</div>
						</div>

						{/* Speed Up */}
						<div className="flex flex-col gap-2 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.allowSpeedUp}
									onChange={(e) =>
										setFormData({ ...formData, allowSpeedUp: e.target.checked })
									}
									className="w-4 h-4 rounded border-zinc-300 text-magenta-600 focus:ring-magenta-500"
								/>
								<label className="text-sm font-semibold text-zinc-900">
									Speed Up erlauben
								</label>
							</div>
							<div>
								<label className="block text-xs text-zinc-500 mb-1">
									Speed Up Gebühr (€)
								</label>
								<input
									type="number"
									step="0.01"
									value={formData.activationFeeSpeedUp}
									onChange={(e) =>
										setFormData({
											...formData,
											activationFeeSpeedUp: parseFloat(e.target.value) || 0
										})
									}
									disabled={!formData.allowSpeedUp}
									className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white focus:ring-2 focus:ring-magenta-500 outline-none disabled:opacity-50"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Device Special Specs (Only visible if DEVICE) */}
				{formData.category === "DEVICE" && (
					<div className="md:col-span-2 space-y-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
						<h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2">
							Geräte-Spezifikationen
						</h3>
						<p className="text-sm text-zinc-500 mb-4">
							Hier können Sie Einmal- und Mietpreise für Hardware definieren.
							Einer von beiden Werten kann `0` bleiben, wenn die Kaufart nicht
							angeboten wird.
						</p>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-zinc-700 mb-1">
									Hersteller
								</label>
								<input
									type="text"
									value={formData.deviceManufacturer}
									onChange={(e) =>
										setFormData({
											...formData,
											deviceManufacturer: e.target.value
										})
									}
									placeholder="z.B. Apple, AVM"
									className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-magenta-500 outline-none"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-700 mb-1">
									Kaufpreis (Einmalig, in €)
								</label>
								<input
									type="number"
									step="0.01"
									value={formData.purchasePrice}
									onChange={(e) =>
										setFormData({
											...formData,
											purchasePrice: parseFloat(e.target.value) || 0
										})
									}
									className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-magenta-500 outline-none"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-700 mb-1">
									Mietpreis (Monatlich, in €)
								</label>
								<input
									type="number"
									step="0.01"
									value={formData.rentalPrice}
									onChange={(e) =>
										setFormData({
											...formData,
											rentalPrice: parseFloat(e.target.value) || 0
										})
									}
									className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-magenta-500 outline-none"
								/>
							</div>
						</div>
					</div>
				)}

				{/* MagentaTV Options */}
				<div className="md:col-span-2 space-y-4">
					<h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-2">
						MagentaTV
					</h3>

					<div className="flex items-center gap-3">
						<input
							type="checkbox"
							checked={formData.allowMagentaTV}
							onChange={(e) =>
								setFormData({ ...formData, allowMagentaTV: e.target.checked })
							}
							className="w-5 h-5 rounded border-zinc-300 text-magenta-600 focus:ring-magenta-500"
						/>
						<label className="text-sm text-zinc-700">MagentaTV zubuchbar</label>
					</div>
				</div>

				{/* Target Groups & Features & Sales Arguments */}
				<div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Target Groups */}
					<div className="space-y-4 md:col-span-2 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
						<h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2">
							Zielgruppen (Filter)
						</h3>
						<p className="text-sm text-zinc-500 mb-4">
							Wählen Sie hier, für welche Zielgruppe(n) dieser Tarif als
							Empfehlung angezeigt werden soll.
						</p>
						<div className="flex flex-wrap gap-4">
							{[
								{ id: "student", label: "Student & Young" },
								{ id: "family", label: "Familie mit Kids" },
								{ id: "senior", label: "Ältere Personen" },
								{ id: "power", label: "Stream/Gaming" },
								{ id: "business", label: "Home-Office" }
							].map((tg) => (
								<label
									key={tg.id}
									className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-zinc-200 cursor-pointer hover:border-magenta-300 transition-colors"
								>
									<input
										type="checkbox"
										checked={formData.targetGroups.includes(tg.id)}
										onChange={() => toggleTargetGroup(tg.id)}
										className="w-4 h-4 rounded border-zinc-300 text-magenta-600 focus:ring-magenta-500"
									/>
									<span className="text-sm font-medium text-zinc-700">
										{tg.label}
									</span>
								</label>
							))}
						</div>
					</div>

					{/* Features */}
					<div className="space-y-4">
						<h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-2">
							Features
						</h3>

						<div className="flex gap-2">
							<input
								type="text"
								value={newFeature}
								onChange={(e) => setNewFeature(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addFeature();
									}
								}}
								placeholder="Feature hinzufügen..."
								className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-magenta-500 outline-none"
							/>
							<button
								type="button"
								onClick={addFeature}
								className="bg-zinc-900 text-white p-2 rounded-xl hover:bg-zinc-700 transition"
							>
								<Plus className="w-5 h-5" />
							</button>
						</div>

						<div className="flex flex-wrap gap-2">
							{formData.features.map((feature: string, idx: number) => (
								<div
									key={idx}
									className="flex items-center gap-2 bg-zinc-100 pl-3 pr-2 py-1 rounded-full text-sm"
								>
									{feature}
									<button
										type="button"
										onClick={() => removeFeature(idx)}
										className="text-zinc-400 hover:text-red-500"
									>
										<X className="w-4 h-4" />
									</button>
								</div>
							))}
						</div>
					</div>

					{/* Sales Arguments */}
					<div className="space-y-4">
						<h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-2">
							Verkaufsargumente
						</h3>
						<p className="text-xs text-zinc-500 mt-[-0.5rem]">
							Werden als Chips beim Produkt angezeigt.
						</p>

						<div className="flex gap-2">
							<input
								type="text"
								value={newSalesArgument}
								onChange={(e) => setNewSalesArgument(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addSalesArgument();
									}
								}}
								placeholder="z.B. Bestes Netz laut Connect..."
								className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-magenta-500 outline-none"
							/>
							<button
								type="button"
								onClick={addSalesArgument}
								className="bg-magenta-600 text-white p-2 rounded-xl hover:bg-magenta-700 transition"
							>
								<Plus className="w-5 h-5" />
							</button>
						</div>

						<div className="flex flex-col gap-2">
							{formData.salesArguments.map((arg: string, idx: number) => (
								<div
									key={idx}
									className="flex items-center justify-between bg-zinc-50 border border-zinc-100 px-3 py-2 rounded-lg text-[0.85rem]"
								>
									<span>{arg}</span>
									<button
										type="button"
										onClick={() => removeSalesArgument(idx)}
										className="text-zinc-400 hover:text-red-500 ml-2"
									>
										<X className="w-4 h-4" />
									</button>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</form>
	);
}
