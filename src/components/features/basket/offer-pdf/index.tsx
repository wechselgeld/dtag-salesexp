import React from 'react';
import {
	Document, Page, View, Text,
} from '@react-pdf/renderer';
import type {
	OfferDocumentProps,
	CalculatedBasketItem,
} from './types';
import {
	styles,
} from './styles';
import {
	Header,
} from './header';
import {
	Footer,
} from './footer';
import {
	MobilfunkSection,
} from './mobilfunk-section';
import {
	FestnetzSection,
} from './festnetz-section';
import {
	SummarySection,
	AdBannersSection,
	LegalNoticeSection,
} from './summary-section';
import {
	DetailsPage,
} from './details-page';
import {
	ContactSection,
} from './contact-section';
import {
	OTTSection,
} from './ott-section';
import {
	DevicesSection,
} from './devices-section';
import {
	calculateProductCosts,
} from '@/hooks/use-cost-calculator';

export const OfferDocument: React.FC<OfferDocumentProps> = ({
	items,
	basketCredits,
	settings,
	salesRepName,
	teamEmail,
	locationName,
}) => {
	const hasMobile = items.some((item) => item.product.category === 'MOBILE');
	const hasFestnetz = items.some(
		(item) => item.product.category === 'DSL' || item.product.category === 'FIBER',
	);
	const hasOTT = items.some((item) => item.product.category === 'MAGENTA_TV_OTT');
	const hasDevices = items.some((item) => item.product.category === 'DEVICE');

	const itemsWithCosts = React.useMemo<CalculatedBasketItem[]>(() => {
		return items.map((item) => {
			const costs = calculateProductCosts({
				product: item.product,
				businessCase: item.config.businessCase,
				magentaTVPackage: item.config.magentaTVPackage,
				selectedSpecialPriceIds: item.config.selectedSpecialPriceIds,
				selectedAddonIds: item.config.selectedAddonIds,
				vouchers: item.config.vouchers,
				hardwarePurchaseType: item.config.hardwarePurchaseType,
				plusKartenCount: item.config.plusKartenCount,
				plusKarten: item.config.plusKarten,
				settings,
				customBasePrice: item.config.customBasePrice,
				hardwareTier: item.config.hardwareTier,
			});
			return {
				item,
				costs,
			};
		});
	}, [
		items,
		settings,
	]);

	// Build ordered list of active categories in the basket
	const activeCategories: string[] = [];
	if (hasMobile) activeCategories.push('MOBILE');
	if (hasFestnetz) activeCategories.push('FESTNETZ');
	if (hasOTT) activeCategories.push('OTT');
	if (hasDevices) activeCategories.push('DEVICES');

	return (
		<Document title="Dein persönliches Angebot der Telekom">
			<Page size="A4" style={styles.page}>
				{/* PAGE 1: Header, Welcome text, and FIRST active category */}
				<Header title="Deine persönliche Empfehlung" />

				<Text style={styles.welcomeText}>
					{salesRepName?.trim()
						? `Vielen Dank für das nette Gespräch. Wie besprochen, hier Deine versprochene Empfehlung. Ich habe die besten Tarife, Preisvorteile und Sonderkonditionen für Dich zusammengestellt. Bei Fragen steht Dir Dein persönlicher Ansprechpartner oder unser Team jederzeit gerne zur Verfügung.`
						: 'Vielen Dank für das nette Gespräch. Wie besprochen, hier Deine versprochene Empfehlung. Ich habe die besten Tarife, Preisvorteile und Sonderkonditionen für Dich zusammengestellt. Bei Fragen steht unser Team jederzeit gerne zur Verfügung.'
					}
				</Text>

				{activeCategories[0] === 'MOBILE' && (
					<MobilfunkSection itemsWithCosts={itemsWithCosts} settings={settings} />
				)}
				{activeCategories[0] === 'FESTNETZ' && (
					<FestnetzSection itemsWithCosts={itemsWithCosts} settings={settings} />
				)}
				{activeCategories[0] === 'OTT' && (
					<OTTSection itemsWithCosts={itemsWithCosts} settings={settings} />
				)}
				{activeCategories[0] === 'DEVICES' && (
					<DevicesSection itemsWithCosts={itemsWithCosts} settings={settings} />
				)}

				{/* SUBSEQUENT ACTIVE CATEGORIES: Each starting on its own fresh page */}
				{activeCategories.slice(1).map((category) => (
					<View key={category} break style={{ marginTop: 15 }}>
						<Header title="" />
						{category === 'MOBILE' && (
							<MobilfunkSection itemsWithCosts={itemsWithCosts} settings={settings} />
						)}
						{category === 'FESTNETZ' && (
							<FestnetzSection itemsWithCosts={itemsWithCosts} settings={settings} />
						)}
						{category === 'OTT' && (
							<OTTSection itemsWithCosts={itemsWithCosts} settings={settings} />
						)}
						{category === 'DEVICES' && (
							<DevicesSection itemsWithCosts={itemsWithCosts} settings={settings} />
						)}
					</View>
				))}

				{/* GESAMTSUMME: A dedicated page for the totals summary */}
				<View break style={{ marginTop: 15 }}>
					<Header title="" />
					<SummarySection
						itemsWithCosts={itemsWithCosts}
						basketCredits={basketCredits}
						settings={settings}
					/>
				</View>

				{/* ADS, CONTACT & LEGAL NOTES: A dedicated page */}
				<View break style={{ marginTop: 15 }}>
					<Header title="" />
					
					<ContactSection
						salesRepName={salesRepName}
						teamEmail={teamEmail}
						locationName={locationName}
					/>

					<AdBannersSection itemsWithCosts={itemsWithCosts} />

					<LegalNoticeSection itemsWithCosts={itemsWithCosts} settings={settings} />
				</View>

				{/* DETAILS: "Deine persönliche Empfehlung im Detail" starts on its own page */}
				<View break style={{ marginTop: 15 }}>
					<Header title="Deine persönliche Empfehlung im Detail" />
					<DetailsPage items={items} />
				</View>

				<Footer />
			</Page>
		</Document>
	);
};

