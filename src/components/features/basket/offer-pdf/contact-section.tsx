import React from 'react';
import {
	View, Text, Link,
} from '@react-pdf/renderer';
import {
	styles,
} from './styles';

interface ContactSectionProps {
	salesRepName?: string;
	teamEmail?: string;
	locationName?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
	salesRepName,
	teamEmail = '0800 33 01000',
	locationName,
}) => {
	const hasRep = !!salesRepName?.trim();
	const hasEmail = !!teamEmail && teamEmail.includes('@');

	// Left Card (Personal Contact / Team Email)
	const renderLeftCard = () => {
		if (!hasEmail && !hasRep) {
			return null;
		}

		return (
			<View style={hasEmail ? styles.contactCardProminent : styles.contactCard}>
				<Text style={styles.contactHeader}>Dein Ansprechpartner</Text>
				<Text style={styles.contactName}>
					{hasRep ? salesRepName : 'Telekom Service-Team'}
				</Text>
				<Text style={styles.contactRole}>
					{locationName?.trim()
						? `Für Dich da aus ${locationName}`
						: 'Jederzeit für Dich da'
					}
				</Text>

				{hasEmail && (
					<Link src={`mailto:${teamEmail}`} style={styles.contactButtonFilled}>
						<Text style={styles.contactButtonFilledText}>E-Mail an das Teampostfach senden</Text>
					</Link>
				)}
			</View>
		);
	};

	// Right Card (Hotline / Support)
	const renderRightCard = () => {
		const showLeft = hasEmail || hasRep;
		const cardStyle = showLeft ? styles.contactCard : styles.contactCardSingle;

		return (
			<View style={cardStyle}>
				<Text style={styles.contactHeader}>Dein betreuendes Team</Text>
				<Text style={styles.contactName}>Telekom Service-Team</Text>
				<Text style={styles.contactRole}>Gemeinsam für Dich erreichbar</Text>

				<View style={styles.contactDetailRow}>
					<Text style={[styles.contactDetailText, { color: '#6a6a6a' }]}>
						Unsere Experten beraten Dich gerne kostenlos am Telefon.
					</Text>
				</View>

				<Link src="tel:08003301000" style={styles.contactButtonOutline}>
					<Text style={styles.contactButtonOutlineText}>Hotline anrufen (0800 33 01000)</Text>
				</Link>
			</View>
		);
	};

	return (
		<View style={styles.contactRow} wrap={false}>
			{renderLeftCard()}
			{renderRightCard()}
		</View>
	);
};
