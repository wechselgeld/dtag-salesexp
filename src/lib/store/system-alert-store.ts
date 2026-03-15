import {
	create,
} from 'zustand';

interface SystemAlert {
    id: string;
    content: React.ReactNode;
    priority?: number;
}

interface SystemAlertStore {
    alerts: SystemAlert[];
    addAlert: (alert: SystemAlert) => void;
    removeAlert: (id: string) => void;
}

export const useSystemAlertStore = create<SystemAlertStore>((set) => ({
	alerts: [
	],
	addAlert: (alert) => set((state) => ({
		alerts: state.alerts.some(a => a.id === alert.id)
			? state.alerts.map(a => a.id === alert.id ? alert : a)
			: [
				...state.alerts,
				alert,
			],
	})),
	removeAlert: (id) => set((state) => ({
		alerts: state.alerts.filter((a) => a.id !== id),
	})),
}));
