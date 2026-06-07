import React from 'react';
import {
	Document, Page, Text, View, StyleSheet, Image,
} from '@react-pdf/renderer';
import type {
	BasketItem,
} from '@/lib/store/basket-store';
import type {
	Credit, PricingSettings,
} from '@/types/product';
import {
	calculateProductCosts,
} from '@/hooks/use-cost-calculator';

// Category brand-compliant display colors matching the web application UI
const CATEGORY_COLORS: Record<string, string> = {
	MOBILE: '#e20074',
	FIBER: '#0090d0',
	DSL: '#7b61ff',
	MAGENTA_TV_OTT: '#ff6b00',
	DEVICE: '#00a878',
	ADDON: '#e67e22',
};

// Soft category-compliant background colors for inner card styling
const CATEGORY_SOFT_BG_COLORS: Record<string, string> = {
	MOBILE: '#FFF0F6',
	FIBER: '#EBF7FF',
	DSL: '#F5F3FF',
	MAGENTA_TV_OTT: '#FFF6EB',
	DEVICE: '#EBFDF5',
	ADDON: '#FFFBF0',
};


export interface OfferDocumentProps {
	items: BasketItem[];
	basketCredits: Credit[];
	settings: PricingSettings;
	teamEmail: string;
	salesRepName?: string;
	logoData?: string;
}

// Format currency to professional German standard (e.g. 1.234,56 €)
const formatCurrency = (value: number): string => {
	const fixedValue = Math.abs(value).toFixed(2);
	const parts = fixedValue.split('.');
	const formattedInteger = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	const result = `${formattedInteger},${parts[1]} €`;
	return value < 0 ? `-${result}` : result;
};

