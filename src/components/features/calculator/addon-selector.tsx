'use client';

import type {
	Addon,
} from '@/types/product';
import {
	Check,
	Search,
	X,
	ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';
import {
	useBasketStore,
} from '@/lib/store/basket-store';
import {
	useMediaQuery,
} from '@/hooks/use-media-query';
import {
	trpc,
} from '@/lib/trpc';
import {
	AnimatePresence, motion,
} from 'framer-motion';
import {
	useState, useMemo, useRef, useEffect,
} from 'react';
import {
	createPortal,
} from 'react-dom';

interface Props {
	addons: Addon[];
	selectedIds: string[];
	onChange: (ids: string[]) => void;
	isMagentaTVSelected: boolean;
	catColor?: string;
}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*  Variant Dropdown (portal-based to avoid z-index clipping)                 */
/* -------------------------------------------------------------------------- */
function VariantDropdown({
	addon,
	selectedTierId,
	onSelect,
	catColor,
}: {
	addon: Addon;
	selectedTierId: string | undefined;
	onSelect: (addon: Addon, tierId: string) => void;
	catColor: string;
}) {
	const [
		isOpen,
		setIsOpen,
	] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [
		dropdownPos,
		setDropdownPos,
	] = useState<{
		top?: number;
		bottom?: number;
		left: number;
		width: number;
	}>({
		left: 0,
		width: 0,
	});

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [
	]);

	useEffect(() => {
		if (isOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			const dropdownWidth = 200;
			// Estimate height: ~55px per tier + ~50px for deselect + padding
			const estHeight = 10 + (selectedTierId ? 50 : 0) + (addon.tiers.length * 55);
			const spaceBelow = window.innerHeight - rect.bottom;
			const shouldOpenUp = spaceBelow < estHeight && rect.top > spaceBelow;

			if (shouldOpenUp) {
				setDropdownPos({
					bottom: window.innerHeight - rect.top + 6,
					left: rect.right - dropdownWidth,
					width: dropdownWidth,
				});
			}
			else {
				setDropdownPos({
					top: rect.bottom + 6,
					left: rect.right - dropdownWidth,
					width: dropdownWidth,
				});
			}
		}
	}, [
		isOpen,
		selectedTierId,
		addon.tiers.length,
	]);

	const selectedTier = addon.tiers.find((t) => t.id === selectedTierId);
	const sortedTiers = [
		...addon.tiers,
	].sort((a, b) => a.price - b.price);

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={clsx(
					'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[0.78rem] font-semibold transition-all duration-200 cursor-pointer outline-none min-w-[130px] justify-between',
					selectedTierId
						? 'bg-white'
						: 'bg-[#fafafa] hover:border-[#bbb]',
				)}
				style={{
					borderColor: selectedTierId ? catColor : '#ddd',
					color: selectedTierId ? catColor : '#666',
				}}
			>
				<span className="truncate">
					{selectedTier ? selectedTier.name : 'Wählen...'}
				</span>
				<ChevronDown
					className={clsx(
						'w-3.5 h-3.5 shrink-0 transition-transform duration-200',
						isOpen ? 'rotate-180' : '',
					)}
				/>
			</button>

			{isOpen && createPortal(
				<AnimatePresence>
					<motion.div
						ref={dropdownRef}
						initial={{
							opacity: 0,
							y: dropdownPos.bottom ? 4 : -4,
							scale: 0.98,
						}}
						animate={{
							opacity: 1,
							y: 0,
							scale: 1,
						}}
						exit={{
							opacity: 0,
							y: dropdownPos.bottom ? 4 : -4,
							scale: 0.98,
						}}
						transition={{
							duration: 0.15,
							ease: [
								0.23,
								1,
								0.32,
								1,
							],
						}}
						className="fixed bg-white border border-[#eaedf0] rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.18)] overflow-hidden py-1"
						style={{
							top: dropdownPos.top,
							bottom: dropdownPos.bottom,
							left: dropdownPos.left,
							width: dropdownPos.width,
							zIndex: 9999,
						}}
					>
						{/* "Deselect" option */}
						{selectedTierId && (
							<>
								<button
									onClick={() => {
										onSelect(addon, selectedTierId);
										setIsOpen(false);
									}}
									className="w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors text-[0.8rem] font-medium text-[#888] hover:bg-[#fafafa] cursor-pointer outline-none border-none bg-transparent"
								>
									<span>Abwählen</span>
									<X className="w-3 h-3 text-[#bbb]" />
								</button>
								<div className="h-px bg-[#f0f0f0] mx-2.5 my-0.5" />
							</>
						)}
						{sortedTiers.map((tier) => {
							const isSelected = tier.id === selectedTierId;
							return (
								<button
									key={tier.id}
									onClick={() => {
										onSelect(addon, tier.id);
										setIsOpen(false);
									}}
									className={clsx(
										'w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer outline-none border-none bg-transparent',
										isSelected
											? 'font-bold'
											: 'hover:bg-[#fafafa] font-medium',
									)}
									style={{
										color: isSelected ? catColor : '#1a1a2e',
										backgroundColor: isSelected ? `${catColor}08` : undefined,
									}}
								>
									<div className="flex flex-col">
										<span className="text-[0.8rem]">{tier.name}</span>
										<span
											className="text-[0.7rem] opacity-60 font-medium"
											style={{
												color: isSelected ? catColor : '#888',
											}}
										>
											+{tier.price.toFixed(2).replace('.', ',')} €/mtl.
										</span>
									</div>
									{isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
								</button>
							);
						})}
					</motion.div>
				</AnimatePresence>,
				document.body,
			)}
		</>
	);
}

