'use client';

import {
	useState, useEffect, useRef,
} from 'react';
import {
	Search, X,
} from 'lucide-react';
import clsx from 'clsx';
import {
	fuzzySearch,
} from '@/lib/fuzzy-search';
import { useSearchHotkey } from '@/hooks/use-search-hotkey';

interface AdminSearchProps<T> {
	items: T[];
	onResultsChange: (results: T[]) => void;
	getSearchableText: (item: T) => string[];
	placeholder?: string;
	className?: string;
	value?: string;
	onChange?: (value: string) => void;
}

function areArraysEqual<T>(a: T[], b: T[]): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

export function AdminSearch<T>({
	items,
	onResultsChange,
	getSearchableText,
	placeholder = 'Suchen...',
	className,
	value,
	onChange,
}: AdminSearchProps<T>) {
	const [
		localQuery,
		setLocalQuery,
	] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	const isControlled = value !== undefined && onChange !== undefined;
	const activeQuery = isControlled ? value : localQuery;
	const setActiveQuery = isControlled ? onChange : setLocalQuery;

	const onResultsChangeRef = useRef(onResultsChange);
	const getSearchableTextRef = useRef(getSearchableText);

	useEffect(() => {
		onResultsChangeRef.current = onResultsChange;
	}, [
 onResultsChange,
]);

	useEffect(() => {
		getSearchableTextRef.current = getSearchableText;
	}, [
 getSearchableText,
]);

	const lastResultsRef = useRef<T[] | null>(null);
	const lastItemsRef = useRef<T[] | null>(null);
	const lastQueryRef = useRef<string | null>(null);

	// Perform fuzzy search on items whenever they change, or query changes
	useEffect(() => {
		const itemsChanged = !lastItemsRef.current || !areArraysEqual(items, lastItemsRef.current);
		const queryChanged = lastQueryRef.current !== activeQuery;

		if (!itemsChanged && !queryChanged) {
			return;
		}

		lastItemsRef.current = items;
		lastQueryRef.current = activeQuery;

		let newResults: T[];
		if (!activeQuery.trim()) {
			newResults = items;
		}
 else {
			const fuzzyResults = fuzzySearch(items, activeQuery, getSearchableTextRef.current, 0.48); // Premium fuzzy tolerance threshold
			newResults = fuzzyResults.map((r) => r.item);
		}

		if (lastResultsRef.current && areArraysEqual(newResults, lastResultsRef.current)) {
			return;
		}

		lastResultsRef.current = newResults;
		onResultsChangeRef.current(newResults);
	}, [
 items,
activeQuery,
]);

	// Global hotkey to focus the search box when pressing '/'
	useSearchHotkey(inputRef);

	return (
		<div className={clsx('relative flex-1 group', className)}>
			<Search className="w-4 h-4 text-[#bbb] absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-[#e20074]" />
			<input
				ref={inputRef}
				type="text"
				placeholder={placeholder}
				value={activeQuery}
				onChange={(e) => setActiveQuery(e.target.value)}
				className="w-full pl-11 pr-11 py-3 rounded-xl border border-[#eaedf0] bg-white focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.85rem] text-[#1a1a2e] font-medium"
			/>
			{activeQuery && (
				<button
					onClick={() => setActiveQuery('')}
					className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#1a1a2e] bg-transparent border-none cursor-pointer flex items-center justify-center p-1 rounded-lg hover:bg-slate-50 transition-all active:scale-95 duration-200"
				>
					<X className="w-4 h-4" />
				</button>
			)}
			{!activeQuery && (
				<kbd className="hidden sm:inline-flex absolute right-4 top-1/2 -translate-y-1/2 items-center gap-1 px-2 py-0.5 text-[0.65rem] font-bold text-[#bbb] bg-slate-50/50 border border-[#eaedf0] rounded-lg select-none pointer-events-none transition-opacity duration-200 group-focus-within:opacity-0">
					/
				</kbd>
			)}
		</div>
	);
}
