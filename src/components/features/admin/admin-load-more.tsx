import React from 'react';
import { Loader2, Plus } from 'lucide-react';

interface AdminLoadMoreProps {
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => void;
}

export function AdminLoadMore({
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
}: AdminLoadMoreProps) {
	if (!hasNextPage) return null;

	return (
		<div className="p-8 border-t border-[#f0f0f0] flex justify-center bg-[#fcfcfd]">
			<button
				onClick={fetchNextPage}
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
	);
}
