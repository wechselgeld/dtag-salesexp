'use client';

import {
	useState,
} from 'react';
import {
	useRouter,
} from 'next/navigation';
import {
	trpc,
} from '@/lib/trpc';
import {
	Loader2,
	Save,
	Plus,
	X,
	Package,
	Zap,
	Smartphone,
	Settings,
	Tv,
	Users,
	ListChecks,
	MessageSquareQuote,
	Euro,
	CheckCircle2,
	Wifi,
} from 'lucide-react';
import {
	useForm, useFieldArray,
} from 'react-hook-form';
import {
	zodResolver,
} from '@hookform/resolvers/zod';
import * as z from 'zod';
import clsx from 'clsx';
import {
	Input,
} from '@/components/shared/ui/input';
import {
	Textarea,
} from '@/components/shared/ui/textarea';
import {
	AdminPageHeader,
	AdminFormSection,
	AdminFormContainer,
} from '@/components/shared/ui/admin-ui';
import {
	History,
} from 'lucide-react';

const productSchema = z.object({
	name: z.string().min(1, 'Name ist erforderlich'),
	category: z.string().min(1, 'Kategorie ist erforderlich'),
	basePrice: z.number().min(0, 'Preis muss positiv sein').default(0),
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
	allowHybrid: z.boolean().default(false),
	allowHardwareTiers: z.boolean().default(false),
	allowPlusKarten: z.boolean().default(false),
	allowsUnlimitedAdvantage: z.boolean().default(false),
	hasMagentaTVBundle: z.boolean().default(false),
	magentaTVBundleName: z.string().optional(),
	magentaTVBundlePrice: z.number().optional().default(0),
	deviceManufacturer: z.string().optional(),
	purchasePrice: z.number().optional().default(0),
	rentalPrice: z.number().optional().default(0),
	features: z.array(z.string()).default([
	]),
	targetGroups: z.array(z.string()).default([
	]),
	salesArguments: z.array(z.string()).default([
	]),
	salesScript: z.string().optional(),
	magentaInfosUrl: z.string().optional(),
	priceHistory: z.array(
		z.object({
			price: z.number().min(0, 'Preis muss positiv sein'),
			label: z.string().optional(),
		}),
	).default([
	]),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
	initialData?: any;
	mode: 'create' | 'edit';
}

export function ProductForm({
	initialData, mode,
}: ProductFormProps) {
	const router = useRouter();
	const utils = trpc.useUtils();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		getValues,
		control,
		formState: {
			errors,
		},
	} = useForm({
		resolver: zodResolver(productSchema),
		mode: 'onChange',
		defaultValues: {
			name: initialData?.name || '',
			category: initialData?.category || 'MOBILE',
			basePrice: initialData?.basePrice || 0,
			description: initialData?.description || '',
			dataVolume: initialData?.dataVolume || '',
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
			allowHybrid: initialData?.allowHybrid || false,
			allowHardwareTiers: initialData?.allowHardwareTiers || false,
			allowPlusKarten: initialData?.allowPlusKarten || false,
			allowsUnlimitedAdvantage: initialData?.allowsUnlimitedAdvantage || false,
			hasMagentaTVBundle: initialData?.hasMagentaTVBundle || false,
			magentaTVBundleName: initialData?.magentaTVBundleName || '',
			magentaTVBundlePrice: initialData?.magentaTVBundlePrice || 0,
			deviceManufacturer: initialData?.deviceManufacturer || '',
			purchasePrice: initialData?.purchasePrice || 0,
			rentalPrice: initialData?.rentalPrice || 0,
			features: initialData?.features || [
			],
			targetGroups: initialData?.targetGroups || [
			],
			salesArguments:
				initialData?.salesArguments?.map((a: any) => a.text) || [
				],
			salesScript: initialData?.salesScript || '',
			magentaInfosUrl: initialData?.magentaInfosUrl || '',
			priceHistory: initialData?.priceHistory?.map((ph: any) => ({
				price: ph.price,
				label: ph.label || '',
			})) || [
			],
		},
	});

	const {
		fields: priceHistoryFields, append: appendPriceHistory, remove: removePriceHistory,
	} = useFieldArray({
		control,
		name: 'priceHistory',
	});

	const [
		newFeature,
		setNewFeature,
	] = useState('');
	const [
		newSalesArgument,
		setNewSalesArgument,
	] = useState('');

	const createMutation = trpc.admin.createProduct.useMutation({
		onSuccess: () => {
			utils.product.getAllProducts.invalidate();
			utils.admin.getProductById.invalidate();
			router.push('/admin/products');
			router.refresh();
		},
	});

	const updateMutation = trpc.admin.updateProduct.useMutation({
		onSuccess: () => {
			utils.product.getAllProducts.invalidate();
			utils.admin.getProductById.invalidate();
			router.push('/admin/products');
			router.refresh();
		},
	});

	const onSubmit = (data: ProductFormData) => {
		if (mode === 'create') {
			createMutation.mutate(data);
		}
		else {
			updateMutation.mutate({
				id: initialData.id,
				...data,
			});
		}
	};

	const addFeature = () => {
		if (newFeature.trim()) {
			const currentFeatures = watch('features') || [
			];
			setValue('features', [
				...currentFeatures,
				newFeature.trim(),
			]);
			setNewFeature('');
		}
	};

	const removeFeature = (idx: number) => {
		const currentFeatures = getValues('features') || [
		];
		const featuresArray = Array.isArray(currentFeatures) ? currentFeatures : [
		];
		setValue(
			'features',
			featuresArray.filter((_, i) => i !== idx),
			{
				shouldDirty: true,
			},
		);
	};

	const addSalesArgument = () => {
		if (newSalesArgument.trim()) {
			const currentArgs = watch('salesArguments') || [
			];
			setValue('salesArguments', [
				...currentArgs,
				newSalesArgument.trim(),
			]);
			setNewSalesArgument('');
		}
	};

	const removeSalesArgument = (idx: number) => {
		const currentArgs = getValues('salesArguments') || [
		];
		const argsArray = Array.isArray(currentArgs) ? currentArgs : [
		];
		setValue(
			'salesArguments',
			argsArray.filter((_, i) => i !== idx),
			{
				shouldDirty: true,
			},
		);
	};

	const toggleTargetGroup = (id: string) => {
		const currentGroups = getValues('targetGroups') || [
		];
		const groupsArray = Array.isArray(currentGroups) ? currentGroups : [
		];

		if (groupsArray.includes(id)) {
			setValue(
				'targetGroups',
				groupsArray.filter((tg) => tg !== id),
				{
					shouldDirty: true,
				},
			);
		}
		else {
			setValue('targetGroups', [
				...groupsArray,
				id,
			], {
				shouldDirty: true,
			});
		}
	};

	const isPending = createMutation.isPending || updateMutation.isPending;

	const category = watch('category');
	const cFeatures = watch('features') || [
	];
	const cTargetGroups = watch('targetGroups') || [
	];
	const cSalesArguments = watch('salesArguments') || [
	];

	const targetGroupsArray = Array.isArray(cTargetGroups) ? cTargetGroups : [
	];

	const SaveButton = (
		<button
			type="submit"
			form="product-form"
			disabled={isPending}
			className={clsx(
				'px-6 py-2.5 rounded-2xl font-bold text-white flex items-center gap-2.5 transition-all duration-300 text-[0.85rem] cursor-pointer active:scale-95 shadow-[0_4px_14px_rgba(226,0,116,0.3)] hover:shadow-[0_8px_24px_rgba(226,0,116,0.4)] hover:-translate-y-0.5',
				isPending
					? 'bg-[#ddd] shadow-none cursor-not-allowed text-[#999] opacity-50'
					: 'bg-[#e20074] hover:bg-[#c70066]',
			)}
		>
			{isPending ? (
				<Loader2 className="w-4 h-4 animate-spin" />
			) : (
				<Save className="w-5 h-5" />
			)}
			Produkt speichern
		</button>
	);

	return (
		<div className="space-y-8 pb-12">
			<AdminPageHeader
				title={
					mode === 'create' ? 'Neues Produkt anlegen' : 'Produkt bearbeiten'
				}
				subtitle={
					mode === 'create'
						? 'Erstelle einen neuen Tarif oder Hardware für das Portfolio.'
						: `Konfiguration für ${initialData?.name}`
				}
				backHref="/admin/products"
				action={SaveButton}
			/>

			<form id="product-form" onSubmit={handleSubmit(onSubmit)}>
				<AdminFormContainer>
					<AdminFormSection
						title="Basisdaten"
						description="Allgemeine Produktinformationen."
						icon={Package}
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input
								label="Name"
								placeholder="z.B. MagentaMobil M"
								error={errors.name?.message}
								{...register('name')}
							/>
							<div className="flex flex-col gap-1.5">
								<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
									Kategorie
								</label>
								<select
									{...register('category')}
									className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] focus:outline-none focus:border-[#e20074] transition-all text-[0.9rem]"
								>
									<option value="MOBILE">Mobilfunk</option>
									<option value="FIBER">Glasfaser</option>
									<option value="DSL">DSL</option>
									<option value="MAGENTA_TV_OTT">MagentaTV — OTT</option>
									<option value="DEVICE">Hardware</option>
								</select>
							</div>
						</div>

						<Textarea
							label="Beschreibung"
							placeholder="Kurze Beschreibung des Tarifs..."
							error={errors.description?.message}
							{...register('description')}
							rows={3}
						/>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{category !== 'DEVICE' && (
								<div className="relative">
									<Input
										label="Basispreis (€ / Monat)"
										type="number"
										step="0.01"
										placeholder="0.00"
										error={errors.basePrice?.message}
										{...register('basePrice', {
											valueAsNumber: true,
										})}
										className="pl-10"
									/>
									<div className="absolute left-4 top-[38px] text-[#bbb]">
										<Euro className="w-4 h-4" />
									</div>
								</div>
							)}
							<Input
								label="Laufzeit (Monate)"
								type="number"
								placeholder="24"
								error={errors.contractDuration?.message}
								{...register('contractDuration', {
									valueAsNumber: true,
								})}
							/>
						</div>
					</AdminFormSection>

					<AdminFormSection
						title="Leistungsdaten"
						description="Technische Spezifikationen und Limits."
						icon={Zap}
					>
						<div className="space-y-6">
							<div className="p-4 bg-[#f7f8fa] rounded-2xl border border-[#eaedf0] flex flex-col gap-4">
								<label className="flex items-center gap-3 cursor-pointer group">
									<input
										type="checkbox"
										checked={(watch('dataVolume') || '')
											.toLowerCase()
											.includes('unlimited')}
										onChange={(e) => {
											setValue(
												'dataVolume',
												e.target.checked ? 'Unlimited' : '',
												{
													shouldValidate: true,
													shouldDirty: true,
												},
											);
										}}
										className="w-5 h-5 rounded border-[#eaedf0] text-[#e20074] focus:ring-[#e20074]"
									/>
									<span className="text-[0.85rem] font-bold text-[#1a1a2e]">
										Unbegrenztes Datenvolumen (Unlimited)
									</span>
								</label>

								<Input
									label="Datenvolumen (z.B. 20 GB)"
									placeholder="20 GB"
									error={errors.dataVolume?.message}
									disabled={(watch('dataVolume') || '')
										.toLowerCase()
										.includes('unlimited')}
									{...register('dataVolume')}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
								<Input
									label="Download-Speed (Mbit/s)"
									type="number"
									placeholder="0"
									error={errors.downloadSpeed?.message}
									{...register('downloadSpeed', {
										valueAsNumber: true,
									})}
								/>
								<Input
									label="Upload-Speed (Mbit/s)"
									type="number"
									placeholder="0"
									error={errors.uploadSpeed?.message}
									{...register('uploadSpeed', {
										valueAsNumber: true,
									})}
								/>
							</div>
						</div>
					</AdminFormSection>

					{category === 'DEVICE' && (
						<AdminFormSection
							title="Hardware"
							description="Hersteller und Hardware-Preise."
							icon={Smartphone}
						>
							<Input
								label="Hersteller"
								placeholder="z.B. Apple, AVM, Samsung"
								error={errors.deviceManufacturer?.message}
								{...register('deviceManufacturer')}
							/>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="relative">
									<Input
										label="Einmalzahlung (€)"
										type="number"
										step="0.01"
										placeholder="0.00"
										error={errors.purchasePrice?.message}
										{...register('purchasePrice', {
											valueAsNumber: true,
										})}
										className="pl-10"
									/>
									<div className="absolute left-4 top-[38px] text-[#bbb]">
										<Euro className="w-4 h-4" />
									</div>
								</div>
								<div className="relative">
									<Input
										label="Mietpreis pro Monat (€)"
										type="number"
										step="0.01"
										placeholder="0.00"
										error={errors.rentalPrice?.message}
										{...register('rentalPrice', {
											valueAsNumber: true,
										})}
										className="pl-10"
									/>
									<div className="absolute left-4 top-[38px] text-[#bbb]">
										<Euro className="w-4 h-4" />
									</div>
								</div>
							</div>
						</AdminFormSection>
					)}

					<AdminFormSection
						title="Geschäftsfälle & Gebühren"
						description="Optionen für Bereitstellung und Wechsel."
						icon={Settings}
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{[
								{
									id: 'allowNewActivation',
									label: 'Neubereitstellung',
									fee: 'activationFeeNew',
								},
								{
									id: 'allowMove',
									label: 'Umzug',
									fee: 'activationFeeMove',
								},
								{
									id: 'allowPlanChange',
									label: 'Tarifwechsel',
									fee: 'activationFeePlanChange',
								},
								{
									id: 'allowSpeedUp',
									label: 'Speed Up',
									fee: 'activationFeeSpeedUp',
								},
							].map((item) => (
								<div
									key={item.id}
									className="p-5 rounded-3xl bg-[#f7f8fa] border border-[#eaedf0] space-y-4"
								>
									<label className="flex items-center gap-3 cursor-pointer group">
										<input
											type="checkbox"
											{...register(item.id as any)}
											className="w-5 h-5 rounded border-[#eaedf0] text-[#e20074] focus:ring-[#e20074]"
										/>
										<span className="text-[0.85rem] font-extrabold text-[#1a1a2e] uppercase tracking-wider">
											{item.label} erlauben
										</span>
									</label>
									<div className="relative">
										<Input
											label={'Gebühr in €'}
											type="number"
											step="0.01"
											disabled={!watch(item.id as any)}
											{...register(item.fee as any, {
												valueAsNumber: true,
											})}
											className="pl-10"
										/>
										<div className="absolute left-4 top-[38px] text-[#bbb]">
											<Euro className="w-4 h-4" />
										</div>
									</div>
								</div>
							))}
						</div>
					</AdminFormSection>

					<AdminFormSection
						title="MagentaTV"
						description="Sichtbarkeit bei TV-Optionen."
						icon={Tv}
					>
						<div className="p-6 rounded-[2rem] bg-[#e20074]/5 border border-[#e20074]/10">
							<label className="flex items-center gap-4 cursor-pointer">
								<input
									type="checkbox"
									{...register('allowMagentaTV')}
									className="w-6 h-6 rounded border-[#e20074]/20 text-[#e20074] focus:ring-[#e20074]"
								/>
								<div className="flex flex-col">
									<span className="text-[1rem] font-bold text-[#e20074]">
										MagentaTV zubuchbar
									</span>
									<span className="text-[0.75rem] text-[#e20074]/70 font-medium italic">
										Wenn aktiviert, wird dieses Produkt im Konfigurator für
										TV-Optionen vorgeschlagen.
									</span>
								</div>
							</label>
						</div>
					</AdminFormSection>
					
					{(category === 'DSL' || category === 'FIBER') && (
						<AdminFormSection
							title="Hybrid-Option"
							description="Sichtbarkeit von Hybrid-Tarifvarianten."
							icon={Wifi}
						>
							<div className="p-6 rounded-[2rem] bg-[#e20074]/5 border border-[#e20074]/10">
								<label className="flex items-center gap-4 cursor-pointer">
									<input
										type="checkbox"
										{...register('allowHybrid')}
										className="w-6 h-6 rounded border-[#e20074]/20 text-[#e20074] focus:ring-[#e20074]"
									/>
									<div className="flex flex-col">
										<span className="text-[1rem] font-bold text-[#e20074]">
											Hybrid-Option zubuchbar
										</span>
										<span className="text-[0.75rem] text-[#e20074]/70 font-medium italic">
											Wenn aktiviert, wird für diesen Festnetztarif eine Hybrid-Alternative zur Auswahl angeboten.
										</span>
									</div>
								</label>
							</div>
						</AdminFormSection>
					)}

					{category === 'MOBILE' && (
						<AdminFormSection
							title="Mobilfunk-Optionen"
							description="Smartphone-Optionen, PlusKarten und Vorteile für Mobilfunktarife."
							icon={Smartphone}
						>
							<div className="space-y-4">
								<div className="p-6 rounded-[2rem] bg-[#e20074]/5 border border-[#e20074]/10">
									<label className="flex items-center gap-4 cursor-pointer">
										<input
											type="checkbox"
											{...register('allowHardwareTiers')}
											className="w-6 h-6 rounded border-[#e20074]/20 text-[#e20074] focus:ring-[#e20074]"
										/>
										<div className="flex flex-col">
											<span className="text-[1rem] font-bold text-[#e20074]">
												Smartphone-Optionen erlauben
											</span>
											<span className="text-[0.75rem] text-[#e20074]/70 font-medium italic">
												Wenn aktiviert, kann der Nutzer im Konfigurator eine
												Smartphone-Stufe auswählen (Smartphone, Top, Premium, Premium-Plus).
											</span>
										</div>
									</label>
								</div>

								<div className="p-6 rounded-[2rem] bg-[#e20074]/5 border border-[#e20074]/10">
									<label className="flex items-center gap-4 cursor-pointer">
										<input
											type="checkbox"
											{...register('allowPlusKarten')}
											className="w-6 h-6 rounded border-[#e20074]/20 text-[#e20074] focus:ring-[#e20074]"
										/>
										<div className="flex flex-col">
											<span className="text-[1rem] font-bold text-[#e20074]">
												PlusKarten zubuchbar
											</span>
											<span className="text-[0.75rem] text-[#e20074]/70 font-medium italic">
												Erlaubt das Hinzufügen von Zweitkarten (PlusKarten) zu diesem Mobilfunktarif im Konfigurator.
											</span>
										</div>
									</label>
								</div>

								<div className="p-6 rounded-[2rem] bg-[#e20074]/5 border border-[#e20074]/10">
									<label className="flex items-center gap-4 cursor-pointer">
										<input
											type="checkbox"
											{...register('allowsUnlimitedAdvantage')}
											className="w-6 h-6 rounded border-[#e20074]/20 text-[#e20074] focus:ring-[#e20074]"
										/>
										<div className="flex flex-col">
											<span className="text-[1rem] font-bold text-[#e20074]">
												Unlimited-Vorteil gewähren
											</span>
											<span className="text-[0.75rem] text-[#e20074]/70 font-medium italic">
												Wenn aktiviert, wird beim Zubuchen von PlusKarten das Datenvolumen dieses Tarifs und aller PlusKarten auf 'Unlimited' heraufgestuft (für berechtigte Tarife wie z.B. MagentaMobil L).
											</span>
										</div>
									</label>
								</div>
							</div>
						</AdminFormSection>
					)}

					<AdminFormSection
						title="Zielgruppen"
						description="Filter-Tags für Verkäufer."
						icon={Users}
					>
						<div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
							{[
								{
									id: 'student',
									label: 'Student & Young',
								},
								{
									id: 'family',
									label: 'Familie mit Kids',
								},
								{
									id: 'senior',
									label: 'Ältere Personen',
								},
								{
									id: 'power',
									label: 'Stream/Gaming',
								},
								{
									id: 'business',
									label: 'Home-Office',
								},
							].map((tg) => {
								const isSelected = targetGroupsArray.includes(tg.id);
								return (
									<label
										key={tg.id}
										className={clsx(
											'flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all',
											isSelected
												? 'border-[#e20074] bg-[#e20074]/5 shadow-sm'
												: 'border-[#eaedf0] bg-white hover:border-[#e20074]/30',
										)}
									>
										<input
											type="checkbox"
											checked={isSelected}
											onChange={(e) => {
												e.stopPropagation();
												toggleTargetGroup(tg.id);
											}}
											className="opacity-0 absolute w-0 h-0"
										/>
										<div
											className={clsx(
												'w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all',
												isSelected
													? 'bg-[#e20074] border-[#e20074]'
													: 'bg-white border-[#ddd]',
											)}
										>
											{isSelected && (
												<CheckCircle2 className="w-3.5 h-3.5 text-white" />
											)}
										</div>
										<span
											className={clsx(
												'text-[0.8rem] font-bold',
												isSelected ? 'text-[#e20074]' : 'text-[#555]',
											)}
										>
											{tg.label}
										</span>
									</label>
								);
							})}
						</div>
					</AdminFormSection>

					<AdminFormSection
						title="Features & Details"
						description="Zusatzinfos und Produktvorteile."
						icon={ListChecks}
						action={
							<span className="text-[0.7rem] font-bold bg-[#f7f8fa] px-3 py-1.5 rounded-xl border border-[#eaedf0]">
								{cFeatures.length} Features
							</span>
						}
					>
						<div className="space-y-4">
							<div className="flex gap-2">
								<div className="flex-1">
									<Input
										placeholder="z.B. 5G inklusive, EU-Roaming..."
										value={newFeature}
										onChange={(e) => setNewFeature(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												addFeature();
											}
										}}
									/>
								</div>
								<button
									type="button"
									onClick={addFeature}
									className="bg-[#1a1a2e] text-white px-4 h-[44px] rounded-xl font-bold flex items-center justify-center active:scale-95 transition-transform mt-[1.5px]"
								>
									<Plus className="w-5 h-5" />
								</button>
							</div>

							<div className="flex flex-wrap gap-2 pt-2">
								{cFeatures.map((feature: string, idx: number) => (
									<div
										key={idx}
										className="flex items-center gap-2 bg-white border border-[#eaedf0] pl-4 pr-2 py-2 rounded-xl text-[0.85rem] font-bold shadow-sm group hover:border-[#dc2626]/30 transition-all"
									>
										<span className="text-[#1a1a2e]">{feature}</span>
										<button
											type="button"
											onClick={() => removeFeature(idx)}
											className="text-[#ccc] hover:text-[#dc2626] p-1 rounded-lg transition-colors"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								))}
							</div>
						</div>
					</AdminFormSection>

					<AdminFormSection
						title="Sales Intelligence"
						description="Leitfaden und Argumentationshilfen."
						icon={MessageSquareQuote}
					>
						<div className="space-y-6">
							<Textarea
								label="Gesprächsleitfaden / Überleitung (Sales Script)"
								placeholder="Wie schlägt der Verkäufer dieses Produkt vor?"
								error={errors.salesScript?.message}
								{...register('salesScript')}
								rows={4}
							/>

							<Input
								label="MagentaInfos Link (Vertriebsinfos)"
								placeholder="https://magentainfos.telekom.de/..."
								error={errors.magentaInfosUrl?.message}
								{...register('magentaInfosUrl')}
							/>

							<div className="space-y-4 pt-4">
								<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
									Verkaufsargumente (USP)
								</label>
								<div className="flex gap-2">
									<div className="flex-1">
										<Input
											placeholder="z.B. Bestes Preis-Leistungs-Verhältnis..."
											value={newSalesArgument}
											onChange={(e) => setNewSalesArgument(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													addSalesArgument();
												}
											}}
										/>
									</div>
									<button
										type="button"
										onClick={addSalesArgument}
										className="bg-[#e20074] text-white px-4 h-[44px] rounded-xl font-bold flex items-center justify-center active:scale-95 transition-transform mt-[1.5px]"
									>
										<Plus className="w-5 h-5" />
									</button>
								</div>

								<div className="space-y-2 pt-2">
									{cSalesArguments.map((arg: string, idx: number) => (
										<div
											key={idx}
											className="flex items-center justify-between w-full bg-[#f7f8fa] border border-[#eaedf0] px-5 py-4 rounded-2xl text-[0.85rem] font-medium group hover:bg-white hover:border-[#e20074]/30 transition-all"
										>
											<span className="text-[#1a1a2e] leading-relaxed">
												{arg}
											</span>
											<button
												type="button"
												onClick={() => removeSalesArgument(idx)}
												className="text-[#ccc] hover:text-[#dc2626] p-1 rounded-lg transition-colors ml-4 shrink-0"
											>
												<X className="w-5 h-5" />
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
					</AdminFormSection>

					{/* Preishistorie Section */}
					<AdminFormSection
						title="Preishistorie"
						description="Alte Preise für diesen Tarif."
						icon={History}
					>
						<div className="space-y-4">
							{priceHistoryFields.map((field, index) => (
								<div
									key={field.id}
									className="p-5 rounded-2xl bg-[#f7f8fa] border border-[#eaedf0] relative group flex flex-col gap-4"
								>
									<button
										type="button"
										onClick={() => removePriceHistory(index)}
										className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-[#eaedf0] shadow-sm flex items-center justify-center text-[#999] hover:text-[#e20074] hover:border-[#e20074] transition-all opacity-0 group-hover:opacity-100 z-10"
									>
										<X className="w-4 h-4" />
									</button>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="relative">
											<Input
												label="Alter Preis (€ / Monat)"
												type="number"
												step="0.01"
												placeholder="0.00"
												error={errors.priceHistory?.[index]?.price?.message}
												{...register(`priceHistory.${index}.price`, {
													valueAsNumber: true,
												})}
												className="pl-10"
											/>
											<div className="absolute left-4 top-[38px] text-[#bbb]">
												<Euro className="w-4 h-4" />
											</div>
										</div>
										<Input
											label="Label (optional)"
											placeholder="z.B. Preis 2023"
											error={errors.priceHistory?.[index]?.label?.message}
											{...register(`priceHistory.${index}.label`)}
										/>
									</div>
								</div>
							))}
							<button
								type="button"
								onClick={() => appendPriceHistory({
									price: 0,
									label: '',
								})}
								className="w-full h-[52px] rounded-2xl border-2 border-dashed border-[#ddd] flex items-center justify-center gap-2 text-[#888] font-bold hover:border-[#e20074] hover:text-[#e20074] hover:bg-[#e20074]/5 transition-all outline-none"
							>
								<Plus className="w-5 h-5" />
								Alten Preis hinzufügen
							</button>
						</div>
					</AdminFormSection>
				</AdminFormContainer>
			</form>
		</div>
	);
}