// Comprehensive premium corporate Telekom stylesheet using standard Helvetica
const styles = StyleSheet.create({
	page: {
		fontFamily: 'Helvetica',
		backgroundColor: '#FFFFFF',
		color: '#222222',
		paddingTop: 50,
		paddingBottom: 75,
		paddingHorizontal: 40,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderBottomColor: '#F4F4F4',
		paddingBottom: 15,
		marginBottom: 20,
	},
	headerLeft: {
		flexDirection: 'column',
	},
	headerTitle: {
		fontSize: 8,
		color: '#888888',
		textTransform: 'uppercase',
		letterSpacing: 1,
		marginBottom: 4,
	},
	salesRepText: {
		fontSize: 11,
		fontWeight: 'bold',
		color: '#222222',
	},
	teamEmailText: {
		fontSize: 9,
		color: '#E20074',
		marginTop: 2,
	},
	logoContainer: {
		width: 45,
		height: 45,
		justifyContent: 'center',
		alignItems: 'flex-end',
	},
	logo: {
		width: 36,
		height: 43,
		objectFit: 'contain',
	},
	logoFallback: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#E20074',
		letterSpacing: 0.5,
	},
	introSection: {
		marginBottom: 20,
	},
	greeting: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#222222',
		marginBottom: 6,
	},
	introSubtitle: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#E20074',
		marginBottom: 10,
		letterSpacing: 0.3,
	},
	introText: {
		fontSize: 9.5,
		color: '#555555',
		lineHeight: 1.5,
	},
	wowCard: {
		backgroundColor: '#FFF5F9',
		borderWidth: 0.75,
		borderColor: '#FFD1E6',
		borderRadius: 12,
		padding: 16,
		marginBottom: 20,
		alignItems: 'center',
		textAlign: 'center',
	},
	wowBadge: {
		backgroundColor: '#E20074',
		borderRadius: 20,
		paddingHorizontal: 10,
		paddingVertical: 3,
		marginBottom: 8,
	},
	wowBadgeText: {
		color: '#FFFFFF',
		fontSize: 8,
		fontWeight: 'bold',
		letterSpacing: 0.5,
	},
	wowTitle: {
		fontSize: 10.5,
		color: '#222222',
		fontWeight: 'bold',
		marginBottom: 4,
	},
	wowSavingsAmount: {
		fontSize: 32,
		color: '#E20074',
		fontWeight: 'bold',
		marginBottom: 6,
	},
	wowSubtitle: {
		fontSize: 8,
		color: '#888888',
		marginTop: 6,
		lineHeight: 1.3,
	},
	wowBulletList: {
		marginTop: 6,
		marginBottom: 4,
		alignSelf: 'center',
		alignItems: 'flex-start',
	},
	wowBulletRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	wowBulletCheck: {
		color: '#E20074',
		fontSize: 10,
		fontWeight: 'bold',
		marginRight: 6,
	},
	wowBulletText: {
		fontSize: 9,
		color: '#222222',
		fontWeight: 'medium',
	},
	fomoBanner: {
		backgroundColor: '#FFF0F6',
		borderLeftWidth: 3.5,
		borderLeftColor: '#E20074',
		borderRadius: 6,
		padding: 12,
		marginBottom: 20,
	},
	fomoTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	fomoIcon: {
		fontSize: 10,
		color: '#E20074',
		marginRight: 6,
		fontWeight: 'bold',
	},
	fomoTitleText: {
		fontSize: 9.5,
		fontWeight: 'bold',
		color: '#E20074',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	fomoBodyText: {
		fontSize: 8.5,
		color: '#444444',
		lineHeight: 1.4,
	},
	specialPriceBadge: {
		backgroundColor: '#FFF0F6',
		borderWidth: 0.5,
		borderColor: '#E20074',
		borderRadius: 4,
		paddingVertical: 2,
		paddingHorizontal: 6,
		marginTop: 4,
		alignSelf: 'flex-start',
	},
	specialPriceText: {
		fontSize: 7.5,
		fontWeight: 'bold',
		color: '#E20074',
	},
	sectionHeading: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#222222',
		marginBottom: 10,
		borderBottomWidth: 1.5,
		borderBottomColor: '#E20074',
		paddingBottom: 4,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	tableHeader: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: '#EEEEEE',
		paddingVertical: 8,
		paddingHorizontal: 12,
		marginBottom: 12,
	},
	tableColHeader: {
		fontSize: 7.5,
		fontWeight: 'bold',
		color: '#999999',
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	tableRow: {
		flexDirection: 'row',
		borderWidth: 0.75,
		borderRadius: 12,
		backgroundColor: '#FFFFFF',
		paddingVertical: 14,
		paddingHorizontal: 16,
		marginBottom: 14,
	},
	tableRowEven: {
		backgroundColor: '#FCFCFC',
	},
	tableCol: {
		flexDirection: 'column',
	},
	productName: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#222222',
		marginBottom: 6,
	},
	optionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 3.5,
	},
	optionTick: {
		color: '#E20074',
		fontSize: 8.5,
		fontWeight: 'bold',
		marginRight: 5,
	},
	optionText: {
		fontSize: 8.5,
		color: '#555555',
	},
	unlimitedText: {
		fontSize: 8.5,
		color: '#16a34a',
		fontWeight: 'bold',
	},
	cardOneTimeContainer: {
		marginTop: 10,
		paddingTop: 6,
		borderTopWidth: 0.5,
		borderTopColor: '#EEEEEE',
	},
	cardOneTimeText: {
		fontSize: 7.5,
		color: '#888888',
		lineHeight: 1.3,
	},
	cardHeroPrice: {
		fontSize: 17,
		fontWeight: 'bold',
		color: '#E20074',
		marginBottom: 1.5,
	},
	cardHeroPriceLabel: {
		fontSize: 7.5,
		color: '#888888',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
		marginBottom: 6,
	},
	cardSeparator: {
		height: 0.5,
		backgroundColor: '#EAEAEA',
		marginVertical: 6,
		alignSelf: 'stretch',
	},
	cardStaffelungTitle: {
		fontSize: 7.5,
		fontWeight: 'bold',
		color: '#555555',
		marginBottom: 4.5,
		textAlign: 'right',
	},
	cardStaffelungRow: {
		fontSize: 7.5,
		color: '#666666',
		marginTop: 2.5,
		textAlign: 'right',
	},
	cardStaffelungPriceBold: {
		fontWeight: 'bold',
		color: '#222222',
	},
	timelineDetailText: {
		fontSize: 8,
		color: '#666666',
		fontStyle: 'italic',
		marginTop: 3,
	},
	priceText: {
		fontSize: 11,
		fontWeight: 'bold',
		color: '#222222',
	},
	priceSubtext: {
		fontSize: 8,
		fontWeight: 'normal',
		color: '#666666',
	},
	breakdownItemText: {
		fontSize: 7.5,
		color: '#555555',
		marginTop: 2,
	},
	integratedPromoBlock: {
		marginTop: 8,
		padding: 8,
		backgroundColor: '#FFFFFF',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0, 0.06)',
		alignSelf: 'flex-start',
		width: '95%',
	},
	integratedPromoTitle: {
		fontSize: 8,
		fontWeight: 'bold',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
		marginBottom: 3,
	},
	integratedPromoDesc: {
		fontSize: 7.5,
		color: '#555555',
		marginBottom: 4,
		lineHeight: 1.3,
	},
	integratedPromoTiers: {
		paddingLeft: 4,
	},
	integratedPromoTierText: {
		fontSize: 7.5,
		color: '#222222',
		marginTop: 1.5,
	},
	creditRow: {
		flexDirection: 'row',
		backgroundColor: '#F0FDF4',
		borderBottomWidth: 1,
		borderBottomColor: '#DCFCE7',
		paddingVertical: 8,
		paddingHorizontal: 10,
	},
	creditName: {
		fontSize: 9,
		fontWeight: 'bold',
		color: '#16a34a',
	},
	creditValue: {
		fontSize: 9,
		fontWeight: 'bold',
		color: '#16a34a',
	},
	summaryCard: {
		backgroundColor: '#FAFAFA',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#EEEEEE',
		padding: 12,
		marginTop: 15,
		marginBottom: 15,
	},
	summaryTitle: {
		fontSize: 11,
		fontWeight: 'bold',
		color: '#222222',
		marginBottom: 8,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	summarySection: {
		flexDirection: 'column',
	},
	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginVertical: 2,
	},
	summaryRowSub: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginVertical: 1,
		paddingLeft: 10,
	},
	summaryLabel: {
		fontSize: 10,
		fontWeight: 'bold',
		color: '#222222',
	},
	summaryValueGross: {
		fontSize: 11,
		fontWeight: 'bold',
		color: '#E20074',
	},
	summaryLabelSub: {
		fontSize: 8,
		color: '#666666',
	},
	summaryValueSub: {
		fontSize: 8,
		color: '#666666',
		fontWeight: 'bold',
	},
	summaryDivider: {
		height: 1,
		backgroundColor: '#EEEEEE',
		marginVertical: 8,
	},
	timelineCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#EEEEEE',
		padding: 12,
		marginBottom: 15,
	},
	timelineTitle: {
		fontSize: 11,
		fontWeight: 'bold',
		color: '#222222',
		marginBottom: 8,
		textTransform: 'uppercase',
	},
	timelineSteps: {
		flexDirection: 'column',
	},
	timelineStepRow: {
		flexDirection: 'row',
		marginBottom: 8,
	},
	timelineStepIndicator: {
		width: 16,
		alignItems: 'center',
		position: 'relative',
	},
	timelineStepDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: '#E20074',
		marginTop: 4,
	},
	timelineStepLine: {
		width: 1,
		flexGrow: 1,
		backgroundColor: '#E20074',
		opacity: 0.3,
		position: 'absolute',
		top: 10,
		bottom: -8,
	},
	timelineStepContent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		flexGrow: 1,
		paddingLeft: 8,
	},
	timelineStepMonths: {
		fontSize: 9,
		fontWeight: 'bold',
		color: '#222222',
	},
	timelineStepPrice: {
		fontSize: 9,
		fontWeight: 'bold',
		color: '#E20074',
	},
	timelineStepPriceSuffix: {
		fontSize: 7,
		fontWeight: 'normal',
		color: '#888888',
	},
	ctaCard: {
		backgroundColor: '#F9F9F9',
		borderRadius: 12,
		padding: 16,
		alignItems: 'center',
		textAlign: 'center',
		marginTop: 15,
		marginBottom: 20,
	},
	ctaTitle: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#E20074',
		marginBottom: 6,
	},
	ctaText: {
		fontSize: 9,
		color: '#555555',
		marginBottom: 10,
		lineHeight: 1.4,
	},
	ctaButton: {
		backgroundColor: '#E20074',
		borderRadius: 20,
		paddingHorizontal: 15,
		paddingVertical: 5,
		marginBottom: 8,
	},
	ctaButtonText: {
		color: '#FFFFFF',
		fontSize: 9,
		fontWeight: 'bold',
	},
	ctaFooter: {
		fontSize: 8,
		color: '#888888',
		lineHeight: 1.3,
	},
	footer: {
		position: 'absolute',
		bottom: 25,
		left: 40,
		right: 40,
		borderTopWidth: 1,
		borderTopColor: '#F4F4F4',
		paddingTop: 8,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	legalDisclaimer: {
		fontSize: 6.5,
		color: '#999999',
		width: '80%',
		lineHeight: 1.3,
	},
	pageNumber: {
		fontSize: 7,
		color: '#999999',
	},
});

