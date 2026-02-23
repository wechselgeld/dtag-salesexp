
import { create } from 'zustand';

interface ModalState {
    availabilityOpen: boolean;
    calculatorOpen: boolean;
    battlecardOpen: boolean;
    setAvailabilityOpen: (open: boolean) => void;
    setCalculatorOpen: (open: boolean) => void;
    setBattlecardOpen: (open: boolean) => void;
}

export const useModalStore = create<ModalState>((set) => ({
    availabilityOpen: false,
    calculatorOpen: false,
    battlecardOpen: false,
    setAvailabilityOpen: (open) => set({ availabilityOpen: open }),
    setCalculatorOpen: (open) => set({ calculatorOpen: open }),
    setBattlecardOpen: (open) => set({ battlecardOpen: open }),
}));
