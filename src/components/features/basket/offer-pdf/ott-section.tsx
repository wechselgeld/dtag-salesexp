import React from 'react';
import {
	View, Text,
} from '@react-pdf/renderer';
import type {
	PricingSettings,
} from '@/types/product';
import {
	styles, COLORS,
} from './styles';
import {
	formatCurrency,
	getContractDurationText,
} from './mobilfunk-section';
import type {
	CalculatedBasketItem,
} from './types';

interface OTTSectionProps {
	itemsWithCosts: CalculatedBasketItem[];
	settings: PricingSettings;
}

const BulletCheckmark = () => (
	<Text style={{ color: COLORS.magenta, fontWeight: 'bold', fontSize: 10, marginRight: 6, marginTop: -1 }}>•</Text>
);

export const OTTSection: React.FC<OTTSectionProps> = ({
	itemsWithCosts,
	settings,
}) => {
	const ottItems = itemsWithCosts.filter(
		(entry) => entry.item.product.category === 'MAGENTA_TV_OTT',
	);

	if (ottItems.length === 0) {
		return null;
	}

	return (
		<View style={{ marginBottom: 20 }}>
			{ottItems.map(({ item, costs }, idx) => {
				const productName = item.product.name;

				// Calculate step pricing dynamically by scanning the 24 months
				const priceSteps: { month: number; price: number }[] = [];
				if (costs.monthlyCosts.length > 0) {
					let lastPrice = costs.monthlyCosts[0].total;
					costs.monthlyCosts.forEach((mc, index) => {
						if (index > 0 && Math.abs(mc.total - lastPrice) > 0.01) {
							priceSteps.push({
								month: index + 1,
								price: mc.total,
							});
							lastPrice = mc.total;
						}
					});
				}

				// One-time subtotal is the sum of activation fees for this product
				const activationFeesSum = costs.oneTimeCosts.breakdown
					.filter(fee => !fee.name.toLowerCase().includes('gutschrift') && !fee.name.toLowerCase().includes('cashback'))
					.reduce((sum, fee) => sum + fee.cost, 0);

				// Rechnerischer 2-Jahre-Preis
				const totalMonthlyCosts24 = costs.monthlyCosts.reduce((sum, c) => sum + c.total, 0);
				const rechnerischer2JahrePrice = totalMonthlyCosts24 / 24;

				const activeArgs = (item.product.salesArguments || []).filter(arg => arg.isActive);

				const cardView = (
					<View style={{ marginBottom: 15 }}>
						<View>
							{/* Subheader row */}
							<View style={styles.sectionHeaderRow}>
								<Text style={styles.sectionHeaderTitle} />
								<View style={styles.sectionHeaderColumns}>
									<Text style={styles.sectionHeaderColMonthly}>Monatlich</Text>
									<Text style={styles.sectionHeaderColOneTime}>Einmalig</Text>
								</View>
							</View>

							{/* Main Card */}
							<View style={styles.productCard} wrap={false}>
								<View style={styles.productCardHeader}>
									<Text style={styles.productName}>{productName}</Text>
									<View style={styles.priceArea}>
										{/* Monthly Column inside card */}
										<View style={styles.monthlyPriceCol}>
											{costs.monthlyCosts[0]?.effectivePrice < costs.monthlyCosts[0]?.basePrice ? (
												<>
													<Text style={styles.crossedOutPrice}>
														{formatCurrency(costs.monthlyCosts[0].basePrice)}
													</Text>
													<Text style={styles.priceText}>
														{formatCurrency(costs.monthlyCosts[0].effectivePrice)}
													</Text>
												</>
											) : (
												<Text style={styles.priceText}>
													{formatCurrency(costs.monthlyCosts[0]?.effectivePrice ?? item.product.basePrice)}
												</Text>
											)}

											{priceSteps.map(step => (
												<Text key={step.month} style={styles.priceSubNote}>
													Ab dem {step.month}. Monat {formatCurrency(step.price)}
												</Text>
											))}
										</View>

										{/* One-Time Column inside card */}
										<View style={styles.oneTimePriceCol}>
											{item.product.activationFeeNew ? (
												<Text style={styles.oneTimePriceText}>
													{formatCurrency(item.product.activationFeeNew)}
												</Text>
											) : (
												<Text style={styles.oneTimePriceText}>0,00 €</Text>
											)}
										</View>
									</View>
								</View>

								{/* Contract Duration */}
								<Text style={styles.contractDuration}>
									{getContractDurationText(item.product.contractDuration)}
								</Text>

								{/* Key Features Bullet points */}
								<View style={styles.bulletList}>
									{activeArgs.length > 0 ? (
										activeArgs.map(arg => (
											<View key={arg.id} style={styles.bulletItem}>
												<BulletCheckmark />
												<Text style={styles.bulletText}>{arg.text}</Text>
											</View>
										))
									) : (
										<>
											<View style={styles.bulletItem}>
												<BulletCheckmark />
												<Text style={styles.bulletTextBold}>Streamen auf all Deinen Geräten</Text>
											</View>
											<View style={styles.bulletItem}>
												<BulletCheckmark />
												<Text style={styles.bulletText}>Über 150 HD-Sender und riesige Megathek inklusive</Text>
											</View>
										</>
									)}
								</View>

								{/* Sonderkonditionen */}
								{item.config.selectedSpecialPriceIds.length > 0 && (
									<View style={styles.specialPriceHighlightBox}>
										<Text style={styles.specialPriceHeader}>Deine Sonderkonditionen & Rabatte</Text>
										{item.product.specialPrices
											.filter(sp => item.config.selectedSpecialPriceIds.includes(sp.id))
											.map(sp => (
												<View key={sp.id} style={styles.specialPriceRow}>
													<Text style={styles.specialPriceLabel}>• {sp.name}</Text>
													{sp.tiers[0]?.price !== undefined && sp.tiers[0]?.price !== null && sp.tiers[0]?.price !== 0 && (
														<Text style={styles.specialPriceValue}>
															-{formatCurrency(sp.tiers[0].price)}
														</Text>
													)}
												</View>
											))}
									</View>
								)}
							</View>
						</View>

						<View wrap={false}>
							{/* Highlight subtotal bar */}
							<View style={styles.teilsummeRow}>
								<View style={{ flex: 1, marginRight: 10 }}>
									<Text style={styles.teilsummeText}>
										TEILSUMME MAGENTATV OTT
									</Text>
									<Text style={{ fontSize: 7, color: '#005b8f', marginTop: 2 }}>
										Ø {formatCurrency(rechnerischer2JahrePrice)} pro Monat  •  {formatCurrency(rechnerischer2JahrePrice / 30)} pro Tag
									</Text>
								</View>
								<View style={styles.teilsummePrices}>
									<Text style={styles.teilsummeMonthlyText}>
										{formatCurrency(costs.monthlyCosts[0]?.total ?? 0)}
									</Text>
									<Text style={styles.teilsummeOneTimeText}>
										{formatCurrency(activationFeesSum)}
									</Text>
								</View>
							</View>

							{/* Rechnerischer price banner */}
							<View style={styles.rechnerischerBanner}>
								<Text style={styles.rechnerischerTitle}>
									Rechnerischer 2-Jahre-Preis:{' '}
									<Text style={styles.rechnerischerPriceHighlight}>
										{formatCurrency(rechnerischer2JahrePrice)} mtl.
									</Text>
								</Text>
								<Text style={styles.rechnerischerDesc}>
									Zeigt den durchschnittlichen monatlichen Preis unter Berücksichtigung aller ausgewählten Aktionen. Zusätzlich fallen ggf. Bereitstellungspreise an.
								</Text>
							</View>
						</View>
					</View>
				);

				if (idx === 0) {
					return (
						<View key={item.id} wrap={false}>
							{/* Section Title (No Icon!) */}
							<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 12 }}>
								<Text style={[styles.sectionTitle, { marginBottom: 0, marginTop: 0 }]}>MagentaTV OTT</Text>
							</View>
							{cardView}
						</View>
					);
				}

				return (
					<View key={item.id}>
						{cardView}
					</View>
				);
			})}
		</View>
	);
};
