import React from 'react';
import Link from 'next/link';
import { Plus, type LucideIcon } from 'lucide-react';

interface AdminEmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	searchQuery: string;
	activeFilterId: string;
	onResetFilters: () => void;
	newLinkHref?: string;
	newLinkLabel?: string;
}

export function AdminEmptyState({
	icon: Icon,
	title,
	description,
	searchQuery,
	activeFilterId,
	onResetFilters,
	newLinkHref,
	newLinkLabel,
}: AdminEmptyStateProps) {
	const hasActiveFilterOrSearch = searchQuery || activeFilterId !== 'ALL';

	return (
		<div className="p-20 flex flex-col items-center justify-center text-center">
			<div className="w-16 h-16 bg-[#f7f8fa] rounded-2xl flex items-center justify-center mb-4 border border-[#eaedf0]">
				<Icon className="w-6 h-6 text-[#ccc]" />
			</div>
			<h3 className="text-[1.1rem] font-bold text-[#1a1a2e] mb-1">
				{title}
			</h3>
			<p className="text-[0.85rem] text-[#999] max-w-[250px] m-0 mb-4">
				{description} {hasActiveFilterOrSearch ? 'für deine Suche/Filter' : ''} gefunden.
			</p>
			<div className="flex gap-3 mt-2">
				{hasActiveFilterOrSearch && (
					<button
						onClick={onResetFilters}
						className="text-[#1a1a2e] text-[0.85rem] font-semibold bg-white border border-[#eaedf0] px-4 py-2 rounded-xl hover:bg-[#f7f8fa] transition-colors cursor-pointer"
					>
						Filter zurücksetzen
					</button>
				)}
				{newLinkHref && newLinkLabel && (
					<Link
						href={newLinkHref}
						className="text-white text-[0.85rem] font-semibold bg-[#e20074] border-none px-4 py-2 rounded-xl hover:bg-[#c70066] transition-colors cursor-pointer no-underline flex items-center gap-2"
					>
						<Plus className="w-4 h-4" /> {newLinkLabel}
					</Link>
				)}
			</div>
		</div>
	);
}
