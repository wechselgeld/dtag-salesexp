"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Shield, Trash2, Plus, Loader2, Pencil } from "lucide-react";
import clsx from "clsx";
import { Skeleton } from "@/components/shared/skeleton";
import { confirmDelete } from "@/components/shared/delete-confirm-toast";
import Link from "next/link";

type UserResponse = {
	id: string;
	email: string;
	role: string;
	createdAt: string | Date;
};

export default function UsersClient() {
	const utils = trpc.useContext();
	const { data: currentUser } = trpc.auth.me.useQuery();
	const { data: users, isLoading } = trpc.adminUsers.list.useQuery();

	const isAdmin = currentUser?.role === "ADMIN";

	const deleteUser = trpc.adminUsers.delete.useMutation({
		onSuccess: () => utils.adminUsers.list.invalidate()
	});

	if (isLoading) {
		return (
			<div>
				<div className="flex justify-between items-center mb-6">
					<div>
						<h1 className="text-[1.6rem] font-extrabold text-[#1a1a2e] tracking-tight mb-1">
							Admins
						</h1>
						<p className="text-[0.85rem] text-[#999] m-0">
							Verwalte die Zugänge zum Dashboard.
						</p>
					</div>
					<Skeleton className="h-10 w-32 rounded-xl" />
				</div>
				<div className="bg-white rounded-2xl border border-[#eaedf0] overflow-hidden p-5 flex flex-col gap-3">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-14 w-full rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-[1.6rem] font-extrabold text-[#1a1a2e] tracking-tight mb-1">
						Admins
					</h1>
					<p className="text-[0.85rem] text-[#999] m-0">
						Verwalte die Zugänge zum Dashboard.
					</p>
				</div>
				{isAdmin && (
					<Link
						href="/admin/users/new"
						className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline border-none cursor-pointer"
					>
						<Plus className="w-4 h-4" />
						Admin erstellen
					</Link>
				)}
			</div>

			<div className="bg-white rounded-2xl border border-[#eaedf0] overflow-hidden">
				{!users || users.length === 0 ? (
					<div className="p-16 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Shield className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Admins
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Es wurden noch keine Administratoren gefunden.
						</p>
					</div>
				) : (
					<table className="w-full text-left">
						<thead>
							<tr className="border-b border-[#eaedf0]">
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
									Email
								</th>
								<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
									Rolle
								</th>
								{isAdmin && (
									<th className="px-5 py-3.5 font-semibold text-[#aaa] text-[0.72rem] uppercase tracking-wider text-right">
										Aktionen
									</th>
								)}
							</tr>
						</thead>
						<tbody>
							{users.map((user, i) => (
								<tr
									key={user.id}
									className={clsx(
										"border-b border-[#f0f0f0] last:border-b-0 group hover:bg-[#f7f8fa] transition-colors duration-200"
									)}
								>
									<td className="py-3.5 px-5 text-[0.85rem] font-medium text-[#1a1a2e]">
										{user.email}
									</td>
									<td className="py-3.5 px-5">
										<span
											className={clsx(
												"px-2 py-1 rounded-md text-[0.7rem] font-bold tracking-wider",
												user.role === "ADMIN"
													? "bg-[#e20074]/10 text-[#e20074]"
													: "bg-[#1a1a2e]/10 text-[#1a1a2e]"
											)}
										>
											{user.role}
										</span>
									</td>
									{isAdmin && (
										<td className="py-3.5 px-5 text-right w-[150px]">
											<div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
												<Link
													href={`/admin/users/${user.id}`}
													className="p-2 text-[#ccc] hover:text-[#0090d0] hover:bg-[#0090d0]/10 rounded-lg transition-all duration-150 cursor-pointer bg-transparent border-none inline-flex items-center justify-center"
													title="Benutzer bearbeiten"
												>
													<Pencil className="w-4 h-4" />
												</Link>
												{currentUser?.id !== user.id && (
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
														className="p-2 text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2] rounded-lg transition-all duration-150 cursor-pointer bg-transparent border-none disabled:opacity-50"
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
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
