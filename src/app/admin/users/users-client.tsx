'use client';

import {
	useState, useMemo,
} from 'react';
import {
	trpc,
} from '@/lib/trpc';
import {
	Shield,
	Trash2,
	Plus,
	Loader2,
	Pencil,
	MapPin,
	Search,
	X,
	Users,
	CheckCircle,
	AlertTriangle,
	Globe,
	User,
	UserCheck,
} from 'lucide-react';
import clsx from 'clsx';
import { showErrorToast } from '@/components/shared/error-toast';
import { AdminSearch } from '@/components/shared/admin-search';
import {
	Skeleton,
} from '@/components/shared/skeleton';
import {
	ScrollableFilterRow,
} from '@/components/shared/scrollable-filter-row';
import {
	confirmDelete,
} from '@/components/shared/delete-confirm-toast';
import Link from 'next/link';
import {
	AdminPageHeader,
} from '@/components/shared/ui/admin-ui';
import {
	Tooltip,
} from '@/components/shared/ui/tooltip';

interface UserResponse {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	role: string;
	createdAt: string | Date;
	isEditor: boolean;
	isActive: boolean;
	isVerified: boolean;
	team?: {
		name: string;
		location: { name: string; address: string | null } | null;
	} | null;
	location?: { name: string; address: string | null } | null;
	odRegion?: { name: string } | null;
}

