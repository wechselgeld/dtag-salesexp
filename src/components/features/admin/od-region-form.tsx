'use client';

import {
	useForm,
} from 'react-hook-form';
import {
	zodResolver,
} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
	useRouter,
} from 'next/navigation';
import {
	trpc,
} from '@/lib/trpc';
import {
	Save, Loader2, ArrowLeft, Globe, ToggleLeft,
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import {
	Input,
} from '@/components/shared/ui/input';
import {
	AdminPageHeader,
	AdminFormContainer,
	AdminFormSection,
} from '@/components/shared/ui/admin-ui';

const odRegionSchema = z.object({
	name: z.string().min(1, 'Name ist erforderlich'),
	isActive: z.boolean().default(true),
});

type OdRegionFormData = z.infer<typeof odRegionSchema>;

interface OdRegionFormProps {
	mode: 'create' | 'edit';
	id?: string;
	initialData?: {
		name: string;
		isActive: boolean;
	};
}

export function OdRegionForm({
	mode, id, initialData,
}: OdRegionFormProps) {
	const router = useRouter();
	const utils = trpc.useUtils();

	const {
		register,
		handleSubmit,
		formState: {
			errors,
		},
	} = useForm({
		resolver: zodResolver(odRegionSchema),
		mode: 'onChange',
		defaultValues: {
			name: initialData?.name || '',
			isActive: initialData?.isActive ?? true,
		},
	});

	const createMutation = trpc.odRegion.create.useMutation({
		onSuccess: () => {
			utils.odRegion.list.invalidate();
			router.push('/admin/od-regions');
			router.refresh();
		},
	});

	const updateMutation = trpc.odRegion.update.useMutation({
		onSuccess: () => {
			utils.odRegion.list.invalidate();
			router.push('/admin/od-regions');
			router.refresh();
		},
	});

	const onSubmit = (data: OdRegionFormData) => {
		if (mode === 'create') {
			createMutation.mutate(data);
		}
		else if (mode === 'edit' && id) {
			updateMutation.mutate({
				id,
				...data,
			});
		}
	};

	const isPending = createMutation.isPending || updateMutation.isPending;

	const SaveButton = (
		<button
			type="submit"
			form="od-region-form"
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
			Bereich speichern
		</button>
	);

	return (
		<div className="space-y-8 pb-12">
			<AdminPageHeader
				title={mode === 'create' ? 'Neuer OD-Bereich' : 'OD-Bereich bearbeiten'}
				subtitle={
					mode === 'create'
						? 'Erstelle einen neuen Verbund von Standorten.'
						: `Verwalte die Einstellungen für ${initialData?.name}`
				}
				backHref="/admin/od-regions"
				action={SaveButton}
			/>

			<form id="od-region-form" onSubmit={handleSubmit(onSubmit)}>
				<AdminFormContainer>
					<AdminFormSection
						title="Stammdaten"
						description="Name und Status des Verbunds."
						icon={Globe}
					>
						<Input
							label="Name des OD-Bereichs"
							placeholder="z.B. OD Süd"
							error={errors.name?.message as string}
							{...register('name')}
						/>

						<div className="flex items-center gap-4 p-5 bg-[#f7f8fa] border border-[#eaedf0] rounded-[1.5rem] mt-2">
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
									OD-Bereich ist aktiv
								</label>
								<p className="text-[0.75rem] text-[#888] m-0 mt-0.5">
									Inaktive Bereiche werden im Setup-Wizard ausgeblendet.
								</p>
							</div>
						</div>
					</AdminFormSection>
				</AdminFormContainer>
			</form>
		</div>
	);
}
