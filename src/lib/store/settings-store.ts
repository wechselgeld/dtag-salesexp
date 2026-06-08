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
	bypassResolutionGuard: boolean;
	acceptedTracking: boolean | null;
	acceptedAiDisclaimer: boolean;
	workflowExpanded: boolean;
	toolsExpanded: boolean;
	setCompactView: (value: boolean) => void;
	setClearAfterExport: (value: boolean) => void;
	setReduceAnimations: (value: boolean) => void;
	setShowHeroImage: (value: boolean) => void;
	setOfferTemplateText: (value: string) => void;
	setSortOption: (value: string) => void;
	setBypassResolutionGuard: (value: boolean) => void;
	setAcceptedTracking: (value: boolean | null) => void;
	setAcceptedAiDisclaimer: (value: boolean) => void;
	setWorkflowExpanded: (value: boolean) => void;
	setToolsExpanded: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			compactView: false,
			clearAfterExport: true,
			reduceAnimations: false,
			showHeroImage: true,
			offerTemplateText: '[HERUNTERGELADENES ANGEBOT HIER HINZUFÜGEN UND TEXT LÖSCHEN - EDITIERE DIESE NACHRICHT IN DEN EINSTELLUNGEN] Hallo,\n\nwie versprochen sende ich Ihnen hier das Angebot, das wir gerade besprochen haben. Es war ein wirklich angenehmes Gespräch!\n\nSchauen Sie sich das PDF in Ruhe an. Wenn alles für Sie passt, antworten Sie mir einfach kurz auf diese Mail – ich kümmere mich dann um die ganze Abwicklung für Sie.\n\nSollten Sie noch Fragen haben oder eine Rückfrage haben: Ich bin für Sie da.\n\nBeste Grüße aus Chemnitz,\n\n{{salesRepName}}\nIhre Telekom',
			sortOption: 'default',
			bypassResolutionGuard: false,
			acceptedTracking: null as boolean | null,
			acceptedAiDisclaimer: false,
			workflowExpanded: true,
			toolsExpanded: true,
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
			setBypassResolutionGuard: (value) => set({
				bypassResolutionGuard: value,
			}),
			setAcceptedTracking: (value) => set({
				acceptedTracking: value,
			}),
			setAcceptedAiDisclaimer: (value) => set({
				acceptedAiDisclaimer: value,
			}),
			setWorkflowExpanded: (value) => set({
				workflowExpanded: value,
			}),
			setToolsExpanded: (value) => set({
				toolsExpanded: value,
			}),
		}),
		{
			name: 'settings-values',
		},
	),
);
