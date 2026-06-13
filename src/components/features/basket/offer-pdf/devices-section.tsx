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

interface DevicesSectionProps {
	itemsWithCosts: CalculatedBasketItem[];
	settings: PricingSettings;
}

const BulletCheckmark = () => (
	<Text style={{ color: COLORS.magenta, fontWeight: 'bold', fontSize: 10, marginRight: 6, marginTop: -1 }}>•</Text>
);

export const DevicesSection: React.FC<DevicesSectionProps> = ({
	itemsWithCosts,
	settings,
}) => {
	const deviceItems = itemsWithCosts.filter(
		(entry) => entry.item.product.category === 'DEVICE',
	);

	if (deviceItems.length === 0) {
		return null;
	}

	return (
		<View style={{ marginBottom: 20 }}>
			{deviceItems.map(({ item, costs }, idx) => {
				const isBuy = item.config.hardwarePurchaseType === 'BUY';
				const manufacturer = item.product.deviceManufacturer?.trim();
				const combinedName = manufacturer
					? `${manufacturer} ${item.product.name}`
					: item.product.name;

				const purchaseTypeSuffix = isBuy ? ' (Kauf)' : ' (Miete)';
				const productName = combinedName + purchaseTypeSuffix;

				// For buying: standard monthly cost is 0. One-time is purchase price + shipping.
				// For renting: monthly is the rental price, one-time is shipping.
				const monthlyPrice = isBuy ? 0 : (costs.monthlyCosts[0]?.effectivePrice ?? item.product.rentalPrice ?? item.product.basePrice ?? 0);
				const oneTimePrice = isBuy
					? (item.product.purchasePrice ?? 0)
					: 0;

				const shippingFee = settings.shipping_hardware_fee;

				// One-time subtotal sum
				const totalOneTimeForThisDevice = oneTimePrice + shippingFee;

				// Rechnerischer 2-Jahre-Preis (only for rental)
				const totalMonthlyCosts24 = costs.monthlyCosts.reduce((sum, c) => sum + c.total, 0);
				const rechnerischer2JahrePrice = isBuy ? 0 : (totalMonthlyCosts24 / 24);

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
											<Text style={styles.priceText}>
												{formatCurrency(monthlyPrice)}
											</Text>
										</View>

										{/* One-Time Column inside card */}
										<View style={styles.oneTimePriceCol}>
											<Text style={styles.oneTimePriceText}>
												{formatCurrency(oneTimePrice)}
											</Text>
											{shippingFee > 0 && (
												<Text style={styles.priceSubNote}>
													zzgl. {formatCurrency(shippingFee)} Versand
												</Text>
											)}
										</View>
									</View>
								</View>

								{/* Contract Duration or Purchase indicator */}
								<Text style={styles.contractDuration}>
									{isBuy ? 'Kaufgerät (einmalige Zahlung)' : `Mietgerät (Mindestvertragslaufzeit ${item.product.contractDuration ?? 12} Monate)`}
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
												<Text style={styles.bulletTextBold}>Premium Hardware für Dein Telekom-Erlebnis</Text>
											</View>
											<View style={styles.bulletItem}>
												<BulletCheckmark />
												<Text style={styles.bulletText}>Schnelle Einrichtung & hervorragende Zuverlässigkeit</Text>
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
										{isBuy ? 'TEILSUMME ENDGERÄTE (KAUF)' : 'TEILSUMME ENDGERÄTE (MIETE)'}
									</Text>
									{!isBuy && (
										<Text style={{ fontSize: 7, color: '#005b8f', marginTop: 2 }}>
											Ø {formatCurrency(rechnerischer2JahrePrice)} pro Monat • {formatCurrency(rechnerischer2JahrePrice / 30)} pro Tag
										</Text>
									)}
								</View>
								<View style={styles.teilsummePrices}>
									<Text style={styles.teilsummeMonthlyText}>
										{formatCurrency(monthlyPrice)}
									</Text>
									<Text style={styles.teilsummeOneTimeText}>
										{formatCurrency(totalOneTimeForThisDevice)}
									</Text>
								</View>
							</View>

							{/* Rechnerischer price banner (Rent only!) */}
							{!isBuy && (
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
							)}
						</View>
					</View>
				);

				if (idx === 0) {
					return (
						<View key={item.id} wrap={false}>
							{/* Section Title (No Icon!) */}
							<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 12 }}>
								<Text style={[styles.sectionTitle, { marginBottom: 0, marginTop: 0 }]}>Endgeräte & Zubehör</Text>
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
