'use client';

import {
	useEffect,
} from 'react';
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
	Save, Loader2, Users, MapPin,
} from 'lucide-react';
import {
	showErrorToast,
} from '@/components/shared/error-toast';

import clsx from 'clsx';
import {
	Input,
} from '@/components/shared/ui/input';
import {
	AdminPageHeader,
	AdminFormContainer,
	AdminFormSection,
} from '@/components/shared/ui/admin-ui';

const teamSchema = z.object({
	name: z.string().min(1, 'Name ist erforderlich'),
	email: z
		.string()
		.email('Gültige E-Mail erforderlich')
		.optional()
		.or(z.literal('')),
	locationId: z.string().optional().nullable(),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface TeamFormProps {
	mode: 'create' | 'edit';
	teamId?: string;
	initialData?: {
		name: string;
		email?: string | null;
		locationId?: string | null;
	};
}

export function TeamForm({
	mode, teamId, initialData,
}: TeamFormProps) {
	const router = useRouter();
	const utils = trpc.useUtils();

	const {
		data: currentUser,
	} = trpc.auth.me.useQuery();

	const {
		data: locationsData, isLoading: isLoadingLocations,
	} =
		trpc.location.list.useQuery();
	const locations = locationsData?.items;

	const {
		register,
		handleSubmit,
		setValue,
		formState: {
			errors,
		},
	} = useForm({
		resolver: zodResolver(teamSchema),
		mode: 'onChange',
		defaultValues: {
			name: initialData?.name || '',
			email: initialData?.email || '',
			locationId: initialData?.locationId || '',
		},
	});

		useEffect(() => {
		if (mode === 'create' && currentUser && currentUser.role === 'LOCATION_MANAGER' && currentUser.locationId) {
			setValue('locationId', currentUser.locationId);
		}
	}, [
		currentUser,
		mode,
		setValue,
	]);

	const createMutation = trpc.team.create.useMutation({
		onSuccess: () => {
			utils.team.list.invalidate();
			router.push('/admin/teams');
			router.refresh();
		},
		onError: (error) => {
			const traceId = error?.data?.traceId || (error as any)?.shape?.data?.traceId;
			showErrorToast('Fehler beim Erstellen', error.message, traceId);
		},
	});

	const updateMutation = trpc.team.update.useMutation({
		onSuccess: () => {
			utils.team.list.invalidate();
			utils.team.getById.invalidate({
				id: teamId!,
			});
			router.push('/admin/teams');
			router.refresh();
		},
		onError: (error) => {
			const traceId = error?.data?.traceId || (error as any)?.shape?.data?.traceId;
			showErrorToast('Fehler beim Speichern', error.message, traceId);
		},
	});

	const onSubmit = (data: TeamFormData) => {
		const formattedData = {
			name: data.name,
			email: data.email || undefined,
			locationId: data.locationId || undefined,
		};
		if (mode === 'create') {
			createMutation.mutate(formattedData);
		}
		else if (mode === 'edit' && teamId) {
			updateMutation.mutate({
				id: teamId,
				...formattedData,
			});
		}
	};

	const isPending = createMutation.isPending || updateMutation.isPending;

	const SaveButton = (
		<button
			type="submit"
			form="team-form"
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
			Team speichern
		</button>
	);

	return (
		<div className="space-y-8 pb-12">
			<AdminPageHeader
				title={mode === 'create' ? 'Neues Team' : 'Team bearbeiten'}
				subtitle={
					mode === 'create'
						? 'Erstelle ein neues Vertriebsteam und ordne es einem Standort zu.'
						: `Verwalte die Einstellungen für das Team ${initialData?.name}`
				}
				backHref="/admin/teams"
				action={SaveButton}
			/>

			<form id="team-form" onSubmit={handleSubmit(onSubmit)}>
				<AdminFormContainer>
					<AdminFormSection
						title="Stammdaten"
						description="Name und Kontakt-E-Mail des Teams."
						icon={Users}
					>
						<Input
							label="Team-Name"
							placeholder="z.B. Team Berlin Süd"
							error={errors.name?.message as string}
							{...register('name')}
						/>

						<Input
							label="Kontakt-E-Mail (Optional)"
							type="email"
							placeholder="z.B. team06@telekom.de"
							error={errors.email?.message as string}
							{...register('email')}
						/>
					</AdminFormSection>

					<AdminFormSection
						title="Zugehörigkeit"
						description="Ordne das Team einem Standort zu."
						icon={MapPin}
					>
						<div className="flex flex-col gap-1.5">
							<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
								Standort
							</label>
							<div className="relative">
								<select
									{...register('locationId')}
									disabled={isLoadingLocations || currentUser?.role === 'LOCATION_MANAGER'}
									className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 transition-all disabled:opacity-50 appearance-none cursor-pointer"
								>
									<option value="">(Kein Standort zugewiesen)</option>
									{locations?.map((loc: any) => (
										<option key={loc.id} value={loc.id}>
											{loc.name} {loc.address ? `(${loc.address})` : ''}{' '}
											{loc.isActive ? '' : '(Inaktiv)'}
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

						<p className="text-[0.75rem] text-[#888] m-0 bg-[#f7f8fa] p-4 rounded-xl border border-[#eaedf0] border-dashed">
							Hinweis: Nach der Erstellung kannst du dem Team spezifische
							Fokus-Produkte und Fokus-Optionen in der Übersicht zuweisen.
						</p>
					</AdminFormSection>
				</AdminFormContainer>
			</form>
		</div>
	);
}