export const OfferDocument: React.FC<OfferDocumentProps> = ({
	items = [
	],
	basketCredits = [
	],
	settings,
	teamEmail,
	salesRepName = 'Dein Telekom Team',
	logoData,
}) => {
	// 1. Perform exhaustive mathematical cost calculation for all items in the basket
	const itemsWithCosts = items.map((item) => {
		const costs = calculateProductCosts({
			product: item.product,
			businessCase: item.config.businessCase,
			magentaTVPackage: item.config.magentaTVPackage,
			selectedSpecialPriceIds: item.config.selectedSpecialPriceIds,
			selectedAddonIds: item.config.selectedAddonIds,
			vouchers: item.config.vouchers,
			hardwarePurchaseType: item.config.hardwarePurchaseType,
			plusKartenCount: item.config.plusKartenCount,
			settings,
			customBasePrice: item.config.customBasePrice,
			hardwareTier: item.config.hardwareTier,
		});

		return {
			item,
			costs,
		};
	});

	// 2. Aggregate recurring monthly totals (Gross)
	const totalMonthlyGross = itemsWithCosts.reduce((acc, entry) => acc + entry.costs.averageMonthlyCost, 0);

	// 3. Compute 24-month step-by-step price timeline
	const monthlyTotals = Array(24).fill(0);
	itemsWithCosts.forEach((entry) => {
		entry.costs.monthlyCosts.forEach((mc, index) => {
			if (index < 24) {
				monthlyTotals[index] += mc.total;
			}
		});
	});

	const combinedSteps: { start: number; end: number; total: number }[] = [
	];
	if (itemsWithCosts.length > 0) {
		let currentStep = {
			start: 1,
			end: 1,
			total: monthlyTotals[0],
		};

		for (let i = 1; i < 24; i++) {
			if (Math.abs(monthlyTotals[i] - currentStep.total) < 0.01) {
				currentStep.end = i + 1;
			}
			else {
				combinedSteps.push({
					...currentStep,
				});
				currentStep = {
					start: i + 1,
					end: i + 1,
					total: monthlyTotals[i],
				};
			}
		}
		combinedSteps.push(currentStep);
	}

	// 4. Compute aggregated One-Time Costs
	const oneTimeBreakdowns = itemsWithCosts.flatMap((entry) => entry.costs.oneTimeCosts.breakdown);
	const oneTimeBreakdownNoShipping = oneTimeBreakdowns.filter((c) => c.name !== 'Versand Hardware');
	const totalOneTimeItems = oneTimeBreakdownNoShipping.reduce((acc, curr) => acc + curr.cost, 0);

	const hasDevice = items.some((i) => i.product.category === 'DEVICE');
	const globalShippingFee = hasDevice ? settings.shipping_hardware_fee : 0;
	const totalCreditsValue = basketCredits.reduce((acc, credit) => acc + credit.value, 0);

	const totalOneTimeGross = (totalOneTimeItems + globalShippingFee) - totalCreditsValue;

	// 5. Compute "Wow-Factor" Total Savings over 24-months contract
	let totalSavingsValue = 0;
	itemsWithCosts.forEach(({
		item, costs,
	}) => {
		let standardBase = item.product.basePrice;
		if (item.product.category === 'DEVICE') {
			standardBase = item.config.hardwarePurchaseType === 'BUY' ? 0 : (item.product.rentalPrice ?? item.product.basePrice);
		}
		else if (item.config.magentaTVPackage && item.product.magentaTVBundlePrice) {
			standardBase = item.product.magentaTVBundlePrice;
		}

		if (item.product.category === 'MOBILE' && item.config.hardwareTier && item.config.hardwareTier !== 'none') {
			const SURCHARGES: Record<string, number> = {
				smartphone: settings.mobile_tier_smartphone ?? 10,
				top: settings.mobile_tier_top ?? 20,
				premium: settings.mobile_tier_premium ?? 30,
				premium_plus: settings.mobile_tier_premium_plus ?? 40,
			};
			standardBase += SURCHARGES[item.config.hardwareTier] ?? 0;
		}

		const tvPrice = item.config.magentaTVPackage === 'smart' ? settings.magentatv_smart_price ?? 10
			: item.config.magentaTVPackage === 'smartstream' ? settings.magentatv_smartstream_price ?? 17
				: item.config.magentaTVPackage === 'megastream' ? settings.magentatv_megastream_price ?? 30
					: 0;

		const standardMonthlyItem = standardBase + costs.regularAddonCost + tvPrice + costs.plusKartenCost;
		const actualMonthlyItemSum = costs.monthlyCosts.reduce((sum, mc) => sum + mc.total, 0);

		const itemMonthlySavings = (standardMonthlyItem * 24) - actualMonthlyItemSum;
		if (itemMonthlySavings > 0) {
			totalSavingsValue += itemMonthlySavings;
		}

		const itemLevelVouchers = item.config.vouchers?.reduce((a, b) => a + b, 0) || 0;
		const itemLevelCredits = item.config.credits?.reduce((a, b) => a + b.value, 0) || 0;
		totalSavingsValue += itemLevelVouchers + itemLevelCredits;
	});

	// Append global basket-level vouchers/credits
	totalSavingsValue += totalCreditsValue;

	// 6. Calculate VAT & Net Breakdown
	const vatRate = typeof (settings as any).vat === 'number'
		? ((settings as any).vat > 1 ? (settings as any).vat / 100 : (settings as any).vat)
		: 0.19;

	const netMonthlyTotal = totalMonthlyGross / (1 + vatRate);
	const vatMonthlyTotal = totalMonthlyGross - netMonthlyTotal;

	const netOneTimeTotal = totalOneTimeGross / (1 + vatRate);
	const vatOneTimeTotal = totalOneTimeGross - netOneTimeTotal;

	return (
		<Document title={`Telekom Angebot - ${salesRepName}`}>
			<Page size="A4" style={styles.page}>

				{/* HEADER: Sales Rep left & Deutsche Telekom Logo on the right */}
				<View style={styles.header} fixed>
					<View style={styles.headerLeft}>
						<Text style={styles.headerTitle}>Dein persönlicher Ansprechpartner</Text>
						<Text style={styles.salesRepText}>{salesRepName}</Text>
						<Text style={styles.teamEmailText}>{teamEmail}</Text>
					</View>
					<View style={styles.logoContainer}>
						{logoData ? (
							<Image src={logoData} style={styles.logo} />
						) : (
							<Text style={styles.logoFallback}>DEUTSCHE TELEKOM</Text>
						)}
					</View>
				</View>

				{/* COVER / WELCOME SECTION */}
				<View style={styles.introSection}>
					<Text style={styles.greeting}>Dein persönliches Magenta-Angebot</Text>
					<Text style={styles.introSubtitle}>Bereit für Highspeed? Dein maßgeschneidertes Telekom-Paket.</Text>
					<Text style={styles.introText}>
						Vielen Dank für das angenehme Gespräch. Wie versprochen habe ich Deine Wunschprodukte zusammengestellt und berechnet. Mit den <Text style={{
 fontWeight: 'bold',
}}>Telekom Kombivorteilen</Text> und unseren aktuellen Aktionen sichern wir Dir das beste Preis-Leistungs-Verhältnis. Hier ist Dein persönliches Angebot:
					</Text>
				</View>

				{/* THE WOW FACTOR: Magenta Highlight Box showing Total Savings */}
				{totalSavingsValue > 0 && (
					<View style={styles.wowCard} wrap={false}>
						<View style={styles.wowBadge}>
							<Text style={styles.wowBadgeText}>DEINE EXKLUSIVE SPAR-AKTION</Text>
						</View>
						<Text style={styles.wowTitle}>Deine exklusive Ersparnis:</Text>
						<Text style={styles.wowSavingsAmount}>{formatCurrency(totalSavingsValue)} gespart!</Text>
						<View style={styles.wowBulletList}>
							<View style={styles.wowBulletRow}>
								<Text style={styles.wowBulletCheck}>✓</Text>
								<Text style={styles.wowBulletText}>Inklusive aller vereinbarten Rabatte</Text>
							</View>
							<View style={styles.wowBulletRow}>
								<Text style={styles.wowBulletCheck}>✓</Text>
								<Text style={styles.wowBulletText}>Kombivorteile direkt eingerechnet</Text>
							</View>
							<View style={styles.wowBulletRow}>
								<Text style={styles.wowBulletCheck}>✓</Text>
								<Text style={styles.wowBulletText}>Volle Transparenz ohne versteckte Gebühren</Text>
							</View>
						</View>
						<Text style={styles.wowSubtitle}>
							Dieser Betrag wird Dir über die Mindestvertragslaufzeit von 24 Monaten durch Rabatte, Gutschriften und Aktionsvorteile gutgeschrieben.
						</Text>
					</View>
				)}

				{/* PRICING TABLE TITLE */}
				<Text style={styles.sectionHeading}>Gewählte Tarife & Optionen</Text>

				{/* PRICING TABLE HEADER */}
				<View style={styles.tableHeader}>
					<Text style={[
						styles.tableColHeader,
						{
							flex: 1,
						},
					]}>Produkt & Optionen</Text>
					<Text style={[
						styles.tableColHeader,
						{
							width: 150,
							textAlign: 'right',
						},
					]}>Monatlich</Text>
				</View>

				{/* PRICING TABLE ROWS */}
				{itemsWithCosts.map(({
					item, costs,
				}) => {
					// Extract compatible addons
					const activeAddons = (item.config.selectedAddonIds?.map((tierId) => {
						const addon = item.product.compatibleAddons?.find((a) =>
							(a.tiers || [
							]).some((t) => t.id === tierId),
						);
						const tier = addon?.tiers?.find((t) => t.id === tierId);
						return tier && addon ? addon.name : null;
					}).filter(Boolean) || [
						]) as string[];

					// Extract special prices
					const activeSpecialPrices = item.product.specialPrices?.filter((sp) =>
						item.config.selectedSpecialPriceIds?.includes(sp.id),
					);

					// Format PlusKarten count
					const plusKartenCount = item.config.plusKartenCount || 0;
					const plusKartenText = plusKartenCount > 0
						? `${plusKartenCount}x PlusKarte (+${formatCurrency(costs.plusKartenCost)})`
						: null;

					// Compile step timeline for this item
					const itemSteps: { start: number; end: number; total: number }[] = [
					];
					let currentStep = {
						start: 1,
						end: 1,
						total: costs.monthlyCosts[0]?.total ?? 0,
					};
					for (let i = 1; i < 24; i++) {
						const totalCost = costs.monthlyCosts[i]?.total ?? 0;
						if (Math.abs(totalCost - currentStep.total) < 0.01) {
							currentStep.end = i + 1;
						}
						else {
							itemSteps.push({
								...currentStep,
							});
							currentStep = {
								start: i + 1,
								end: i + 1,
								total: totalCost,
							};
						}
					}
					itemSteps.push(currentStep);

					const regularPrice = itemSteps[itemSteps.length - 1]?.total ?? 0;
					const catColor = CATEGORY_COLORS[item.product.category] || '#e20074';
					const softBgColor = CATEGORY_SOFT_BG_COLORS[item.product.category] || '#FFF0F6';

					return (
						<View key={item.id} style={[
							styles.tableRow,
							{
								backgroundColor: softBgColor,
								borderColor: `${catColor }33`,
								borderWidth: 0.75,
							},
						]} wrap={false}>
							<View style={[
								styles.tableCol,
								{
									flex: 1,
								},
							]}>
								<Text style={styles.productName}>{item.product.name}</Text>

								{activeSpecialPrices && activeSpecialPrices.length > 0 && activeSpecialPrices.map((sp, spIdx) => (
									<View key={spIdx} style={styles.integratedPromoBlock}>
										<Text style={[
											styles.integratedPromoTitle,
											{
												color: catColor,
											},
										]}>Aktionsvorteil: {sp.name}</Text>
										{sp.description && (
											<Text style={styles.integratedPromoDesc}>{sp.description}</Text>
										)}
										{sp.tiers && sp.tiers.length > 0 && (
											<View style={styles.integratedPromoTiers}>
												{sp.tiers.map((tier, tierIdx) => {
													const months = tier.fromMonth === tier.toMonth
														? `Monat ${tier.fromMonth}`
														: `Monat ${tier.fromMonth}-${tier.toMonth}`;
													const targetSuffix = (tier.discountTarget || sp.discountTarget) === 'MAGENTA_TV' ? ' auf MagentaTV' : '';
													const label = tier.discountType === 'RELATIVE'
														? `-${formatCurrency(tier.price)} Rabatt${targetSuffix}`
														: `${formatCurrency(tier.price)} mtl. Aktionspreis${targetSuffix}`;
													return (
														<Text key={tierIdx} style={styles.integratedPromoTierText}>
															• {months}: {label}
														</Text>
													);
												})}
											</View>
										)}
									</View>
								))}

								{activeAddons && activeAddons.length > 0 && activeAddons.map((addon, aIdx) => (
									<View key={aIdx} style={styles.optionRow}>
										<Text style={styles.optionTick}>✓</Text>
										<Text style={styles.optionText}>inkl. {addon}</Text>
									</View>
								))}
								{plusKartenText && (
									<View style={styles.optionRow}>
										<Text style={styles.optionTick}>✓</Text>
										<Text style={styles.optionText}>{plusKartenText}</Text>
									</View>
								)}
								{costs.hasUnlimitedAdvantage && (
									<View style={styles.optionRow}>
										<Text style={styles.optionTick}>✓</Text>
										<Text style={styles.unlimitedText}>Kombivorteil: Unlimited Datenvolumen</Text>
									</View>
								)}

								{costs.oneTimeCosts.total > 0 && (
									<View style={styles.cardOneTimeContainer}>
										<Text style={styles.cardOneTimeText}>
											Einmalige Kosten: {formatCurrency(costs.oneTimeCosts.total)}
											{costs.oneTimeCosts.breakdown.length > 0 &&
												` (${costs.oneTimeCosts.breakdown.map(b => `${b.name}: ${formatCurrency(b.cost)}`).join(', ')})`
											}
										</Text>
									</View>
								)}
							</View>
							<View style={[
								styles.tableCol,
								{
									width: 150,
									textAlign: 'right',
									alignItems: 'flex-end',
									justifyContent: 'flex-start',
								},
							]}>
								<Text style={styles.cardHeroPrice}>{formatCurrency(costs.averageMonthlyCost)}</Text>
								<Text style={styles.cardHeroPriceLabel}>Effektiver Monatspreis (Ø)</Text>
								{itemSteps.length > 1 && (
									<>
										<View style={styles.cardSeparator} />
										<Text style={styles.cardStaffelungTitle}>Monatliche Staffelung</Text>
										{itemSteps.map((step, sIdx) => {
											const months = step.start === step.end ? `Monat ${step.start}` : `Monat ${step.start}-${step.end}`;
											const isPromo = step.total < regularPrice;
											const labelSuffix = isPromo ? ' (Spar-Phase)' : '';
											const prefix = isPromo ? 'nur ' : '';
											return (
												<Text key={sIdx} style={styles.cardStaffelungRow}>
													{months}{labelSuffix}: {prefix}
													<Text style={styles.cardStaffelungPriceBold}>{formatCurrency(step.total)}</Text>
												</Text>
											);
										})}
									</>
								)}
							</View>
						</View>
					);
				})}

				{/* BASKET-LEVEL CREDITS / VOUCHERS */}
				{basketCredits.length > 0 && basketCredits.map((credit) => (
					<View key={credit.id} style={styles.creditRow} wrap={false}>
						<View style={{
							flexGrow: 3,
						}}>
							<Text style={styles.creditName}>Aktionsgutschrift: {credit.name}</Text>
						</View>
						<View style={{
							width: 90,
							textAlign: 'right',
						}}>
							<Text style={styles.creditValue}>-{formatCurrency(credit.value)}</Text>
						</View>
						<View style={{
							width: 130,
						}} />
					</View>
				))}

				{/* 24-MONTH TOTAL BASKET TIMELINE STEP MAP */}
				{combinedSteps.length > 1 && (
					<View style={styles.timelineCard} wrap={false}>
						<Text style={styles.timelineTitle}>Preisverlauf Deiner Gesamtkonfiguration</Text>
						<View style={styles.timelineSteps}>
							{combinedSteps.map((step, idx) => (
								<View key={idx} style={styles.timelineStepRow}>
									<View style={styles.timelineStepIndicator}>
										<View style={styles.timelineStepDot} />
										{idx < combinedSteps.length - 1 && <View style={styles.timelineStepLine} />}
									</View>
									<View style={styles.timelineStepContent}>
										<Text style={styles.timelineStepMonths}>
											{step.start === step.end ? `Monat ${step.start}` : `Monat ${step.start} bis ${step.end}`}
										</Text>
										<Text style={styles.timelineStepPrice}>
											{formatCurrency(step.total)} <Text style={styles.timelineStepPriceSuffix}>/ Monat</Text>
										</Text>
									</View>
								</View>
							))}
						</View>
					</View>
				)}

				{/* AGGREGATED COST SUMMARY CARD & VAT DETAILS */}
				<View style={styles.summaryCard} wrap={false}>
					<Text style={styles.summaryTitle}>Gesamtkostenübersicht (inkl. MwSt.)</Text>

					{/* Monthly costs breakdown */}
					<View style={styles.summarySection}>
						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Monatlich durchschnittlich (Brutto):</Text>
							<Text style={styles.summaryValueGross}>{formatCurrency(totalMonthlyGross)}</Text>
						</View>
						<View style={styles.summaryRowSub}>
							<Text style={styles.summaryLabelSub}>davon Netto-Betrag:</Text>
							<Text style={styles.summaryValueSub}>{formatCurrency(netMonthlyTotal)}</Text>
						</View>
						<View style={styles.summaryRowSub}>
							<Text style={styles.summaryLabelSub}>davon MwSt. ({Math.round(vatRate * 100)}%):</Text>
							<Text style={styles.summaryValueSub}>{formatCurrency(vatMonthlyTotal)}</Text>
						</View>
					</View>

					<View style={styles.summaryDivider} />

					{/* One-time costs breakdown */}
					<View style={styles.summarySection}>
						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Einmalig gesamt (Brutto):</Text>
							<Text style={styles.summaryValueGross}>{formatCurrency(totalOneTimeGross)}</Text>
						</View>
						<View style={styles.summaryRowSub}>
							<Text style={styles.summaryLabelSub}>davon Netto-Betrag:</Text>
							<Text style={styles.summaryValueSub}>{formatCurrency(netOneTimeTotal)}</Text>
						</View>
						<View style={styles.summaryRowSub}>
							<Text style={styles.summaryLabelSub}>davon MwSt. ({Math.round(vatRate * 100)}%):</Text>
							<Text style={styles.summaryValueSub}>{formatCurrency(vatOneTimeTotal)}</Text>
						</View>
					</View>
				</View>

				{/* CALL TO ACTION (CTA) CARD */}
				<View style={styles.ctaCard} wrap={false}>
					<Text style={styles.ctaTitle}>Lass uns das Angebot gemeinsam buchen!</Text>
					<Text style={styles.ctaText}>
						Bist Du mit der Zusammenstellung zufrieden? Um die Bestellung auszuführen und Deine Tarife zu aktivieren, antworte mir einfach direkt auf meine E-Mail oder kontaktiere das Team unter:
					</Text>
					<View style={styles.ctaButton}>
						<Text style={styles.ctaButtonText}>{teamEmail}</Text>
					</View>
					<Text style={styles.ctaFooter}>
						Du möchtest zur Telekom wechseln? Wir übernehmen alle Wechselformalitäten, die Kündigung Deines alten Anbieters und die kostenfreie Mitnahme Deiner bestehenden Rufnummer.
					</Text>
				</View>

				{/* FOMO NOTICE: Highlighting limited time and exclusivity */}
				<View style={styles.fomoBanner} wrap={false}>
					<View style={styles.fomoTitleRow}>
						<Text style={styles.fomoIcon}>⚡</Text>
						<Text style={styles.fomoTitleText}>Befristeter Aktionsvorteil</Text>
					</View>
					<Text style={styles.fomoBodyText}>
						Bitte beachte: Dieses Angebot basiert auf unseren aktuellen Aktionskonditionen und exklusiven Online-Rabatten. Diese Vorzugspreise und Gutschriften sind nur für kurze Zeit reserviert und verfallen nach Ablauf des aktuellen Aktionszeitraums. Sichere Dir diese Konditionen am besten zeitnah, um den maximalen Sparvorteil zu nutzen!
					</Text>
				</View>

				{/* CORPORATE BRAND FOOTER */}
				<View style={styles.footer} fixed>
					<Text style={styles.legalDisclaimer}>
						Dieses Angebot ist freibleibend. Deutsche Telekom AG, Friedrich-Ebert-Allee 140, 53113 Bonn. Aufsichtsrat: Frank Appel (Vorsitzender). Vorstand: Timotheus Höttges (Vorsitzender). Handelsregister: Amtsgericht Bonn, HRB 6794. Sitz der Gesellschaft: Bonn. WEEE-Reg.-Nr. DE 50478485.
					</Text>
					<Text style={styles.pageNumber} render={({
						pageNumber, totalPages,
					}) => `Seite ${pageNumber} von ${totalPages}`} />
				</View>

			</Page>
		</Document>
	);
};
