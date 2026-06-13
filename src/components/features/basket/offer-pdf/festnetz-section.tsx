import React from 'react';
import {
	View, Text, Svg, Path,
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

interface FestnetzSectionProps {
	itemsWithCosts: CalculatedBasketItem[];
	settings: PricingSettings;
}

const BulletCheckmark = () => (
	<Text style={{ color: COLORS.magenta, fontWeight: 'bold', fontSize: 10, marginRight: 6, marginTop: -1 }}>•</Text>
);

export const FestnetzSection: React.FC<FestnetzSectionProps> = ({
	itemsWithCosts,
	settings,
}) => {
	const fixedItems = itemsWithCosts.filter(
		(entry) => entry.item.product.category === 'DSL' || entry.item.product.category === 'FIBER',
	);

	if (fixedItems.length === 0) {
		return null;
	}

	return (
		<View style={{
			marginBottom: 20,
		}}>
			{fixedItems.map(({ item, costs }, idx) => {
				const tvPackageKey = item.config.magentaTVPackage;
				let tvPackageName = '';
				if (tvPackageKey === 'smart') { tvPackageName = 'Smart'; }
				else if (tvPackageKey === 'smartstream') { tvPackageName = 'SmartStream'; }
				else if (tvPackageKey === 'megastream') { tvPackageName = 'MegaStream'; }

				const combinedName = tvPackageKey
					? `${item.product.name} mit MagentaTV ${tvPackageName}`
					: item.product.name;

				// Calculate step pricing dynamically by scanning the 24 months
				const priceSteps: { month: number; price: number }[] = [];
				if (costs.monthlyCosts.length > 0) {
					let lastPrice = costs.monthlyCosts[0].total;
					costs.monthlyCosts.forEach((mc, idx) => {
						if (idx > 0 && Math.abs(mc.total - lastPrice) > 0.01) {
							priceSteps.push({
								month: idx + 1,
								price: mc.total,
							});
							lastPrice = mc.total;
						}
					});
				}

				// One-time subtotal is the sum of activation/shipping fees for this product
				const activationFeesSum = costs.oneTimeCosts.breakdown
					.filter(fee => !fee.name.toLowerCase().includes('gutschrift') && !fee.name.toLowerCase().includes('cashback'))
					.reduce((sum, fee) => sum + fee.cost, 0);

				// Rechnerischer 2-Jahre-Preis (average over 24 months, after router credits, excluding activation)
				const totalMonthlyCosts24 = costs.monthlyCosts.reduce((sum, c) => sum + c.total, 0);
				const routerGutschriftAmount = item.product.specialPrices
					.filter(sp => item.config.selectedSpecialPriceIds.includes(sp.id) && sp.name.toLowerCase().includes('router'))
					.reduce((sum, sp) => {
						const tierPrice = sp.tiers[0]?.price ?? 0;
						return sum + (tierPrice || 100);
					}, 0);

				const rechnerischer2JahrePrice = (totalMonthlyCosts24 - routerGutschriftAmount) / 24;

				const cardView = (
					<View style={{
						marginBottom: 15,
					}}>
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
									<Text style={styles.productName}>{combinedName}</Text>
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

								{/* Overlap Fix: contract duration is a sibling, not nested inside columnName with flex:1 */}
								<Text style={styles.contractDuration}>
									{getContractDurationText(item.product.contractDuration)}
								</Text>

								{/* Key Features Bullet points with Svg checkmarks */}
								<View style={styles.bulletList}>
									<View style={styles.bulletItem}>
										<BulletCheckmark />
										<Text style={styles.bulletTextBold}>
											{item.product.downloadSpeed ? `${item.product.downloadSpeed} MBit/s (Down)` : 'Highspeed-Internet'}
											{item.product.downloadSpeed && ` / ${(item.product.downloadSpeed / 2).toFixed(0)} MBit/s (Up)`}
										</Text>
									</View>

									{tvPackageKey === 'smart' && (
										<>
											<View style={styles.bulletItem}>
												<BulletCheckmark />
												<Text style={styles.bulletText}>MagentaTV+</Text>
											</View>
											<View style={styles.bulletItem}>
												<BulletCheckmark />
												<Text style={styles.bulletText}>RTL+ Premium</Text>
											</View>
										</>
									)}

									{tvPackageKey === 'smartstream' && (
										<>
											<View style={styles.bulletItem}>
												<BulletCheckmark />
												<Text style={styles.bulletText}>MagentaTV+</Text>
											</View>
											<View style={styles.bulletItem}>
												<BulletCheckmark />
												<Text style={styles.bulletText}>RTL+ Premium</Text>
											</View>
											<View style={styles.bulletItem}>
												<BulletCheckmark />
												<Text style={styles.bulletText}>Netflix Standard mit Werbung</Text>
											</View>
											<View style={styles.bulletItem}>
												<BulletCheckmark />
												<Text style={styles.bulletText}>Disney+ Standard mit Werbung</Text>
											</View>
										</>
									)}

									{tvPackageKey === 'megastream' && (
										<>
											<View style={styles.bulletItem}>
												<BulletCheckmark />
												<Text style={styles.bulletText}>MagentaTV+</Text>
											</View>
											<View style={styles.bulletItem}>
												<BulletCheckmark />
												<Text style={styles.bulletText}>RTL+ Premium</Text>
											</View>
											<View style={styles.bulletItem}>
												<BulletCheckmark />
												<Text style={styles.bulletText}>Netflix Standard (werbefrei)</Text>
											</View>
											<View style={styles.bulletItem}>
												<BulletCheckmark />
												<Text style={styles.bulletText}>Disney+ Standard (werbefrei)</Text>
											</View>
											<View style={styles.bulletItem}>
												<BulletCheckmark />
												<Text style={styles.bulletText}>Apple TV+ (für zuhause und unterwegs)</Text>
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
										{combinedName ? `TEILSUMME ${combinedName.toUpperCase()}` : 'TEILSUMME FESTNETZ'}
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
							{/* Section Title without Router Icon */}
							<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 12 }}>
								<Text style={[styles.sectionTitle, { marginBottom: 0, marginTop: 0 }]}>Festnetz</Text>
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
