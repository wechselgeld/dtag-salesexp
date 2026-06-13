import React from 'react';
import {
	pdf,
} from '@react-pdf/renderer';
import type {
	BasketItem,
} from '@/lib/store/basket-store';
import {
	DEFAULT_PRICING,
} from '@/hooks/use-cost-calculator';
import type {
	Credit, PricingSettings,
} from '@/types/product';
import {
	OfferDocument,
} from '@/components/features/basket/offer-pdf';

/**
 * PDF Offer Generator Utilities
 * 
 * --- EXPECTED ARGUMENTS ---
 * - items: BasketItem[]
 *   The list of product items in the shopping basket. Each item contains product info and active selections.
 * - basketCredits: Credit[]
 *   The list of global credits or vouchers applied to the basket.
 * - settings: PricingSettings (optional)
 *   Pricing rules and custom rates, defaults to DEFAULT_PRICING.
 * - teamEmail: string (optional)
 *   The sales team email address, defaults to '0800 33 01000'.
 * - salesRepName: string (optional)
 *   The name of the sales representative generating this offer, defaults to an empty string.
 * 
 * --- HANDLED FUNCTIONALITY & OUTPUT ---
 * - Handles: Builds the PDF document from the shopping basket, triggers a file download in the browser,
 *   and converts the resulting Blob to a Base64-encoded data URL.
 * - Output: Returns a Promise resolving to a Base64 data URL for `generateOfferPdf` and a `Blob` for `buildPdfBlob`.
 */

async function buildPdfBlob(
	items: BasketItem[],
	basketCredits: Credit[],
	settings: PricingSettings = DEFAULT_PRICING,
	teamEmail = '0800 33 01000',
	salesRepName = '',
	locationName = '',
): Promise<Blob> {
	const doc = (
		<OfferDocument
			items={items}
			basketCredits={basketCredits}
			settings={settings}
			teamEmail={teamEmail}
			salesRepName={salesRepName}
			locationName={locationName}
		/>
	);

	return pdf(doc).toBlob();
}

function downloadBlob(blob: Blob, fileName: string): void {
	if (typeof window === 'undefined') {
		return;
	}
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export async function generateOfferPdf(
	items: BasketItem[],
	basketCredits: Credit[],
	settings: PricingSettings = DEFAULT_PRICING,
	teamEmail = '0800 33 01000',
	salesRepName = '',
	locationName = '',
): Promise<string> {
	try {
		const blob = await buildPdfBlob(items, basketCredits, settings, teamEmail, salesRepName, locationName);
		downloadBlob(blob, 'Telekom-Angebot.pdf');

		return new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				resolve(reader.result as string);
			};
			reader.onerror = () => {
				reject(new Error('Failed to read PDF blob as Base64 Data URL'));
			};
			reader.readAsDataURL(blob);
		});
	}
	catch (error) {
		console.error('Error compiling or downloading PDF offer document:', error);
		return '';
	}
}
