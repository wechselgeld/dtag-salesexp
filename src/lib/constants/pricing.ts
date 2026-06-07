export const MAGENTA_TV_PACKAGES = {
	smart: {
		name: 'MagentaTV Smart',
		shortName: 'Smart',
		price: 10,
		features: [
			'Alle Spiele der FIFA WM nur bei MagentaTV',
			'MagentaTV+',
			'RTL+ Premium',
		],
	},
	smartstream: {
		name: 'MagentaTV SmartStream',
		shortName: 'SmartStream',
		price: 17,
		features: [
			'Alle Spiele der FIFA WM nur bei MagentaTV',
			'Netflix Standard-Abo mit Werbung',
			'Disney+ Standard mit Werbung',
			'RTL+ Premium',
		],
	},
	megastream: {
		name: 'MagentaTV MegaStream',
		shortName: 'MegaStream',
		price: 30,
		features: [
			'Alle Spiele der FIFA WM nur bei MagentaTV',
			'Netflix Standard-Abo',
			'Disney+ Standard',
			'RTL+ Premium',
			'AppleTV+',
		],
	},
} as const;

export type MagentaTVPackageKey = keyof typeof MAGENTA_TV_PACKAGES;

const CATEGORY_NAMES: Record<string, string> = {
	MOBILE: 'Mobilfunk',
	FIBER: 'Glasfaser',
	DSL: 'Festnetz',
	MAGENTA_TV_OTT: 'MagentaTV',
	DEVICE: 'Endgeräte',
	ADDON: 'Zubuchoptionen',
	DATA: 'Datentarife',
};

const CATEGORY_COLORS: Record<string, string> = {
	MOBILE: '#e20074',
	FIBER: '#0090d0',
	DSL: '#7b61ff',
	MAGENTA_TV_OTT: '#ff6b00',
	DEVICE: '#00a878',
	ADDON: '#e67e22',
	DATA: '#3498db',
};

const SHIPPING_HARDWARE_FEE = 6.95;
