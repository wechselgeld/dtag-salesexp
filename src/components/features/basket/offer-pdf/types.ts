import type {
	BasketItem,
} from '@/lib/store/basket-store';
import type {
	Credit, PricingSettings, CalculationResult,
} from '@/types/product';

export interface CalculatedBasketItem {
	item: BasketItem;
	costs: CalculationResult;
}

export interface OfferDocumentProps {
	items: BasketItem[];
	basketCredits: Credit[];
	settings: PricingSettings;
	teamEmail?: string;
	salesRepName?: string;
	locationName?: string;
}



