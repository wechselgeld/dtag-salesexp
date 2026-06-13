import React from 'react';
import {
	View, Text, Svg, Path,
} from '@react-pdf/renderer';
import type {
	Credit, PricingSettings,
} from '@/types/product';
import {
	styles, COLORS,
} from './styles';
import {
	formatCurrency,
} from './mobilfunk-section';
import type {
	CalculatedBasketItem,
} from './types';

interface SummarySectionProps {
	itemsWithCosts: CalculatedBasketItem[];
	basketCredits: Credit[];
	settings: PricingSettings;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
	itemsWithCosts,
	basketCredits,
	settings,
}) => {
	if (itemsWithCosts.length === 0) {
		return null;
	}

	const items = itemsWithCosts.map((entry) => entry.item);

	// 1. Calculate month-by-month combined costs for all 24 months
	const monthlyTotals = Array(24).fill(0);
	const standardTotals = Array(24).fill(0);

	// Combined activation/one-time costs (WITHOUT negative credits)
	let totalOneTimeActivation = 0;
	let totalCreditsValue = basketCredits.reduce((sum, c) => sum + c.value, 0);

	itemsWithCosts.forEach(({ item, costs }) => {
		costs.monthlyCosts.forEach((mc, idx) => {
			if (idx < 24) {
				monthlyTotals[idx] += mc.total;

				// Calculate standard (non-discounted) price for this month
				const stdBase = item.product.basePrice;
				const tvPkg = item.config.magentaTVPackage;
				let tvPkgPrice = 0;
				if (tvPkg === 'smart') { tvPkgPrice = settings.magentatv_smart_price; }
				else if (tvPkg === 'smartstream') { tvPkgPrice = settings.magentatv_smartstream_price; }
				else if (tvPkg === 'megastream') { tvPkgPrice = settings.magentatv_megastream_price; }

				const stdTotal = stdBase + costs.plusKartenCost + costs.regularAddonCost + tvPkgPrice;
				standardTotals[idx] += stdTotal;
			}
		});

		costs.oneTimeCosts.breakdown.forEach((fee) => {
			if (fee.cost > 0) {
				totalOneTimeActivation += fee.cost;
			}
			else {
				// Cashback and credits inside items
				totalCreditsValue += Math.abs(fee.cost);
			}
		});
	});

	// Compile list of explicit one-time credits
	interface OneTimeCreditDetail {
		name: string;
		value: number;
	}
	const oneTimeCreditsList: OneTimeCreditDetail[] = [];

	basketCredits.forEach((c) => {
		oneTimeCreditsList.push({
			name: c.name,
			value: c.value,
		});
	});

	itemsWithCosts.forEach(({ item, costs }) => {
		costs.oneTimeCosts.breakdown.forEach((fee) => {
			if (fee.cost < 0) {
				oneTimeCreditsList.push({
					name: `${item.product.name}: ${fee.name}`,
					value: Math.abs(fee.cost),
				});
			}
		});
	});

	const totalOneTimeCreditsSum = oneTimeCreditsList.reduce((sum, c) => sum + c.value, 0);
	const netOneTimePrice = Math.max(0, totalOneTimeActivation - totalOneTimeCreditsSum);

	// Find price steps for combined totals
	const combinedSteps: { start: number; end: number; total: number }[] = [
	];
	if (monthlyTotals.length > 0) {
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

	// Calculate total Ersparnis over 24 months
	// Ersparnis = (standard monthly costs sum - actual monthly costs sum) + total credits value
	let totalMonthlySavings = 0;
	for (let i = 0; i < 24; i++) {
		totalMonthlySavings += Math.max(0, standardTotals[i] - monthlyTotals[i]);
	}
	const totalErsparnis = totalMonthlySavings + totalCreditsValue;

	// Basket wide average and daily prices
	const averageMonthlyBasket = monthlyTotals.reduce((sum, v) => sum + v, 0) / 24;
	const dailyPriceBasket = averageMonthlyBasket / 30;

	// Boolean flags for dynamic features
	const hasMobile = items.some((item) => item.product.category === 'MOBILE');
	const hasFestnetz = items.some(
		(item) => item.product.category === 'DSL' || item.product.category === 'FIBER',
	);
	const hasConvergence = hasMobile && hasFestnetz;
	const hasTV = items.some((item) => !!item.config.magentaTVPackage);

	const mobileEntry = itemsWithCosts.find((entry) => entry.item.product.category === 'MOBILE');
	const pkNormal = mobileEntry?.item.config.plusKarten?.normal ?? mobileEntry?.item.config.plusKartenCount ?? 0;
	const pkFlex = mobileEntry?.item.config.plusKarten?.flex ?? 0;
	const pkKids = mobileEntry?.item.config.plusKarten?.kidsTeens ?? 0;
	const hasPlusKarten = (pkNormal + pkFlex + pkKids) > 0;

	// Calculate average price per SIM over 24 months (only if there is a MOBILE product)
	let averagePerSimText = '';
	if (mobileEntry) {
		const { item: mobileItem, costs: mobileCosts } = mobileEntry;
		const totalSims = 1 + pkNormal + pkFlex + pkKids;

		const mobileTotalMonthly24 = mobileCosts.monthlyCosts.reduce((sum, c) => sum + c.total, 0);
		const mobileCashback = mobileItem.product.specialPrices
			.filter(sp => mobileItem.config.selectedSpecialPriceIds.includes(sp.id) && sp.name.toLowerCase().includes('cashback'))
			.reduce((sum, sp) => sum + (sp.tiers[0]?.price ?? 240), 0);

		const mobileAverageMonthly = (mobileTotalMonthly24 - mobileCashback) / 24;
		const simAverage = mobileAverageMonthly / totalSims;
		averagePerSimText = `Ø ${simAverage.toFixed(2).replace('.', ',')} €`;
	}

	return (
		<View style={{ marginBottom: 15 }}>
			<View style={styles.gesamtsummeContainer} wrap={false}>
				<View style={styles.gesamtsummeHeader}>
				{/* Svg Shopping Cart Icon + Gesamtsumme Title */}
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Svg viewBox="0 0 24 24" style={{ width: 14, height: 14, marginRight: 6 }}>
						<Path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" fill="none" stroke={COLORS.magenta} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
						<Path d="M8 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" fill={COLORS.magenta} stroke="none" />
						<Path d="M19 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" fill={COLORS.magenta} stroke="none" />
					</Svg>
					<Text style={styles.gesamtsummeTitle}>GESAMTSUMME</Text>
				</View>
				<View style={styles.gesamtsummePrices}>
					<Text style={styles.gesamtsummeMonthlyText}>
						{formatCurrency(monthlyTotals[0])}
					</Text>
					<View style={{ width: 70, alignItems: 'flex-end' }}>
						{totalOneTimeCreditsSum > 0 ? (
							<>
								<Text style={[styles.crossedOutPrice, { fontSize: 9, marginBottom: 1 }]}>
									{formatCurrency(totalOneTimeActivation)}
								</Text>
								<Text style={[styles.gesamtsummeOneTimeText, { width: 'auto' }]}>
									{formatCurrency(netOneTimePrice)}
								</Text>
							</>
						) : (
							<Text style={styles.gesamtsummeOneTimeText}>
								{formatCurrency(totalOneTimeActivation)}
							</Text>
						)}
					</View>
				</View>
			</View>

			{/* High-Converting aggregate Durchschnitt/Tagespreis Box */}
			<View style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				backgroundColor: '#fcecf2',
				borderRadius: 6,
				padding: 6,
				marginTop: 4,
				marginBottom: 8,
				borderWidth: 1,
				borderColor: '#f9d2df',
				alignItems: 'center',
			}}>
				<Text style={{ fontSize: 8.5, color: COLORS.dark }}>Rechnerischer Durchschnitt über 24 Monate:</Text>
				<Text style={{ fontSize: 8.5, fontFamily: 'TeleNeo', fontWeight: 'bold', color: COLORS.magenta }}>
					{formatCurrency(averageMonthlyBasket)} / Monat (ca. {formatCurrency(dailyPriceBasket)} / Tag)
				</Text>
			</View>

			{/* Steps details and savings */}
			<View style={styles.gesamtsummeSteps}>
				{combinedSteps.slice(1).map((step) => (
					<Text key={step.start} style={styles.gesamtsummeStepText}>
						Ab dem {step.start}. Monat {formatCurrency(step.total)}
					</Text>
				))}
				{totalErsparnis > 0 && (
					<Text style={styles.gesamtsummeSavingsText}>
						Ersparnis über 24 Monate: {formatCurrency(totalErsparnis)}
					</Text>
				)}
			</View>
		</View>

		{/* DETAILED COST BREAKDOWN (Short Invoice style matching basket) */}
		<View style={{
			marginTop: 15,
			marginBottom: 8,
		}}>
			<Text style={{
				fontFamily: 'TeleNeo',
				fontWeight: 'bold',
				fontSize: 9,
				color: COLORS.magenta,
				textTransform: 'uppercase',
			}}>
				Warenkorb-Details (Kostenaufstellung)
			</Text>
		</View>

		<View>
			{itemsWithCosts.map(({ item, costs }, idx) => {
				const isMobile = item.product.category === 'MOBILE';
				const isFestnetz = item.product.category === 'DSL' || item.product.category === 'FIBER';
					
					let prodName = item.product.name;
					if (isFestnetz) {
						const tvPackageKey = item.config.magentaTVPackage;
						let tvPackageName = '';
						if (tvPackageKey === 'smart') { tvPackageName = 'Smart'; }
						else if (tvPackageKey === 'smartstream') { tvPackageName = 'SmartStream'; }
						else if (tvPackageKey === 'megastream') { tvPackageName = 'MegaStream'; }
						if (tvPackageKey) {
							prodName = `${item.product.name} mit MagentaTV ${tvPackageName}`;
						}
					}

					// Calculate step pricing dynamically for this specific item
					const itemSteps: { month: number; price: number }[] = [];
					if (costs.monthlyCosts.length > 0) {
						let lastPrice = costs.monthlyCosts[0].total;
						costs.monthlyCosts.forEach((mc, stepIdx) => {
							if (stepIdx > 0 && Math.abs(mc.total - lastPrice) > 0.01) {
								itemSteps.push({
									month: stepIdx + 1,
									price: mc.total,
								});
								lastPrice = mc.total;
							}
						});
					}

					return (
						<View key={item.id} wrap={false} style={{
							borderWidth: 1,
							borderColor: COLORS.magenta,
							borderRadius: 6,
							padding: 10,
							backgroundColor: COLORS.lightPinkBg,
							marginBottom: idx < itemsWithCosts.length - 1 ? 8 : 0,
						}}>
							{/* Product line item header */}
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2, marginBottom: 2 }}>
								<Text style={{ fontSize: 8, fontFamily: 'TeleNeo', fontWeight: 'bold', color: COLORS.dark, flex: 1 }}>
									{prodName}
								</Text>
								<Text style={{ fontSize: 8, fontFamily: 'TeleNeo', fontWeight: 'bold', color: COLORS.magenta, textAlign: 'right' }}>
									{formatCurrency(costs.monthlyCosts[0]?.total ?? 0)} mtl.
								</Text>
							</View>

							{/* Details of the Monthly components */}
							<View style={{ paddingLeft: 8, marginBottom: 2 }}>
								<Text style={{ fontSize: 7.5, color: COLORS.gray, paddingVertical: 1 }}>
									• Grundgebühr: {formatCurrency(costs.basePrice)}/Monat
								</Text>
								
								{isFestnetz && item.config.magentaTVPackage && (
									<Text style={{ fontSize: 7.5, color: COLORS.gray, paddingVertical: 1 }}>
										• MagentaTV Option: +{formatCurrency(costs.regularMagentaTVCost)}/Monat
									</Text>
								)}

								{isMobile && costs.plusKartenCost > 0 && (
									<Text style={{ fontSize: 7.5, color: COLORS.gray, paddingVertical: 1 }}>
										• Zusatzkarten (PlusKarten): +{formatCurrency(costs.plusKartenCost)}/Monat
									</Text>
								)}

								{costs.regularAddonCost > 0 && (
									<Text style={{ fontSize: 7.5, color: COLORS.gray, paddingVertical: 1 }}>
										• Optionen & Addons: +{formatCurrency(costs.regularAddonCost)}/Monat
									</Text>
								)}

								{itemSteps.map(step => (
									<Text key={step.month} style={{ fontSize: 7.5, color: COLORS.magenta, fontFamily: 'TeleNeo', fontWeight: 'bold', paddingVertical: 1 }}>
										• Preisänderung ab dem {step.month}. Monat: {formatCurrency(step.price)}/Monat
									</Text>
								))}
							</View>

							{/* Positive One-time fees breakdown of this product */}
							{costs.oneTimeCosts.breakdown.length > 0 && (
								<View style={{ paddingLeft: 8, marginTop: 2, marginBottom: 2 }}>
									<Text style={{ fontSize: 7.5, fontFamily: 'TeleNeo', fontWeight: 'bold', color: COLORS.dark, marginTop: 2, marginBottom: 2 }}>
										Einmalige Gebühren & Gutschriften:
									</Text>
									{costs.oneTimeCosts.breakdown.map((fee, feeIdx) => {
										const isCredit = fee.cost < 0;
										return (
											<View key={feeIdx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 1.5 }}>
												<Text style={{ fontSize: 7, color: isCredit ? '#004d2e' : COLORS.gray, flex: 1 }}>
													- {fee.name}
												</Text>
												<Text style={{ 
													fontSize: 7, 
													fontFamily: 'TeleNeo', 
													fontWeight: 'bold', 
													color: isCredit ? '#00a878' : COLORS.dark,
													textAlign: 'right'
												}}>
													{isCredit ? '-' : ''}{formatCurrency(Math.abs(fee.cost))}
												</Text>
											</View>
										);
									})}
								</View>
							)}
						</View>
					);
				})}
			</View>

			{/* One-time Credits Calculation Breakdown */}
			{oneTimeCreditsList.length > 0 && (
				<View wrap={false} style={{
					borderWidth: 1,
					borderColor: '#00a878',
					borderRadius: 6,
					padding: 10,
					marginTop: 10,
					backgroundColor: '#f2fcf7',
				}}>
					<Text style={[styles.subSectionTitle, { color: '#00a878', marginTop: 0, textTransform: 'uppercase', fontSize: 8.5 }]}>
						Einmalige Gutschriften & Cashback
					</Text>
					{oneTimeCreditsList.map((credit, idx) => (
						<View key={idx} style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							paddingVertical: 1.5,
							alignItems: 'center',
						}}>
							<Text style={{ fontSize: 8, color: '#004d2e', flex: 1 }}>• {credit.name}</Text>
							<Text style={{ fontSize: 8, fontFamily: 'TeleNeo', fontWeight: 'bold', color: '#00a878', textAlign: 'right' }}>
								-{formatCurrency(credit.value)}
							</Text>
						</View>
					))}
					<View style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						borderTopWidth: 0.5,
						borderTopColor: '#b2edd3',
						paddingTop: 4,
						marginTop: 4,
						alignItems: 'center',
					}}>
						<Text style={{ fontSize: 8.5, fontFamily: 'TeleNeo', fontWeight: 'bold', color: COLORS.dark, flex: 1 }}>
							Effektiver einmaliger Preis:
						</Text>
						<Text style={{ fontSize: 9.5, fontFamily: 'TeleNeo', fontWeight: 'bold', color: COLORS.magenta, textAlign: 'right' }}>
							{formatCurrency(netOneTimePrice)}
						</Text>
					</View>
				</View>
			)}
		</View>
	);
};

