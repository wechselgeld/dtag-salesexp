import {
    create,
} from 'zustand';
import {
    persist, createJSONStorage,
} from 'zustand/middleware';

interface SetupDraftState {
    // Wizard Navigation
    currentStep: number; // Step 0 = Email Input, Step 1 = Location, Step 2 = Team, Step 3 = Form, Step 4 = Passkey Promo
    
    // Registration Form Fields
    firstName: string;
    lastName: string;
    email: string;
    pin: string;
    locationId: string | null;
    teamId: string | null;
    acceptedTerms: boolean;
    acceptedPrivacy: boolean;
    acceptedTracking: boolean;

    // Account Recognition States
    userExists: boolean | null;
    profileFirstName: string;
    profileLastName: string;
    profileTeamName: string;

    // Setters
    setCurrentStep: (step: number) => void;
    setFirstName: (value: string) => void;
    setLastName: (value: string) => void;
    setEmail: (value: string) => void;
    setPin: (value: string) => void;
    setLocationId: (value: string | null) => void;
    setTeamId: (value: string | null) => void;
    setAcceptedTerms: (value: boolean) => void;
    setAcceptedPrivacy: (value: boolean) => void;
    setAcceptedTracking: (value: boolean) => void;
    setUserExists: (exists: boolean | null, firstName?: string, lastName?: string, teamName?: string) => void;

    // Navigation & Helpers
    nextStep: () => void;
    prevStep: () => void;
    resetStore: () => void;
    isStepValid: (step: number) => boolean;
}

const initialValues = {
    currentStep: 0,
    firstName: '',
    lastName: '',
    email: '',
    pin: '',
    locationId: null,
    teamId: null,
    acceptedTerms: false,
    acceptedPrivacy: false,
    acceptedTracking: false,
    userExists: null,
    profileFirstName: '',
    profileLastName: '',
    profileTeamName: '',
};

export const useSetupStore = create<SetupDraftState>()(
    persist(
        (set, get) => ({
            ...initialValues,

            setCurrentStep: (step) => set({
                currentStep: step,
            }),
            setFirstName: (value) => set({
                firstName: value,
            }),
            setLastName: (value) => set({
                lastName: value,
            }),
            setEmail: (value) => set({
                email: value.trim().toLowerCase(),
            }),
            setPin: (value) => set({
                pin: value,
            }),
            setLocationId: (value) => set({
                locationId: value,
                // Reset team selection if location changes to prevent orphan data
                teamId: null,
            }),
            setTeamId: (value) => set({
                teamId: value,
            }),
            setAcceptedTerms: (value) => set({
                acceptedTerms: value,
            }),
            setAcceptedPrivacy: (value) => set({
                acceptedPrivacy: value,
            }),
            setAcceptedTracking: (value) => set({
                acceptedTracking: value,
            }),
            setUserExists: (exists, firstName = '', lastName = '', teamName = '') => set({
                userExists: exists,
                profileFirstName: firstName,
                profileLastName: lastName,
                profileTeamName: teamName,
            }),

            nextStep: () => {
                const {
                    currentStep, isStepValid,
                } = get();
                if (isStepValid(currentStep)) {
                    set({
                        currentStep: currentStep + 1,
                    });
                }
            },

            prevStep: () => {
                const {
                    currentStep,
                } = get();
                if (currentStep > 0) {
                    set({
                        currentStep: currentStep - 1,
                    });
                }
            },

            resetStore: () => {
                set(initialValues);
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('sxp-setup-storage');
                }
            },

            isStepValid: (step) => {
                const {
                    locationId, teamId, firstName, lastName, email, pin, acceptedTerms, acceptedPrivacy,
                } = get();
                switch (step) {
                    case 0:
                        return !!email.trim() && email.endsWith('@telekom.de');
                    case 1:
                        return !!locationId;
                    case 2:
                        return !!teamId;
                    case 3:
                        return (
                            !!firstName.trim() &&
                            !!lastName.trim() &&
                            pin.length === 6 &&
                            acceptedTerms &&
                            acceptedPrivacy
                        );
                    case 4:
                        return true;
                    default:
                        return false;
                }
            },
        }),
        {
            name: 'sxp-setup-storage',
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
);
