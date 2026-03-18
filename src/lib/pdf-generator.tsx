import {
	pdf,
} from '@react-pdf/renderer';
import React from 'react';
import type {
	BasketItem,
} from '@/hooks/use-basket-store';
import {
    DEFAULT_PRICING,
} from '@/hooks/use-cost-calculator';
import type {
	Credit, PricingSettings,
} from '@/types/product';
import {
	OfferDocument,
} from '@/components/features/basket/offer-pdf/index';

export const getSvgAsPngBase64 = (url: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			const canvas = document.createElement('canvas');
			// Higher resolution for PDF clarity
			canvas.width = img.width * 4;
			canvas.height = img.height * 4;
			const ctx = canvas.getContext('2d');
			if (ctx) {
				ctx.scale(4, 4);
				ctx.drawImage(img, 0, 0);
			}
			resolve(canvas.toDataURL('image/png'));
		};
		img.onerror = reject;
		img.src = url;
	});
};

function getFormattedDate(): string {
	const now = new Date();
	const day = String(now.getDate()).padStart(2, '0');
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const year = now.getFullYear();
	return `${day}.${month}.${year}`;
}

export async function generateOfferPdf(items: BasketItem[], basketCredits: Credit[], settings: PricingSettings = DEFAULT_PRICING, teamEmail = 'team06@telekom.de', salesRepName = '') {
	let logoData: string | undefined;
	try {
		logoData = await getSvgAsPngBase64('/Deutsche_Telekom.svg');
	}
	catch (error) {
		console.error('Logo loading failed:', error);
	}

	const blob = await pdf(
		<OfferDocument
			items={items}
			basketCredits={basketCredits}
			settings={settings}
			teamEmail={teamEmail}
			salesRepName={salesRepName}
			logoData={logoData}
		/>,
	).toBlob();

	// Generate meaningful filename
	const dateStr = getFormattedDate();
	const productNames = items
		.map(i => i.product.name.replace(/[^a-zA-Z0-9äöüÄÖÜß ]/g, '').trim())
		.join('_')
		.substring(0, 60);
	const fileName = `Angebot_Telekom_${productNames}_${dateStr}.pdf`.replace(/ /g, '_');

	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);

	// Also return for potential use (like email preview)
	const reader = new FileReader();
	return new Promise<string>((resolve) => {
		reader.onloadend = () => {
			resolve(reader.result as string);
		};
		reader.readAsDataURL(blob);
	});
}
