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
import type {
	CalculatedBasketItem,
} from './types';

export const formatCurrency = (val: number): string => {
	return `${val.toFixed(2).replace('.', ',')} €`;
};

export const getContractDurationText = (duration: number | null | undefined, defaultDuration = 24): string => {
	const val = duration !== null && duration !== undefined ? duration : defaultDuration;
	if (val === 1) {
		return 'Mindestvertragslaufzeit 1 Monat';
	}
	if (val === 0) {
		return 'Ohne Mindestvertragslaufzeit';
	}
	return `Mindestvertragslaufzeit ${val} Monate`;
};

interface MobilfunkSectionProps {
	itemsWithCosts: CalculatedBasketItem[];
	settings: PricingSettings;
}

const BulletCheckmark = () => (
	<Text style={{ color: COLORS.magenta, fontWeight: 'bold', fontSize: 10, marginRight: 6, marginTop: -1 }}>•</Text>
);

export const MobilfunkSection: React.FC<MobilfunkSectionProps> = ({
	itemsWithCosts,
	settings,
}) => {
	const mobileItems = itemsWithCosts.filter((entry) => entry.item.product.category === 'MOBILE');

	if (mobileItems.length === 0) {
		return null;
	}

	return (
		<View style={{
			marginBottom: 20,
		}}>
			{mobileItems.map(({ item, costs }, idx) => {
				const pkNormal = item.config.plusKarten?.normal ?? item.config.plusKartenCount ?? 0;
				const pkFlex = item.config.plusKarten?.flex ?? 0;
				const pkKids = item.config.plusKarten?.kidsTeens ?? 0;
				const totalPlusKarten = pkNormal + pkFlex + pkKids;

				// One-time subtotal is the sum of activation/shipping fees for this product
				const activationFeesSum = costs.oneTimeCosts.breakdown
					.filter(fee => !fee.name.toLowerCase().includes('gutschrift') && !fee.name.toLowerCase().includes('cashback'))
					.reduce((sum, fee) => sum + fee.cost, 0);

				// Rechnerischer 2-Jahre-Preis (average over 24 months, after mobile cashbacks, excluding activation)
				const totalMonthlyCosts24 = costs.monthlyCosts.reduce((sum, c) => sum + c.total, 0);
				const cashbackAmount = item.product.specialPrices
					.filter(sp => item.config.selectedSpecialPriceIds.includes(sp.id) && sp.name.toLowerCase().includes('cashback'))
					.reduce((sum, sp) => {
						const tierPrice = sp.tiers[0]?.price ?? 0;
						return sum + (tierPrice || 240);
					}, 0);

				const rechnerischer2JahrePrice = (totalMonthlyCosts24 - cashbackAmount) / 24;

				// Calculate actual Month 1 total for Mobile (base + TV + options + PlusKarten)
				const month1Cost = costs.monthlyCosts[0]?.total ?? 0;

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
									<Text style={styles.productName}>{item.product.name}</Text>
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

								<Text style={styles.contractDuration}>
									{getContractDurationText(item.product.contractDuration)}
								</Text>

								{/* Key Features Bullet points with Svg checkmarks */}
								<View style={styles.bulletList}>
									<View style={styles.bulletItem}>
										<BulletCheckmark />
										<Text style={styles.bulletTextBold}>
											{item.product.dataVolume || '∞'} GB Datenvolumen im besten 5G-Netz
										</Text>
									</View>
									<View style={styles.bulletItem}>
										<BulletCheckmark />
										<Text style={styles.bulletText}>
											Telefonie-/SMS-Flat in alle dt. Netze
										</Text>
									</View>
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

								{/* PlusKarte Heart highlight if PlusKarten exist and qualify for Unlimited Advantage */}
								{costs.hasUnlimitedAdvantage && (
									<View style={styles.plusKarteUnlimitedContainer}>
										<Text style={[
											styles.paragraphTextBold,
											{
												color: COLORS.magenta,
												marginBottom: 3,
											},
										]}>
											Unlimited durch Deine MagentaMobil PlusKarte
										</Text>
										<Text style={styles.paragraphText}>
											Jetzt kannst Du ohne Limit streamen, surfen und teilen – auf all Deinen Karten.
										</Text>
									</View>
								)}
							</View>
						</View>

						{/* Zusatzkarten (PlusKarten) Cards list */}
						{totalPlusKarten > 0 && (
							<View style={{
								marginTop: 5,
							}}>
								<Text style={styles.zusatzkartenHeader}>Zusatzkarten</Text>

								{pkNormal > 0 && (
									<View style={styles.zusatzkartenCard} wrap={false}>
										<View style={styles.zusatzkarteRow}>
											<View style={{
												flex: 1,
												marginRight: 10,
											}}>
												<Text style={styles.zusatzkarteName}>
													{pkNormal}x MagentaMobil PlusKarte
												</Text>
												<Text style={styles.zusatzkarteSubtext}>
													{costs.hasUnlimitedAdvantage
														? 'Mit Unlimited Highspeed-Datenvolumen im besten 5G-Netz'
														: `Mit ${item.product.dataVolume || '∞'} GB Datenvolumen im besten 5G-Netz`
													}
												</Text>
											</View>
											<View style={styles.priceArea}>
												<View style={styles.monthlyPriceCol}>
													<Text style={styles.priceText}>
														{formatCurrency(settings.plus_karte_first_price + Math.max(0, pkNormal - 1) * settings.plus_karte_following_price)}
													</Text>
													{pkNormal > 1 && (
														<Text style={styles.priceSubNote}>
															1. Karte {formatCurrency(settings.plus_karte_first_price)}, weitere {formatCurrency(settings.plus_karte_following_price)}
														</Text>
													)}
												</View>
												<View style={styles.oneTimePriceCol}>
													{settings.plus_karte_promo_free_activation_normal ? (
														<>
															<Text style={styles.crossedOutPrice}>
																{formatCurrency(pkNormal * settings.plus_karte_activation_fee_normal)}
															</Text>
															<Text style={styles.oneTimePriceText}>0,00 €</Text>
														</>
													) : (
														<Text style={styles.oneTimePriceText}>
															{formatCurrency(pkNormal * settings.plus_karte_activation_fee_normal)}
														</Text>
													)}
												</View>
											</View>
										</View>
									</View>
								)}

								{pkFlex > 0 && (
									<View style={styles.zusatzkartenCard} wrap={false}>
										<View style={styles.zusatzkarteRow}>
											<View style={{
												flex: 1,
												marginRight: 10,
											}}>
												<Text style={styles.zusatzkarteName}>
													{pkFlex}x MagentaMobil PlusKarte Flex
												</Text>
												<Text style={styles.zusatzkarteSubtext}>
													Ohne Vertragslaufzeit • {costs.hasUnlimitedAdvantage
														? 'Mit Unlimited Highspeed-Datenvolumen im besten 5G-Netz'
														: `Mit ${item.product.dataVolume || '∞'} GB Datenvolumen`
													}
												</Text>
											</View>
											<View style={styles.priceArea}>
												<View style={styles.monthlyPriceCol}>
													<Text style={styles.priceText}>
														{formatCurrency(pkFlex * settings.plus_karte_flex_price)}
													</Text>
												</View>
												<View style={styles.oneTimePriceCol}>
													{settings.plus_karte_promo_free_activation_flex ? (
														<>
															<Text style={styles.crossedOutPrice}>
																{formatCurrency(pkFlex * settings.plus_karte_activation_fee_flex)}
															</Text>
															<Text style={styles.oneTimePriceText}>0,00 €</Text>
														</>
													) : (
														<Text style={styles.oneTimePriceText}>
															{formatCurrency(pkFlex * settings.plus_karte_activation_fee_flex)}
														</Text>
													)}
												</View>
											</View>
										</View>
									</View>
								)}

								{pkKids > 0 && (
									<View style={styles.zusatzkartenCard} wrap={false}>
										<View style={styles.zusatzkarteRow}>
											<View style={{
												flex: 1,
												marginRight: 10,
											}}>
												<Text style={styles.zusatzkarteName}>
													{pkKids}x MagentaMobil PlusKarte Kids & Teens
												</Text>
												<Text style={styles.zusatzkarteSubtext}>
													Für Kinder & Jugendliche unter 18 Jahren • {costs.hasUnlimitedAdvantage
														? 'Mit Unlimited Highspeed-Datenvolumen im besten 5G-Netz'
														: `Mit ${item.product.dataVolume || '∞'} GB Datenvolumen`
													}
												</Text>
											</View>
											<View style={styles.priceArea}>
												<View style={styles.monthlyPriceCol}>
													<Text style={styles.priceText}>
														{formatCurrency(pkKids * settings.plus_karte_kids_price)}
													</Text>
												</View>
												<View style={styles.oneTimePriceCol}>
													<Text style={styles.oneTimePriceText}>
														{formatCurrency(pkKids * settings.plus_karte_activation_fee_kids)}
													</Text>
												</View>
											</View>
										</View>
									</View>
								)}
							</View>
						)}

						<View wrap={false}>
							{/* Highlight subtotal bar */}
							<View style={styles.teilsummeRow}>
								<View style={{ flex: 1, marginRight: 10 }}>
									<Text style={styles.teilsummeText}>
										TEILSUMME MOBILFUNK
									</Text>
									<Text style={{ fontSize: 7, color: '#005b8f', marginTop: 2 }}>
										Ø {formatCurrency(rechnerischer2JahrePrice)} pro Monat  •  {formatCurrency(rechnerischer2JahrePrice / 30)} pro Tag
									</Text>
								</View>
								<View style={styles.teilsummePrices}>
									<Text style={styles.teilsummeMonthlyText}>
										{formatCurrency(month1Cost)}
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
									Zeigt den durchschnittlichen monatlichen Preis unter Berücksichtigung aller ausgewählten Aktionen (wie Cashback). Zusätzlich fallen ggf. Bereitstellungspreise an.
								</Text>
							</View>
						</View>
					</View>
				);

				if (idx === 0) {
					return (
						<View key={item.id} wrap={false}>
							{/* Section Title with Svg Smartphone Icon removed */}
							<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 12 }}>
								<Text style={[styles.sectionTitle, { marginBottom: 0, marginTop: 0 }]}>Mobilfunk</Text>
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
