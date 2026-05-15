import {
	useEffect, useMemo, useState,
} from 'react';
import type {
	MagentaTVPackageKey,
} from '@/lib/constants/pricing';
import {
	trpc,
} from '@/lib/trpc';
import type {
	Product,
	BusinessCase,
	SpecialPrice,
	CalculationResult,
	Credit,
	PricingSettings,
	HardwareTier,
	CalculationInput,
} from '@/types/product';

export const DEFAULT_PRICING: PricingSettings = {
	magentatv_smart_price: 10,
	magentatv_smartstream_price: 17,
	magentatv_megastream_price: 30,
	shipping_hardware_fee: 6.95,
	plus_karte_first_price: 19.95,
	plus_karte_following_price: 9.95,
	mobile_tier_smartphone: 10,
	mobile_tier_top: 20,
	mobile_tier_premium: 30,
	mobile_tier_premium_plus: 40,
};

export type { BusinessCase, HardwareTier, CalculationInput };
export type { MagentaTVPackageKey };

export function calculateProductCosts({
	product,
	businessCase,
	magentaTVPackage,
	selectedSpecialPriceIds,
	selectedAddonIds,
	vouchers,
	credits = [
	],
	hardwarePurchaseType,
	plusKartenCount,
	settings = DEFAULT_PRICING,
	customBasePrice,
	hardwareTier = 'none',
}: CalculationInput): CalculationResult {
	if (!product) {
		return {
			monthlyCosts: [
			],
			averageMonthlyCost: 0,
			totalCost24Months: 0,
			oneTimeCosts: {
				total: 0,
				breakdown: [
				],
			},
			basePrice: 0,
			effectiveBasePrice: 0,
			plusKartenCost: 0,
			hasUnlimitedAdvantage: false,
			regularAddonCost: 0,
			regularMagentaTVCost: 0,
		};
	}

	const isMagentaTVSelected = magentaTVPackage !== null;
	let tvPackagePrice = 0;
	if (magentaTVPackage === 'smart') { tvPackagePrice = settings.magentatv_smart_price; }
	else if (magentaTVPackage === 'smartstream') { tvPackagePrice = settings.magentatv_smartstream_price; }
	else if (magentaTVPackage === 'megastream') { tvPackagePrice = settings.magentatv_megastream_price; }

	// const duration = product.contractDuration || 24;

	// 1. Determine Base Price (Standard or Bundle or Hardware)
	let effectiveBasePrice = product.basePrice;

	if (product.category === 'DEVICE') {
		if (hardwarePurchaseType === 'BUY') {
			effectiveBasePrice = 0; // The monthly cost for hardware is 0 if bought
		}
		else if (hardwarePurchaseType === 'RENT') {
			effectiveBasePrice = product.rentalPrice ?? product.basePrice;
		}
		else {
			// Default to rental price or base if none selected
			effectiveBasePrice = product.rentalPrice ?? product.basePrice;
		}
	}
	else if (isMagentaTVSelected && product.magentaTVBundlePrice) {
		// If MagentaTV is selected, we might have a different base price for the bundle
		effectiveBasePrice = product.magentaTVBundlePrice;
	}

	if (customBasePrice !== undefined) {
		effectiveBasePrice = customBasePrice;
	}

	// Hardware Tier Surcharge (MOBILE only)
	let hardwareTierSurcharge = 0;
	if (product.category === 'MOBILE' && hardwareTier !== 'none') {
		switch (hardwareTier) {
			case 'smartphone':
				hardwareTierSurcharge = settings.mobile_tier_smartphone;
				break;
			case 'top':
				hardwareTierSurcharge = settings.mobile_tier_top;
				break;
			case 'premium':
				hardwareTierSurcharge = settings.mobile_tier_premium;
				break;
			case 'premium_plus':
				hardwareTierSurcharge = settings.mobile_tier_premium_plus;
				break;
			default:
				break;
		}
		effectiveBasePrice += hardwareTierSurcharge;
	}

	// 2. Determine One-Time Costs (Activation Fee)
	let oneTimeTotal = 0;
	const oneTimeBreakdown: { name: string; cost: number }[] = [
	];

	// Hardware Purchases
	if (product.category === 'DEVICE' && hardwarePurchaseType === 'BUY' && product.purchasePrice) {
		oneTimeTotal += product.purchasePrice;
		oneTimeBreakdown.push({
			name: 'Kaufpreis Endgerät',
			cost: product.purchasePrice,
		});
	}

	let activationFee = 0;
	switch (businessCase) {
		case 'NEW_ACTIVATION':
			activationFee = product.activationFeeNew ?? 0;
			break;
		case 'MOVE':
			activationFee = product.activationFeeMove ?? 0;
			break;
		case 'PLAN_CHANGE':
			activationFee = product.activationFeePlanChange ?? 0;
			break;
		case 'SPEED_UP':
			activationFee = product.activationFeeSpeedUp ?? 0;
			break;
		default:
			activationFee = 0;
			break;
	}

	if (customBasePrice !== undefined) {
		activationFee = 0;
	}

	if (activationFee > 0) {
		oneTimeTotal += activationFee;
		oneTimeBreakdown.push({
			name: 'Bereitstellungspauschale Tarif',
			cost: activationFee,
		});
	}

	if (product.category === 'DEVICE') {
		oneTimeTotal += settings.shipping_hardware_fee;
		oneTimeBreakdown.push({
			name: 'Versand Hardware',
			cost: settings.shipping_hardware_fee,
		});
	}

	// Credits
	credits.forEach(credit => {
		oneTimeTotal -= credit.value;
		oneTimeBreakdown.push({
			name: credit.name || 'Gutschrift',
			cost: -credit.value,
		});
	});

	// Subtract one-time vouchers
	const totalVouchers = vouchers.reduce((a, b) => a + b, 0);
	if (totalVouchers > 0) {
		oneTimeTotal -= totalVouchers;
		oneTimeBreakdown.push({
			name: 'Guthaben / Voucher',
			cost: -totalVouchers,
		});
	}

	// 3. Calculate Monthly Costs
	const monthlyCosts = [
	];
	let sumMonthlyCosts = 0;

	// Find selected special price objects
	const activeSpecialPrices = product.specialPrices.filter(sp =>
		selectedSpecialPriceIds.includes(sp.id),
	);

	// Calculate Addon Costs (constant per month for now)
	const activeTiers = (product.compatibleAddons || [
	]).flatMap(a => a.tiers || [
	]).filter(t =>
		selectedAddonIds.includes(t.id),
	);
	const monthlyAddonCost = activeTiers.reduce((sum, tier) => sum + tier.price, 0);

	const pkCount = plusKartenCount || 0;
	const plusKartenCostPerMonth = pkCount >= 1
		? (settings.plus_karte_first_price + Math.max(0, pkCount - 1) * settings.plus_karte_following_price)
		: 0;

	const productNameLower = product.name.toLowerCase();
	const isAtLeastM = productNameLower.includes('magentamobil m') ||
		productNameLower.includes('magentamobil l') ||
		productNameLower.includes('magentamobil xl');
	const hasUnlimitedAdvantage = isAtLeastM && pkCount > 0;

	for (let month = 1; month <= 24; month++) {
		let bestBasePrice = effectiveBasePrice;
		let bestTVCost = tvPackagePrice;

		let appliedBasePriceSpecial: SpecialPrice | undefined;
		let appliedTVSpecial: SpecialPrice | undefined;

		for (const sp of activeSpecialPrices) {
			const matchingTier = sp.tiers.find(t => month >= t.fromMonth && month <= t.toMonth);
			if (matchingTier) {
				const target = matchingTier.discountTarget || sp.discountTarget;
				const type = matchingTier.discountType || sp.discountType;

				if (target === 'MAGENTA_TV') {
					let simulatedCost = type === 'RELATIVE'
						? tvPackagePrice - matchingTier.price
						: matchingTier.price;

					if (simulatedCost < 0) { simulatedCost = 0; }

					if (simulatedCost < bestTVCost) {
						bestTVCost = simulatedCost;
						appliedTVSpecial = sp;
					}
				}
				else {
					let simulatedCost = type === 'RELATIVE'
						? effectiveBasePrice - matchingTier.price
						: matchingTier.price;

					if (simulatedCost < 0) { simulatedCost = 0; }

					if (simulatedCost < bestBasePrice) {
						bestBasePrice = simulatedCost;
						appliedBasePriceSpecial = sp;
					}
				}
			}
		}

		const totalMonthCost = bestBasePrice + monthlyAddonCost + bestTVCost + plusKartenCostPerMonth;
		sumMonthlyCosts += totalMonthCost;

		monthlyCosts.push({
			month,
			basePrice: effectiveBasePrice,
			effectivePrice: bestBasePrice,
			specialPriceApplied: appliedBasePriceSpecial || appliedTVSpecial,
			addonCosts: monthlyAddonCost,
			magentaTVCost: bestTVCost,
			total: totalMonthCost,
		});
	}

	const totalCost24Months = sumMonthlyCosts + oneTimeTotal;
	const averageMonthlyCost = totalCost24Months / 24;

	// Daily price trivialization (using exact monthly average)
	const dailyPrice = averageMonthlyCost / 30;
	const dailyPriceFormatted = dailyPrice < 1
		? `${(dailyPrice * 100).toFixed(0)} Cent`
		: `${dailyPrice.toFixed(2)} €`;

	return {
		monthlyCosts,
		averageMonthlyCost,
		totalCost24Months,
		oneTimeCosts: {
			total: oneTimeTotal,
			breakdown: oneTimeBreakdown,
		},
		basePrice: product.basePrice,
		effectiveBasePrice,
		dailyPriceTrivialization: dailyPriceFormatted,
		plusKartenCost: plusKartenCostPerMonth,
		hasUnlimitedAdvantage,
		regularAddonCost: monthlyAddonCost,
		regularMagentaTVCost: tvPackagePrice,
	};
}

