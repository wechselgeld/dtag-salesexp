import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    compactView: boolean;
    clearAfterExport: boolean;
    reduceAnimations: boolean;
    offerTemplateText: string;
    setCompactView: (value: boolean) => void;
    setClearAfterExport: (value: boolean) => void;
    setReduceAnimations: (value: boolean) => void;
    setOfferTemplateText: (value: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            compactView: false,
            clearAfterExport: true,
            reduceAnimations: false,
            offerTemplateText: "[HERUNTERGELADENES ANGEBOT HIER HINZUFÜGEN UND TEXT LÖSCHEN] Guten Tag,\n\nvielen Dank für das angenehme Gespräch. Wie besprochen, erhalten Sie anbei Ihr ganz persönliches Telekom-Angebot.\n\nSie haben noch Fragen zum Angebot oder möchten bestellen? Wir rufen Sie zurück. Antworten Sie gern jederzeit mit Ihrer Rückrufnummer- und Zeit auf diese Nachricht.\n\nFreundliche Grüße aus Chemnitz\nIhre Telekom",
            setCompactView: (value) => set({ compactView: value }),
            setClearAfterExport: (value) => set({ clearAfterExport: value }),
            setReduceAnimations: (value) => set({ reduceAnimations: value }),
            setOfferTemplateText: (value) => set({ offerTemplateText: value }),
        }),
        {
            name: 'dts-settings',
        }
    )
);
