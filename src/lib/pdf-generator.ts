import { jsPDF } from "jspdf";
import { BasketItem } from "@/hooks/use-basket-store";
import { calculateProductCosts, DEFAULT_PRICING } from "@/hooks/use-cost-calculator";
import { Credit, PricingSettings } from "@/types/product";
import { MAGENTA_TV_PACKAGES, CATEGORY_COLORS, CATEGORY_NAMES, SHIPPING_HARDWARE_FEE } from "@/lib/constants/pricing";
import { hexToRgb } from "@/lib/utils";



export const getSvgAsPngBase64 = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
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

export async function generateOfferPdf(items: BasketItem[], basketCredits: Credit[], settings: PricingSettings = DEFAULT_PRICING, teamEmail: string = "team06@telekom.de") {
    // A4 dimensions: 210 x 297 mm
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 16;
    let currentY = margin;

    const magenta = [226, 0, 116] as [number, number, number];
    const navy = [26, 26, 46] as [number, number, number];
    const darkGray = [50, 50, 50] as [number, number, number];
    const lightGray = [150, 150, 150] as [number, number, number];

    // Helper functions
    const addRoundedRect = (x: number, y: number, w: number, h: number, r: number, color: [number, number, number], fill: boolean = true) => {
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setFillColor(color[0], color[1], color[2]);
        if (fill) {
            doc.roundedRect(x, y, w, h, r, r, 'F');
        } else {
            doc.roundedRect(x, y, w, h, r, r, 'D'); // draw outline
        }
    };

    // Calculate overall data
    const combinedMonths = Array(24).fill(0);
    let totalBasketOneTime = 0;
    let hasOneTimeValues = false;

    // Track credits
    const allCredits: { name: string; amount: number }[] = [];

    items.forEach((item) => {
        const calc = calculateProductCosts({
            product: item.product,
            businessCase: item.config.businessCase,
            magentaTVPackage: item.config.magentaTVPackage,
            selectedSpecialPriceIds: item.config.selectedSpecialPriceIds,
            selectedAddonIds: item.config.selectedAddonIds,
            vouchers: item.config.vouchers,
            credits: item.config.credits,
            hardwarePurchaseType: item.config.hardwarePurchaseType,
            settings: settings
        });

        calc.monthlyCosts.forEach((mc, i) => {
            combinedMonths[i] += mc.total;
        });

        const itemOneTime = calc.oneTimeCosts.breakdown
            .filter(b => b.name !== "Versand Hardware")
            .reduce((sum, b) => sum + b.cost, 0);

        totalBasketOneTime += itemOneTime;
        if (itemOneTime !== 0) hasOneTimeValues = true;
    });

    basketCredits.forEach(c => {
        totalBasketOneTime -= c.value;
        allCredits.push({ name: c.name, amount: c.value });
        hasOneTimeValues = true;
    });
    const hasDevice = items.some(i => i.product.category === "DEVICE");
    if (hasDevice) {
        totalBasketOneTime += settings.shipping_hardware_fee;
        hasOneTimeValues = true;
    }

    const averageTotal = combinedMonths.reduce((a, b) => a + b, 0) / 24;

    // --- HEADER ---
    doc.setFillColor(magenta[0], magenta[1], magenta[2]);
    doc.rect(0, 0, pageWidth, 5, 'F');

    currentY += 10;

    // Telekom "T" Logo
    try {
        const logoData = await getSvgAsPngBase64("/Deutsche_Telekom.svg");
        // Logo dimensions approx 76.7 / 91.2 = 0.84 aspect ratio. height = 10 -> width = 8.4
        doc.addImage(logoData, "PNG", margin, currentY - 8, 8.4, 10);
    } catch (e) {
        doc.setTextColor(magenta[0], magenta[1], magenta[2]);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(26);
        doc.text("T", margin, currentY);
    }

    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.setFontSize(22);
    // Align horizontally with the logo
    doc.text("Ihr persönliches Angebot", margin + 12, currentY);

    const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    doc.setFontSize(10);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setFont("helvetica", "normal");
    doc.text(`Erstellt für Sie, am ${today} in Chemnitz`, pageWidth - margin, currentY - 2, { align: "right" });

    currentY += 10;

    // --- INTRO TEXT ---
    doc.setFontSize(11);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const introText = "Vielen Dank für das angenehme Gespräch. Wir freuen uns, dass Sie sich für unsere Tarife interessieren. Nachfolgend habe ich Ihnen ein maßgeschneidertes Angebot angehangen - so, wie telefonisch besprochen.";
    const splitIntro = doc.splitTextToSize(introText, pageWidth - margin * 2);
    doc.text(splitIntro, margin, currentY);
    currentY += splitIntro.length * 5 + 8;

    // --- TITLE BAR ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.text(`Zusammenfassung für ${items.length} ${items.length === 1 ? "Produkt" : "Produkte"}`, margin, currentY + 5);

    currentY += 12;
    doc.setDrawColor(240, 240, 240);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // --- KOSTENVERLAUF CHART ---
    // A nice rounded box with light grey background
    addRoundedRect(margin, currentY, pageWidth - margin * 2, 45, 5, [248, 249, 250]);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(160, 160, 170);
    doc.text("KOSTENVERLAUF", margin + 12, currentY);

    doc.setTextColor(magenta[0], magenta[1], magenta[2]);
    const avgText = `${averageTotal.toFixed(2)} €`;

    // Draw string from right so that it aligns correctly without pushing off-screen
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Ø mtl.", pageWidth - margin - 12, currentY, { align: "right" });

    doc.setFontSize(22);
    doc.setTextColor(magenta[0], magenta[1], magenta[2]);
    doc.text(avgText, pageWidth - margin - 24, currentY + 0.5, { align: "right" });

    currentY += 10;

    // Draw bar chart
    const maxVal = Math.max(...combinedMonths, 1); // prevent div by zero
    const chartHeight = 18;
    const barWidth = 4.5;
    const barSpacing = 2;
    const totalChartWidth = (barWidth + barSpacing) * 24 - barSpacing;
    const startX = margin + ((pageWidth - margin * 2) - totalChartWidth) / 2;

    for (let i = 0; i < 24; i++) {
        const h = (combinedMonths[i] / maxVal) * chartHeight;
        const x = startX + i * (barWidth + barSpacing);
        const y = currentY + (chartHeight - h);

        doc.setFillColor(236, 126, 185); // Light magenta gradient simulation
        if (i > 11) doc.setFillColor(226, 0, 116); // darker for second year
        doc.roundedRect(x, y, barWidth, h, 1, 1, 'F');

        // Labels
        if (i === 0) { doc.setFontSize(7); doc.setTextColor(180, 180, 180); doc.text("1", x + 1.5, currentY + chartHeight + 4); }
        if (i === 6) { doc.text("7", x + 1.5, currentY + chartHeight + 4); }
        if (i === 12) { doc.text("13", x + 1, currentY + chartHeight + 4); }
        if (i === 18) { doc.text("19", x + 1, currentY + chartHeight + 4); }
    }

    currentY += chartHeight + 20;

    const checkPageBreak = (neededHeight: number) => {
        if (currentY + neededHeight > pageHeight - margin - 20) { // Keep space for footer
            doc.addPage();
            currentY = margin;
            doc.setFillColor(magenta[0], magenta[1], magenta[2]);
            doc.rect(0, 0, pageWidth, 5, 'F');
            currentY += 10;
        }
    };

    // --- BASKET CREDITS ---
    if (allCredits.length > 0) {
        checkPageBreak(allCredits.length * 15 + 10);
        allCredits.forEach(c => {
            const h = 12;
            doc.setDrawColor(220, 240, 230); // light green border
            doc.setFillColor(250, 253, 251); // slight green tint
            doc.roundedRect(margin, currentY, pageWidth - margin * 2, h, 2, 2, 'FD');

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(navy[0], navy[1], navy[2]);
            doc.text(`%   ${c.name}`, margin + 5, currentY + 8);

            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 168, 120);
            doc.text(`-${c.amount.toFixed(2)} €`, pageWidth - margin - 5, currentY + 8, { align: 'right' });
            currentY += h + 4;
        });
        currentY += 4;
    }

    // --- PRODUCTS ---
    items.forEach((item) => {
        const itemCalc = calculateProductCosts({
            product: item.product,
            businessCase: item.config.businessCase,
            magentaTVPackage: item.config.magentaTVPackage,
            selectedSpecialPriceIds: item.config.selectedSpecialPriceIds,
            selectedAddonIds: item.config.selectedAddonIds,
            vouchers: item.config.vouchers,
            credits: item.config.credits,
            settings: settings
        });

        const activeAddons: string[] = [];
        if (item.config.selectedAddonIds?.length > 0 && item.product.compatibleAddons) {
            item.config.selectedAddonIds.forEach(tierId => {
                const a = item.product.compatibleAddons?.find(x => (x.tiers || []).some(t => t.id === tierId));
                if (a) {
                    const t = (a.tiers || []).find(t => t.id === tierId);
                    if (t) activeAddons.push(`${a.name} ${a.tiers.length > 1 ? `(${t.name})` : ''} +${t.price.toFixed(2)}€`);
                }
            });
        }

        // Calculate needed height for text dynamically
        let detailLines = 1; // Basispreis
        if (itemCalc.effectiveBasePrice !== itemCalc.basePrice) detailLines++;

        const spSet = new Set<string>();
        itemCalc.monthlyCosts.forEach(mc => {
            if (mc.specialPriceApplied && !spSet.has(mc.specialPriceApplied.name)) {
                spSet.add(mc.specialPriceApplied.name);
                detailLines++;
            }
        });

        if (itemCalc.oneTimeCosts.total !== 0) {
            detailLines++; // title line
            detailLines += itemCalc.oneTimeCosts.breakdown.length * 0.8;
        }
        if (activeAddons.length > 0) {
            detailLines++;
            detailLines += activeAddons.length;
        }

        const boxHeight = 26 + (detailLines * 5); // extra padding for average price at bottom
        checkPageBreak(boxHeight + 10);

        // Product Box
        doc.setDrawColor(230, 230, 235);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, currentY, pageWidth - margin * 2, boxHeight, 3, 3, 'FD');

        // Category Tag
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        const colorHex = CATEGORY_COLORS[item.product.category] || "#666666";
        const color = hexToRgb(colorHex);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(CATEGORY_NAMES[item.product.category]?.toUpperCase() || "PRODUKT", margin + 5, currentY + 7);

        // Product Title
        let title = item.product.name;
        if (item.config.magentaTVPackage) {
            title += ` mit ${MAGENTA_TV_PACKAGES[item.config.magentaTVPackage].name}`;
        }
        doc.setFontSize(12);
        doc.setTextColor(navy[0], navy[1], navy[2]);
        doc.text(title, margin + 5, currentY + 13);

        // Details
        let detailY = currentY + 19;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

        doc.text(`Regulärer Basispreis: ${itemCalc.basePrice.toFixed(2)} € mtl.`, margin + 5, detailY);
        detailY += 5;

        if (itemCalc.effectiveBasePrice !== itemCalc.basePrice && item.config.magentaTVPackage) {
            doc.text(`Paketpreis inkl. MagentaTV: ${itemCalc.effectiveBasePrice.toFixed(2)} € mtl.`, margin + 5, detailY);
            detailY += 5;
        } else if (itemCalc.effectiveBasePrice !== itemCalc.basePrice) {
            doc.text(`Aktions-Basispreis: ${itemCalc.effectiveBasePrice.toFixed(2)} € mtl.`, margin + 5, detailY);
            detailY += 5;
        }

        spSet.forEach(spName => {
            doc.text(`Aktionsvorteil: ${spName}`, margin + 5, detailY);
            detailY += 5;
        });

        if (itemCalc.oneTimeCosts.total !== 0) {
            doc.text(`Bereitstellungspauschale: ${itemCalc.oneTimeCosts.total.toFixed(2)} €`, margin + 5, detailY);
            detailY += 5;
            doc.setFontSize(9);
            doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
            detailY += 1;
        }

        if (activeAddons.length > 0) {
            doc.text("Zubuchoptionen:", margin + 5, detailY);
            detailY += 5;
            activeAddons.forEach(addon => {
                doc.text(`   + Inkl. ${addon}`, margin + 5, detailY);
                detailY += 5;
            });
        }

        // Price
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(navy[0], navy[1], navy[2]);
        const pr = `Ø ${itemCalc.averageMonthlyCost.toFixed(2)} €`;
        doc.text(pr, margin + 5, currentY + boxHeight - 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        const prWidth = doc.getTextWidth(pr);
        doc.text("mtl.", margin + 15 + prWidth + 1.5, currentY + boxHeight - 5);

        currentY += boxHeight + 6;
    });

    currentY += 10;
    checkPageBreak(80);

    doc.setDrawColor(240, 240, 240);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // --- EINMALIG & KOSTENÜBERSICHT ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("Einmalig", margin, currentY);

    if (totalBasketOneTime < 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 168, 120);
        doc.text(`Gutschrift i. H. v. ${Math.abs(totalBasketOneTime).toFixed(2)} €`, pageWidth - margin, currentY, { align: 'right' });
    } else if (totalBasketOneTime > 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(navy[0], navy[1], navy[2]);
        doc.text(`Kosten i. H. v. ${totalBasketOneTime.toFixed(2)} €`, pageWidth - margin, currentY, { align: 'right' });
    } else if (hasOneTimeValues) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(navy[0], navy[1], navy[2]);
        doc.text("0.00 €", pageWidth - margin, currentY, { align: 'right' });
    } else {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(navy[0], navy[1], navy[2]);
        doc.text("-", pageWidth - margin, currentY, { align: 'right' });
    }

    currentY += 8;

    // DARK NAVY SUMMARY BOX
    // Calculate periods
    let currentPrice = combinedMonths[0];
    let startMonth = 1;
    const periods = [];
    for (let i = 1; i < 24; i++) {
        if (Math.abs(combinedMonths[i] - currentPrice) > 0.01) {
            periods.push({ startMonth, endMonth: i, price: currentPrice });
            startMonth = i + 1;
            currentPrice = combinedMonths[i];
        }
    }
    periods.push({ startMonth, endMonth: 24, price: currentPrice });

    const summaryBoxH = 30 + (periods.length * 8) + 15;
    checkPageBreak(summaryBoxH + 20);

    addRoundedRect(margin, currentY, pageWidth - margin * 2, summaryBoxH, 4, navy);

    let navyY = currentY + 12;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(150, 150, 160);
    doc.text("KOSTENÜBERSICHT (24 MONATE)", margin + 6, navyY);
    navyY += 12;

    periods.forEach(p => {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(230, 230, 230);
        doc.text(`Monat ${p.startMonth} - ${p.endMonth}`, margin + 6, navyY);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text(`${p.price.toFixed(2)} €`, pageWidth - margin - 6, navyY, { align: 'right' });
        navyY += 8;
    });

    // Divider inside navy box
    navyY += 2;
    doc.setDrawColor(50, 50, 70);
    doc.line(margin + 6, navyY, pageWidth - margin - 6, navyY);
    navyY += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(150, 150, 160);
    doc.text("Ø MONATLICH", margin + 6, navyY);

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(`${averageTotal.toFixed(2)} €`, pageWidth - margin - 6, navyY, { align: 'right' });

    currentY = navyY + 20;
    checkPageBreak(30);

    // --- OUTRO TEXT ---
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const outroText = `Fragen, Unstimmigkeiten oder möchten Sie das Angebot direkt buchen? Wir rufen Sie zurück. Schreiben Sie uns dafür eine E-Mail an ${teamEmail} und geben Sie die gewünschte Rückrufzeit- und Nummer an.`;
    const splitOutro = doc.splitTextToSize(outroText, pageWidth - margin * 2);
    doc.text(splitOutro, margin, currentY);

    // --- FOOTER ---
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    doc.text(`Jederzeit für Sie erreichbar unter ${teamEmail}.`, margin, pageHeight - 15);
    doc.text("Deutsche Telekom Service GmbH @ Chemnitz", margin, pageHeight - 10);
    doc.text("Connecting your world.", pageWidth - margin, pageHeight - 10, { align: "right" });

    doc.save("Angebot_Telekom.pdf");
    return doc.output('datauristring');
}
