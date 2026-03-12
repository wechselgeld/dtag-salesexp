import { create } from "zustand";

interface NewsNotification {
    id: string;
    title: string;
    content: string;
    priority: "INFO" | "UPDATE" | "IMPORTANT" | "CRITICAL" | "SALES";
    team?: { name: string };
    location?: { name: string };
    odRegion?: { name: string };
}

interface NewsNotificationStore {
    notifications: NewsNotification[];
    addNotification: (notification: NewsNotification) => void;
    removeNotification: (id: string) => void;
}

export const useNewsNotificationStore = create<NewsNotificationStore>((set) => ({
    notifications: [],
    addNotification: (notification) =>
        set((state) => {
            if (state.notifications.some((n) => n.id === notification.id)) return state;
            return { notifications: [...state.notifications, notification] };
        }),
    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id)
        }))
}));
