import {
	create,
} from 'zustand';
import {
	persist,
} from 'zustand/middleware';

interface SettingsState {
    compactView: boolean;
    clearAfterExport: boolean;
    reduceAnimations: boolean;
    showHeroImage: boolean;
    offerTemplateText: string;
    sortOption: string;
    setCompactView: (value: boolean) => void;
    setClearAfterExport: (value: boolean) => void;
    setReduceAnimations: (value: boolean) => void;
    setShowHeroImage: (value: boolean) => void;
    setOfferTemplateText: (value: string) => void;
    setSortOption: (value: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			compactView: false,
			clearAfterExport: true,
			reduceAnimations: false,
			showHeroImage: true,
			offerTemplateText: '[HERUNTERGELADENES ANGEBOT HIER HINZUFÜGEN UND TEXT LÖSCHEN - EDITIERE DIESE NACHRICHT IN DEN EINSTELLUNGEN] Guten Tag,\n\nvielen Dank für das angenehme Gespräch. Wie besprochen, erhalten Sie anbei Ihr ganz persönliches Telekom-Angebot.\n\nSie haben noch Fragen zum Angebot oder möchten bestellen? Wir rufen Sie zurück. Antworten Sie gern jederzeit mit Ihrer Rückrufnummer- und Zeit auf diese Nachricht.\n\nFreundliche Grüße aus Chemnitz\nIhre Telekom',
			sortOption: 'default',
			setCompactView: (value) => set({
				compactView: value,
			}),
			setClearAfterExport: (value) => set({
				clearAfterExport: value,
			}),
			setReduceAnimations: (value) => set({
				reduceAnimations: value,
			}),
			setShowHeroImage: (value) => set({
				showHeroImage: value,
			}),
			setOfferTemplateText: (value) => set({
				offerTemplateText: value,
			}),
			setSortOption: (value) => set({
				sortOption: value,
			}),
		}),
		{
			name: 'settings-values',
		},
	),
);
