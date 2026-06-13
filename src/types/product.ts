import type {
    MagentaTVPackageKey,
} from '@/lib/constants/pricing';

export type BusinessCase = 'NEW_ACTIVATION' | 'MOVE' | 'PLAN_CHANGE' | 'SPEED_UP';
export type HardwareTier = 'none' | 'smartphone' | 'top' | 'premium' | 'premium_plus';

export interface CalculationInput {
    product: Product;
    businessCase: BusinessCase;
    magentaTVPackage: MagentaTVPackageKey | null;
    selectedSpecialPriceIds: string[];
    selectedAddonIds: string[];
    vouchers: number[];
    credits?: Credit[];
    hardwarePurchaseType?: 'RENT' | 'BUY';
    plusKartenCount?: number;
    plusKarten?: {
        normal: number;
        flex: number;
        kidsTeens: number;
    };
    settings?: PricingSettings;
    customBasePrice?: number;
    hardwareTier?: HardwareTier;
    isHybrid?: boolean;
}

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
    magentaTVRequirement: 'REQUIRED' | 'NOT_ALLOWED' | 'NONE' | 'ONLY_SMART' | 'ONLY_SMARTSTREAM' | 'ONLY_MEGASTREAM';
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
    magentaTVRequirement: 'REQUIRED' | 'NOT_ALLOWED' | 'NONE' | 'ONLY_SMART' | 'ONLY_SMARTSTREAM' | 'ONLY_MEGASTREAM';
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
    allowHybrid: boolean;
    allowPlusKarten: boolean;
    allowsUnlimitedAdvantage: boolean;

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
    plus_karte_flex_price: number;
    plus_karte_kids_price: number;
    plus_karte_activation_fee_normal: number;
    plus_karte_activation_fee_flex: number;
    plus_karte_activation_fee_kids: number;
    plus_karte_promo_free_activation_normal: boolean;
    plus_karte_promo_free_activation_flex: boolean;
    mobile_tier_smartphone: number;
    mobile_tier_top: number;
    mobile_tier_premium: number;
    mobile_tier_premium_plus: number;
}

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


