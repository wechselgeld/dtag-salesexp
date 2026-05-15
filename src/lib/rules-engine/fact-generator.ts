import type { CalculationInput } from '@/types/product';

/**
 * Transforms the calculator input into a set of "Facts" for the rules engine.
 */
export function createFacts(input: CalculationInput) {
	const {
		product,
		businessCase,
		magentaTVPackage,
		selectedAddonIds,
		hardwareTier,
		plusKartenCount,
	} = input;

	return {
		// Product Info
		productId: product.id,
		productName: product.name,
		productCategory: product.category,
		basePrice: product.basePrice,

		// Context
		businessCase, // "NEW_ACTIVATION", "MOVE", "PLAN_CHANGE", "SPEED_UP"
		magentaTV: magentaTVPackage !== null,
		magentaTVPackage, // "smart", "smartstream", "megastream"
		
		// Addons & Hardware
		selectedAddonIds: selectedAddonIds || [],
		hardwareTier: hardwareTier || 'none',
		plusKartenCount: plusKartenCount || 0,

		// Time context (if we ever need rules based on current date)
		currentDate: new Date().toISOString(),
	};
}
