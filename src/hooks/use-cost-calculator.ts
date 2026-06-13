import {
	useEffect, useMemo, useState, useCallback,
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
	plus_karte_following_price: 14.95,
	plus_karte_flex_price: 19.95,
	plus_karte_kids_price: 9.95,
	plus_karte_activation_fee_normal: 19.95,
	plus_karte_activation_fee_flex: 19.95,
	plus_karte_activation_fee_kids: 0,
	plus_karte_promo_free_activation_normal: true,
	plus_karte_promo_free_activation_flex: true,
	mobile_tier_smartphone: 10,
	mobile_tier_top: 20,
	mobile_tier_premium: 30,
	mobile_tier_premium_plus: 40,
};

export type {
	BusinessCase, CalculationInput,
};
export type {
	MagentaTVPackageKey,
};

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
	plusKarten,
	settings = DEFAULT_PRICING,
	customBasePrice,
	hardwareTier = 'none',
	isHybrid = false,
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
	if (customBasePrice !== undefined) {
		effectiveBasePrice = customBasePrice;
	}
	else if (product.category === 'DEVICE') {
		effectiveBasePrice = hardwarePurchaseType === 'BUY'
			? 0
			: (product.rentalPrice ?? product.basePrice);
	}
	else if (isMagentaTVSelected && product.magentaTVBundlePrice) {
		effectiveBasePrice = product.magentaTVBundlePrice;
	}

	// Hardware Tier Surcharge (MOBILE only)
	if (product.category === 'MOBILE' && hardwareTier !== 'none') {
		const SURCHARGES: Record<string, number> = {
			smartphone: settings.mobile_tier_smartphone,
			top: settings.mobile_tier_top,
			premium: settings.mobile_tier_premium,
			premium_plus: settings.mobile_tier_premium_plus,
		};
		effectiveBasePrice += SURCHARGES[hardwareTier] ?? 0;
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

	const activationFeeMap: Record<BusinessCase, number | null | undefined> = {
		NEW_ACTIVATION: product.activationFeeNew,
		MOVE: product.activationFeeMove,
		PLAN_CHANGE: product.activationFeePlanChange,
		SPEED_UP: product.activationFeeSpeedUp,
	};
	const activationFee = (customBasePrice !== undefined)
		? 0
		: (activationFeeMap[businessCase] ?? 0);

	if (activationFee > 0) {
		oneTimeTotal += activationFee;
		const fullName = `Bereitstellungspauschale ${product.name}`;
		const displayName = fullName.length > 42
			? `Bereitstellungspauschale ${product.name
				.replace(/MagentaZuhause/g, 'MZ')
				.replace(/MagentaMobil/g, 'MM')
				.replace(/Glasfaser/g, 'GF')
				.replace(/MagentaTV/g, 'MTV')}`
			: fullName;
		oneTimeBreakdown.push({
			name: displayName,
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

	// Resolve the 3 PlusKarten variants count (backward compatible)
	const pkNormal = plusKarten?.normal ?? plusKartenCount ?? 0;
	const pkFlex = plusKarten?.flex ?? 0;
	const pkKids = plusKarten?.kidsTeens ?? 0;

	// Promotional Activation Fees
	if (pkNormal > 0) {
		const fee = settings.plus_karte_activation_fee_normal;
		const promoActive = settings.plus_karte_promo_free_activation_normal;
		if (promoActive) {
			oneTimeBreakdown.push({
				name: `Bereitstellung PlusKarte Normal (Aktionspreis: 0 € statt ${(pkNormal * fee).toFixed(2).replace('.', ',')} €)`,
				cost: 0,
			});
		} else {
			const totalFee = pkNormal * fee;
			oneTimeTotal += totalFee;
			oneTimeBreakdown.push({
				name: `Bereitstellung PlusKarte Normal (${pkNormal}x ${fee.toFixed(2).replace('.', ',')} €)`,
				cost: totalFee,
			});
		}
	}
	if (pkFlex > 0) {
		const fee = settings.plus_karte_activation_fee_flex;
		const promoActive = settings.plus_karte_promo_free_activation_flex;
		if (promoActive) {
			oneTimeBreakdown.push({
				name: `Bereitstellung PlusKarte Flex (Aktionspreis: 0 € statt ${(pkFlex * fee).toFixed(2).replace('.', ',')} €)`,
				cost: 0,
			});
		} else {
			const totalFee = pkFlex * fee;
			oneTimeTotal += totalFee;
			oneTimeBreakdown.push({
				name: `Bereitstellung PlusKarte Flex (${pkFlex}x ${fee.toFixed(2).replace('.', ',')} €)`,
				cost: totalFee,
			});
		}
	}
	if (pkKids > 0) {
		const fee = settings.plus_karte_activation_fee_kids;
		if (fee === 0) {
			oneTimeBreakdown.push({
				name: 'Bereitstellung PlusKarte Kids & Teens',
				cost: 0,
			});
		} else {
			const totalFee = pkKids * fee;
			oneTimeTotal += totalFee;
			oneTimeBreakdown.push({
				name: `Bereitstellung PlusKarte Kids & Teens (${pkKids}x ${fee.toFixed(2).replace('.', ',')} €)`,
				cost: totalFee,
			});
		}
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

	// Multi-Variant PlusKarten Calculations
	const normalCost = pkNormal > 0
		? (settings.plus_karte_first_price + Math.max(0, pkNormal - 1) * settings.plus_karte_following_price)
		: 0;
	const flexCost = pkFlex * settings.plus_karte_flex_price;
	const kidsCost = pkKids * settings.plus_karte_kids_price;
	const plusKartenCostPerMonth = normalCost + flexCost + kidsCost;

	const totalPlusKarten = pkNormal + pkFlex + pkKids;
	const hasUnlimitedAdvantage = product.allowsUnlimitedAdvantage && totalPlusKarten > 0;

	for (let month = 1; month <= 24; month++) {
		let bestBasePrice = effectiveBasePrice;
		let bestTVCost = tvPackagePrice;

		let appliedBasePriceSpecial: SpecialPrice | undefined;
		let appliedTVSpecial: SpecialPrice | undefined;

		for (const sp of activeSpecialPrices) {
			const matchingTier = sp.tiers.find(t => month >= t.fromMonth && month <= t.toMonth);
			if (!matchingTier) { continue; }

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
		rawSetBusinessCase,
	] = useState<BusinessCase>(initialBusinessCase);
	const [
		selectedSpecialPriceIds,
		setSelectedSpecialPriceIds,
	] = useState<string[]>([
	]);
	const [
		magentaTVPackage,
		rawSetMagentaTVPackage,
	] = useState<MagentaTVPackageKey | null>(null);
	const [
		isHybrid,
		setIsHybrid,
	] = useState<boolean>(false);
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
		plusKarten,
		setPlusKarten,
	] = useState<{ normal: number; flex: number; kidsTeens: number }>({
		normal: 0,
		flex: 0,
		kidsTeens: 0,
	});

	const plusKartenCount = plusKarten.normal + plusKarten.flex + plusKarten.kidsTeens;
	const setPlusKartenCount = (count: number) => {
		setPlusKarten(prev => ({ ...prev, normal: count }));
	};

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

	const pruneSpecialPrices = useCallback((
		bc: BusinessCase,
		pkg: MagentaTVPackageKey | null,
		priceIds: string[]
	) => {
		if (!product || priceIds.length === 0) { return priceIds; }
		const isMTVSelected = pkg !== null || product.category === 'MAGENTA_TV_OTT';
		return priceIds.filter(spId => {
			const sp = product.specialPrices.find(s => s.id === spId);
			if (!sp) { return false; }
			if (sp.magentaTVRequirement === 'REQUIRED' && !isMTVSelected) { return false; }
			if (sp.magentaTVRequirement === 'NOT_ALLOWED' && isMTVSelected) { return false; }
			if (sp.magentaTVRequirement === 'ONLY_SMART' && pkg !== 'smart') { return false; }
			if (sp.magentaTVRequirement === 'ONLY_SMARTSTREAM' && pkg !== 'smartstream') { return false; }
			if (sp.magentaTVRequirement === 'ONLY_MEGASTREAM' && pkg !== 'megastream') { return false; }
			if (sp.requiresMove || sp.requiresNewActivation || sp.requiresSpeedUp) {
				if (bc === 'MOVE' && !sp.requiresMove) { return false; }
				if (bc === 'NEW_ACTIVATION' && !sp.requiresNewActivation) { return false; }
				if (bc === 'SPEED_UP' && !sp.requiresSpeedUp) { return false; }
				if (bc === 'PLAN_CHANGE') { return false; }
			}
			return true;
		});
	}, [product]);

	const pruneAddons = useCallback((
		pkg: MagentaTVPackageKey | null,
		addonIds: string[]
	) => {
		if (!product || !product.compatibleAddons || addonIds.length === 0) { return addonIds; }
		const isMTVSelected = pkg !== null || product.category === 'MAGENTA_TV_OTT';
		return addonIds.filter(tierId => {
			const addon = product.compatibleAddons!.find(a => (a.tiers || [
			]).some(t => t.id === tierId));
			if (!addon) { return false; }
			if (addon.magentaTVRequirement === 'REQUIRED' && !isMTVSelected) { return false; }
			if (addon.magentaTVRequirement === 'NOT_ALLOWED' && isMTVSelected) { return false; }
			if (addon.magentaTVRequirement === 'ONLY_SMART' && pkg !== 'smart') { return false; }
			if (addon.magentaTVRequirement === 'ONLY_SMARTSTREAM' && pkg !== 'smartstream') { return false; }
			if (addon.magentaTVRequirement === 'ONLY_MEGASTREAM' && pkg !== 'megastream') { return false; }
			return true;
		});
	}, [product]);

	const setBusinessCase = useCallback((
		value: BusinessCase | ((prev: BusinessCase) => BusinessCase)
	) => {
		rawSetBusinessCase(prev => {
			const nextBc = typeof value === 'function' ? value(prev) : value;
			setSelectedSpecialPriceIds(currentIds => pruneSpecialPrices(nextBc, magentaTVPackage, currentIds));
			return nextBc;
		});
	}, [magentaTVPackage, pruneSpecialPrices]);

	const setMagentaTVPackage = useCallback((
		value: MagentaTVPackageKey | null | ((prev: MagentaTVPackageKey | null) => MagentaTVPackageKey | null)
	) => {
		rawSetMagentaTVPackage(prev => {
			const nextPkg = typeof value === 'function' ? value(prev) : value;
			setSelectedSpecialPriceIds(currentIds => pruneSpecialPrices(businessCase, nextPkg, currentIds));
			setSelectedAddonIds(currentIds => pruneAddons(nextPkg, currentIds));
			return nextPkg;
		});
	}, [businessCase, pruneSpecialPrices, pruneAddons]);

	// Prune on product change
	useEffect(() => {
		if (product) {
			setSelectedSpecialPriceIds(prev => pruneSpecialPrices(businessCase, magentaTVPackage, prev));
			setSelectedAddonIds(prev => pruneAddons(magentaTVPackage, prev));
		}
	}, [product, businessCase, magentaTVPackage, pruneSpecialPrices, pruneAddons]);

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

		const validSpecialPriceIds = selectedSpecialPriceIds.filter(spId => {
			const sp = product.specialPrices.find(s => s.id === spId);
			if (!sp) { return false; }
			if (sp.magentaTVRequirement === 'REQUIRED' && !isMagentaTVSelected) { return false; }
			if (sp.magentaTVRequirement === 'NOT_ALLOWED' && isMagentaTVSelected) { return false; }
			if (sp.magentaTVRequirement === 'ONLY_SMART' && magentaTVPackage !== 'smart') { return false; }
			if (sp.magentaTVRequirement === 'ONLY_SMARTSTREAM' && magentaTVPackage !== 'smartstream') { return false; }
			if (sp.magentaTVRequirement === 'ONLY_MEGASTREAM' && magentaTVPackage !== 'megastream') { return false; }
			if (sp.requiresMove || sp.requiresNewActivation || sp.requiresSpeedUp) {
				if (businessCase === 'MOVE' && !sp.requiresMove) { return false; }
				if (businessCase === 'NEW_ACTIVATION' && !sp.requiresNewActivation) { return false; }
				if (businessCase === 'SPEED_UP' && !sp.requiresSpeedUp) { return false; }
				if (businessCase === 'PLAN_CHANGE') { return false; }
			}
			return true;
		});

		const validAddonIds = selectedAddonIds.filter(tierId => {
			const addon = product.compatibleAddons!.find(a => (a.tiers || [
			]).some(t => t.id === tierId));
			if (!addon) { return false; }
			if (addon.magentaTVRequirement === 'REQUIRED' && !isMagentaTVSelected) { return false; }
			if (addon.magentaTVRequirement === 'NOT_ALLOWED' && isMagentaTVSelected) { return false; }
			if (addon.magentaTVRequirement === 'ONLY_SMART' && magentaTVPackage !== 'smart') { return false; }
			if (addon.magentaTVRequirement === 'ONLY_SMARTSTREAM' && magentaTVPackage !== 'smartstream') { return false; }
			if (addon.magentaTVRequirement === 'ONLY_MEGASTREAM' && magentaTVPackage !== 'megastream') { return false; }
			return true;
		});

		return calculateProductCosts({
			product,
			businessCase,
			magentaTVPackage,
			selectedSpecialPriceIds: validSpecialPriceIds,
			selectedAddonIds: validAddonIds,
			vouchers,
			credits: activeCredits,
			hardwarePurchaseType,
			plusKartenCount,
			plusKarten,
			settings,
			customBasePrice,
			hardwareTier,
			isHybrid,
		});
	}, [
		product,
		businessCase,
		magentaTVPackage,
		isMagentaTVSelected,
		selectedSpecialPriceIds,
		selectedAddonIds,
		vouchers,
		availableCredits,
		selectedCreditIds,
		hardwarePurchaseType,
		plusKartenCount,
		plusKarten,
		settings,
		customBasePrice,
		hardwareTier,
		isHybrid,
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
		plusKarten,
		setPlusKarten,
		settings,
		customBasePrice,
		setCustomBasePrice,
		hardwareTier,
		setHardwareTier,
		isHybrid,
		setIsHybrid,
	};
}
