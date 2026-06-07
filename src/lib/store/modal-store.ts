import {
	create,
} from 'zustand';

interface ModalState {
	calculatorOpen: boolean;
	battlecardOpen: boolean;
	feedbackOpen: boolean;
	salesTipsOpen: boolean;
	setCalculatorOpen: (open: boolean) => void;
	setBattlecardOpen: (open: boolean) => void;
	setFeedbackOpen: (open: boolean) => void;
	setSalesTipsOpen: (open: boolean) => void;
}

export const useModalStore = create<ModalState>((set) => ({
	calculatorOpen: false,
	battlecardOpen: false,
	feedbackOpen: false,
	salesTipsOpen: false,
	setCalculatorOpen: (open) => set({
		calculatorOpen: open,
	}),
	setBattlecardOpen: (open) => set({
		battlecardOpen: open,
	}),
	setFeedbackOpen: (open) => set({
		feedbackOpen: open,
	}),
	setSalesTipsOpen: (open) => set({
		salesTipsOpen: open,
	}),
}));
