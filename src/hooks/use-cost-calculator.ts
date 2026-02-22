import { useEffect, useMemo, useState } from 'react';

export type SpecialPrice = {
    id: string;
    name: string;
    requiresMagentaTV: boolean;
    requiresSpeedUp: boolean;
    requiresMove: boolean;
    isActive: boolean;
    priority: number;
    tiers: {
        price: number;
        fromMonth: number;
        toMonth: number;
    }[];
};

export type AddonTier = {
    id: string;
    name: string;
    price: number;
    addonId: string;
};

export type Addon = {
    id: string;
    name: string;
    description: string | null;
    requiresNoMagentaTV: boolean;
    tiers: AddonTier[];
};

export type Product = {
    id: string;
    name: string;
    category: string;
    basePrice: number;
    contractDuration: number | null;
    activationFeeNew: number | null;
    activationFeeMove: number | null;
    activationFeePlanChange: number | null;
    activationFeeSpeedUp: number | null;
    magentaTVBundlePrice: number | null;
    specialPrices: SpecialPrice[];
    compatibleAddons?: Addon[];

    // Devices
    deviceManufacturer?: string | null;
    purchasePrice?: number | null;
    rentalPrice?: number | null;
};

export type BusinessCase = 'NEW_ACTIVATION' | 'MOVE' | 'PLAN_CHANGE' | 'SPEED_UP';

// MagentaTV packages definition
export const MAGENTA_TV_PACKAGES = {
    smart: {
        name: 'MagentaTV Smart',
        shortName: 'Smart',
        price: 10,
        features: [
            'Alle Spiele der FIFA WM nur bei MagentaTV',
            'MagentaTV+',
            'RTL+ Premium'
        ]
    },
    smartstream: {
        name: 'MagentaTV SmartStream',
        shortName: 'SmartStream',
        price: 17,
        features: [
            'Alle Spiele der FIFA WM nur bei MagentaTV',
            'Netflix Standard-Abo mit Werbung',
            'Disney+ Standard mit Werbung',
            'RTL+ Premium'
        ]
    },
    megastream: {
        name: 'MagentaTV MegaStream',
        shortName: 'MegaStream',
        price: 30,
        features: [
            'Alle Spiele der FIFA WM nur bei MagentaTV',
            'Netflix Standard-Abo',
            'Disney+ Standard',
            'RTL+ Premium',
            'AppleTV+'
        ]
    }
} as const;

export type MagentaTVPackageKey = keyof typeof MAGENTA_TV_PACKAGES;

export interface CalculationResult {
    monthlyCosts: {
        month: number;
        basePrice: number;
        effectivePrice: number;
        specialPriceApplied?: SpecialPrice;
        addonCosts: number;
        magentaTVCost: number;
        total: number;
    }[];
    averageMonthlyCost: number;
    totalCost24Months: number;
    oneTimeCosts: { total: number; breakdown: { name: string; cost: number }[] };
    basePrice: number;
    effectiveBasePrice: number; // The standard price (with TV if selected)
    dailyPriceTrivialization?: string;
}

export type Credit = {
    id: string;
    name: string;
    value: number;
}

interface CalculationInput {
    product: Product;
    businessCase: BusinessCase;
    magentaTVPackage: MagentaTVPackageKey | null;
    selectedSpecialPriceIds: string[];
    selectedAddonIds: string[];
    vouchers: number[];
    credits?: Credit[];
    hardwarePurchaseType?: 'RENT' | 'BUY';
}