/* -------------------------------------------------------------------------- */
/*  Main AddonSelector                                                        */
/* -------------------------------------------------------------------------- */
export function AddonSelector({
	addons,
	selectedIds,
	onChange,
	isMagentaTVSelected,
	catColor = '#e20074',
}: Props) {
	const isOpen = useBasketStore((state) => state.isOpen);
	const isComparisonMode = useBasketStore((state) => state.isComparisonMode);
	const basketsCount = useBasketStore((state) => state.baskets.length);
	const isComparing = isOpen && isComparisonMode && basketsCount > 1;
	const isNarrowViewport = useMediaQuery('(max-width: 1024px)');
	const isSqueezed = isComparing || (isOpen && basketsCount >= 3) || isNarrowViewport;

	const [
		searchQuery,
		setSearchQuery,
	] = useState('');

	const {
		data: designSettings,
	} = trpc.settings.getDesignSettings.useQuery(
		undefined,
		{
			staleTime: 10 * 60 * 1000,
		},
	);

	// Filter out addons based on MagentaTV requirement
	const availableAddons = useMemo(() => {
		return addons.filter((addon) => {
			if (addon.magentaTVRequirement === 'NOT_ALLOWED' && isMagentaTVSelected) {
				return false;
			}
			if (addon.magentaTVRequirement === 'REQUIRED' && !isMagentaTVSelected) {
				return false;
			}
			if (!addon.tiers || addon.tiers.length === 0) { return false; }

			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				const matchesName = addon.name.toLowerCase().includes(query);
				const matchesDesc = addon.description?.toLowerCase().includes(query);
				const matchesTiers = addon.tiers.some(t => t.name.toLowerCase().includes(query));
				if (!matchesName && !matchesDesc && !matchesTiers) { return false; }
			}

			return true;
		});
	}, [
		addons,
		isMagentaTVSelected,
		searchQuery,
	]);

	if (addons.length === 0) { return null; }

	const handleToggle = (addon: Addon, tierId: string) => {
		const tierIdsForThisAddon = addon.tiers.map((t) => t.id);

		if (selectedIds.includes(tierId)) {
			onChange(selectedIds.filter((x) => x !== tierId));
		}
		else {
			const newIds = selectedIds.filter(
				(id) => !tierIdsForThisAddon.includes(id),
			);
			onChange([
				...newIds,
				tierId,
			]);
		}
	};

	return (
		<div className="space-y-3">
			{addons.length > 5 && (
				<div
					className="relative flex items-center border px-4 rounded-xl transition-all duration-300 bg-[#f7f8fa] py-2.5"
					style={{
						borderColor: searchQuery ? `${catColor}4d` : '#e5e7eb',
						boxShadow: searchQuery
							? `0 0 0 3px ${catColor}10, 0 4px 12px rgba(0, 0, 0, 0.05)`
							: '0 1px 3px rgba(0, 0, 0, 0.02)',
						backgroundColor: searchQuery ? '#ffffff' : '#f7f8fa',
					}}
				>
					<Search
						className="mr-2.5 shrink-0 transition-colors duration-400 w-4 h-4"
						style={{
							color: searchQuery ? catColor : '#b0b0b0',
						}}
					/>
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Zubuchoptionen suchen..."
						className="border-none outline-none w-full font-sans text-[#1a1a2e] bg-transparent placeholder:text-[#b0b0b0] placeholder:font-normal text-[0.85rem]"
					/>
					{searchQuery && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								setSearchQuery('');
							}}
							className="p-1 rounded-lg hover:bg-[#f0f0f0] text-[#ccc] hover:text-[#999] transition-colors cursor-pointer border-none bg-transparent ml-2 shrink-0"
						>
							<X className="w-4 h-4" />
						</button>
					)}
				</div>
			)}

			{availableAddons.length === 0 && searchQuery && (
				<div className="py-6 text-center text-[#999] text-[0.85rem]">
					Keine Option gefunden für „{searchQuery}".
				</div>
			)}

			{/* Row-based list */}
			<div className="flex flex-col gap-2">
				{availableAddons.map((addon) => {
					const selectedTierId = addon.tiers.find((t) =>
						selectedIds.includes(t.id),
					)?.id;
					const isMultiTier = addon.tiers.length > 1;
					const hasSelected = !!selectedTierId;
					const sortedTiers = [
						...addon.tiers,
					].sort((a, b) => a.price - b.price);
					const cheapestTier = sortedTiers[0];
					const displayPrice = hasSelected
						? addon.tiers.find((t) => t.id === selectedTierId)?.price ?? 0
						: cheapestTier?.price ?? 0;

					const isMagentaTV = addon.name.toLowerCase().includes('magentatv');
					const globalImageUrl = isMagentaTV
						? designSettings?.magentatv_background_image
						: null;
					const finalImageUrl = addon.imageUrl || globalImageUrl;
					const showImageBg = hasSelected && !!finalImageUrl;

					return (
						<motion.div
							key={addon.id}
							whileTap={{
								scale: 0.98,
							}}
							onClick={() => {
								if (hasSelected) {
									handleToggle(addon, selectedTierId!);
								}
								else {
									handleToggle(addon, cheapestTier.id);
								}
							}}
							className={clsx(
								'relative rounded-xl border-2 transition-all duration-200 overflow-hidden cursor-pointer',
								showImageBg ? 'text-white' : '',
								!hasSelected ? 'hover:border-[#ccc]' : '',
							)}
							style={{
								borderColor: hasSelected ? catColor : '#eaedf0',
								backgroundColor:
									hasSelected && !showImageBg ? `${catColor}06` : 'white',
							}}
						>
							{/* Background Image Overlay */}
							{finalImageUrl && (
								<div
									className={clsx(
										'absolute -inset-0.5 z-0 transition-opacity duration-400 pointer-events-none',
										hasSelected ? 'opacity-100' : 'opacity-0',
									)}
								>
									<div
										className="absolute inset-0 bg-cover bg-center blur-[2px] scale-110"
										style={{
											backgroundImage: `url(${finalImageUrl})`,
										}}
									/>
									<div className="absolute inset-0 bg-[#1a1a2e]/40" />
								</div>
							)}

							{/* Row Content */}
							<div className={clsx(
								'relative z-10 flex gap-4 px-4 py-3.5',
								isSqueezed
									? 'flex-col items-stretch'
									: 'flex-row items-center justify-between',
							)}>
								<div className="flex items-center gap-4 flex-1 min-w-0">
									{/* Toggle checkbox — always present */}
									<div
										className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200"
										style={{
											borderColor: hasSelected ? catColor : '#ddd',
											backgroundColor: hasSelected ? catColor : 'transparent',
										}}
									>
										{hasSelected && (
											<Check
												className="w-3.5 h-3.5 text-white"
												strokeWidth={4}
											/>
										)}
									</div>

									{/* Title + Price subtitle + Description */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-0.5">
											<h3
												className={clsx(
													'font-bold text-[0.95rem] m-0 transition-colors',
													showImageBg
														? 'text-white'
														: hasSelected
															? `text-[${catColor}]`
															: 'text-[#1a1a2e]',
												)}
												style={{
													color: showImageBg
														? undefined
														: hasSelected
															? catColor
															: undefined,
												}}
											>
												{addon.name}
											</h3>
										</div>
										<p
											className={clsx(
												'text-[0.78rem] m-0 transition-colors',
												showImageBg ? 'text-white/70' : 'text-[#999]',
											)}
										>
											{!isMultiTier || hasSelected
												? `+${displayPrice.toFixed(2).replace('.', ',')} € mtl.`
												: `ab ${displayPrice.toFixed(2).replace('.', ',')} € mtl.`}
											{addon.description && (
												<>
													<span className="mx-1.5 opacity-50">•</span>
													{addon.description}
												</>
											)}
										</p>
									</div>
								</div>

								{/* Variant Dropdown (multi-tier only, at end of row) */}
								{isMultiTier && (
									<div onClick={(e) => e.stopPropagation()} className={clsx('shrink-0', isSqueezed ? 'ml-9' : 'ml-0')}>
										<VariantDropdown
											addon={addon}
											selectedTierId={selectedTierId}
											onSelect={handleToggle}
											catColor={catColor}
										/>
									</div>
								)}
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}
