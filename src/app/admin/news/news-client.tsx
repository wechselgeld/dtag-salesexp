'use client';

import {
	useState,
} from 'react';
import {
	trpc,
} from '@/lib/trpc';
import {
	Plus, Trash2, Megaphone, Loader2, Search, Layers,
} from 'lucide-react';
import clsx from 'clsx';
import {
	format,
} from 'date-fns';
import {
	de,
} from 'date-fns/locale';
import {
	Skeleton,
} from '@/components/shared/skeleton';
import Link from 'next/link';
import {
	confirmDelete,
} from '@/components/shared/delete-confirm-toast';
import {
	AdminPageHeader,
} from '@/components/shared/ui/admin-ui';

const PRIORITY_COLORS: Record<string, string> = {
	INFO: '#00a878', // Green
	UPDATE: '#0090d0', // Blue
	IMPORTANT: '#ff6b00', // Orange
	CRITICAL: '#dc2626', // Red
};

const PRIORITY_LABELS: Record<string, string> = {
	INFO: 'Info',
	UPDATE: 'Update',
	IMPORTANT: 'Wichtig',
	CRITICAL: 'Kritisch',
};

export default function AdminNewsPage() {
	const utils = trpc.useUtils();
	const [
		searchQuery,
		setSearchQuery,
	] = useState('');

	const {
		data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage,
	} =
		trpc.admin.news.list.useInfiniteQuery(
			{
				limit: 20,
				search: searchQuery || undefined,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	const deleteNews = trpc.admin.news.delete.useMutation({
		onSuccess: () => {
			utils.admin.news.list.invalidate();
		},
	});

	const newsItems = data?.pages.flatMap((page) => page.items) || [
	];

	return (
		<div className="space-y-6 pb-20">
			<div className="flex justify-between items-center">
				<AdminPageHeader
					title="Neuigkeiten"
					subtitle="Verwalte Mitteilungen für das Dashboard."
					backHref="/admin"
				/>
				<Link
					href="/admin/news/new"
					className="flex items-center gap-2 bg-[#e20074] hover:bg-[#c70066] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] hover:shadow-[0_6px_20px_rgba(226,0,116,0.3)] hover:-translate-y-0.5 active:scale-95 text-[0.82rem] no-underline"
				>
					<Plus className="w-4 h-4" />
					Neuigkeit erstellen
				</Link>
			</div>

			<div className="relative">
				<Search className="w-4 h-4 text-[#bbb] absolute left-4 top-1/2 -translate-y-1/2" />
				<input
					type="text"
					placeholder="Neuigkeiten suchen..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem]"
				/>
			</div>

			<div className="bg-white rounded-3xl border border-[#eaedf0] overflow-hidden shadow-sm">
				{isLoading && newsItems.length === 0 ? (
					<div className="flex flex-col gap-3 p-5">
						{[
							1,
							2,
							3,
							4,
							5,
						].map((i) => (
							<Skeleton key={i} className="h-20 w-full rounded-xl" />
						))}
					</div>
				) : newsItems.length === 0 ? (
					<div className="p-20 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
							<Megaphone className="w-6 h-6 text-[#ccc]" />
						</div>
						<h3 className="text-[1.1rem] font-bold text-[#1a1a2e] mb-1">
							Keine Neuigkeiten
						</h3>
						<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0">
							Es wurden keine Neuigkeiten für deine Suche gefunden.
						</p>
					</div>
				) : (
					<div className="flex flex-col">
						{newsItems.map(
							(
								item: {
									id: string;
									title: string;
									content: string;
									priority: string;
									createdAt: Date | string;
								},
								i: number,
							) => {
								const color =
									PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.INFO;
								return (
									<div
										key={item.id}
										className={clsx(
											'px-6 py-5 flex items-start justify-between group hover:bg-[#fcfcfd] transition-colors gap-4',
											i < newsItems.length - 1 && 'border-b border-[#f0f0f0]',
										)}
									>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1.5">
												<span
													className="px-2.5 py-1 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider"
													style={{
														color,
														backgroundColor: `${color}15`,
														border: `1px solid ${color}30`,
													}}
												>
													{PRIORITY_LABELS[item.priority]}
												</span>
												<span className="text-[0.7rem] text-[#888] font-bold">
													{format(
														new Date(item.createdAt),
														'dd. MMM yyyy - HH:mm',
														{
															locale: de,
														},
													)}
												</span>
											</div>
											<h3 className="text-[1rem] font-bold text-[#1a1a2e] m-0 mb-1.5 leading-tight">
												{item.title}
											</h3>
											<p className="text-[0.85rem] text-[#666] m-0 leading-relaxed max-w-[800px]">
												{item.content}
											</p>
										</div>
										<div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
											<button
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													confirmDelete({
														id: item.id,
														name: item.title,
														onConfirm: () => deleteNews.mutate({
															id: item.id,
														}),
													});
												}}
												disabled={deleteNews.isPending}
												className="p-2 text-[#ccc] hover:text-[#dc2626] hover:bg-[#fee2e2] rounded-lg transition-all cursor-pointer bg-transparent border-none disabled:opacity-50"
												title="Löschen"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</div>
								);
							},
						)}
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
