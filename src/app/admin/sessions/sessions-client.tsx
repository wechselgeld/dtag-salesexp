'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
	Activity,
	Loader2,
	MapPin,
	Users,
	Globe,
	Mail,
	Search,
	X,
	Plus,
	CheckCircle2,
	Clock,
	AlertTriangle,
	Laptop,
} from 'lucide-react';
import { Skeleton } from '@/components/shared/skeleton';
import { AdminPageHeader } from '@/components/shared/ui/admin-ui';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Tooltip } from '@/components/shared/ui/tooltip';
import { useDebounce } from '@/hooks/use-debounce';
import clsx from 'clsx';

function isTestAccount(firstName: string | null, lastName: string | null, email: string | null): boolean {
	const combined = `${firstName || ''} ${lastName || ''} ${email || ''}`.toLowerCase();
	if (combined.includes('test') || combined.includes('dev') || combined.includes('demo')) {
		return true;
	}
	// Check if name contains numbers (often used in test accounts like "Test1", "Agent007")
	const nameCombined = `${firstName || ''} ${lastName || ''}`;
	if (/\d/.test(nameCombined)) {
		return true;
	}
	return false;
}

export default function SessionsClient() {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
	const debouncedSearch = useDebounce(searchQuery, 300);

	const { data: me } = trpc.auth.me.useQuery();
	const isRestrictedUser = me?.role === 'LOCATION_MANAGER' || me?.role === 'TEAM_LEADER';

	const { data: locations, isLoading: isLocationsLoading } = trpc.location.list.useQuery();

	const {
		data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage,
	} = trpc.session.list.useInfiniteQuery(
		{
			limit: 20,
			search: debouncedSearch || undefined,
			locationId: selectedLocationId !== 'all' ? selectedLocationId : undefined,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		},
	);

	if (isLoading && !data) {
		return (
			<div className="space-y-6 pb-20">
				<AdminPageHeader
					title="Sales Sessions"
					subtitle="Übersicht aller aktiven und vergangenen Sessions."
					backHref="/admin"
				/>
				<div className="bg-white rounded-3xl border border-[#eaedf0] p-6 space-y-4 shadow-sm">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className="h-16 w-full rounded-2xl" />
					))}
				</div>
			</div>
		);
	}

	const allSessions = data?.pages.flatMap((page) => page.items) || [];

	return (
		<div className="space-y-6 pb-20">
			<AdminPageHeader
				title="Sales Sessions"
				subtitle="Übersicht aller aktiven und vergangenen Sessions."
				backHref="/admin"
			/>

			{/* List Controls matching TeamsPage */}
			<div className="flex flex-col md:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="w-4 h-4 text-[#bbb] absolute left-4 top-1/2 -translate-y-1/2" />
					<input
						type="text"
						placeholder="Suchen nach Name, E-Mail oder Team..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-11 pr-11 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
					/>
					{searchQuery && (
						<button
							onClick={() => setSearchQuery('')}
							className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#1a1a2e] bg-transparent border-none cursor-pointer"
						>
							<X className="w-4 h-4" />
						</button>
					)}
				</div>
				{!isRestrictedUser && (
					<div className="w-full md:w-[250px] relative">
						<select
							value={selectedLocationId}
							onChange={(e) => setSelectedLocationId(e.target.value)}
							disabled={isLocationsLoading}
							className="w-full pl-4 pr-10 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem] appearance-none disabled:opacity-50"
						>
							<option value="all">Alle Standorte</option>
							{locations?.items?.map((loc: any) => (
								<option key={loc.id} value={loc.id}>{loc.name}</option>
							))}
						</select>
						<div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#bbb]">
							<svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
						</div>
					</div>
				)}
			</div>


			<div className="bg-white rounded-3xl border border-[#eaedf0] overflow-hidden shadow-sm">
				{allSessions.length === 0 ? (
					<div className="p-20 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Activity className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1.1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Sessions gefunden
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0 mb-4 leading-relaxed">
							Es wurden keine Sales-Sessions {searchQuery ? 'für Deine Suche' : 'in diesem Bereich'} gefunden.
						</p>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery('')}
								className="text-[#1a1a2e] text-[0.85rem] font-semibold bg-white border border-[#eaedf0] px-4 py-2 rounded-xl hover:bg-[#f7f8fa] transition-colors cursor-pointer"
							>
								Suche zurücksetzen
							</button>
						)}
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="bg-[#fcfcfd] border-b border-[#eaedf0]">
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Berater / Kunde
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Organisation (Team/Standort)
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Sitzungsdetails
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right">
										Erstellt am
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#f0f0f0]">
								{allSessions.map((session, idx) => {
									const isTest = isTestAccount(session.firstName, session.lastName, session.email);
									return (
										<motion.tr
											initial={{ opacity: 0, y: 5 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: idx * 0.02 }}
											key={session.id}
											className="group hover:bg-[#fcfcfd] transition-colors"
										>
											<td className="px-6 py-4">
												<div className="flex flex-col gap-1">
													<div className="flex items-center gap-2">
														<span className="text-[0.95rem] font-bold text-[#1a1a2e]">
															{session.firstName} {session.lastName}
														</span>
														{isTest && (
															<Tooltip content="Konto enthält Test-Begriffe oder Zahlen">
																<span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/60 text-amber-700 text-[0.65rem] font-bold tracking-wide uppercase cursor-help">
																	<AlertTriangle className="w-3 h-3 text-amber-500" />
																	Testkonto
																</span>
															</Tooltip>
														)}
													</div>
													<div className="flex items-center gap-2 mt-0.5">
														{session.isVerified ? (
															<span className="flex items-center gap-1 text-[0.72rem] font-semibold text-[#00a878] bg-[#00a878]/10 px-2 py-0.5 rounded-md border border-[#00a878]/20 w-fit">
																<CheckCircle2 className="w-3 h-3" /> Verifiziert
															</span>
														) : (
															<span className="flex items-center gap-1 text-[0.72rem] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 w-fit">
																<Clock className="w-3 h-3" /> Ausstehend
															</span>
														)}
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex flex-col gap-1.5">
													<div className="flex items-center gap-2">
														<Users className="w-3.5 h-3.5 text-[#e20074]" />
														<span className="text-[0.85rem] font-bold text-[#e20074]">
															{session.team.name}
														</span>
													</div>
													<div className="flex flex-col gap-0.5 ml-5">
														<div className="flex items-center gap-1.5 text-[0.75rem] text-[#888] font-medium">
															<MapPin className="w-3 h-3" />
															{session.team.location?.address ? (
																<Tooltip content={session.team.location.address}>
																	<span className="border-b border-dashed border-[#eaedf0] cursor-help">
																		{session.team.location.name}
																	</span>
																</Tooltip>
															) : (
																session.team.location?.name || 'Kein Standort'
															)}
														</div>
														<div className="flex items-center gap-1.5 text-[0.7rem] text-[#bbb] font-medium">
															<Globe className="w-3 h-3" />
															{session.team.location?.odRegion?.name || 'Keine Region'}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex flex-col gap-1.5">
													{session.email && (
														<div className="flex items-center gap-2 text-[0.8rem] text-[#1a1a2e] font-medium bg-[#f7f8fa] px-2.5 py-1 rounded-lg border border-[#eaedf0] w-fit">
															<Mail className="w-3.5 h-3.5 text-[#888]" />
															{session.email}
														</div>
													)}
													<div className="flex items-center gap-3 text-[0.7rem] font-mono text-[#aaa]">
														<span>IP: {session.ip || 'Unbekannt'}</span>
														{session.userAgent && (
															<Tooltip content={session.userAgent}>
																<span className="flex items-center gap-1 border-b border-dashed border-[#eaedf0] cursor-help">
																	<Laptop className="w-3 h-3" /> Client Info
																</span>
															</Tooltip>
														)}
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex flex-col text-right">
													<span className="text-[0.85rem] font-bold text-[#1a1a2e]">
														{format(new Date(session.createdAt), 'dd. MMM yyyy', { locale: de })}
													</span>
													<span className="text-[0.75rem] font-medium text-[#999] mt-0.5">
														{format(new Date(session.createdAt), 'HH:mm \'Uhr\'')}
													</span>
												</div>
											</td>
										</motion.tr>
									);
								})}
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