export function calculateProductCosts({
    product,
    businessCase,
    magentaTVPackage,
    selectedSpecialPriceIds,
    selectedAddonIds,
    vouchers,
    credits = [],
    hardwarePurchaseType
}: CalculationInput): CalculationResult {
    if (!product) {
        return {
            monthlyCosts: [],
            averageMonthlyCost: 0,
            totalCost24Months: 0,
            oneTimeCosts: { total: 0, breakdown: [] },
            basePrice: 0,
            effectiveBasePrice: 0,
        };
    }

    const isMagentaTVSelected = magentaTVPackage !== null;
    const tvPackagePrice = magentaTVPackage ? MAGENTA_TV_PACKAGES[magentaTVPackage].price : 0;

    const duration = product.contractDuration || 24;

    // 1. Determine Base Price (Standard or Bundle or Hardware)
    let effectiveBasePrice = product.basePrice;

    if (product.category === "DEVICE") {
        if (hardwarePurchaseType === 'BUY') {
            effectiveBasePrice = 0; // The monthly cost for hardware is 0 if bought
        } else if (hardwarePurchaseType === 'RENT') {
            effectiveBasePrice = product.rentalPrice ?? product.basePrice;
        } else {
            // Default to rental price or base if none selected
            effectiveBasePrice = product.rentalPrice ?? product.basePrice;
        }
    } else {
        // If MagentaTV is selected, we might have a different base price for the bundle
        if (isMagentaTVSelected && product.magentaTVBundlePrice) {
            effectiveBasePrice = product.magentaTVBundlePrice;
        }
    }

    // 2. Determine One-Time Costs (Activation Fee)
    let oneTimeTotal = 0;
    const oneTimeBreakdown: { name: string; cost: number }[] = [];

    // Hardware Purchases
    if (product.category === "DEVICE" && hardwarePurchaseType === 'BUY' && product.purchasePrice) {
        oneTimeTotal += product.purchasePrice;
        oneTimeBreakdown.push({ name: "Kaufpreis Endgerät", cost: product.purchasePrice });
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
    }

    if (activationFee > 0) {
        oneTimeTotal += activationFee;
        oneTimeBreakdown.push({ name: "Bereitstellungspauschale Tarif", cost: activationFee });
    }

    // Credits
    credits.forEach(credit => {
        oneTimeTotal -= credit.value;
        oneTimeBreakdown.push({ name: credit.name || "Gutschrift", cost: -credit.value });
    });

    // Subtract one-time vouchers
    const totalVouchers = vouchers.reduce((a, b) => a + b, 0);
    if (totalVouchers > 0) {
        oneTimeTotal -= totalVouchers;
        oneTimeBreakdown.push({ name: "Guthaben / Voucher", cost: -totalVouchers });
    }

    // 3. Calculate Monthly Costs
    const monthlyCosts = [];
    let sumMonthlyCosts = 0;

    // Find selected special price objects
    const activeSpecialPrices = product.specialPrices.filter(sp =>
        selectedSpecialPriceIds.includes(sp.id)
    );

    // Calculate Addon Costs (constant per month for now)
    const activeTiers = (product.compatibleAddons || []).flatMap(a => a.tiers || []).filter(t =>
        selectedAddonIds.includes(t.id)
    );
    const monthlyAddonCost = activeTiers.reduce((sum, tier) => sum + tier.price, 0);

    for (let month = 1; month <= 24; month++) {
        let monthPrice = effectiveBasePrice;
        let appliedSpecialPrice: SpecialPrice | undefined;

        // Check for applicable special prices for this month
        // For each active special price, find if any tier covers this month
        let bestTierPrice: number | undefined;
        let bestSpecialPrice: SpecialPrice | undefined;

        for (const sp of activeSpecialPrices) {
            const matchingTier = sp.tiers.find(t => month >= t.fromMonth && month <= t.toMonth);
            if (matchingTier) {
                if (bestTierPrice === undefined || matchingTier.price < bestTierPrice) {
                    bestTierPrice = matchingTier.price;
                    bestSpecialPrice = sp;
                }
            }
        }

        if (bestTierPrice !== undefined) {
            monthPrice = bestTierPrice;
            appliedSpecialPrice = bestSpecialPrice;
        }

        const totalMonthCost = monthPrice + monthlyAddonCost + tvPackagePrice;
        sumMonthlyCosts += totalMonthCost;

        monthlyCosts.push({
            month,
            basePrice: effectiveBasePrice,
            effectivePrice: monthPrice,
            specialPriceApplied: appliedSpecialPrice,
            addonCosts: monthlyAddonCost,
            magentaTVCost: tvPackagePrice,
            total: totalMonthCost
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
        oneTimeCosts: { total: oneTimeTotal, breakdown: oneTimeBreakdown },
        basePrice: product.basePrice,
        effectiveBasePrice,
        dailyPriceTrivialization: dailyPriceFormatted
    }
}

export function useCostCalculator(
    product: Product | undefined | null,
    initialBusinessCase: BusinessCase = 'NEW_ACTIVATION'
) {
    const [businessCase, setBusinessCase] = useState<BusinessCase>(initialBusinessCase);
    const [selectedSpecialPriceIds, setSelectedSpecialPriceIds] = useState<string[]>([]);
    const [magentaTVPackage, setMagentaTVPackage] = useState<MagentaTVPackageKey | null>(null);
    const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
    // Vouchers in state
    const [vouchers, setVouchers] = useState<number[]>([]);

    const [availableCredits, setAvailableCredits] = useState<Credit[]>([]);
    const [selectedCreditIds, setSelectedCreditIds] = useState<string[]>([]);

    const [hardwarePurchaseType, setHardwarePurchaseType] = useState<'RENT' | 'BUY'>('RENT');

    // Derived boolean for backward compat
    const isMagentaTVSelected = magentaTVPackage !== null;

    // Auto-deselect special prices whose conditions are no longer met
    useEffect(() => {
        if (!product || selectedSpecialPriceIds.length === 0) return;

        const stillValid = selectedSpecialPriceIds.filter(spId => {
            const sp = product.specialPrices.find(s => s.id === spId);
            if (!sp) return false;
            if (sp.requiresMagentaTV && !isMagentaTVSelected) return false;
            if (sp.requiresMove && businessCase !== 'MOVE') return false;
            if (sp.requiresSpeedUp && businessCase !== 'SPEED_UP') return false;
            return true;
        });

        if (stillValid.length !== selectedSpecialPriceIds.length) {
            setSelectedSpecialPriceIds(stillValid);
        }
    }, [isMagentaTVSelected, businessCase, product, selectedSpecialPriceIds]);

    // Auto-deselect addons whose conditions are no longer met
    useEffect(() => {
        if (!product || !product.compatibleAddons || selectedAddonIds.length === 0) return;

        const stillValid = selectedAddonIds.filter(tierId => {
            const addon = product.compatibleAddons!.find(a => (a.tiers || []).some(t => t.id === tierId));
            if (!addon) return false;
            if (addon.requiresNoMagentaTV && isMagentaTVSelected) return false;
            return true;
        });

        if (stillValid.length !== selectedAddonIds.length) {
            setSelectedAddonIds(stillValid);
        }
    }, [isMagentaTVSelected, product, selectedAddonIds]);

    const businessCaseOptions = [
        { id: 'NEW_ACTIVATION', label: 'Neuvertrag' },
        { id: 'MOVE', label: 'Umzug' },
        { id: 'PLAN_CHANGE', label: 'Tarifwechsel' },
        { id: 'SPEED_UP', label: 'Upgrade' },
    ];

    const calculation = useMemo((): CalculationResult => {
        if (!product) return {
            monthlyCosts: [],
            averageMonthlyCost: 0,
            totalCost24Months: 0,
            oneTimeCosts: { total: 0, breakdown: [] },
            basePrice: 0,
            effectiveBasePrice: 0,
        };

        const activeCredits = availableCredits.filter(c => selectedCreditIds.includes(c.id));

        return calculateProductCosts({
            product,
            businessCase,
            magentaTVPackage,
            selectedSpecialPriceIds,
            selectedAddonIds,
            vouchers,
            credits: activeCredits,
            hardwarePurchaseType
        });
    }, [product, businessCase, magentaTVPackage, selectedSpecialPriceIds, selectedAddonIds, vouchers, availableCredits, selectedCreditIds, hardwarePurchaseType]);

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
        setHardwarePurchaseType
    };
}
