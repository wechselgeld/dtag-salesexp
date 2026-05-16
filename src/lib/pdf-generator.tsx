import { pdf } from '@react-pdf/renderer';
import React from 'react';
import type { BasketItem } from '@/hooks/use-basket-store';
import { DEFAULT_PRICING } from '@/hooks/use-cost-calculator';
import type { Credit, PricingSettings } from '@/types/product';
import { OfferDocument } from '@/components/features/basket/offer-pdf/index';

export const getSvgAsPngBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
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

function buildFileName(items: BasketItem[]): string {
    const dateStr = new Date().toLocaleDateString('de-DE').replace(/\./g, '-');
    const productNames = items
        .map((i) => i.product.name.replace(/[^a-zA-Z0-9äöüÄÖÜß ]/g, '').trim())
        .join('_')
        .substring(0, 60);
    return `Angebot_Telekom_${productNames}_${dateStr}.pdf`.replace(/ /g, '_');
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}

// Pure: generates the PDF as a Blob. No side effects.
// Use this when you need the file contents without triggering a download
// (e.g. email attachment preview, print preview).
export async function buildPdfBlob(
    items: BasketItem[],
    basketCredits: Credit[],
    settings: PricingSettings = DEFAULT_PRICING,
    teamEmail = 'team06@telekom.de',
    salesRepName = '',
): Promise<Blob> {
    let logoData: string | undefined;
    try {
        logoData = await getSvgAsPngBase64('/Deutsche_Telekom.svg');
    } catch {
        // Logo is decorative — PDF generation continues without it.
    }

    return pdf(
        <OfferDocument
            items={items}
            basketCredits={basketCredits}
            settings={settings}
            teamEmail={teamEmail}
            salesRepName={salesRepName}
            logoData={logoData}
        />,
    ).toBlob();
}

// Side effect: triggers a browser file download. Call only from user gesture handlers.
export function downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Composite: generates, downloads, and returns base64 for any callers that
// need all three behaviors (the original use case: download + email preview).
export async function generateOfferPdf(
    items: BasketItem[],
    basketCredits: Credit[],
    settings: PricingSettings = DEFAULT_PRICING,
    teamEmail = 'team06@telekom.de',
    salesRepName = '',
): Promise<string> {
    const blob = await buildPdfBlob(items, basketCredits, settings, teamEmail, salesRepName);
    downloadBlob(blob, buildFileName(items));
    return blobToBase64(blob);
}
