import {
	StyleSheet,
} from '@react-pdf/renderer';
import {
	FONT_FAMILY, T,
} from './tokens';

export const s = StyleSheet.create({
	// ── Page ──
	page: {
		fontFamily: FONT_FAMILY,
		fontSize: 9,
		color: T.dark,
		backgroundColor: T.white,
		paddingTop: 0,
		paddingBottom: 68,
		paddingHorizontal: 0,
	},

	// ── Header ──
	header: {
		backgroundColor: T.magenta,
		paddingHorizontal: 40,
		paddingTop: 28,
		paddingBottom: 22,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	headerLeft: {
		flex: 1,
	},
	headerTitle: {
		fontSize: 21,
		fontWeight: 700,
		color: T.white,
		letterSpacing: -0.4,
		marginBottom: 3,
	},
	headerSubtitle: {
		fontSize: 9.5,
		fontWeight: 400,
		color: 'rgba(255,255,255,0.8)',
	},
	headerLogo: {
		width: 48,
		height: 48,
		marginLeft: 16,
		backgroundColor: T.white,
		borderRadius: 6,
		padding: 4,
	},
	headerLogoPlaceholder: {
		width: 52,
		height: 52,
		marginLeft: 16,
		backgroundColor: 'rgba(255,255,255,0.25)',
		borderRadius: 6,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerLogoText: {
		fontSize: 14,
		fontWeight: 700,
		color: T.white,
	},
	headerAccent: {
		height: 3,
		backgroundColor: '#FF3399',
	},

	// ── Trust Bar ──
	trustBar: {
		backgroundColor: T.gray50,
		borderBottomWidth: 1,
		borderBottomColor: T.gray200,
		paddingHorizontal: 40,
		paddingVertical: 9,
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 28,
	},
	trustItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},
	trustText: {
		fontSize: 7.5,
		fontWeight: 400,
		color: T.gray500,
	},

	// ── Content ──
	content: {
		paddingHorizontal: 40,
		paddingTop: 20,
	},
	sectionHeading: {
		fontSize: 12,
		fontWeight: 700,
		color: T.dark,
		marginBottom: 4,
		letterSpacing: -0.2,
	},
	sectionDescription: {
		fontSize: 8.5,
		fontWeight: 400,
		color: T.gray500,
		marginBottom: 16,
		lineHeight: 1.4,
		maxWidth: 420,
	},
	continuedHint: {
		fontSize: 8,
		fontWeight: 400,
		color: T.gray400,
		fontStyle: 'italic',
		marginTop: 8,
		borderTopWidth: 0.5,
		borderTopColor: T.gray100,
		paddingTop: 8,
		textAlign: 'right',
	},

	// ── Product Card ──
	productCard: {
		backgroundColor: T.white,
		borderWidth: 1,
		borderColor: T.gray200,
		borderRadius: 6,
		marginBottom: 12,
		overflow: 'hidden',
	},
	productCardHeader: {
		paddingHorizontal: 14,
		paddingVertical: 9,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomWidth: 1,
		borderBottomColor: T.gray100,
	},
	productCardHeaderLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		flex: 1,
	},
	categoryBadge: {
		paddingHorizontal: 7,
		paddingVertical: 3,
		borderRadius: 3,
	},
	categoryBadgeText: {
		fontSize: 6.5,
		fontWeight: 700,
		color: T.white,
		textTransform: 'uppercase',
		letterSpacing: 0.6,
	},
	productName: {
		fontSize: 11,
		fontWeight: 700,
		color: T.dark,
		flex: 1,
	},
	businessCaseBadge: {
		paddingHorizontal: 6,
		paddingVertical: 2.5,
		borderRadius: 3,
		backgroundColor: T.gray100,
		marginLeft: 6,
	},
	businessCaseText: {
		fontSize: 7,
		fontWeight: 400,
		color: T.gray500,
	},
	productCardBody: {
		paddingHorizontal: 14,
		paddingVertical: 12,
	},

	// ── Price Highlight ──
	priceHighlight: {
		backgroundColor: T.magentaLight,
		borderRadius: 5,
		paddingHorizontal: 14,
		paddingVertical: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
		borderWidth: 1,
		borderColor: T.magentaSoft,
	},
	priceHighlightLeft: {
		gap: 2,
	},
	priceLabel: {
		fontSize: 7,
		fontWeight: 400,
		color: T.gray500,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
		marginBottom: 1,
	},
	priceRow: {
		flexDirection: 'row',
		alignItems: 'baseline',
		gap: 3,
	},
	priceMain: {
		fontSize: 22,
		fontWeight: 700,
		color: T.magenta,
		letterSpacing: -0.8,
	},
	priceSuffix: {
		fontSize: 9,
		fontWeight: 400,
		color: T.magentaDark,
		marginBottom: 1,
	},
	priceOld: {
		fontSize: 10,
		fontWeight: 400,
		color: T.gray400,
		textDecoration: 'line-through',
	},
	priceHighlightRight: {
		alignItems: 'flex-end',
		gap: 4,
	},
	savingsBadge: {
		backgroundColor: T.success,
		paddingHorizontal: 7,
		paddingVertical: 3,
		borderRadius: 3,
	},
	savingsText: {
		fontSize: 7,
		fontWeight: 700,
		color: T.white,
	},
	dailyPrice: {
		fontSize: 7.5,
		fontWeight: 400,
		color: T.gray500,
	},

	// ── Info Badges ──
	infoBadgeRow: {
		flexDirection: 'row',
		gap: 5,
		marginBottom: 8,
	},
	infoBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: T.accentLight,
		paddingHorizontal: 7,
		paddingVertical: 3,
		borderRadius: 3,
	},
	infoBadgeText: {
		fontSize: 7,
		fontWeight: 700,
		color: T.accent,
	},

	// ── Unlimited Badge ──
	unlimitedBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
		backgroundColor: '#FDF2F8',
		borderWidth: 1,
		borderColor: '#FBCFE8',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		marginBottom: 8,
	},
	unlimitedBadgeText: {
		fontSize: 7.5,
		fontWeight: 700,
		color: T.magenta,
	},

	// ── Timeline ──
	timelineSection: {
		marginBottom: 4,
		marginTop: 2,
	},
	timelineHeader: {
		fontSize: 7.5,
		fontWeight: 700,
		color: T.dark,
		marginBottom: 5,
		textTransform: 'uppercase',
		letterSpacing: 0.4,
	},
	timelineRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 3,
	},
	timelinePeriod: {
		fontSize: 7.5,
		fontWeight: 400,
		color: T.gray500,
		width: 85,
	},
	timelineBar: {
		height: 5,
		borderRadius: 2.5,
		marginRight: 8,
	},
	timelineValue: {
		fontSize: 7.5,
		fontWeight: 700,
		color: T.dark,
	},

	// ── Detail Rows ──
	detailSection: {
		marginTop: 6,
	},
	detailRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 4.5,
		borderBottomWidth: 1,
		borderBottomColor: T.gray100,
	},
	detailLabel: {
		fontSize: 8,
		fontWeight: 400,
		color: T.gray700,
		flex: 1,
	},
	detailLabelBold: {
		fontSize: 8,
		fontWeight: 700,
		color: T.dark,
		flex: 1,
	},
	detailValue: {
		fontSize: 8,
		fontWeight: 400,
		color: T.dark,
	},
	detailValueBold: {
		fontSize: 8,
		fontWeight: 700,
		color: T.dark,
	},
	detailValueGreen: {
		fontSize: 8,
		fontWeight: 700,
		color: '#2a6a57', // More subtle than standard success green
	},
	addonDescription: {
		fontSize: 7,
		fontWeight: 400,
		color: T.gray500,
		marginTop: 1,
	},

	// ── Feature Tags ──
	featureRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 4,
		marginTop: 8,
	},
	featureTag: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		backgroundColor: T.successLight,
		paddingHorizontal: 6,
		paddingVertical: 3,
		borderRadius: 3,
	},
	featureTagText: {
		fontSize: 6.5,
		fontWeight: 400,
		color: '#2a6a57',
	},

	// ── Summary Card ──
	summaryCard: {
		backgroundColor: T.dark,
		borderRadius: 6,
		paddingHorizontal: 18,
		paddingVertical: 14,
		marginTop: 6,
		marginHorizontal: 40,
	},
	summaryTitle: {
		fontSize: 10,
		fontWeight: 700,
		color: T.white,
		marginBottom: 10,
	},
	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 3.5,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255,255,255,0.08)',
	},
	summaryLabel: {
		fontSize: 8,
		fontWeight: 400,
		color: 'rgba(255,255,255,0.55)',
	},
	summaryValue: {
		fontSize: 8.5,
		fontWeight: 700,
		color: T.white,
	},
	summaryDivider: {
		height: 1,
		backgroundColor: 'rgba(255,255,255,0.12)',
		marginVertical: 6,
	},
	summaryTotalRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-end',
		paddingTop: 6,
	},
	summaryTotalLabel: {
		fontSize: 8.5,
		fontWeight: 400,
		color: 'rgba(255,255,255,0.65)',
	},
	summaryDailyHint: {
		fontSize: 7,
		fontWeight: 400,
		color: 'rgba(255,255,255,0.4)',
		marginTop: 1,
	},
	summaryTotalValue: {
		fontSize: 18,
		fontWeight: 700,
		color: T.white,
		letterSpacing: -0.4,
	},
	summaryTotalSuffix: {
		fontSize: 9,
		fontWeight: 400,
		color: 'rgba(255,255,255,0.5)',
		marginBottom: 1,
	},

	// ── CTA ──
	ctaSection: {
		marginHorizontal: 40,
		marginTop: 14,
		backgroundColor: T.magenta,
		borderRadius: 6,
		paddingHorizontal: 16,
		paddingVertical: 14,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	ctaLeft: {
		gap: 2,
		flex: 1,
		marginRight: 12,
	},
	ctaTitle: {
		fontSize: 11,
		fontWeight: 700,
		color: T.white,
	},
	ctaSubtitle: {
		fontSize: 8,
		fontWeight: 400,
		color: 'rgba(255,255,255,0.8)',
	},
	ctaEmailBox: {
		backgroundColor: 'rgba(255,255,255,0.18)',
		borderRadius: 4,
		paddingHorizontal: 10,
		paddingVertical: 6,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},
	ctaEmail: {
		fontSize: 8.5,
		fontWeight: 700,
		color: T.white,
	},
	ctaRepName: {
		fontSize: 7.5,
		fontWeight: 400,
		color: 'rgba(255,255,255,0.65)',
		marginTop: 6,
	},

	// ── Urgency ──
	urgencyBar: {
		backgroundColor: '#FEF3C7',
		borderWidth: 1,
		borderColor: '#FDE68A',
		borderRadius: 5,
		paddingHorizontal: 12,
		paddingVertical: 7,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 7,
		marginHorizontal: 40,
		marginTop: 12,
	},
	urgencyText: {
		fontSize: 7.5,
		fontWeight: 400,
		color: '#92400E',
		flex: 1,
	},

	// ── Benefits ──
	benefitsSection: {
		marginHorizontal: 40,
		marginTop: 12,
		flexDirection: 'row',
		gap: 8,
	},
	benefitCard: {
		flex: 1,
		backgroundColor: T.gray50,
		borderRadius: 5,
		paddingHorizontal: 10,
		paddingVertical: 9,
		borderWidth: 1,
		borderColor: T.gray200,
	},
	benefitTitle: {
		fontSize: 7.5,
		fontWeight: 700,
		color: T.dark,
		marginBottom: 2,
	},
	benefitText: {
		fontSize: 7,
		fontWeight: 400,
		color: T.gray500,
		lineHeight: 1.35,
	},

	// ── Footer ──
	footer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 40,
		paddingTop: 8,
		paddingBottom: 8,
		borderTopWidth: 1,
		borderTopColor: T.gray200,
		backgroundColor: T.white,
		flexDirection: 'row',
		alignItems: 'center',
	},
	footerTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 2,
	},
	footerText: {
		fontSize: 7,
		fontWeight: 400,
		color: T.gray400,
	},
	footerLegal: {
		fontSize: 6,
		fontWeight: 400,
		color: T.gray400,
		lineHeight: 1.3,
	},
	footerLogo: {
		height: 48,
		objectFit: 'contain',
		marginLeft: 14,
	},
});
