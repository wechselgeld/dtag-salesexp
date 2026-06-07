import {
	create,
} from 'zustand';
import {
	persist,
} from 'zustand/middleware';

interface ChangelogState {
	lastSeenChangelogId: string | null;
	acknowledgedFeatures: string[];
	setLastSeenChangelogId: (id: string) => void;
	acknowledgeFeature: (featureId: string) => void;
	resetStore: () => void;
}

export const useChangelogStore = create<ChangelogState>()(
	persist(
		(set) => ({
			lastSeenChangelogId: null,
			acknowledgedFeatures: [],
			setLastSeenChangelogId: (id) => set({
				lastSeenChangelogId: id,
			}),
			acknowledgeFeature: (featureId) => set((state) => {
				if (state.acknowledgedFeatures.includes(featureId)) {
					return state;
				}
				return {
					acknowledgedFeatures: [
						...state.acknowledgedFeatures,
						featureId,
					],
				};
			}),
			resetStore: () => set({
				lastSeenChangelogId: null,
				acknowledgedFeatures: [],
			}),
		}),
		{
			name: 'changelog-tracking',
		},
	),
);
