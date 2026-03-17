export type BusinessCase = 'NEW_ACTIVATION' | 'MOVE' | 'PLAN_CHANGE' | 'SPEED_UP';

export interface PriceHistory {
    id: string;
    price: number;
    label?: string | null;
    createdAt: Date | string;
}

export interface SpecialPriceTier {
    price: number;
    fromMonth: number;
    toMonth: number;
    discountTarget: string;
    discountType: string;
}

export interface SpecialPrice {
    id: string;
    name: string;
    description?: string | null;
    internalNote?: string | null;
    requiresMagentaTV: boolean;
    requiresSpeedUp: boolean;
    requiresMove: boolean;
    requiresNewActivation: boolean;
    isActive: boolean;
    priority: number;
    discountTarget: string;
    discountType: string;
    tiers: SpecialPriceTier[];
}

export interface AddonTier {
    id: string;
    name: string;
    price: number;
    addonId: string;
}

export interface Addon {
    id: string;
    name: string;
    description: string | null;
    requiresNoMagentaTV: boolean;
    tiers: AddonTier[];
    imageUrl?: string | null;
    isGlobal?: boolean;
    isActive?: boolean;
}

export interface Product {
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

    allowNewActivation: boolean;
    allowMove: boolean;
    allowPlanChange: boolean;
    allowSpeedUp: boolean;
    allowMagentaTV: boolean;

    description: string | null;
    downloadSpeed: number | null;
    dataVolume: string | null;
    salesArguments: { id: string; text: string; isActive: boolean }[];
    magentaInfosUrl: string | null;

    // Devices
    deviceManufacturer?: string | null;
    purchasePrice?: number | null;
    rentalPrice?: number | null;

    salesScript?: string | null;
    priceHistory?: PriceHistory[];
}

export interface Credit {
    id: string;
    name: string;
    value: number;
}

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
    effectiveBasePrice: number;
    dailyPriceTrivialization?: string;
    hasUnlimitedAdvantage?: boolean;
    plusKartenCost: number;
    regularAddonCost: number;
    regularMagentaTVCost: number;
}

export interface PricingSettings {
    magentatv_smart_price: number;
    magentatv_smartstream_price: number;
    magentatv_megastream_price: number;
    shipping_hardware_fee: number;
    plus_karte_first_price: number;
    plus_karte_following_price: number;
}
