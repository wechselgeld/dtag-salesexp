"use client";

import { trpc } from "@/lib/trpc";
import {
	Activity,
	Loader2,
	Search,
	Calendar,
	MapPin,
	Users,
	Globe,
	Mail
} from "lucide-react";
import { Skeleton } from "@/components/shared/skeleton";
import { AdminPageHeader } from "@/components/shared/ui/admin-ui";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { motion } from "framer-motion";
import { Tooltip } from "@/components/shared/ui/tooltip";

export default function SessionsClient() {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		trpc.session.list.useInfiniteQuery(
			{ limit: 20 },
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor
			}
		);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<AdminPageHeader
					title="Sales Sessions"
					subtitle="Übersicht aller aktiven und vergangenen Kunden-Verifizierungen."
					backHref="/admin"
				/>
				<div className="bg-white rounded-3xl border border-[#eaedf0] p-6 space-y-4">
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
				subtitle="Übersicht aller aktiven und vergangenen Kunden-Verifizierungen."
				backHref="/admin"
			/>

			<div className="bg-white rounded-3xl border border-[#eaedf0] overflow-hidden shadow-sm">
				{!allSessions || allSessions.length === 0 ? (
					<div className="p-20 flex flex-col items-center justify-center text-center">
						<div className="w-20 h-20 bg-[#f7f8fa] rounded-3xl flex items-center justify-center mb-6 border border-[#eaedf0]">
							<Activity className="w-8 h-8 text-[#ccc]" />
						</div>
						<h3 className="text-[1.2rem] font-bold text-[#1a1a2e] mb-2">
							Keine Sessions gefunden
						</h3>
						<p className="text-[0.9rem] text-[#999] max-w-[300px] m-0 leading-relaxed">
							Es wurden bisher keine Sales-Sessions in diesem Bereich
							aufgezeichnet.
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="bg-[#fcfcfd] border-b border-[#eaedf0]">
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Kunde / Status
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Organisation (Team/Standort)
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Details
									</th>
									<th className="px-6 py-4 font-bold text-[#aaa] text-[0.72rem] uppercase tracking-wider">
										Datum
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#f0f0f0]">
								{allSessions.map(
									(
										session: {
											id: string;
											firstName: string | null;
											lastName: string | null;
											email: string | null;
											isVerified: boolean;
											ip: string | null;
											createdAt: Date | string;
											team: {
												name: string;
												location: {
													name: string;
													address: string | null;
													odRegion: { name: string } | null;
												} | null;
											};
										},
										idx: number
									) => (
										<motion.tr
											initial={{ opacity: 0, y: 5 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: idx * 0.03 }}
											key={session.id}
											className="hover:bg-[#fcfcfd] transition-colors"
										>
											<td className="px-6 py-5">
												<div className="flex flex-col">
													<span className="text-[0.95rem] font-bold text-[#1a1a2e]">
														{session.firstName} {session.lastName}
													</span>
													<div className="flex items-center gap-2 mt-1">
														<span
															className={`w-2 h-2 rounded-full ${session.isVerified ? "bg-green-500" : "bg-amber-500"}`}
														/>
														<span className="text-[0.75rem] font-medium text-[#888]">
															{session.isVerified
																? "Verifiziert"
																: "Ausstehend"}
														</span>
													</div>
												</div>
											</td>
											<td className="px-6 py-5">
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
																<Tooltip
																	content={session.team.location.address}
																>
																	<span className="border-b border-dashed border-[#eaedf0] cursor-help">
																		{session.team.location.name}
																	</span>
																</Tooltip>
															) : (
																session.team.location?.name || "Kein Standort"
															)}
														</div>
														<div className="flex items-center gap-1.5 text-[0.7rem] text-[#bbb] font-medium">
															<Globe className="w-3 h-3" />
															{session.team.location?.odRegion?.name ||
																"Keine Region"}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-5">
												<div className="flex flex-col gap-1.5">
													{session.email && (
														<div className="flex items-center gap-2 text-[0.8rem] text-[#1a1a2e] font-medium bg-[#f7f8fa] px-3 py-1.5 rounded-lg border border-[#eaedf0] w-fit">
															<Mail className="w-3.5 h-3.5 text-[#888]" />
															{session.email}
														</div>
													)}
													<span className="text-[0.7rem] font-mono text-[#aaa]">
														IP: {session.ip || "Unbekannt"}
													</span>
												</div>
											</td>
											<td className="px-6 py-5">
												<div className="flex flex-col text-right">
													<span className="text-[0.85rem] font-bold text-[#1a1a2e]">
														{format(
															new Date(session.createdAt),
															"dd. MMM yyyy",
															{
																locale: de
															}
														)}
													</span>
													<span className="text-[0.75rem] font-medium text-[#999] mt-0.5">
														{format(new Date(session.createdAt), "HH:mm 'Uhr'")}
													</span>
												</div>
											</td>
										</motion.tr>
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
							className="flex items-center gap-2 bg-white hover:bg-[#f7f8fa] text-[#1a1a2e] px-8 py-3 rounded-2xl font-bold transition-all border border-[#eaedf0] shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
						>
							{isFetchingNextPage ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : (
								<Activity className="w-5 h-5 group-hover:rotate-12 transition-transform" />
							)}
							{isFetchingNextPage ? "Wird geladen..." : "Mehr Sessions laden"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