export function useCostCalculator(
	product: Product | undefined | null,
	initialBusinessCase: BusinessCase = 'NEW_ACTIVATION',
) {
	const [
		businessCase,
		setBusinessCase,
	] = useState<BusinessCase>(initialBusinessCase);
	const [
		selectedSpecialPriceIds,
		setSelectedSpecialPriceIds,
	] = useState<string[]>([
	]);
	const [
		magentaTVPackage,
		setMagentaTVPackage,
	] = useState<MagentaTVPackageKey | null>(null);
	const [
		selectedAddonIds,
		setSelectedAddonIds,
	] = useState<string[]>([
	]);
	// Vouchers in state
	const [
		vouchers,
		setVouchers,
	] = useState<number[]>([
	]);

	const [
		availableCredits,
		setAvailableCredits,
	] = useState<Credit[]>([
	]);
	const [
		selectedCreditIds,
		setSelectedCreditIds,
	] = useState<string[]>([
	]);

	const [
		hardwarePurchaseType,
		setHardwarePurchaseType,
	] = useState<'RENT' | 'BUY'>('RENT');
	const [
		plusKartenCount,
		setPlusKartenCount,
	] = useState<number>(0);
	const [
		customBasePrice,
		setCustomBasePrice,
	] = useState<number | undefined>(undefined);
	const [
		hardwareTier,
		setHardwareTier,
	] = useState<HardwareTier>('none');

	// Derived boolean for backward compat
	const isMagentaTVSelected = magentaTVPackage !== null || product?.category === 'MAGENTA_TV_OTT';

	// Auto-deselect special prices whose conditions are no longer met
	useEffect(() => {
		if (!product || selectedSpecialPriceIds.length === 0) { return; }

		const stillValid = selectedSpecialPriceIds.filter(spId => {
			const sp = product.specialPrices.find(s => s.id === spId);
			if (!sp) { return false; }
			if (sp.magentaTVRequirement === 'REQUIRED' && !isMagentaTVSelected) { return false; }
			if (sp.magentaTVRequirement === 'NOT_ALLOWED' && isMagentaTVSelected) { return false; }
			if (sp.requiresMove && businessCase !== 'MOVE') { return false; }
			if (sp.requiresNewActivation && businessCase !== 'NEW_ACTIVATION') { return false; }
			if (sp.requiresSpeedUp && businessCase !== 'SPEED_UP') { return false; }
			return true;
		});

		if (stillValid.length !== selectedSpecialPriceIds.length) {
			setSelectedSpecialPriceIds(stillValid);
		}
	}, [
		isMagentaTVSelected,
		businessCase,
		product,
		selectedSpecialPriceIds,
	]);

	// Auto-deselect addons whose conditions are no longer met
	useEffect(() => {
		if (!product || !product.compatibleAddons || selectedAddonIds.length === 0) { return; }

		const stillValid = selectedAddonIds.filter(tierId => {
			const addon = product.compatibleAddons!.find(a => (a.tiers || [
			]).some(t => t.id === tierId));
			if (!addon) { return false; }
			if (addon.magentaTVRequirement === 'REQUIRED' && !isMagentaTVSelected) { return false; }
			if (addon.magentaTVRequirement === 'NOT_ALLOWED' && isMagentaTVSelected) { return false; }
			return true;
		});

		if (stillValid.length !== selectedAddonIds.length) {
			setSelectedAddonIds(stillValid);
		}
	}, [
		isMagentaTVSelected,
		product,
		selectedAddonIds,
	]);

	const {
		data: pricingSettings,
	} = trpc.settings.getPricingSettings.useQuery(undefined, {
		staleTime: 10 * 60 * 1000,
	});
	const settings = pricingSettings || DEFAULT_PRICING;

	const businessCaseOptions = [
		{
			id: 'NEW_ACTIVATION',
			label: 'Neuvertrag',
		},
		{
			id: 'MOVE',
			label: 'Umzug',
		},
		{
			id: 'PLAN_CHANGE',
			label: 'Tarifwechsel',
		},
		{
			id: 'SPEED_UP',
			label: 'Upgrade',
		},
	];

	const calculation = useMemo((): CalculationResult => {
		if (!product) {
			return {
				monthlyCosts: [
				],
				averageMonthlyCost: 0,
				totalCost24Months: 0,
				oneTimeCosts: {
					total: 0,
					breakdown: [
					],
				},
				basePrice: 0,
				effectiveBasePrice: 0,
				plusKartenCost: 0,
				hasUnlimitedAdvantage: false,
				regularAddonCost: 0,
				regularMagentaTVCost: 0,
			};
		}

		const activeCredits = availableCredits.filter(c => selectedCreditIds.includes(c.id));

		return calculateProductCosts({
			product,
			businessCase,
			magentaTVPackage,
			selectedSpecialPriceIds,
			selectedAddonIds,
			vouchers,
			credits: activeCredits,
			hardwarePurchaseType,
			plusKartenCount,
			settings,
			customBasePrice,
			hardwareTier,
		});
	}, [
		product,
		businessCase,
		magentaTVPackage,
		selectedSpecialPriceIds,
		selectedAddonIds,
		vouchers,
		availableCredits,
		selectedCreditIds,
		hardwarePurchaseType,
		plusKartenCount,
		settings,
		customBasePrice,
		hardwareTier,
	]);

	return {
		businessCase,
		setBusinessCase,
		selectedSpecialPriceIds,
		setSelectedSpecialPriceIds,
		businessCaseOptions,
		isMagentaTVSelected,
		magentaTVPackage,
		setMagentaTVPackage,
		selectedAddonIds,
		setSelectedAddonIds,
		vouchers,
		setVouchers,
		selectedCreditIds,
		setSelectedCreditIds,
		setAvailableCredits,
		calculation,
		hardwarePurchaseType,
		setHardwarePurchaseType,
		plusKartenCount,
		setPlusKartenCount,
		settings,
		customBasePrice,
		setCustomBasePrice,
		hardwareTier,
		setHardwareTier,
	};
}