export default function UsersClient() {
	const utils = trpc.useUtils();
	const {
		data: currentUser,
	} = trpc.auth.me.useQuery();
	const [
		searchQuery,
		setSearchQuery,
	] = useState('');
	const [
		activeFilterId,
		setActiveFilterId,
	] = useState<string>('ALL');
	const [
		searchedUsers,
		setSearchedUsers,
	] = useState<UserResponse[]>([]);

	const {
		data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage,
	} =
		trpc.adminUsers.list.useInfiniteQuery(
			{
				limit: 250, // Fetch everything for instant client-side full fuzzy search
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	const isAdmin = currentUser?.role === 'ADMIN';
	const isManager =
		currentUser?.role === 'OD_MANAGER' ||
		currentUser?.role === 'LOCATION_MANAGER';

	const canCreateUser = isAdmin || isManager;
	const canDeleteUser = isAdmin || isManager;

	const deleteUser = trpc.adminUsers.delete.useMutation({
		onSuccess: () => utils.adminUsers.list.invalidate(),
		onError: (error) => showErrorToast('Fehler beim Löschen', error.message),
	});

	const users = data?.pages.flatMap((page) => page.items) || [
	];

	const filteredUsers = useMemo(() => {
		if (activeFilterId === 'ALL') { return searchedUsers; }
		return searchedUsers.filter((user) => {
			if (activeFilterId === 'ADMIN') { return user.role === 'ADMIN'; }
			if (activeFilterId === 'OD_MANAGER') { return user.role === 'OD_MANAGER'; }
			if (activeFilterId === 'LOCATION_MANAGER') { return user.role === 'LOCATION_MANAGER'; }
			if (activeFilterId === 'TEAM_LEADER') { return user.role === 'TEAM_LEADER'; }
			if (activeFilterId === 'USER') { return user.role === 'USER'; }
			if (activeFilterId === 'EDITOR') { return user.isEditor; }
			if (activeFilterId === 'ACTIVE') { return user.isActive; }
			if (activeFilterId === 'INACTIVE') { return !user.isActive; }
			return true;
		});
	}, [
		searchedUsers,
		activeFilterId,
	]);

	return (
		<div className="space-y-6 pb-20">
			<div className="flex justify-between items-center">
				<AdminPageHeader
					title="Benutzer"
					subtitle="Verwalte die Zugänge zum Dashboard."
					backHref="/admin"
				/>
			</div>

			<div className="bg-[#f7f8fa] border border-[#eaedf0] p-4 rounded-2xl flex items-center justify-between shadow-sm">
				<p className="text-[0.85rem] text-[#666] m-0">
					<strong>Hinweis:</strong> Neue Benutzer können hier nicht mehr manuell erstellt werden. Mitarbeiter müssen sich auf der Startseite selbst registrieren und können anschließend hier verwaltet und befördert werden.
				</p>
			</div>

			<div className="flex flex-col gap-4">
				<AdminSearch
					items={users}
					onResultsChange={setSearchedUsers}
					getSearchableText={(user) => [
						user.firstName || '',
						user.lastName || '',
						user.email,
						user.role,
						user.isEditor ? 'Editor' : '',
						user.team?.name || '',
						user.location?.name || '',
						user.odRegion?.name || '',
					]}
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Benutzer suchen nach Name, E-Mail, Rolle, Team oder Standort..."
				/>

				{/* Filter Bubbles */}
				<ScrollableFilterRow>
					{[
						{ id: 'ALL', label: 'Alle', icon: Users, color: '#1a1a2e' },
						{ id: 'ADMIN', label: 'Admins', icon: Shield, color: '#e20074' },
						{ id: 'OD_MANAGER', label: 'OD-Leiter', icon: Globe, color: '#7b61ff' },
						{ id: 'LOCATION_MANAGER', label: 'Standortleiter', icon: MapPin, color: '#ff6b00' },
						{ id: 'TEAM_LEADER', label: 'Teamleiter', icon: UserCheck, color: '#e67e22' },
						{ id: 'USER', label: 'Verkäufer', icon: User, color: '#64748b' },
						{ id: 'EDITOR', label: 'Editoren', icon: Pencil, color: '#0090d0' },
						{ id: 'ACTIVE', label: 'Aktiv', icon: CheckCircle, color: '#00a878' },
						{ id: 'INACTIVE', label: 'Gesperrt', icon: AlertTriangle, color: '#dc2626' },
					].map((filter) => {
						const isSelected = activeFilterId === filter.id;
						const Icon = filter.icon;
						return (
							<button
								key={filter.id}
								onClick={() => setActiveFilterId(filter.id)}
								className={clsx(
									'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all duration-200 cursor-pointer outline-none font-semibold text-[0.8rem] active:scale-95',
									isSelected
										? 'text-white shadow-md'
										: 'bg-linear-to-br from-white to-[#fcfafc] border-[#eaedf0] text-[#666] hover:bg-[#f7f8fa] hover:border-[#ddd]',
								)}
								style={{
									backgroundColor: isSelected ? filter.color : undefined,
									borderColor: isSelected ? filter.color : undefined,
								}}
							>
								<Icon className={clsx('w-4 h-4', isSelected ? 'opacity-100' : 'opacity-60')} />
								<span>{filter.label}</span>
							</button>
						);
					})}
				</ScrollableFilterRow>
			</div>

			<div className="bg-white rounded-3xl border border-[#eaedf0] overflow-hidden shadow-sm">
				{isLoading && users.length === 0 ? (
					<div className="flex flex-col gap-3 p-5">
						{[
							1,
							2,
							3,
							4,
							5,
						].map((i) => (
							<Skeleton key={i} className="h-14 w-full rounded-xl" />
						))}
					</div>
				) : filteredUsers.length === 0 ? (
					<div className="p-20 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Shield className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1.1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Benutzer
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0 mb-4">
							Es wurden keine Benutzer {searchQuery || activeFilterId !== 'ALL' ? 'für deine Suche/Filter' : ''} gefunden.
						</p>
						<div className="flex gap-3 mt-2">
							{(searchQuery || activeFilterId !== 'ALL') && (
								<button
									onClick={() => { setSearchQuery(''); setActiveFilterId('ALL'); }}
									className="text-[#1a1a2e] text-[0.85rem] font-semibold bg-white border border-[#eaedf0] px-4 py-2 rounded-xl hover:bg-[#f7f8fa] transition-colors cursor-pointer"
								>
									Filter zurücksetzen
								</button>
							)}
						</div>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead>
								<tr className="border-b border-[#eaedf0] bg-[#fcfcfd]">
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Benutzer
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Rolle
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Geltungsbereich
									</th>
									{(isAdmin || isManager) && (
										<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right">
											Aktionen
										</th>
									)}
								</tr>
							</thead>
							<tbody className="divide-y divide-[#f0f0f0]">
								{filteredUsers.map(
									(user: UserResponse) => (
										<tr
											key={user.id}
											className="group hover:bg-[#fcfcfd] transition-colors"
										>
											<td className="py-4 px-6">
												<div className="flex flex-col">
													<span className="text-[0.95rem] font-bold text-[#1a1a2e]">
														{user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unbekannt'}
													</span>
													<span className="text-[0.8rem] text-[#666]">{user.email}</span>
												</div>
											</td>
											<td className="py-4 px-6">
												<div className="flex flex-col gap-1">
													<span className={clsx(
														'text-[0.65rem] font-bold px-2 py-0.5 rounded-md inline-block w-fit uppercase',
														user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
													)}>
														{user.isActive ? 'Aktiv' : 'Gesperrt'}
													</span>
													<span className={clsx(
														'text-[0.65rem] font-bold px-2 py-0.5 rounded-md inline-block w-fit uppercase',
														user.isVerified ? 'bg-[#0090d0]/10 text-[#0090d0]' : 'bg-orange-100 text-orange-700'
													)}>
														{user.isVerified ? 'Verifiziert' : 'Unverifiziert'}
													</span>
												</div>
											</td>
											<td className="py-4 px-6">
												<div className="flex flex-wrap gap-2">
													<span
														className={clsx(
															'px-2.5 py-1 rounded-lg text-[0.65rem] font-bold tracking-wider uppercase',
															user.role === 'ADMIN'
																? 'bg-[#e20074]/10 text-[#e20074] border border-[#e20074]/20'
																: 'bg-[#1a1a2e] text-white',
														)}
													>
														{user.role}
													</span>
													{user.isEditor && (
														<span className="px-2.5 py-1 rounded-lg text-[0.65rem] font-bold tracking-wider uppercase bg-[#0090d0]/10 text-[#0090d0] border border-[#0090d0]/20">
															Editor
														</span>
													)}
												</div>
											</td>
											<td className="py-4 px-6 text-[0.85rem] text-[#666]">
												{user.team?.name ? (
													<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f0f2f5] border border-[#eaedf0] text-[#1a1a2e] font-medium">
														Team: {user.team.name}
														{user.team.location && (
															<span className="text-[0.65rem] text-[#888] ml-1">
																(
																{user.team.location.address ? (
																	<Tooltip content={user.team.location.address}>
																		<span className="border-b border-dashed border-[#eaedf0] cursor-help">
																			{user.team.location.name}
																		</span>
																	</Tooltip>
																) : (
																	user.team.location.name
																)}
																)
															</span>
														)}
													</span>
												) : user.location?.name ? (
													<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f0f2f5] border border-[#eaedf0] text-[#1a1a2e] font-medium">
														<MapPin className="w-3.5 h-3.5 text-[#888]" />
														{user.location.address ? (
															<Tooltip content={user.location.address}>
																<span className="border-b border-dashed border-[#eaedf0] cursor-help">
																	{user.location.name}
																</span>
															</Tooltip>
														) : (
															user.location.name
														)}
													</span>
												) : user.odRegion?.name ? (
													<span className="text-[#bbb] italic font-medium">
														Alle Standorte in {user.odRegion.name}
													</span>
												) : (
													<span className="text-[#bbb] italic">
														Alle Standorte
													</span>
												)}
											</td>
											{(isAdmin || isManager) && (
												<td className="py-4 px-6 text-right w-[150px]">
													<div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
														<Link
															href={`/admin/users/${user.id}`}
															className="p-2 text-[#ccc] hover:text-[#0090d0] hover:bg-[#0090d0]/10 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
															title="Benutzer bearbeiten"
														>
															<Pencil className="w-4 h-4" />
														</Link>
														{currentUser?.sub !== user.id && canDeleteUser && (
															<button
																onClick={() => {
																	confirmDelete({
																		id: user.id,
																		name: user.email,
																		onConfirm: (sudoPassword) =>
																			deleteUser.mutateAsync({
																				id: user.id,
																				sudoPassword,
																			}),
																	});
																}}
																disabled={deleteUser.isPending}
																className="p-2 text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2] rounded-lg transition-all cursor-pointer bg-transparent border-none disabled:opacity-50"
																title="Benutzer löschen"
															>
																{deleteUser.isPending ? (
																	<Loader2 className="w-4 h-4 animate-spin" />
																) : (
																	<Trash2 className="w-4 h-4" />
																)}
															</button>
														)}
													</div>
												</td>
											)}
										</tr>
									),
								)}
							</tbody>
						</table>
					</div>
				)}

				{hasNextPage && (
					<div className="p-8 border-t border-[#f0f0f0] flex justify-center bg-[#fcfcfd]">
						<button
							onClick={() => fetchNextPage()}
							disabled={isFetchingNextPage}
							className="flex items-center gap-2 bg-white hover:bg-[#f7f8fa] text-[#1a1a2e] px-8 py-3 rounded-2xl font-bold transition-all border border-[#eaedf0] shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-[0.85rem]"
						>
							{isFetchingNextPage ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : (
								<Plus className="w-5 h-5" />
							)}
							{isFetchingNextPage ? 'Wird geladen...' : 'Mehr laden'}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
