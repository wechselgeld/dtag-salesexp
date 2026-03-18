// ─── Font ────────────────────────────────────────────────────────────
// @react-pdf/renderer only supports TTF/OTF, NOT WOFF2.
// Using Helvetica (built-in) as fallback. To use TeleNeo:
//   import { Font } from '@react-pdf/renderer';
//   Font.register({ family: 'TeleNeo', fonts: [{ src: '/fonts/TeleNeo/Regular.ttf', fontWeight: 400 }, ...] });
export const FONT_FAMILY = 'Helvetica';

// ─── Color Tokens ────────────────────────────────────────────────────
export const T = {
	magenta: '#E20074',
	magentaDark: '#B8005E',
	magentaLight: '#FFF0F6',
	magentaSoft: '#FCE4F0',
	dark: '#1A1A2E',
	gray700: '#4A4A5A',
	gray500: '#6B7280',
	gray400: '#9CA3AF',
	gray200: '#E5E7EB',
	gray100: '#F3F4F6',
	gray50: '#F9FAFB',
	white: '#FFFFFF',
	success: '#059669',
	successLight: '#ECFDF5',
	accent: '#2563EB',
	accentLight: '#EFF6FF',
	catMobile: '#E20074',
	catFiber: '#0090D0',
	catDSL: '#7B61FF',
	catTV: '#FF6B00',
	catDevice: '#00A878',
} as const;

// ─── Category Meta ───────────────────────────────────────────────────
export const CATEGORY_META: Record<string, { color: string; label: string }> = {
	MOBILE: {
		color: T.catMobile,
		label: 'Mobilfunk',
	},
	FIBER: {
		color: T.catFiber,
		label: 'Glasfaser',
	},
	DSL: {
		color: T.catDSL,
		label: 'Festnetz',
	},
	MAGENTA_TV_OTT: {
		color: T.catTV,
		label: 'MagentaTV',
	},
	DEVICE: {
		color: T.catDevice,
		label: 'Endger\u00E4t',
	},
};

// ─── Label Maps ──────────────────────────────────────────────────────
export const BUSINESS_CASE_LABELS: Record<string, string> = {
	NEW_ACTIVATION: 'Neuvertrag',
	MOVE: 'Umzug',
	PLAN_CHANGE: 'Tarifwechsel',
	SPEED_UP: 'Upgrade',
};

export const HARDWARE_TIER_LABELS: Record<string, string> = {
	smartphone: 'Smartphone',
	top: 'Top-Smartphone',
	premium: 'Premium-Smartphone',
	premium_plus: 'Premium-Plus-Smartphone',
};