const HeartIcon = () => (
	<Svg viewBox="0 0 24 24" style={{ width: 8, height: 8, marginLeft: 4, marginTop: 1 }}>
		<Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={COLORS.white} stroke="none" />
	</Svg>
);

export interface AdBannersSectionProps {
	itemsWithCosts: CalculatedBasketItem[];
}

export const AdBannersSection: React.FC<AdBannersSectionProps> = ({
	itemsWithCosts,
}) => {
	const items = itemsWithCosts.map((entry) => entry.item);
	const hasMobile = items.some((item) => item.product.category === 'MOBILE');
	const hasFestnetz = items.some(
		(item) => item.product.category === 'DSL' || item.product.category === 'FIBER',
	);
	const hasConvergence = hasMobile && hasFestnetz;
	const hasTV = items.some((item) => !!item.config.magentaTVPackage);

	// Dynamic Marketing Banners Content - Enriched premium copywriting!
	let banner1 = {
		title: 'MAGENTA MOMENTS',
		sub: 'Sichere Dir wöchentlich neue Geschenke, Gewinnspiele und exklusive Partnervorteile von Top-Marken. Ganz einfach und ohne Zusatzkosten als Telekom-Kunde.',
		footer: 'Aktiviere Deine Vorteile direkt in der MeinMagenta App!',
		bgColor: COLORS.magenta,
	};

	let banner2 = {
		title: 'MAGENTATV SMART',
		sub: 'Die perfekte Kombination aus Fernsehen und Streaming. Über 150 HD-Sender, zeitversetztes Fernsehen und Zugriff auf RTL+ Premium, Netflix und Disney+ in einem Paket.',
		footer: 'Das beste Entertainment-Erlebnis für Dein gesamtes Zuhause!',
		bgColor: '#191919',
	};

	if (hasConvergence) {
		banner1 = {
			title: 'TELEKOM PLUSKARTE',
			sub: 'Mehr sparen im besten Netz: Buche Zusatzkarten für Familie oder Freunde ab nur 9,95 € mtl. Das Beste: Jede Zusatzkarte erhält automatisch das volle Datenvolumen der Hauptkarte!',
			footer: 'Volle Leistung, kleinerer Preis. Flexibel ohne Vertragslaufzeit buchbar!',
			bgColor: COLORS.magenta,
		};
		if (hasTV) {
			banner2 = {
				title: 'MAGENTA MOMENTS',
				sub: 'Sichere Dir exklusive Rabatte, Gutscheine & Gewinne von Top-Partnern wie Kinogutscheine, Streaming oder Shopping-Deals wöchentlich neu.',
				footer: 'Das kostenfreie Treueprogramm für Telekom-Kunden.',
				bgColor: '#191919',
			};
		}
	} else if (hasMobile && !hasFestnetz) {
		banner1 = {
			title: 'GLASFASER-ZUKUNFT',
			sub: 'Das modernste Internet für Dein Zuhause. Erlebe stabilen Highspeed mit Gigabit-Geschwindigkeiten, minimalen Ladezeiten und maximaler Zuverlässigkeit beim Streamen.',
			footer: 'Sichere Dir bis zu 100% Rabatt auf den Bereitstellungspreis!',
			bgColor: COLORS.magenta,
		};
		if (hasTV) {
			banner2 = {
				title: 'MAGENTA MOMENTS',
				sub: 'Sichere Dir exklusive Partnervorteile, Gutscheine und exklusive Highlights. Dein wöchentliches Dankeschön als Mobilfunk-Kunde.',
				footer: 'Einfach die MeinMagenta App laden und sofort profitieren!',
				bgColor: '#191919',
			};
		}
	} else if (hasFestnetz && !hasMobile) {
		banner1 = {
			title: 'ZWEITKARTEN IM BESTEN NETZ',
			sub: 'Ergänze Deinen Festnetzanschluss mit erstklassigem Mobilfunk. Für Deine Familie, Partner oder Zweitgeräte gibt es exklusive Zusatzkarten ab nur 9,95 € mtl.',
			footer: 'Profitiere von exklusiven Bundle-Vorteilen im Mobilfunknetz!',
			bgColor: COLORS.magenta,
		};
		if (hasTV) {
			banner2 = {
				title: 'MAGENTA MOMENTS',
				sub: 'Dein persönliches, kostenfreies Dankeschön als Telekom-Kunde. Wöchentlich wechselnde Geschenke, Rabatte und exklusive Erlebnis-Gewinnspiele.',
				footer: 'Kostenlose Vorteile direkt in der MeinMagenta App.',
				bgColor: '#191919',
			};
		}
	}

	return (
		<View style={styles.marketingBannersRow} wrap={false}>
			<View style={[
				styles.marketingBanner,
				{
					backgroundColor: banner1.bgColor,
				},
			]}>
				<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
					<Text style={styles.bannerTitle}>{banner1.title}</Text>
					{banner1.title === 'MAGENTA MOMENTS' && <HeartIcon />}
				</View>
				<Text style={styles.bannerSub}>{banner1.sub}</Text>
				<Text style={styles.bannerFooter}>{banner1.footer}</Text>
			</View>
			<View style={[
				styles.marketingBanner,
				{
					backgroundColor: banner2.bgColor,
				},
			]}>
				<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
					<Text style={styles.bannerTitle}>{banner2.title}</Text>
					{banner2.title === 'MAGENTA MOMENTS' && <HeartIcon />}
				</View>
				<Text style={[
					styles.bannerSub,
					banner2.bgColor === '#191919' ? { color: COLORS.magenta, fontFamily: 'TeleNeo', fontWeight: 'bold' } : {},
				]}>
					{banner2.sub}
				</Text>
				<Text style={styles.bannerFooter}>{banner2.footer}</Text>
			</View>
		</View>
	);
};

