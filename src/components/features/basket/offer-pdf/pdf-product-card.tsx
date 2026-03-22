import React from 'react';
import {
	View,
	Text,
} from '@react-pdf/renderer';
import type {
	BasketItem,
} from '@/hooks/use-basket-store';
import type {
	Addon,
	AddonTier,
	CalculationResult,
} from '@/types/product';
import {
	MAGENTA_TV_PACKAGES,
} from '@/lib/constants/pricing';
import {
	T, CATEGORY_META, BUSINESS_CASE_LABELS, HARDWARE_TIER_LABELS,
} from './tokens';
import {
	s,
} from './styles';
import {
	CheckIcon, SparkleIcon, WifiIcon, TagIcon,
} from './icons';
import {
	fmt, fmtPrice, formatDailyPrice, computeSteps,
} from './helpers';

// ─── Types ───────────────────────────────────────────────────────────
interface SelectedAddon {
	addon: Addon;
	tier: AddonTier;
}

export interface ProductCardProps {
	item: BasketItem;
	calc: CalculationResult;
}

// ─── ProductCard ─────────────────────────────────────────────────────
export const ProductCard: React.FC<ProductCardProps> = ({
	item,
	calc,
}) => {
	const cat = CATEGORY_META[item.product.category] || CATEGORY_META.MOBILE;
	const bcLabel = BUSINESS_CASE_LABELS[item.config.businessCase] || '';
	const isDevice = item.product.category === 'DEVICE';
	const isTV = item.product.category === 'MAGENTA_TV_OTT';
	const isMobile = item.product.category === 'MOBILE';
	const isFixed = item.product.category === 'DSL' || item.product.category === 'FIBER';

	const steps = computeSteps(calc.monthlyCosts);
	const hasMultipleSteps = steps.length > 1;

	// Anchoring: show original price struck-through when promotions reduce average below base
	const hasPromoSavings = !isDevice
		&& item.config.selectedSpecialPriceIds.length > 0
		&& calc.averageMonthlyCost < calc.basePrice;
	const totalSaving24 = (calc.basePrice - calc.averageMonthlyCost) * 24;

	const tvPkg = item.config.magentaTVPackage
		? MAGENTA_TV_PACKAGES[item.config.magentaTVPackage]
		: null;

	const selectedSpecials = item.product.specialPrices.filter(sp =>
		item.config.selectedSpecialPriceIds.includes(sp.id),
	);

	const selectedAddons: SelectedAddon[] = (item.product.compatibleAddons || [
])
		.flatMap(addon => {
			const tier = addon.tiers.find(t =>
				item.config.selectedAddonIds.includes(t.id),
			);
			return tier ? [
 {
 addon,
tier,
},
] : [
];
		});

	const maxStepTotal = hasMultipleSteps ? Math.max(...steps.map(st => st.total)) : 0;
	const minStepTotal = hasMultipleSteps ? Math.min(...steps.map(st => st.total)) : 0;

	return (
		<View style={s.productCard} wrap={false}>
			{/* ── Header ── */}
			<View style={s.productCardHeader}>
				<View style={s.productCardHeaderLeft}>
					<View style={[
						s.categoryBadge,
						item.config.customBasePrice !== undefined
							? {
 backgroundColor: '#64748b',
} // Slate color for Bestand
							: {
 backgroundColor: cat.color,
},
					]}>
						<Text style={s.categoryBadgeText}>
							{item.config.customBasePrice !== undefined ? 'Bestand' : cat.label}
						</Text>
					</View>
					<Text style={s.productName}>
						{item.product.name}
						{tvPkg ? ` mit ${tvPkg.name}` : ''}
						{item.config.hardwareTier && item.config.hardwareTier !== 'none'
							? ` mit ${HARDWARE_TIER_LABELS[item.config.hardwareTier] || 'Smartphone'}`
							: ''}
					</Text>
				</View>
				{item.config.customBasePrice !== undefined ? (
					<View style={[
						s.businessCaseBadge,
						{
 backgroundColor: '#f1f5f9',
borderColor: '#cbd5e1',
},
					]}>
						<Text style={[
							s.businessCaseText,
							{
 color: '#475569',
},
						]}>Bestandsprodukt</Text>
					</View>
				) : (
					bcLabel && !isDevice && !isTV && (
						<View style={s.businessCaseBadge}>
							<Text style={s.businessCaseText}>{bcLabel}</Text>
						</View>
					)
				)}
			</View>

			{item.config.customBasePrice !== undefined ? (
				<View style={s.productCardBody}>
					<Text style={{
 fontSize: 9,
color: '#64748b',
lineHeight: 1.4,
marginBottom: 8,
}}>
						Dieses Produkt ist bereits Bestandteil Ihres Vertrags. Für dieses Angebot fallen hierfür keine zusätzlichen Einmal- oder monatlichen Kosten an.
					</Text>

					{/* Info Badges – Speed / Data Volume */}
					{isFixed && item.product.downloadSpeed && (
						<View style={s.infoBadgeRow}>
							<View style={[
								s.infoBadge,
								{
 borderColor: '#e2e8f0',
backgroundColor: '#f8fafc',
},
							]}>
								<WifiIcon size={7} color="#64748b" />
								<Text style={[
 s.infoBadgeText,
{
 color: '#64748b',
},
]}>
									bis zu {item.product.downloadSpeed} Mbit/s
								</Text>
							</View>
						</View>
					)}
					{isMobile && item.product.dataVolume && (
						<View style={s.infoBadgeRow}>
							<View style={[
								s.infoBadge,
								{
 borderColor: '#e2e8f0',
backgroundColor: '#f8fafc',
},
							]}>
								<Text style={[
 s.infoBadgeText,
{
 color: '#64748b',
},
]}>{item.product.dataVolume}</Text>
							</View>
						</View>
					)}

					<View style={[
						s.detailRow,
						{
 marginTop: 8,
borderTopWidth: 1,
borderTopColor: '#e2e8f0',
paddingTop: 6,
borderBottomWidth: 0,
},
					]}>
						<Text style={[
 s.detailLabelBold,
{
 color: '#475569',
},
]}>Monatliche Gesamtkosten (inkl. gewählter Optionen)</Text>
						<Text style={[
 s.detailValueBold,
{
 color: '#475569',
},
]}>{fmtPrice(calc.averageMonthlyCost)}</Text>
					</View>
				</View>
			) : (
				<View style={s.productCardBody}>
				{/* Price Highlight (Anchoring) */}
				<View style={s.priceHighlight}>
					<View style={s.priceHighlightLeft}>
						<Text style={s.priceLabel}>
							{isDevice
								? (item.config.hardwarePurchaseType === 'BUY'
									? 'EINMALZAHLUNG'
									: 'MONATLICHE MIETE')
								: (hasMultipleSteps
									? 'DURCHSCHN. MONATLICH'
									: 'MONATLICHER PREIS')
							}
						</Text>
						<View style={s.priceRow}>
							{hasPromoSavings && (
								<Text style={s.priceOld}>{fmt(calc.basePrice)}</Text>
							)}
							<Text style={s.priceMain}>
								{isDevice && item.config.hardwarePurchaseType === 'BUY'
									? fmt(item.product.purchasePrice ?? 0)
									: fmt(calc.averageMonthlyCost)
								}
							</Text>
							<Text style={s.priceSuffix}>
								{isDevice && item.config.hardwarePurchaseType === 'BUY'
									? '\u20AC'
									: '\u20AC/mtl.'}
							</Text>
						</View>
					</View>
					<View style={s.priceHighlightRight}>
						{totalSaving24 > 1 && (
							<View style={s.savingsBadge}>
								<Text style={s.savingsText}>
									Sie sparen {fmt(totalSaving24)} {'\u20AC'}
								</Text>
							</View>
						)}
						{!isDevice && (
							<Text style={s.dailyPrice}>
								{formatDailyPrice(calc.averageMonthlyCost)}
							</Text>
						)}
					</View>
				</View>

				{/* Info Badges – Speed / Data Volume */}
				{isFixed && item.product.downloadSpeed && (
					<View style={s.infoBadgeRow}>
						<View style={s.infoBadge}>
							<WifiIcon size={7} />
							<Text style={s.infoBadgeText}>
								bis zu {item.product.downloadSpeed} Mbit/s
							</Text>
						</View>
					</View>
				)}
				{isMobile && item.product.dataVolume && (
					<View style={s.infoBadgeRow}>
						<View style={s.infoBadge}>
							<Text style={s.infoBadgeText}>{item.product.dataVolume}</Text>
						</View>
					</View>
				)}

				{/* Unlimited Advantage */}
				{calc.hasUnlimitedAdvantage && (
					<View style={s.unlimitedBadge}>
						<SparkleIcon size={9} />
						<Text style={s.unlimitedBadgeText}>
							Kombivorteil: Alle PlusKarten mit unbegrenztem Datenvolumen
						</Text>
					</View>
				)}

				{/* Monthly Cost Timeline */}
				{hasMultipleSteps && !isDevice && (
					<View style={s.timelineSection}>
						<Text style={s.timelineHeader}>
							Kostenübersicht 24 Monate
						</Text>
						{steps.map((step, idx) => {
							const barW = maxStepTotal > 0
								? Math.max(24, (step.total / maxStepTotal) * 150)
								: 24;
							const isLowest = step.total <= minStepTotal + 0.01;
							return (
								<View key={idx} style={s.timelineRow}>
									<Text style={s.timelinePeriod}>
										{step.start === step.end
											? `Monat ${step.start}`
											: `Monat ${step.start} - ${step.end}`
										}
									</Text>
									<View
										style={[
											s.timelineBar,
											{
												width: barW,
												backgroundColor: isLowest && steps.length > 1
													? `${T.success}40`
													: `${cat.color}25`,
											},
										]}
									/>
									<Text
										style={[
											s.timelineValue,
											isLowest && steps.length > 1
												? {
 color: T.success,
}
												: {
},
										]}
									>
										{fmtPrice(step.total)}
									</Text>
								</View>
							);
						})}
					</View>
				)}

				{/* Detail Breakdown */}
				<View style={s.detailSection}>
					{!isDevice && (
						<View style={s.detailRow}>
							<Text style={s.detailLabel}>Grundpreis Tarif</Text>
							<Text style={s.detailValue}>{fmtPrice(calc.basePrice)}</Text>
						</View>
					)}

					{tvPkg && (
						<>
							<View style={[
 s.detailRow,
{
 borderBottomWidth: 0,
paddingBottom: 0,
},
]}>
								<Text style={s.detailLabel}>{tvPkg.name}</Text>
								<Text style={s.detailValue}>+{fmtPrice(calc.regularMagentaTVCost)}</Text>
							</View>
							{/* MagentaTV Features Tag-Row directly below its line item, with the divider AFTER it */}
							<View
								style={[
									s.featureRow,
									{
										marginTop: 0,
										marginBottom: 2,
										paddingBottom: 8,
										borderBottomWidth: 1,
										borderBottomColor: T.gray100,
									},
								]}
							>
								{tvPkg.features.map((feature, idx) => (
									<View
										key={idx}
										style={[
 s.featureTag,
{
 backgroundColor: '#FFF7ED',
},
]}
									>
										<CheckIcon size={6} color="#D97706" />
										<Text style={[
 s.featureTagText,
{
 color: '#D97706',
},
]}>
											{feature}
										</Text>
									</View>
								))}
							</View>
						</>
					)}

					{(item.config.plusKartenCount ?? 0) > 0 && (
						<View style={s.detailRow}>
							<Text style={s.detailLabel}>
								{item.config.plusKartenCount}x PlusKarte
							</Text>
							<Text style={s.detailValue}>+{fmtPrice(calc.plusKartenCost)}</Text>
						</View>
					)}

					{selectedAddons.map(({
 addon, tier,
}) => (
						<View key={tier.id} style={s.detailRow}>
							<View style={{
 flex: 1,
}}>
								<Text style={s.detailLabel}>
									{addon.name}{addon.tiers.length > 1 ? ` - ${tier.name}` : ''}
								</Text>
								{addon.description && (
									<Text style={s.addonDescription}>{addon.description}</Text>
								)}
							</View>
							<Text style={s.detailValue}>+{fmtPrice(tier.price)}</Text>
						</View>
					))}

					{selectedSpecials.map(sp => (
						<View key={sp.id} style={s.detailRow}>
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									gap: 4,
									flex: 1,
								}}
							>
								<TagIcon size={7} color={T.success} />
								<Text style={[
 s.detailLabel,
{
 color: T.success,
},
]}>{sp.name}</Text>
							</View>
							<Text style={s.detailValueGreen}>Aktion aktiv</Text>
						</View>
					))}

					{calc.oneTimeCosts.breakdown.length > 0 && (
						<>
							<View
								style={[
									s.detailRow,
									{
										marginTop: 4,
										paddingTop: 6,
									},
								]}
							>
								<Text style={s.detailLabelBold}>Einmalige Kosten</Text>
								<Text style={s.detailValueBold}>
									{fmtPrice(calc.oneTimeCosts.total)}
								</Text>
							</View>
							{calc.oneTimeCosts.breakdown.map((cost, idx) => (
								<View key={idx} style={s.detailRow}>
									<Text
										style={[
											s.detailLabel,
											{
												fontSize: 7,
												paddingLeft: 8,
											},
										]}
									>
										{cost.name}
									</Text>
									<Text
										style={[
											cost.cost < 0 ? s.detailValueGreen : s.detailValue,
											{
 fontSize: 7,
},
										]}
									>
										{cost.cost < 0
											? `-${fmtPrice(Math.abs(cost.cost))}`
											: fmtPrice(cost.cost)
										}
									</Text>
								</View>
							))}
						</>
					)}
				</View>

				{/* Sales Argument Tags */}
				{item.product.salesArguments?.filter(a => a.isActive).length > 0 && (
					<View style={s.featureRow}>
						{item.product.salesArguments
							.filter(a => a.isActive)
							.slice(0, 4)
							.map(arg => (
								<View key={arg.id} style={s.featureTag}>
									<CheckIcon size={6} color={T.success} />
									<Text style={s.featureTagText}>{arg.text}</Text>
								</View>
							))}
					</View>
				)}


			</View>
			)}
		</View>
	);
};
