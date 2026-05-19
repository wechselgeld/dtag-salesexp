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

	AlertCircle,
	Shield,
	Key,
	Share2,
	UserX,
	ShieldAlert,
	LogOut,
	Smartphone,
} from 'lucide-react';

import clsx from 'clsx';
import {
	Input,
} from '@/components/shared/ui/input';
import {
	useState, useEffect,
} from 'react';
import {
 showErrorToast,
} from '@/components/shared/error-toast';
import {
	AdminPageHeader,
	AdminFormSection,
	AdminFormContainer,
} from '@/components/shared/ui/admin-ui';

const userSchema = z.object({
	email: z.string().email('Gültige E-Mail erforderlich'),
	password: z.string(),
	role: z.enum([
		'ADMIN',
		'OD_MANAGER',
		'LOCATION_MANAGER',
		'TEAM_LEADER',
	]),
	isEditor: z.boolean().default(false).optional(),
	isActive: z.boolean().default(true).optional(),
	odRegionId: z.string().optional().nullable(),
	locationId: z.string().optional().nullable(),
	teamId: z.string().optional().nullable(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
	mode: 'create' | 'edit';
	userId?: string;
	initialData?: {
		email: string;
		role: 'ADMIN' | 'OD_MANAGER' | 'LOCATION_MANAGER' | 'TEAM_LEADER';
		isEditor?: boolean;
		isActive?: boolean;
		odRegionId?: string | null;
		locationId?: string | null;
		teamId?: string | null;
	};
}

export function UserForm({
	mode, userId, initialData,
}: UserFormProps) {
	const router = useRouter();
	const utils = trpc.useUtils();
	const [
		errorMsg,
		setErrorMsg,
	] = useState('');

	const {
		data: currentUser,
	} = trpc.auth.me.useQuery();

	const {
		data: odRegionsData, isLoading: isLoadingOdRegions,
	} =
		trpc.odRegion.list.useQuery();
	const odRegions = odRegionsData?.items;

	const {
		data: locationsData, isLoading: isLoadingLocations,
	} =
		trpc.location.list.useQuery();
	const locations = locationsData?.items;

	const {
		data: teamsData, isLoading: isLoadingTeams,
	} =
		trpc.team.list.useQuery();
	const teams = teamsData?.items;

	const {
		register,
		watch,
		setValue,
		handleSubmit,
		formState: {
			errors,
		},
	} = useForm({
		resolver: zodResolver(userSchema),
		mode: 'onChange',
		defaultValues: {
			email: initialData?.email || '',
			password: '',
			role: initialData?.role || 'TEAM_LEADER',
			isEditor: initialData?.isEditor || false,
			isActive: initialData?.isActive ?? true,
			odRegionId: initialData?.odRegionId || '',
			locationId: initialData?.locationId || '',
			teamId: initialData?.teamId || '',
		},
	});

	const selectedRole = watch('role');

	useEffect(() => {
		if (mode === 'create' && currentUser) {
			if (currentUser.role === 'OD_MANAGER' && currentUser.odRegionId) {
				setValue('odRegionId', currentUser.odRegionId);
			}
			else if (
				currentUser.role === 'LOCATION_MANAGER' &&
				currentUser.locationId
			) {
				setValue('locationId', currentUser.locationId);
			}
			else if (currentUser.role === 'TEAM_LEADER' && currentUser.teamId) {
				setValue('teamId', currentUser.teamId);
			}
		}
	}, [
		currentUser,
		mode,
		setValue,
	]);


	const updateMutation = trpc.adminUsers.update.useMutation({
		onSuccess: () => {
			utils.adminUsers.list.invalidate();
			router.push('/admin/users');
			router.refresh();
		},
		onError: (err) => {
			setErrorMsg(err.message);
		},
	});

	const revokeSessions = trpc.adminUsers.revokeSessions.useMutation({
		onSuccess: () => showErrorToast('Erfolg', 'Alle Sitzungen wurden beendet.'),
		onError: (err) => setErrorMsg(err.message),
	});

	const removePassword = trpc.adminUsers.removePassword.useMutation({
		onSuccess: () => showErrorToast('Erfolg', 'Passwort wurde entfernt.'),
		onError: (err) => setErrorMsg(err.message),
	});

	const triggerPinReset = trpc.adminUsers.triggerPinReset.useMutation({
		onSuccess: () => showErrorToast('Erfolg', 'PIN Reset Email versendet.'),
		onError: (err) => setErrorMsg(err.message),
	});

	const onSubmit = (data: UserFormData) => {
		setErrorMsg('');

		// Infer parent hierarchy IDs based on selected role
		const finalData = {
 ...data,
};
		if (data.role === 'TEAM_LEADER' && data.teamId) {
			const team = teams?.find(t => t.id === data.teamId);
			if (team) {
				finalData.locationId = team.locationId;
				finalData.odRegionId = team.location?.odRegionId || null;
			}
		}
 else if (data.role === 'LOCATION_MANAGER' && data.locationId) {
			const loc = locations?.find(l => l.id === data.locationId);
			if (loc) {
				finalData.odRegionId = loc.odRegionId;
				finalData.teamId = null;
			}
		}
 else if (data.role === 'OD_MANAGER') {
			finalData.locationId = null;
			finalData.teamId = null;
		}
 else if (data.role === 'ADMIN') {
			finalData.odRegionId = null;
			finalData.locationId = null;
			finalData.teamId = null;
		}

		if (mode === 'edit' && userId) {
			if (data.password && data.password.length < 6) {
				setErrorMsg('Passwort muss mindestens 6 Zeichen lang sein');
				return;
			}
			updateMutation.mutate({
				id: userId,
				email: finalData.email,
				role: finalData.role,
				password: finalData.password || undefined,
				isEditor: finalData.isEditor,
				isActive: finalData.isActive,
				odRegionId: finalData.odRegionId || null,
				locationId: finalData.locationId || null,
				teamId: finalData.teamId || null,
			});
		}
	};

	const isPending = updateMutation.isPending;

	const SaveButton = (
		<button
			type="submit"
			form="user-form"
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
			Änderungen speichern
		</button>
	);

	return (
		<div className="space-y-8 pb-12">
			<AdminPageHeader
				title={mode === 'create' ? 'Neuer Benutzer' : 'Benutzer bearbeiten'}
				subtitle={
					mode === 'create'
						? 'Erstelle einen neuen Zugangscode für das Admin-Dashboard.'
						: `Verwalte die Berechtigungen für ${initialData?.email}`
				}
				backHref="/admin/users"
				action={SaveButton}
			/>

			{errorMsg && (
				<div className="bg-red-50 text-red-600 p-5 rounded-3xl flex items-center gap-4 text-[0.9rem] font-medium border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
					<div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
						<AlertCircle className="w-6 h-6" />
					</div>
					{errorMsg}
				</div>
			)}

			<form id="user-form" onSubmit={handleSubmit(onSubmit)}>
				<AdminFormContainer>
					<AdminFormSection
						title="Zugangsdaten"
						description="E-Mail und Passwort für den Login."
						icon={Key}
					>
						<Input
							label="E-Mail"
							type="email"
							placeholder="z.B. user@telekom.de"
							error={errors.email?.message as string}
							{...register('email')}
						/>
					</AdminFormSection>

					<AdminFormSection
						title="Benutzerstatus"
						description="Sperren oder entsperren Sie diesen Benutzer."
						icon={UserX}
					>
						<div className="flex items-start gap-4 p-5 bg-[#fdf2f8] border border-[#fce7f3] rounded-[1.5rem]">
							<div className="relative flex items-center">
								<input
									type="checkbox"
									id="isActive"
									{...register('isActive')}
									disabled={userId === currentUser?.sub}
									className="peer w-6 h-6 rounded-lg border-[#fbcfe8] text-[#e20074] focus:ring-[#e20074] cursor-pointer appearance-none bg-white transition-all checked:bg-[#e20074] checked:border-[#e20074] disabled:opacity-50 disabled:cursor-not-allowed"
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
							<div className="flex flex-col">
								<label
									htmlFor="isActive"
									className={clsx('text-[0.85rem] font-bold text-[#1a1a2e]', userId === currentUser?.sub ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}
								>
									Benutzerkonto ist aktiv
								</label>
								<p className="text-[0.75rem] text-[#be185d] m-0 leading-relaxed font-medium mt-0.5">
									Wenn deaktiviert, kann sich dieser Benutzer nicht mehr anmelden.
								</p>
							</div>
						</div>
					</AdminFormSection>

					<AdminFormSection
						title="Rollen & Berechtigungen"
						description="Definiere was dieser Benutzer darf."
						icon={Shield}
					>
						<div className="flex flex-col gap-1.5">
							<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
								Funktionsrolle
							</label>
							<div className="relative">
								<select
									{...register('role')}
									className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 transition-all text-[#1a1a2e] appearance-none cursor-pointer"
								>
									{(currentUser?.role === 'ADMIN' || !currentUser?.role) && (
										<option value="ADMIN">
											Zentraler Administrator (Full Access)
										</option>
									)}
									{(currentUser?.role === 'ADMIN') && (
										<option value="OD_MANAGER">
											OD-Leiter (Bereichszugriff)
										</option>
									)}
									{(currentUser?.role === 'ADMIN' ||
										currentUser?.role === 'OD_MANAGER') && (
										<option value="LOCATION_MANAGER">
											Standortleiter (Regional-Fokus)
										</option>
									)}
									{(currentUser?.role === 'ADMIN' ||
										currentUser?.role === 'OD_MANAGER' ||
										currentUser?.role === 'LOCATION_MANAGER') && (
									<option value="TEAM_LEADER">
										Teamleiter (Eingeschränkt)
									</option>
									)}
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

						<div className="flex items-start gap-4 p-5 bg-[#fdf2f8] border border-[#fce7f3] rounded-[1.5rem] mt-2">
							<div className="relative flex items-center">
								<input
									type="checkbox"
									id="isEditor"
									{...register('isEditor')}
									disabled={mode === 'edit' && userId === currentUser?.sub && currentUser?.role !== 'ADMIN'}
									className="peer w-6 h-6 rounded-lg border-[#fbcfe8] text-[#e20074] focus:ring-[#e20074] cursor-pointer appearance-none bg-white transition-all checked:bg-[#e20074] checked:border-[#e20074] disabled:opacity-50 disabled:cursor-not-allowed"
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
							<div className="flex flex-col">
								<label
									htmlFor="isEditor"
									className={clsx('text-[0.85rem] font-bold text-[#1a1a2e]', mode === 'edit' && userId === currentUser?.sub && currentUser?.role !== 'ADMIN' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}
								>
									Zusätzliche Editor-Rechte aktivieren
								</label>
								<p className="text-[0.75rem] text-[#be185d] m-0 leading-relaxed font-medium mt-0.5">
									Erlaubt das Bearbeiten von Produkten, Aktionen, Gutschriften
									und News – unabhängig von der Funktionsrolle.
									{mode === 'edit' && userId === currentUser?.sub && currentUser?.role !== 'ADMIN' && (
										<span className="block mt-1 font-bold">Du kannst deine eigenen Editor-Rechte nicht bearbeiten.</span>
									)}
								</p>
							</div>
						</div>
					</AdminFormSection>

					{(selectedRole === 'OD_MANAGER' ||
						selectedRole === 'LOCATION_MANAGER' ||
						selectedRole === 'TEAM_LEADER') && (
						<AdminFormSection
							title="Hierarchie-Zuordnung"
							description="Definiere den Zuständigkeitsbereich des Benutzers."
							icon={Share2}
						>
							<div className="space-y-5">
								{selectedRole === 'OD_MANAGER' && (
									<div className="flex flex-col gap-1.5">
										<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
											OD-Bereich
										</label>
										<div className="relative">
											<select
												{...register('odRegionId')}
												disabled={
													isLoadingOdRegions || currentUser?.role === 'OD_MANAGER'
												}
												className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 transition-all disabled:opacity-50 appearance-none cursor-pointer"
											>
												<option value="">(Kein OD-Bereich)</option>
												{odRegions
													?.filter(
														(r: any) =>
															currentUser?.role === 'ADMIN' ||
															r.id === currentUser?.odRegionId,
													)
													.map((r: any) => (
														<option key={r.id} value={r.id}>
															{r.name}
														</option>
													))}
											</select>
											<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#bbb]">
												<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
													<path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
												</svg>
											</div>
										</div>
									</div>
								)}

								{selectedRole === 'LOCATION_MANAGER' && (
									<div className="flex flex-col gap-1.5">
										<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
											Zugeordneter Standort
										</label>
										<div className="relative">
											<select
												{...register('locationId')}
												disabled={
													isLoadingLocations ||
													currentUser?.role === 'LOCATION_MANAGER'
												}
												className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 transition-all disabled:opacity-50 appearance-none cursor-pointer"
											>
												<option value="">(Kein Standort)</option>
												{locations
													?.filter(
														(l: any) =>
															(currentUser?.role === 'ADMIN' ||
																currentUser?.role === 'OD_MANAGER' ||
																l.id === currentUser?.locationId),
													)
													.map((loc: any) => (
														<option key={loc.id} value={loc.id}>
															{loc.name} {loc.odRegion?.name ? `— ${loc.odRegion.name}` : ''}
														</option>
													))}
											</select>
											<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#bbb]">
												<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
													<path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
												</svg>
											</div>
										</div>
									</div>
								)}

								{selectedRole === 'TEAM_LEADER' && (
									<div className="flex flex-col gap-1.5">
										<label className="text-[0.8rem] font-bold text-[#1a1a2e]">
											Zugeordnetes Vertriebsteam
										</label>
										<div className="relative">
											<select
												{...register('teamId')}
												disabled={
													isLoadingTeams || currentUser?.role === 'TEAM_LEADER'
												}
												className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.9rem] focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 transition-all disabled:opacity-50 appearance-none cursor-pointer"
											>
												<option value="">(Kein Team)</option>
												{teams
													?.filter(
														(t: any) =>
															(currentUser?.role !== 'TEAM_LEADER' ||
																t.id === currentUser?.teamId),
													)
													.map((team: any) => (
														<option key={team.id} value={team.id}>
															{team.name} — {team.location?.name}
														</option>
													))}
											</select>
											<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#bbb]">
												<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
													<path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
												</svg>
											</div>
										</div>
									</div>
								)}
							</div>
						</AdminFormSection>
					)}

					{mode === 'edit' && (
						<AdminFormSection
							title="Sicherheit & Sitzungen"
							description="Verwalte Passwörter, PINs und aktive Sitzungen."
							icon={ShieldAlert}
						>
							<div className="flex flex-col gap-4">
								<div className="flex items-center justify-between p-4 border border-[#eaedf0] rounded-xl bg-white">
									<div>
										<h4 className="text-[0.85rem] font-bold text-[#1a1a2e] m-0">Sitzungen beenden</h4>
										<p className="text-[0.75rem] text-[#666] m-0 mt-1">
											Meldet den Benutzer von allen Geräten ab.
										</p>
									</div>
									<button
										type="button"
										onClick={() => revokeSessions.mutate({
 id: userId as string,
})}
										disabled={revokeSessions.isPending}
										className="flex items-center gap-2 px-4 py-2 bg-[#fdf2f8] text-[#e20074] hover:bg-[#fce7f3] rounded-lg text-[0.8rem] font-bold transition-colors disabled:opacity-50"
									>
										<LogOut className="w-4 h-4" />
										Beenden
									</button>
								</div>

								<div className="flex items-center justify-between p-4 border border-[#eaedf0] rounded-xl bg-white">
									<div>
										<h4 className="text-[0.85rem] font-bold text-[#1a1a2e] m-0">Passwort entfernen</h4>
										<p className="text-[0.75rem] text-[#666] m-0 mt-1">
											Zwingt den Benutzer, ein neues Passwort beim nächsten Admin-Login zu setzen.
										</p>
									</div>
									<button
										type="button"
										onClick={() => removePassword.mutate({
 id: userId as string,
})}
										disabled={removePassword.isPending}
										className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[0.8rem] font-bold transition-colors disabled:opacity-50"
									>
										<ShieldAlert className="w-4 h-4" />
										Entfernen
									</button>
								</div>

								<div className="flex items-center justify-between p-4 border border-[#eaedf0] rounded-xl bg-white">
									<div>
										<h4 className="text-[0.85rem] font-bold text-[#1a1a2e] m-0">PIN zurücksetzen</h4>
										<p className="text-[0.75rem] text-[#666] m-0 mt-1">
											Sendet eine E-Mail an den Benutzer mit einem Code zur Vergabe einer neuen PIN.
										</p>
									</div>
									<button
										type="button"
										onClick={() => triggerPinReset.mutate({
 id: userId as string,
})}
										disabled={triggerPinReset.isPending}
										className="flex items-center gap-2 px-4 py-2 bg-[#f0f2f5] text-[#1a1a2e] hover:bg-[#e2e8f0] rounded-lg text-[0.8rem] font-bold transition-colors disabled:opacity-50"
									>
										<Smartphone className="w-4 h-4" />
										Reset anfordern
									</button>
								</div>
							</div>
						</AdminFormSection>
					)}
				</AdminFormContainer>
			</form>
		</div>
	);
}