export interface LegalNoticeSectionProps {
	itemsWithCosts: CalculatedBasketItem[];
	settings: PricingSettings;
}

export const LegalNoticeSection: React.FC<LegalNoticeSectionProps> = ({
	itemsWithCosts,
	settings,
}) => {
	const items = itemsWithCosts.map((entry) => entry.item);
	const hasMobile = items.some((item) => item.product.category === 'MOBILE');
	const hasFestnetz = items.some(
		(item) => item.product.category === 'DSL' || item.product.category === 'FIBER',
	);
	const hasConvergence = hasMobile && hasFestnetz;

	const mobileEntry = itemsWithCosts.find((entry) => entry.item.product.category === 'MOBILE');
	const pkNormal = mobileEntry?.item.config.plusKarten?.normal ?? mobileEntry?.item.config.plusKartenCount ?? 0;
	const pkFlex = mobileEntry?.item.config.plusKarten?.flex ?? 0;
	const pkKids = mobileEntry?.item.config.plusKarten?.kidsTeens ?? 0;
	const hasPlusKarten = (pkNormal + pkFlex + pkKids) > 0;

	// Dynamic Legal Footnotes Content
	const mobileItem = items.find(item => item.product.category === 'MOBILE');
	const legalFootnotes: { id: string; text: string }[] = [];
	let fnIndex = 1;

	legalFootnotes.push({
		id: `fn-${fnIndex++}`,
		text: 'Externe Verlinkung: Dieser Link führt auf eine externe Quelle. Die Telekom Deutschland GmbH übernimmt keine Haftung für Inhalte dieser Quellen. Sie ist nicht dafür verantwortlich, dass solche Inhalte vollständig, richtig, aktuell und rechtmäßig sind.',
	});

	if (hasMobile && mobileItem) {
		const mobileDuration = mobileItem.product.contractDuration ?? 24;
		const mobileDurationText = mobileDuration === 1 ? '1 Monat (Flex)' : `${mobileDuration} Monate`;
		legalFootnotes.push({
			id: `fn-${fnIndex++}`,
			text: `Mobilfunk: Mindestvertragslaufzeit ${mobileDurationText}. Einmaliger Bereitstellungspreis für Hauptkarten beträgt 39,95 €. Inlandsgespräche und SMS in alle deutschen Netze sind enthalten.`,
		});
	}

	if (hasFestnetz) {
		const festnetzItem = items.find(item => item.product.category === 'DSL' || item.product.category === 'FIBER');
		const festnetzDuration = festnetzItem?.product.contractDuration ?? 24;
		const festnetzDurationText = festnetzDuration === 1 ? '1 Monat (Flex)' : `${festnetzDuration} Monate`;
		legalFootnotes.push({
			id: `fn-${fnIndex++}`,
			text: `Festnetz (DSL/Glasfaser): Mindestvertragslaufzeit ${festnetzDurationText}. Voraussetzung ist ein geeigneter physischer Anschluss an Ihrer Adresse. Einmaliger Bereitstellungspreis für einen neuen Anschluss beträgt 69,95 € (DSL) bzw. 0,00 € im Rahmen von zeitlich befristeten Glasfaser-Ausbau-Aktionen.`,
		});
	}

	if (hasConvergence) {
		legalFootnotes.push({
			id: `fn-${fnIndex++}`,
			text: 'M1 Kombivorteil: Voraussetzung für den M1 Vorteil ist das gleichzeitige Bestehen eines berechtigten Mobilfunk- und Festnetz-Vertrags der Telekom. Bei Beendigung eines Vertrages entfällt der M1 Kombivorteil (wie z. B. die Telefonie-Flat vom Festnetz in alle dt. Mobilfunknetze).',
		});
	}

	if (hasPlusKarten) {
		const hasPKFlex = items.some(item => (item.config.plusKarten?.flex ?? 0) > 0);
		const hasPKNormal = items.some(item => (item.config.plusKarten?.normal ?? item.config.plusKartenCount ?? 0) > 0 || (item.config.plusKarten?.kidsTeens ?? 0) > 0);
		const mainDuration = mobileItem?.product.contractDuration ?? 24;
		let pkDurationText = mainDuration === 1 ? '1 Monat (Flex)' : '24 Monate';
		if (mainDuration !== 1 && hasPKFlex) {
			if (hasPKNormal) {
				pkDurationText = '24 Monate (Standard) bzw. 1 Monat (Flex)';
			} else {
				pkDurationText = '1 Monat (Flex)';
			}
		}
		legalFootnotes.push({
			id: `fn-${fnIndex++}`,
			text: `PlusKarten: Voraussetzung für die Buchung von PlusKarten is ein berechtigter Telekom Mobilfunk-Hauptvertrag. Die Mindestvertragslaufzeit einer PlusKarte beträgt ${pkDurationText}. Endet der Hauptvertrag, entfallen die günstigen PlusKarten-Sonderkonditionen.`,
		});
	}

	const hasTV = items.some((item) => !!item.config.magentaTVPackage);
	if (hasTV) {
		legalFootnotes.push({
			id: `fn-${fnIndex++}`,
			text: 'MagentaTV: Erfordert einen geeigneten Internetanschluss (Mindestbandbreite empfohlen 10 MBit/s). RTL+ Premium, Netflix oder Disney+ sind nur in den jeweiligen Smart-, Smartstream- oder Megastream-Paketen inkludiert und erfordern eine kostenfreie Registrierung beim jeweiligen Streaming-Anbieter.',
		});
	}

	return (
		<View style={styles.legalNoticeBox} wrap={false}>
			<Text style={styles.legalNoticeTitle}>Rechtliche Hinweise & Fußnoten:</Text>
			{legalFootnotes.map((fn, idx) => (
				<Text key={fn.id} style={[styles.legalNoticeText, { marginBottom: 4 }]}>
					{idx + 1}. {fn.text}
				</Text>
			))}
			<View style={{ marginTop: 6, borderTopWidth: 0.5, borderTopColor: COLORS.lightGray, paddingTop: 6 }}>
				<Text style={styles.legalNoticeText}>
					Änderungen und Irrtum vorbehalten. Die Empfehlung ist freibleibend und basiert auf den geltenden Allgemeinen Geschäftsbedingungen von Telekom Deutschland GmbH für das jeweilige Produkt. Die Allgemeinen Geschäftsbedingungen sind in den Telekom Shops, bei den Telekom Partnern oder im Internet unter www.telekom.de/agb erhältlich.
				</Text>
			</View>
		</View>
	);
};
