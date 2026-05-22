import {
	useEffect, useRef, useMemo,
} from 'react';
import {
	useBasketStore,
} from '@/hooks/use-basket-store';
import {
	useNewsNotificationStore,
} from '@/lib/store/news-notification-store';
import {
	calculateProductCosts, DEFAULT_PRICING,
} from '@/hooks/use-cost-calculator';
import {
	trpc,
} from '@/lib/trpc';

export function useBasketLogic(basketId?: string) {
	const basket = useBasketStore((state) =>
		basketId ? (state.baskets || []).find((b) => b.id === basketId) : null
	);
	const storeItems = useBasketStore((state) => state.items);
	const storeBasketCredits = useBasketStore((state) => state.basketCredits);

	const items = basket ? basket.items : storeItems;
	const basketCredits = basket ? basket.basketCredits : storeBasketCredits;
	const addNotification = useNewsNotificationStore((state) => state.addNotification);
	const lastNudgeRef = useRef<string | null>(null);

	const {
		data: pricingSettings,
	} = trpc.settings.getPricingSettings.useQuery(undefined, {
		staleTime: 10 * 60 * 1000,
	});
	const settings = pricingSettings || DEFAULT_PRICING;

	// Cross-Sell Detector (Fixed + Mobile Advantage)
	useEffect(() => {
		if (items.length === 0) {
			lastNudgeRef.current = null;
			return;
		}

		// Only trigger the nudge if an item was added very recently (within the last 2 seconds)
		// This prevents the nudge from showing up on page reloads, comparison toggles, or tab switches.
		const hasRecentlyAddedItem = items.some((item) => Date.now() - item.addedAt < 2000);
		if (!hasRecentlyAddedItem) {
			return;
		}

		const hasMobile = items.some((i) => i.product.category === 'MOBILE');
		const hasFixed = items.some(
			(i) => i.product.category === 'FIBER' || i.product.category === 'DSL',
		);

		let nudgeId = null;
		let title = '';
		let content = '';

		if (hasMobile && !hasFixed) {
			nudgeId = 'nudge-fixed-missing';
			title = 'Preisvorteil durch Festnetz';
			content = 'Dein Kunde nutzt Mobilfunk. Biete ihm zusätzlich Festnetz an.';
		}
		else if (hasFixed && !hasMobile) {
			nudgeId = 'nudge-mobile-missing';
			title = 'Preisvorteil durch Mobilfunk';
			content = 'Dein Kunde nutzt Festnetz. Biete ihm zusätzlich Mobilfunk an.';
		}

		if (nudgeId && lastNudgeRef.current !== nudgeId) {
			addNotification({
				id: nudgeId,
				title,
				content,
				priority: 'SALES',
			});
			lastNudgeRef.current = nudgeId;
		}
		else if (!nudgeId) {
			lastNudgeRef.current = null;
		}
	}, [
		items,
		addNotification,
	]);

	// Cache calculations for each item to avoid redundant expensive calls
	const itemsWithCosts = useMemo(() => {
		return items.map(item => {
			const costs = calculateProductCosts({
				product: item.product,
				businessCase: item.config.businessCase,
				magentaTVPackage: item.config.magentaTVPackage,
				selectedSpecialPriceIds: item.config.selectedSpecialPriceIds,
				selectedAddonIds: item.config.selectedAddonIds,
				vouchers: item.config.vouchers,
				hardwarePurchaseType: item.config.hardwarePurchaseType,
				plusKartenCount: item.config.plusKartenCount,
				settings,
				customBasePrice: item.config.customBasePrice,
				hardwareTier: item.config.hardwareTier,
			});

			return {
				item,
				costs,
			};
		});
	}, [items, settings]);

	// Aggregated Totals
	const totals = useMemo(() => {
		return itemsWithCosts.reduce((acc, entry) => {
			return {
				monthly: acc.monthly + entry.costs.averageMonthlyCost,
				daily: acc.daily + entry.costs.averageMonthlyCost / 30,
			};
		}, {
			monthly: 0,
			daily: 0,
		});
	}, [itemsWithCosts]);

	// Monthly steps calculation (24 months)
	const combinedSteps = useMemo(() => {
		if (itemsWithCosts.length === 0) return [];

		const monthlyTotals = Array(24).fill(0);
		itemsWithCosts.forEach((entry) => {
			entry.costs.monthlyCosts.forEach((mc, index) => {
				if (index < 24) { monthlyTotals[index] += mc.total; }
			});
		});

		const steps: { start: number; end: number; total: number }[] = [];
		let currentStep = {
			start: 1,
			end: 1,
			total: monthlyTotals[0],
		};

		for (let i = 1; i < 24; i++) {
			if (Math.abs(monthlyTotals[i] - currentStep.total) < 0.01) {
				currentStep.end = i + 1;
			}
			else {
				steps.push({
					...currentStep,
				});
				currentStep = {
					start: i + 1,
					end: i + 1,
					total: monthlyTotals[i],
				};
			}
		}
		steps.push(currentStep);
		return steps;
	}, [itemsWithCosts]);

	// One-time costs breakdown
	const oneTimeBreakdowns = useMemo(() => {
		return itemsWithCosts.flatMap((entry) => entry.costs.oneTimeCosts.breakdown);
	}, [itemsWithCosts]);

	const oneTimeBreakdownNoShipping = useMemo(() => {
		return oneTimeBreakdowns.filter(c => c.name !== 'Versand Hardware');
	}, [oneTimeBreakdowns]);

	const totalOneTimeItems = useMemo(() => {
		return oneTimeBreakdownNoShipping.reduce((acc, curr) => acc + curr.cost, 0);
	}, [oneTimeBreakdownNoShipping]);

	const hasDevice = useMemo(() => {
		return items.some((i) => i.product.category === 'DEVICE');
	}, [items]);

	const globalShippingFee = useMemo(() => {
		return hasDevice ? settings.shipping_hardware_fee : 0;
	}, [hasDevice, settings.shipping_hardware_fee]);

	const groupedOneTimeCosts = useMemo(() => {
		const grouped = oneTimeBreakdownNoShipping.reduce((acc, curr) => {
			acc[curr.name] = (acc[curr.name] || 0) + curr.cost;
			return acc;
		}, {} as Record<string, number>);

		if (globalShippingFee > 0) {
			grouped['Versand Hardware'] = globalShippingFee;
		}
		return grouped;
	}, [oneTimeBreakdownNoShipping, globalShippingFee]);

	const totalCredits = useMemo(() => {
		return basketCredits.reduce((acc, credit) => acc + credit.value, 0);
	}, [basketCredits]);

	const totalOneTime = useMemo(() => {
		return (totalOneTimeItems + globalShippingFee) - totalCredits;
	}, [totalOneTimeItems, globalShippingFee, totalCredits]);

	return {
		totals,
		combinedSteps,
		groupedOneTimeCosts,
		totalOneTime,
		totalCredits,
		hasDevice,
		deviceShippingCost: globalShippingFee,
		settings,
	};
}
