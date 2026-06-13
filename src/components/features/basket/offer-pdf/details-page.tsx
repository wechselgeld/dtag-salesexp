import React from 'react';
import {
	View, Text,
} from '@react-pdf/renderer';
import type {
	BasketItem,
} from '@/lib/store/basket-store';
import {
	styles,
} from './styles';

interface DetailsPageProps {
	items: BasketItem[];
}

export const DetailsPage: React.FC<DetailsPageProps> = ({
	items,
}) => {
	if (items.length === 0) {
		return null;
	}

	return (
		<View style={styles.detailGrid}>
			{items.map((item, index) => {
				const {
 product, config,
} = item;
				const activeArgs = (product.salesArguments || [
]).filter((arg) => arg.isActive);

				let catName = 'Festnetz';
				if (product.category === 'MOBILE') {
					catName = 'Mobilfunk';
				} else if (product.category === 'MAGENTA_TV_OTT') {
					catName = 'MagentaTV OTT';
				} else if (product.category === 'DEVICE') {
					catName = 'Endgerät / Zubehör';
				}

				return (
					<View key={item.id} style={styles.detailSection} wrap={false}>
						<Text style={styles.detailSectionTitle}>
							{index + 1}. Detailansicht: {product.name} ({catName})
						</Text>

						{/* Basic product attributes */}
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Produkt-Kategorie:</Text>
							<Text style={styles.detailValue}>{product.category}</Text>
						</View>

						{/* Base Price */}
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Standard-Grundpreis:</Text>
							<Text style={styles.detailValue}>
								{product.basePrice.toFixed(2).replace('.', ',')} € / Monat
							</Text>
						</View>

						{/* Speeds / Data volumes */}
						{product.downloadSpeed && (
							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Download-Geschwindigkeit:</Text>
								<Text style={styles.detailValue}>bis zu {product.downloadSpeed} MBit/s</Text>
							</View>
						)}

						{product.category === 'MOBILE' && product.dataVolume && (
							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Inklusiv-Datenvolumen:</Text>
								<Text style={styles.detailValue}>{product.dataVolume} GB</Text>
							</View>
						)}

						{/* Contract duration */}
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Vertragslaufzeit:</Text>
							<Text style={styles.detailValue}>
								{product.contractDuration !== null && product.contractDuration !== undefined ? product.contractDuration : 24} {(product.contractDuration !== null && product.contractDuration !== undefined ? product.contractDuration : 24) === 1 ? 'Monat' : 'Monate'}
							</Text>
						</View>

						{/* Business Case selection */}
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Geschäftsvorfall (Aktion):</Text>
							<Text style={styles.detailValue}>
								{config.businessCase === 'NEW_ACTIVATION' && 'Neuentgelt / Bereitstellung'}
								{config.businessCase === 'MOVE' && 'Umzug'}
								{config.businessCase === 'PLAN_CHANGE' && 'Tarifwechsel'}
								{config.businessCase === 'SPEED_UP' && 'Geschwindigkeits-Upgrade'}
							</Text>
						</View>

						{/* Description */}
						{product.description && (
							<View style={[
 styles.detailRow,
{
 marginTop: 4,
},
]}>
								<Text style={styles.detailLabel}>Produktbeschreibung:</Text>
								<Text style={styles.detailValue}>{product.description}</Text>
							</View>
						)}

						{/* Sales arguments */}
						{activeArgs.length > 0 && (
							<View style={{
 marginTop: 6,
}}>
								<Text style={[
 styles.subSectionTitle,
{
 fontSize: 8.5,
},
]}>Produktvorteile & Argumente:</Text>
								{activeArgs.map((arg) => (
									<View key={arg.id} style={styles.bulletItem}>
										<View style={styles.bulletDot} />
										<Text style={styles.bulletText}>{arg.text}</Text>
									</View>
								))}
							</View>
						)}
					</View>
				);
			})}
		</View>
	);
};
