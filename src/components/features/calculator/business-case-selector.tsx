'use client';

import type {
	BusinessCase,
} from '@/hooks/use-cost-calculator';
import {
	Check, UserPlus, Truck, RefreshCw, Zap, Star,
} from 'lucide-react';
import clsx from 'clsx';

import {
	motion,
} from 'framer-motion';
import {
	useBasketStore,
} from '@/hooks/use-basket-store';
import {
	useMediaQuery,
} from '@/hooks/use-media-query';

interface Product {
	allowNewActivation: boolean;
	allowMove: boolean;
	allowPlanChange: boolean;
	allowSpeedUp: boolean;
	activationFeeNew: number | null;
	activationFeeMove: number | null;
	activationFeePlanChange: number | null;
	activationFeeSpeedUp: number | null;
}

interface Props {
	product: Product;
	selectedCase: BusinessCase;
	onChange: (value: BusinessCase) => void;
	accentColor?: string;
	highlightedCases?: BusinessCase[];
}

export function BusinessCaseSelector({
	product,
	selectedCase,
	onChange,
	accentColor = '#e20074',
	highlightedCases = [
	],
}: Props) {
	const isOpen = useBasketStore((state) => state.isOpen);
	const isComparisonMode = useBasketStore((state) => state.isComparisonMode);
	const basketsCount = useBasketStore((state) => state.baskets.length);
	const isComparing = isOpen && isComparisonMode && basketsCount > 1;
	const isNarrowViewport = useMediaQuery('(max-width: 1024px)');
	const isSqueezed = isComparing || isNarrowViewport || (isOpen && basketsCount >= 3);

	const gridClass = (() => {
		if (isSqueezed) {
			if (basketsCount === 2 || isNarrowViewport) {
				return 'grid-cols-1 sm:grid-cols-2';
			}
			return 'grid-cols-1';
		}
		if (isOpen) {
			return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
		}
		return 'grid-cols-2 sm:grid-cols-4';
	})();

	const cases = [
		{
			id: 'NEW_ACTIVATION',
			label: 'Neubereitstellung',
			icon: UserPlus,
			allowed: product.allowNewActivation,
			fee: product.activationFeeNew,
		},
		{
			id: 'MOVE',
			label: 'Umzug',
			icon: Truck,
			allowed: product.allowMove,
			fee: product.activationFeeMove,
		},
		{
			id: 'PLAN_CHANGE',
			label: 'Tarif- & Anbieterwechsel',
			icon: RefreshCw,
			allowed: product.allowPlanChange,
			fee: product.activationFeePlanChange,
		},
		{
			id: 'SPEED_UP',
			label: 'Speed Up',
			icon: Zap,
			allowed: product.allowSpeedUp,
			fee: product.activationFeeSpeedUp,
		},
	] as const;

	return (
		<div className={clsx("grid gap-4", gridClass)}>
			{cases.map((item) => {
				if (!item.allowed) { return null; }
				const isSelected = selectedCase === item.id;

				return (
					<motion.button
						key={item.id}
						whileTap={{
							scale: 0.97,
						}}
						onClick={() => onChange(item.id as BusinessCase)}
						className={clsx(
							'relative flex flex-col items-center text-center p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer',
							isSelected
								? 'bg-(--accent)/4'
								: 'border-[#eaedf0] bg-linear-to-br from-white to-[#fcfafc] hover:border-[#ddd]',
							highlightedCases.includes(item.id as BusinessCase) &&
								!isSelected &&
								'highlight-glow',
						)}
						style={
							{
								'--accent': accentColor,
								borderColor: isSelected ? accentColor : undefined,
							} as React.CSSProperties
						}
					>
						<item.icon
							className="w-5 h-5 mb-2 transition-colors"
							style={{
								color: isSelected ? accentColor : '#bbb',
							}}
							strokeWidth={1.8}
						/>
						<div
							className={clsx(
								'text-[0.8rem] font-semibold leading-tight transition-colors',
								isSelected ? 'text-[#1a1a2e]' : 'text-[#888]',
							)}
						>
							{item.label}
						</div>
						<div className="text-[0.68rem] text-[#b0b0b0] mt-1">
							{item.fee ? `Einmalig ${item.fee.toFixed(2)} €` : 'Kostenfrei'}
						</div>

						{isSelected && (
							<div className="absolute top-2 right-2">
								<Check
									className="w-3.5 h-3.5"
									style={{
										color: accentColor,
									}}
									strokeWidth={2.5}
								/>
							</div>
						)}

						{highlightedCases.includes(item.id as BusinessCase) &&
							!isSelected && (
							<div className="absolute -top-[10px] left-1/2 -translate-x-1/2 bg-[#fffcf0] text-[#b78900] px-2 py-0.5 rounded text-[0.55rem] font-bold tracking-widest uppercase flex items-center gap-1 border border-[#fde68a] shadow-sm z-10 whitespace-nowrap">
								<Star className="w-2.5 h-2.5 fill-[#fde047]" />
									TEAM-FOKUS
							</div>
						)}
					</motion.button>
				);
			})}
		</div>
	);
}
