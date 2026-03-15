'use client';

import {
	useForm,
} from 'react-hook-form';
import {
	zodResolver,
} from '@hookform/resolvers/zod';
import {
	z,
} from 'zod';
import {
	useRouter,
} from 'next/navigation';
import {
	trpc,
} from '@/lib/trpc';
import clsx from 'clsx';
import {
	Save,
	Loader2,
	ArrowLeft,
	Euro,
	ToggleLeft,
	FileText,
} from 'lucide-react';
import Link from 'next/link';
import {
	Input,
} from '@/components/shared/ui/input';
import {
	AdminPageHeader,
	AdminFormContainer,
	AdminFormSection,
} from '@/components/shared/ui/admin-ui';

const creditSchema = z.object({
	name: z.string().min(1, 'Name ist erforderlich'),
	value: z.number().min(0, 'Wert muss positiv sein'),
	isActive: z.boolean().default(true),
});

type CreditFormData = z.infer<typeof creditSchema>;

interface CreditFormProps {
	initialData?: { name: string; value: number; isActive: boolean; id: string };
	isEditMode?: boolean;
}

export function CreditForm({
	initialData,
	isEditMode = false,
}: CreditFormProps) {
	const router = useRouter();
	const utils = trpc.useUtils();

	const {
		register,
		handleSubmit,
		formState: {
			errors,
		},
	} = useForm({
		resolver: zodResolver(creditSchema),
		mode: 'onChange',
		defaultValues: {
			name: initialData ? initialData.name : '',
			value: initialData ? initialData.value : 0,
			isActive: initialData ? initialData.isActive : true,
		},
	});

	const createMutation = trpc.admin.oneTimeCredit.create.useMutation({
		onSuccess: () => {
			utils.admin.oneTimeCredit.list.invalidate();
			utils.admin.oneTimeCredit.getById.invalidate();
			router.push('/admin/credits');
			router.refresh();
		},
	});

	const updateMutation = trpc.admin.oneTimeCredit.update.useMutation({
		onSuccess: () => {
			utils.admin.oneTimeCredit.list.invalidate();
			utils.admin.oneTimeCredit.getById.invalidate();
			router.push('/admin/credits');
			router.refresh();
		},
	});

	const onSubmit = (data: CreditFormData) => {
		if (isEditMode && initialData) {
			updateMutation.mutate({
				...data,
				id: initialData.id,
			});
		}
		else {
			createMutation.mutate(data);
		}
	};

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	const SaveButton = (
		<button
			type="submit"
			form="credit-form"
			disabled={isSubmitting}
			className={clsx(
				'px-6 py-2.5 rounded-2xl font-bold text-white flex items-center gap-2.5 transition-all duration-300 text-[0.85rem] cursor-pointer active:scale-95 shadow-[0_4px_14px_rgba(226,0,116,0.3)] hover:shadow-[0_8px_24px_rgba(226,0,116,0.4)] hover:-translate-y-0.5',
				isSubmitting
					? 'bg-[#ddd] shadow-none cursor-not-allowed text-[#999] opacity-50'
					: 'bg-[#e20074] hover:bg-[#c70066]',
			)}
		>
			{isSubmitting ? (
				<Loader2 className="w-4 h-4 animate-spin" />
			) : (
				<Save className="w-5 h-5" />
			)}
			Gutschrift speichern
		</button>
	);

	return (
		<div className="space-y-8 pb-12">
			<AdminPageHeader
				title={isEditMode ? 'Gutschrift bearbeiten' : 'Neue Gutschrift'}
				subtitle={
					isEditMode
						? `Verwalte die Details für ${initialData?.name}`
						: 'Erstelle eine neue Einmal-Gutschrift für Produkte.'
				}
				backHref="/admin/credits"
				action={SaveButton}
			/>

			<form id="credit-form" onSubmit={handleSubmit(onSubmit)}>
				<AdminFormContainer>
					<AdminFormSection
						title="Details"
						description="Name und Wert der Gutschrift."
						icon={FileText}
					>
						<Input
							label="Bezeichnung"
							placeholder="z.B. Anschlusspreisbefreiung"
							error={errors.name?.message as string}
							{...register('name')}
						/>

						<div className="flex flex-col gap-1.5">
							<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
								Wert in Euro (€)
							</label>
							<div className="relative">
								<Input
									type="number"
									step="0.01"
									placeholder="0.00"
									error={errors.value?.message as string}
									{...register('value', {
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

					<AdminFormSection
						title="Status"
						description="Sichtbarkeit für Verkäufer."
						icon={ToggleLeft}
					>
						<div className="flex items-center gap-4 p-5 bg-[#f7f8fa] border border-[#eaedf0] rounded-[1.5rem]">
							<div className="relative flex items-center">
								<input
									type="checkbox"
									id="isActive"
									{...register('isActive')}
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
									Gutschrift ist aktiv
								</label>
								<p className="text-[0.75rem] text-[#888] m-0 mt-0.5">
									Inaktive Gutschriften werden den Verkäufern nicht zur Auswahl
									angeboten.
								</p>
							</div>
						</div>
					</AdminFormSection>
				</AdminFormContainer>
			</form>
		</div>
	);
}
