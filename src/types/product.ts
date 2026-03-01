export type BusinessCase = 'NEW_ACTIVATION' | 'MOVE' | 'PLAN_CHANGE' | 'SPEED_UP';

export type SpecialPriceTier = {
    price: number;
    fromMonth: number;
    toMonth: number;
};

export type SpecialPrice = {
    id: string;
    name: string;
    requiresMagentaTV: boolean;
    requiresSpeedUp: boolean;
    requiresMove: boolean;
    isActive: boolean;
    priority: number;
    tiers: SpecialPriceTier[];
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
    isGlobal?: boolean;
    isActive?: boolean;
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

    salesScript?: string | null;
};

export type Credit = {
    id: string;
    name: string;
    value: number;
};

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
}

export type PricingSettings = {
    magentatv_smart_price: number;
    magentatv_smartstream_price: number;
    magentatv_megastream_price: number;
    shipping_hardware_fee: number;
    plus_karte_first_price: number;
    plus_karte_following_price: number;
};
