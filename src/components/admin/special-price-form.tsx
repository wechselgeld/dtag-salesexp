"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface TierData {
	price: number;
	fromMonth: number;
	toMonth: number;
}

interface SpecialPriceFormProps {
	initialData?: {
		id: string;
		name: string;
		products: { id: string; name: string }[];
		tiers: TierData[];
		requiresMagentaTV: boolean;
		requiresSpeedUp: boolean;
		requiresMove: boolean;
		priority: number;
		isActive: boolean;
	};
	mode: "create" | "edit";
}

export function SpecialPriceForm({ initialData, mode }: SpecialPriceFormProps) {
	const router = useRouter();
	const { data: products } = trpc.product.getAllProducts.useQuery();

	const [formData, setFormData] = useState({
		name: initialData?.name || "",
		productIds: initialData?.products?.map((p) => p.id) || ([] as string[]),
		requiresMagentaTV: initialData?.requiresMagentaTV || false,
		requiresSpeedUp: initialData?.requiresSpeedUp || false,
		requiresMove: initialData?.requiresMove || false,
		priority: initialData?.priority || 0,
		isActive: initialData?.isActive ?? true
	});

	const [tiers, setTiers] = useState<TierData[]>(
		initialData?.tiers && initialData.tiers.length > 0
			? initialData.tiers
			: [{ price: 0, fromMonth: 1, toMonth: 6 }]
	);

	const addTier = () => {
		const lastTier = tiers[tiers.length - 1];
		setTiers([
			...tiers,
			{
				price: 0,
				fromMonth: lastTier ? lastTier.toMonth + 1 : 1,
				toMonth: lastTier ? lastTier.toMonth + 6 : 6
			}
		]);
	};

	const removeTier = (index: number) => {
		if (tiers.length <= 1) return;
		setTiers(tiers.filter((_, i) => i !== index));
	};

	const updateTier = (index: number, field: keyof TierData, value: number) => {
		const newTiers = [...tiers];
		newTiers[index] = { ...newTiers[index], [field]: value };
		setTiers(newTiers);
	};

	const toggleProduct = (productId: string) => {
		setFormData((prev) => ({
			...prev,
			productIds: prev.productIds.includes(productId)
				? prev.productIds.filter((id) => id !== productId)
				: [...prev.productIds, productId]
		}));
	};

	const createMutation = trpc.admin.createSpecialPrice.useMutation({
		onSuccess: () => {
			router.push("/admin/special-prices");
			router.refresh();
		}
	});

	const updateMutation = trpc.admin.updateSpecialPrice.useMutation({
		onSuccess: () => {
			router.push("/admin/special-prices");
			router.refresh();
		}
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const payload = { ...formData, tiers };
		if (mode === "create") {
			createMutation.mutate(payload);
		} else {
			updateMutation.mutate({
				id: initialData!.id,
				...payload
			});
		}
	};

	const isPending = createMutation.isPending || updateMutation.isPending;

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			<div className="flex items-center justify-between">
				<Link
					href="/admin/special-prices"
					className="text-[#999] hover:text-[#1a1a2e] flex items-center gap-2 transition-colors text-[0.85rem] no-underline"
				>
					<ArrowLeft className="w-4 h-4" /> Zurück
				</Link>
				<button
					type="submit"
					disabled={isPending || formData.productIds.length === 0}
					className={clsx(
						"px-5 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 transition-all duration-200 text-[0.82rem] cursor-pointer",
						isPending || formData.productIds.length === 0
							? "bg-[#ddd] cursor-not-allowed"
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

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Left Column — Base Data */}
				<div className="space-y-6">
					<div className="bg-white rounded-2xl p-6 border border-[#eaedf0] space-y-5">
						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] border-b border-[#f0f0f0] pb-2 m-0">
							Basisdaten
						</h3>

						<div className="space-y-1.5">
							<label className="text-[0.75rem] font-semibold text-[#888]">
								Name (Aktion)
							</label>
							<input
								type="text"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="w-full px-4 py-2.5 border border-[#eaedf0] rounded-xl focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
								placeholder="z.B. MagentaZuhause Aktion"
								required
							/>
						</div>

						<div className="space-y-1.5">
							<label className="text-[0.75rem] font-semibold text-[#888]">
								Priorität (Höher gewinnt)
							</label>
							<input
								type="number"
								value={formData.priority}
								onChange={(e) =>
									setFormData({
										...formData,
										priority: parseInt(e.target.value)
									})
								}
								className="w-full px-4 py-2.5 border border-[#eaedf0] rounded-xl focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
							/>
						</div>

						{/* Conditions */}
						<div className="space-y-3 pt-2 border-t border-[#f0f0f0]">
							<h4 className="text-[0.8rem] font-bold text-[#1a1a2e] m-0">
								Bedingungen
							</h4>
							{[
								{
									key: "requiresMagentaTV" as const,
									label: "Benötigt MagentaTV"
								},
								{
									key: "requiresSpeedUp" as const,
									label: "Benötigt SpeedUp"
								},
								{
									key: "requiresMove" as const,
									label: "Benötigt Umzug/Neuanschluss"
								}
							].map(({ key, label }) => (
								<label
									key={key}
									className="flex items-center gap-2.5 cursor-pointer"
								>
									<input
										type="checkbox"
										checked={formData[key]}
										onChange={(e) =>
											setFormData({ ...formData, [key]: e.target.checked })
										}
										className="w-4 h-4 rounded border-[#ddd] text-[#e20074] focus:ring-[#e20074]"
									/>
									<span className="text-[0.82rem] text-[#666]">{label}</span>
								</label>
							))}
						</div>
					</div>

					{/* Produkte */}
					<div className="bg-white rounded-2xl p-6 border border-[#eaedf0] space-y-4">
						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] border-b border-[#f0f0f0] pb-2 m-0">
							Produkte{" "}
							<span className="text-[0.72rem] font-normal text-[#999]">
								({formData.productIds.length} ausgewählt)
							</span>
						</h3>

						<div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1">
							{products?.map((product) => {
								const isChecked = formData.productIds.includes(product.id);
								return (
									<label
										key={product.id}
										className={clsx(
											"flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all text-[0.82rem]",
											isChecked
												? "bg-[#e20074]/[0.04] border border-[#e20074]/20"
												: "hover:bg-[#f7f8fa] border border-transparent"
										)}
									>
										<input
											type="checkbox"
											checked={isChecked}
											onChange={() => toggleProduct(product.id)}
											className="w-4 h-4 rounded border-[#ddd] text-[#e20074] focus:ring-[#e20074]"
										/>
										<span
											className={clsx(
												"font-medium",
												isChecked ? "text-[#1a1a2e]" : "text-[#666]"
											)}
										>
											{product.name}
										</span>
										<span className="text-[0.68rem] text-[#bbb] ml-auto">
											{product.category}
										</span>
									</label>
								);
							})}
						</div>
					</div>
				</div>

				{/* Right Column — Tiers */}
				<div className="bg-white rounded-2xl p-6 border border-[#eaedf0] space-y-5 self-start">
					<div className="flex justify-between items-center border-b border-[#f0f0f0] pb-2">
						<h3 className="text-[0.95rem] font-bold text-[#1a1a2e] m-0">
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

					<div className="space-y-3">
						{tiers.map((tier, index) => (
							<div
								key={index}
								className="bg-[#f7f8fa] rounded-xl p-4 border border-[#eaedf0] relative group"
							>
								<div className="flex items-center justify-between mb-3">
									<span className="text-[0.72rem] font-bold text-[#999] uppercase tracking-wider">
										Stufe {index + 1}
									</span>
									{tiers.length > 1 && (
										<button
											type="button"
											onClick={() => removeTier(index)}
											className="p-1 text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2]/40 rounded-lg transition-all cursor-pointer bg-transparent border-none"
											title="Stufe entfernen"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
									)}
								</div>
								<div className="grid grid-cols-3 gap-3">
									<div className="space-y-1">
										<label className="text-[0.68rem] font-semibold text-[#aaa]">
											Von Monat
										</label>
										<input
											type="number"
											min={1}
											value={tier.fromMonth}
											onChange={(e) =>
												updateTier(
													index,
													"fromMonth",
													parseInt(e.target.value) || 1
												)
											}
											className="w-full px-3 py-2 border border-[#eaedf0] rounded-lg text-[0.82rem] focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-[0.68rem] font-semibold text-[#aaa]">
											Bis Monat
										</label>
										<input
											type="number"
											min={1}
											value={tier.toMonth}
											onChange={(e) =>
												updateTier(
													index,
													"toMonth",
													parseInt(e.target.value) || 1
												)
											}
											className="w-full px-3 py-2 border border-[#eaedf0] rounded-lg text-[0.82rem] focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-[0.68rem] font-semibold text-[#aaa]">
											Preis (€)
										</label>
										<input
											type="number"
											step="0.01"
											min={0}
											value={tier.price}
											onChange={(e) =>
												updateTier(
													index,
													"price",
													parseFloat(e.target.value) || 0
												)
											}
											className="w-full px-3 py-2 border border-[#eaedf0] rounded-lg text-[0.82rem] focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all font-bold text-[#e20074]"
										/>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Visual Summary */}
					{tiers.length > 0 && (
						<div className="bg-[#1a1a2e] rounded-xl p-4 mt-2">
							<div className="text-[0.68rem] uppercase tracking-wider text-[#888] font-semibold mb-2">
								Vorschau
							</div>
							<div className="space-y-1">
								{tiers.map((tier, i) => (
									<div key={i} className="flex justify-between text-[0.82rem]">
										<span className="text-[#aaa]">
											Monat {tier.fromMonth}–{tier.toMonth}
										</span>
										<span className="font-bold text-white">
											{tier.price.toFixed(2)} €
										</span>
									</div>
								))}
								<div className="flex justify-between text-[0.82rem] pt-1 border-t border-white/10">
									<span className="text-[#aaa]">danach</span>
									<span className="font-medium text-[#888]">
										regulärer Preis
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</form>
	);
}
