import React from 'react';
import {
	Document,
	Page,
	View,
	Text,
	Image,
} from '@react-pdf/renderer';
import type {
	BasketItem,
} from '@/lib/store/basket-store';
import type {
	Credit,
	PricingSettings,
} from '@/types/product';
import {
	calculateProductCosts,
} from '@/hooks/use-cost-calculator';
import {
	T,
} from './tokens';
import {
	s,
} from './styles';
import {
	CheckIcon, ShieldIcon, WifiIcon, TagIcon, ClockIcon, MailIcon,
} from './icons';
import {
	fmt, fmtPrice, getDate, formatDailyPrice, buildCombinedSteps,
} from './helpers';
import {
	ProductCard,
} from './pdf-product-card';

export interface OfferDocumentProps {
	items: BasketItem[];
	basketCredits: Credit[];
	settings: PricingSettings;
	teamEmail: string;
	salesRepName?: string;
	logoData?: string;
}

export const OfferDocument: React.FC<OfferDocumentProps> = ({
	items,
	basketCredits,
	settings,
	teamEmail,
	salesRepName,
	logoData,
}) => {
	// Pre-calculate costs for every basket item
	const itemsWithCalc = items.map(item => {
		const calc = calculateProductCosts({
			product: item.product,
			businessCase: item.config.businessCase,
			magentaTVPackage: item.config.magentaTVPackage,
			selectedSpecialPriceIds: item.config.selectedSpecialPriceIds,
			selectedAddonIds: item.config.selectedAddonIds,
			vouchers: item.config.vouchers,
			credits: item.config.credits,
			hardwarePurchaseType: item.config.hardwarePurchaseType,
			plusKartenCount: item.config.plusKartenCount,
			settings,
			customBasePrice: item.config.customBasePrice,
			hardwareTier: item.config.hardwareTier,
		});

		// One-time costs for Bestandsprodukte are already 0 from useCostCalculator
		return {
 item,
calc,
};
	});

	// Aggregate totals
	const totalMonthlyAvg = itemsWithCalc.reduce((sum, e) => sum + e.calc.averageMonthlyCost, 0);
	const totalOneTime = itemsWithCalc.reduce((sum, e) => sum + e.calc.oneTimeCosts.total, 0)
		- basketCredits.reduce((sum, c) => sum + c.value, 0);

	// Combine all products' monthly costs into summary steps
	const monthlyTotals = Array(24).fill(0) as number[];
	itemsWithCalc.forEach(e => {
		e.calc.monthlyCosts.forEach((mc, idx) => {
			if (idx < 24) monthlyTotals[idx] += mc.total;
		});
	});
	const combinedSteps = buildCombinedSteps(monthlyTotals);

	const dateStr = getDate();
	const repName = salesRepName?.trim() || '';
	// Personal greeting: use rep name if available
	const headerSubline = repName
		? `Erstellt am ${dateStr} von ${repName}`
		: `Erstellt am ${dateStr}`;
	// CTA subtitle is more personal with rep name
	const ctaSubline = repName
		? `Antworten Sie auf diese E-Mail \u2014 ${repName} meldet sich zeitnah bei Ihnen.`
		: 'Antworten Sie einfach auf diese E-Mail oder rufen Sie uns an.';

	return (
		<Document
			title="Ihr persönliches Telekom-Angebot"
			author="Deutsche Telekom"
			subject="Individuelles Angebot"
		>
			<Page size="A4" style={s.page}>
				{/* ━━ HEADER ━━ */}
				<View style={s.header} fixed>
					<View style={s.headerLeft}>
						<Text style={s.headerTitle}>Das passende Angebot für Sie</Text>
						<Text style={s.headerSubtitle}>{headerSubline}</Text>
					</View>
				</View>
				<View style={s.headerAccent} fixed />
				{/* Fixed spacer for page 2+, neutralized on page 1 via negative margin on trustBar */}
				<View style={{
 height: 16,
}} fixed />

				{/* ━━ TRUST BAR (Only on Page 1) ━━ */}
				<View
					style={[
						s.trustBar,
						{
							marginTop: -16,
						},
					]}
				>
					<View style={s.trustItem}>
						<WifiIcon size={8} color={T.magenta} />
						<Text style={s.trustText}>
							Deutschlands bestes Netz
						</Text>
					</View>
					<View style={s.trustItem}>
						<ShieldIcon size={8} color={T.magenta} />
						<Text style={s.trustText}>Mehrfach ausgezeichnet</Text>
					</View>
					<View style={s.trustItem}>
						<TagIcon size={8} color={T.magenta} />
						<Text style={s.trustText}>Keine versteckten Kosten</Text>
					</View>
				</View>

				{/* ━━ PRODUCT CARDS ━━ */}
				<View style={s.content}>
					<Text style={s.sectionHeading}>
						{items.length === 1
							? 'Ihr ausgew\u00E4hltes Produkt'
							: `Ihre ${items.length} ausgew\u00E4hlten Produkte`
						}
					</Text>
					<Text style={s.sectionDescription}>
						Vielen Dank, dass Sie sich bei uns gemeldet haben. Hier finden Sie eine Auflistung zu allen Daten 						{items.length === 1
							? 'Ihres neuen Tarifs'
							: 'Ihrer neuen Tarife'
						}. Wenn Sie Fragen haben oder direkt bestellen möchten, antworten Sie gern einfach auf diese E-Mail.
					</Text>
					{itemsWithCalc.map(({
						item, calc,
					}) => (
						<ProductCard key={item.id} item={item} calc={calc} />
					))}

					{/* Hint only visible on Page 1 if Page 2 exists, to explain the whitespace */}
					<Text
						style={s.continuedHint}
						render={({
							pageNumber, totalPages,
						}) => (
							pageNumber < totalPages
								? 'Fortsetzung der Produkt\u00FCbersicht auf der n\u00E4chsten Seite...'
								: ''
						)}
					/>
				</View>

				{/* ━━ GLOBAL CREDITS ━━ */}
				{basketCredits.length > 0 && (
					<View style={{
 marginHorizontal: 40,
marginTop: 2,
}}>
						{basketCredits.map(credit => (
							<View key={credit.id} style={[
 s.detailRow,
{
 paddingHorizontal: 4,
},
]}>
								<View style={{
 flexDirection: 'row',
alignItems: 'center',
gap: 4,
}}>
									<CheckIcon size={6} color={T.success} />
									<Text style={[
 s.detailLabel,
{
 color: T.success,
fontWeight: 700,
},
]}>
										{credit.name}
									</Text>
								</View>
								<Text style={s.detailValueGreen}>-{fmtPrice(credit.value)}</Text>
							</View>
						))}
					</View>
				)}

				{/* ━━ SUMMARY CARD ━━ */}
				{items.length > 0 && (
					<View style={s.summaryCard} wrap={false}>
						<Text style={s.summaryTitle}>Zusammenfassung</Text>

						{combinedSteps.map((step, idx) => (
							<View key={idx} style={s.summaryRow}>
								<Text style={s.summaryLabel}>
									{step.start === step.end
										? `Monat ${step.start}`
										: `Monat ${step.start} - ${step.end}`
									}
								</Text>
								<Text style={s.summaryValue}>{fmtPrice(step.total)}</Text>
							</View>
						))}

						<View style={s.summaryRow}>
							<Text style={s.summaryLabel}>Einmalige Kosten</Text>
							<Text style={[
								s.summaryValue,
								totalOneTime < 0 ? {
 color: '#34D399',
} : {
},
							]}>
								{totalOneTime < 0
									? `Gutschrift ${fmtPrice(Math.abs(totalOneTime))}`
									: fmtPrice(totalOneTime)
								}
							</Text>
						</View>

						<View style={s.summaryDivider} />

						<View style={s.summaryTotalRow}>
							<View>
								<Text style={s.summaryTotalLabel}>Durchschn. monatlich</Text>
								<Text style={s.summaryDailyHint}>
									{formatDailyPrice(totalMonthlyAvg)}
								</Text>
							</View>
							<View style={{
 flexDirection: 'row',
alignItems: 'baseline',
gap: 2,
}}>
								<Text style={s.summaryTotalValue}>{fmt(totalMonthlyAvg)}</Text>
								<Text style={s.summaryTotalSuffix}>{'\u20AC'}/mtl.</Text>
							</View>
						</View>
					</View>
				)}

				{/* ━━ URGENCY BAR (Scarcity / Loss Aversion) ━━ */}
				<View style={s.urgencyBar} wrap={false}>
					<ClockIcon size={9} />
					<Text style={s.urgencyText}>
						Es hat mich gefreut, dieses Angebot individuell für Sie zusammenzustellen.
						Aber beachten Sie bitte: Aktionspreise gelten nur im Aktionszeitraum.
						Ich empfehle Ihnen, sich diese Vorteile zeitnah zu sichern.
					</Text>
				</View>

				{/* ━━ CTA — more personal with rep name ━━ */}
				<View style={s.ctaSection} wrap={false}>
					<View style={s.ctaLeft}>
						<Text style={s.ctaTitle}>
							Interesse? Wir sind für Sie da.
						</Text>
						<Text style={s.ctaSubtitle}>{ctaSubline}</Text>
						{repName && (
							<Text style={s.ctaRepName}>
								Ihr Ansprechpartner: {repName}
							</Text>
						)}
					</View>
					<View style={s.ctaEmailBox}>
						<MailIcon size={9} />
						<Text style={s.ctaEmail}>{teamEmail}</Text>
					</View>
				</View>

				{/* ━━ BENEFITS (Social Proof) ━━ */}
				<View style={s.benefitsSection} wrap={false}>
					<View style={s.benefitCard}>
						<Text style={s.benefitTitle}>Persönliche Beratung</Text>
						<Text style={s.benefitText}>
							Ihr Ansprechpartner hilft bei Fragen und Bestellung.
						</Text>
					</View>
					<View style={s.benefitCard}>
						<Text style={s.benefitTitle}>Einfacher Wechsel</Text>
						<Text style={s.benefitText}>
							Kündigung beim Altanbieter übernehmen wir.
						</Text>
					</View>
					<View style={s.benefitCard}>
						<Text style={s.benefitTitle}>Kein Risiko</Text>
						<Text style={s.benefitText}>
							14 Tage Widerrufsrecht ab Vertragsabschluss.
						</Text>
					</View>
				</View>

				{/* ━━ FOOTER with legal note + logo ━━ */}
				<View style={s.footer} fixed>
					{/* Left: all footer text */}
					<View style={{
 flex: 1,
}}>
						<View style={s.footerTop}>
							<Text style={s.footerText}>
								Telekom Deutschland GmbH — Angebot vom {dateStr}
								{repName ? ` — Ihr Berater: ${repName}` : ''}
							</Text>
							<Text
								style={s.footerText}
								render={({
 pageNumber, totalPages,
}) =>
									`Seite ${pageNumber} von ${totalPages}`
								}
							/>
						</View>
						<Text style={s.footerLegal}>
							Änderungen und Irrtum vorbehalten. Die Empfehlung ist freibleibend und basiert auf den geltenden Allgemeinen Geschäftsbedingungen von Telekom
Deutschland GmbH für das jeweilige Produkt. Die Allgemeinen Geschäftsbedingungen sind in den Telekom Shops, bei den Telekom Partnern oder im Internet
unter www.telekom.de/agb erhältlich.
						</Text>
					</View>
					{/* Right: logo spanning full footer height */}
					{logoData && (
						<Image
							src={logoData}
							style={s.footerLogo}
						/>
					)}
				</View>
			</Page>
		</Document>
	);
};
