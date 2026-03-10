"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
	Shield,
	Trash2,
	Plus,
	Loader2,
	Pencil,
	MapPin,
	Search
} from "lucide-react";
import clsx from "clsx";
import { Skeleton } from "@/components/shared/skeleton";
import { confirmDelete } from "@/components/shared/delete-confirm-toast";
import Link from "next/link";
import { AdminPageHeader } from "@/components/shared/ui/admin-ui";

type UserResponse = {
	id: string;
	email: string;
	role: string;
	createdAt: string | Date;
	isEditor: boolean;
	team?: { name: string } | null;
	location?: { name: string } | null;
	odRegion?: { name: string } | null;
};

export default function UsersClient() {
	const utils = trpc.useUtils();
	const { data: currentUser } = trpc.auth.me.useQuery();
	const [searchQuery, setSearchQuery] = useState("");

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		trpc.adminUsers.list.useInfiniteQuery(
			{
				limit: 20,
				search: searchQuery || undefined
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor
			}
		);

	const isAdmin = currentUser?.role === "ADMIN";
	const isManager =
		currentUser?.role === "OD_MANAGER" ||
		currentUser?.role === "LOCATION_MANAGER";

	const canCreateUser = isAdmin || isManager;
	const canDeleteUser = isAdmin || isManager;

	const deleteUser = trpc.adminUsers.delete.useMutation({
		onSuccess: () => utils.adminUsers.list.invalidate()
	});

	const users = data?.pages.flatMap((page) => page.items) || [];

	return (
		<div className="space-y-6 pb-20">
			<div className="flex justify-between items-center">
				<AdminPageHeader
					title="Benutzer"
					subtitle="Verwalte die Zugänge zum Dashboard."
					backHref="/admin"
				/>
				{canCreateUser && (
					<Link
						href="/admin/users/new"
						className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline border-none cursor-pointer"
					>
						<Plus className="w-4 h-4" />
						Benutzer erstellen
					</Link>
				)}
			</div>

			<div className="relative">
				<Search className="w-4 h-4 text-[#bbb] absolute left-4 top-1/2 -translate-y-1/2" />
				<input
					type="text"
					placeholder="Suchen nach E-Mail..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
				/>
			</div>

			<div className="bg-white rounded-3xl border border-[#eaedf0] overflow-hidden shadow-sm">
				{isLoading && users.length === 0 ? (
					<div className="flex flex-col gap-3 p-5">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="h-14 w-full rounded-xl" />
						))}
					</div>
				) : users.length === 0 ? (
					<div className="p-20 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Shield className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1.1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Benutzer
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Es wurden keine Benutzer für deine Suche gefunden.
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead>
								<tr className="border-b border-[#eaedf0] bg-[#fcfcfd]">
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Email
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
								{users.map(
									(user: {
										id: string;
										email: string;
										role: string;
										isEditor: boolean;
										team: { name: string } | null;
										location: { name: string } | null;
										odRegion: { name: string } | null;
									}) => (
										<tr
											key={user.id}
											className="group hover:bg-[#fcfcfd] transition-colors"
										>
											<td className="py-4 px-6 text-[0.95rem] font-bold text-[#1a1a2e]">
												{user.email}
											</td>
											<td className="py-4 px-6">
												<div className="flex flex-wrap gap-2">
													<span
														className={clsx(
															"px-2.5 py-1 rounded-lg text-[0.65rem] font-bold tracking-wider uppercase",
															user.role === "ADMIN"
																? "bg-[#e20074]/10 text-[#e20074] border border-[#e20074]/20"
																: "bg-[#1a1a2e] text-white"
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
													</span>
												) : user.location?.name ? (
													<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f0f2f5] border border-[#eaedf0] text-[#1a1a2e] font-medium">
														<MapPin className="w-3.5 h-3.5 text-[#888]" />
														{user.location.name}
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
														{currentUser?.id !== user.id && canDeleteUser && (
															<button
																onClick={() => {
																	confirmDelete({
																		id: user.id,
																		name: user.email,
																		onConfirm: () =>
																			deleteUser.mutate({ id: user.id })
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
									)
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
							{isFetchingNextPage ? "Wird geladen..." : "Mehr laden"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
