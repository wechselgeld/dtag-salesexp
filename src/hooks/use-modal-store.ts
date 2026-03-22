import {
	create,
} from 'zustand';

interface ModalState {
	calculatorOpen: boolean;
	battlecardOpen: boolean;
	feedbackOpen: boolean;
	setCalculatorOpen: (open: boolean) => void;
	setBattlecardOpen: (open: boolean) => void;
	setFeedbackOpen: (open: boolean) => void;
}

export const useModalStore = create<ModalState>((set) => ({
	calculatorOpen: false,
	battlecardOpen: false,
	feedbackOpen: false,
	setCalculatorOpen: (open) => set({
		calculatorOpen: open,
	}),
	setBattlecardOpen: (open) => set({
		battlecardOpen: open,
	}),
	setFeedbackOpen: (open) => set({
		feedbackOpen: open,
	}),
}));
