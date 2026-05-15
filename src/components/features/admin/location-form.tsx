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
	Save,
	Loader2,
	ArrowLeft,
	MapPin,
	Globe,
	ToggleLeft,
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

const locationSchema = z.object({
	name: z.string().min(1, 'Name ist erforderlich'),
	address: z.string().min(1, 'Adresse ist erforderlich'),
	isActive: z.boolean().default(true),
	odRegionId: z
		.string()
		.min(1, 'Zuordnung zu einem OD-Bereich ist erforderlich'),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
	mode: 'create' | 'edit';
	id?: string;
	initialData?: {
		name: string;
		address?: string | null;
		isActive: boolean;
		odRegionId?: string | null;
	};
}

export function LocationForm({
	mode, id, initialData,
}: LocationFormProps) {
	const router = useRouter();
	const utils = trpc.useUtils();

	const {
		data: currentUser,
	} = trpc.auth.me.useQuery();

	const {
		data: odRegionsData, isLoading: isLoadingOdRegions,
	} =
		trpc.odRegion.list.useQuery();
	const odRegions = odRegionsData?.items;

	const {
		register,
		handleSubmit,
		setValue,
		formState: {
			errors,
		},
	} = useForm({
		resolver: zodResolver(locationSchema),
		mode: 'onChange',
		defaultValues: {
			name: initialData?.name || '',
			address: initialData?.address || '',
			isActive: initialData?.isActive ?? true,
			odRegionId: initialData?.odRegionId || '',
		},
	});

	// Lock the OD Region if the user is an OD Manager
	import('react').then(({ useEffect }) => {
		useEffect(() => {
			if (mode === 'create' && currentUser && currentUser.role === 'OD_MANAGER' && currentUser.odRegionId) {
				setValue('odRegionId', currentUser.odRegionId);
			}
		}, [currentUser, mode, setValue]);
	});

	const createMutation = trpc.location.create.useMutation({
		onSuccess: () => {
			utils.location.list.invalidate();
			router.push('/admin/locations');
			router.refresh();
		},
	});

	const updateMutation = trpc.location.update.useMutation({
		onSuccess: () => {
			utils.location.list.invalidate();
			router.push('/admin/locations');
			router.refresh();
		},
	});

	const onSubmit = (data: LocationFormData) => {
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
			form="location-form"
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
			Standort speichern
		</button>
	);

	return (
		<div className="space-y-8 pb-12">
			<AdminPageHeader
				title={mode === 'create' ? 'Neuer Standort' : 'Standort bearbeiten'}
				subtitle={
					mode === 'create'
						? 'Füge einen neuen physischen Standort zum System hinzu.'
						: `Verwalte die Einstellungen für ${initialData?.name}`
				}
				backHref="/admin/locations"
				action={SaveButton}
			/>

			<form id="location-form" onSubmit={handleSubmit(onSubmit)}>
				<AdminFormContainer>
					<AdminFormSection
						title="Stammdaten"
						description="Name und grundlegende Info."
						icon={MapPin}
					>
						<Input
							label="Name des Standorts"
							placeholder="z.B. Berlin"
							error={errors.name?.message as string}
							{...register('name')}
						/>
						<div className="mt-4">
							<Input
								label="Adresse"
								placeholder="z.B. Musterstraße 1, 12345 Berlin"
								error={errors.address?.message as string}
								{...register('address')}
							/>
						</div>
					</AdminFormSection>

					<AdminFormSection
						title="Zuordnung"
						description="Wähle den übergeordneten OD-Bereich."
						icon={Globe}
					>
						<div className="flex flex-col gap-1.5 pt-2">
							<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
								OD-Bereich
							</label>
							<div className="relative">
								<select
									{...register('odRegionId')}
									disabled={isLoadingOdRegions || currentUser?.role === 'OD_MANAGER'}
									className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 transition-all disabled:opacity-50 appearance-none cursor-pointer"
								>
									<option value="">(Wähle einen Bereich)</option>
									{odRegions?.filter((r: any) => currentUser?.role === 'ADMIN' || r.id === currentUser?.odRegionId).map((r: any) => (
										<option key={r.id} value={r.id}>
											{r.name}
										</option>
									))}
								</select>
								<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#bbb]">
									<svg
										width="12"
										height="8"
										viewBox="0 0 12 8"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M1.5 1.75L6 6.25L10.5 1.75"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</div>
							</div>
						</div>
					</AdminFormSection>

					<AdminFormSection
						title="Status"
						description="Sichtbarkeit im System."
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
									Standort ist aktiv
								</label>
								<p className="text-[0.75rem] text-[#888] m-0 mt-0.5">
									Inaktive Standorte werden im Setup-Wizard ausgeblendet.
								</p>
							</div>
						</div>
					</AdminFormSection>
				</AdminFormContainer>
			</form>
		</div>
	);
}
