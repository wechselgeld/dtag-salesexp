import {
	create,
} from 'zustand';
import {
	persist,
} from 'zustand/middleware';
import type {
	MagentaTVPackageKey,
} from '@/lib/constants/pricing';
import type {
	Product, BusinessCase, Credit, HardwareTier,
} from '@/types/product';

export interface BasketItem {
	id: string; // UUID
	product: Product;
	config: {
		businessCase: BusinessCase;
		selectedSpecialPriceIds: string[];
		magentaTVPackage: MagentaTVPackageKey | null;
		selectedAddonIds: string[];
		vouchers: number[];
		credits: Credit[];
		hardwarePurchaseType?: 'RENT' | 'BUY';
		plusKartenCount?: number;
		customBasePrice?: number;
		hardwareTier?: HardwareTier;
	};
	addedAt: number;
}

export interface Basket {
	id: string;
	name: string;
	items: BasketItem[];
	basketCredits: Credit[];
	isNameEdited?: boolean;
}

const getBaseProductName = (fullName: string): string => {
	const prefixes = [
 'MagentaZuhause',
'MagentaMobil',
'Young',
'MagentaTV',
'Glasfaser',
];
	for (const prefix of prefixes) {
		if (fullName.startsWith(prefix)) {
			return prefix;
		}
	}
	return fullName;
};

const updateBasketNames = (basketsList: Basket[]): Basket[] => {
	return basketsList.map((basket, index) => {
		if (basket.isNameEdited) {
			return basket;
		}

		const items = basket.items || [
];
		if (items.length === 0) {
			const configNum = index + 1;
			return {
				...basket,
				name: `Konfiguration ${configNum}`,
			};
		}

		if (items.length === 1) {
			const singleName = items[0].product.name;
			let name = getBaseProductName(singleName);
			if (name.length > 25) {
				name = `${name.slice(0, 22) }...`;
			}
			return {
				...basket,
				name,
			};
		}

		const productNames = items.map((item) => item.product.name);
		let name = productNames.join(' + ');

		if (name.length > 20) {
			const shorten = (str: string) => {
				return str
					.replace(/MagentaZuhause/g, 'MZ')
					.replace(/MagentaMobil/g, 'MM')
					.replace(/MagentaTV/g, 'MTV')
					.replace(/Glasfaser/g, 'GF');
			};
			name = productNames.map(shorten).join(' + ');
		}

		if (name.length > 25) {
			name = `${name.slice(0, 22) }...`;
		}

		return {
			...basket,
			name,
		};
	});
};

interface BasketState {
	items: BasketItem[];
	isOpen: boolean;
	basketCredits: Credit[];
	baskets: Basket[];
	activeBasketId: string;
	isComparisonMode: boolean;
	setIsComparisonMode: (isComparisonMode: boolean) => void;
	addItem: (product: Product, config: BasketItem['config']) => string;
	removeItem: (id: string) => void;
	restoreItem: (item: BasketItem) => void;
	updateItem: (id: string, config: Partial<BasketItem['config']>) => void;
	setBasketCredits: (credits: Credit[]) => void;
	clearBasket: () => void;
	setIsOpen: (isOpen: boolean) => void;
	addBasket: () => string;
	removeBasket: (id: string) => void;
	setActiveBasketId: (id: string) => void;
	renameBasket: (id: string, name: string) => void;
	removeItemForId: (basketId: string, itemId: string) => void;
	clearBasketForId: (basketId: string) => void;
	setBasketCreditsForId: (basketId: string, credits: Credit[]) => void;
}

export const useBasketStore = create<BasketState>()(
	persist(
		(set) => ({
			items: [
],
			isOpen: false,
			basketCredits: [
], // Global credits for active basket
			baskets: [
				{
					id: 'default',
					name: 'Konfiguration 1',
					items: [
],
					basketCredits: [
],
				},
			],
			activeBasketId: 'default',
			isComparisonMode: false,

			setIsComparisonMode: (isComparisonMode) => set({
 isComparisonMode,
}),

			addItem: (product, config) => {
				const newId = crypto.randomUUID();
				const newItem: BasketItem = {
					id: newId,
					product,
					config,
					addedAt: Date.now(),
				};

				set((state) => {
					const activeId = state.activeBasketId || 'default';
					let currentBaskets = state.baskets || [
];
					if (currentBaskets.length === 0) {
						currentBaskets = [
 {
 id: 'default',
name: 'Konfiguration 1',
items: [
],
basketCredits: [
],
},
];
					}

					const updatedBaskets = currentBaskets.map((b) => {
						if (b.id === activeId) {
							return {
								...b,
								items: [
 ...b.items,
newItem,
],
							};
						}
						return b;
					});

					const namedBaskets = updateBasketNames(updatedBaskets);
					const activeBasket = namedBaskets.find((b) => b.id === activeId);

					return {
						baskets: namedBaskets,
						items: activeBasket ? activeBasket.items : [
],
						isOpen: true,
					};
				});

				return newId;
			},

			removeItem: (id) => {
				set((state) => {
					const activeId = state.activeBasketId || 'default';
					const updatedBaskets = state.baskets.map((b) => {
						if (b.id === activeId) {
							return {
								...b,
								items: b.items.filter((item) => item.id !== id),
							};
						}
						return b;
					});
					const namedBaskets = updateBasketNames(updatedBaskets);
					const activeBasket = namedBaskets.find((b) => b.id === activeId);
					return {
						baskets: namedBaskets,
						items: activeBasket ? activeBasket.items : [
],
					};
				});
			},

			restoreItem: (item) => {
				set((state) => {
					const activeId = state.activeBasketId || 'default';
					const updatedBaskets = state.baskets.map((b) => {
						if (b.id === activeId) {
							return {
								...b,
								items: [
 ...b.items,
item,
].sort((a, b2) => a.addedAt - b2.addedAt),
							};
						}
						return b;
					});
					const namedBaskets = updateBasketNames(updatedBaskets);
					const activeBasket = namedBaskets.find((b) => b.id === activeId);
					return {
						baskets: namedBaskets,
						items: activeBasket ? activeBasket.items : [
],
						isOpen: true,
					};
				});
			},

			updateItem: (id, config) => {
				set((state) => {
					const activeId = state.activeBasketId || 'default';
					const updatedBaskets = state.baskets.map((b) => {
						if (b.id === activeId) {
							return {
								...b,
								items: b.items.map((item) =>
									item.id === id
										? {
											...item,
											config: {
												...item.config,
												...config,
											},
										}
										: item,
								),
							};
						}
						return b;
					});
					const namedBaskets = updateBasketNames(updatedBaskets);
					const activeBasket = namedBaskets.find((b) => b.id === activeId);
					return {
						baskets: namedBaskets,
						items: activeBasket ? activeBasket.items : [
],
					};
				});
			},

			setBasketCredits: (credits) => {
				set((state) => {
					const activeId = state.activeBasketId || 'default';
					const updatedBaskets = state.baskets.map((b) => {
						if (b.id === activeId) {
							return {
								...b,
								basketCredits: credits,
							};
						}
						return b;
					});
					return {
						baskets: updatedBaskets,
						basketCredits: credits,
					};
				});
			},

			clearBasket: () => {
				set((state) => {
					const activeId = state.activeBasketId || 'default';
					const updatedBaskets = state.baskets.map((b) => {
						if (b.id === activeId) {
							return {
								...b,
								items: [
],
								basketCredits: [
],
							};
						}
						return b;
					});
					const namedBaskets = updateBasketNames(updatedBaskets);
					return {
						baskets: namedBaskets,
						items: [
],
						basketCredits: [
],
					};
				});
			},

			setIsOpen: (isOpen) => set({
				isOpen,
			}),

			addBasket: () => {
				const newId = crypto.randomUUID();
				const createdId = newId;
				set((state) => {
					const currentBaskets = state.baskets || [
];
					if (currentBaskets.length >= 3) {
						return {
};
					}
					// Find next configuration number based on existing baskets
					const existingNums = currentBaskets
						.map((b) => {
							const match = b.name.match(/Konfiguration\s+(\d+)/i);
							return match ? parseInt(match[1], 10) : 0;
						})
						.filter((n) => n > 0);
					const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : currentBaskets.length + 1;

					const newBasket: Basket = {
						id: newId,
						name: `Konfiguration ${nextNum}`,
						items: [
],
						basketCredits: [
],
					};
					const updatedBaskets = [
 ...currentBaskets,
newBasket,
];
					const namedBaskets = updateBasketNames(updatedBaskets);
					return {
						baskets: namedBaskets,
						activeBasketId: newId,
						items: [
],
						basketCredits: [
],
						isOpen: true,
					};
				});
				return createdId;
			},

			removeBasket: (id) => {
				set((state) => {
					const updatedBaskets = state.baskets.filter((b) => b.id !== id);
					let activeId = state.activeBasketId;

					let finalBaskets = updatedBaskets;
					if (finalBaskets.length === 0) {
						const newId = 'default';
						finalBaskets = [
 {
							id: newId,
							name: 'Konfiguration 1',
							items: [
],
							basketCredits: [
],
						},
];
						activeId = newId;
					}
 else {
						if (activeId === id) {
							activeId = finalBaskets[0].id;
						}
						// When all tabs are removed but one and the name is still something auto-generated like "Konfiguration 5", change it to "Konfiguration 1".
						if (finalBaskets.length === 1) {
							const lastBasket = finalBaskets[0];
							if (/^Konfiguration\s+\d+$/i.test(lastBasket.name)) {
								finalBaskets = [
 {
									...lastBasket,
									name: 'Konfiguration 1',
								},
];
							}
						}
					}

					const namedBaskets = updateBasketNames(finalBaskets);
					const activeBasket = namedBaskets.find((b) => b.id === activeId)!;
					return {
						baskets: namedBaskets,
						activeBasketId: activeId,
						items: activeBasket.items,
						basketCredits: activeBasket.basketCredits,
					};
				});
			},

			setActiveBasketId: (id) => {
				set((state) => {
					const activeBasket = state.baskets.find((b) => b.id === id);
					if (!activeBasket) {
return {
};
}
					return {
						activeBasketId: id,
						items: activeBasket.items,
						basketCredits: activeBasket.basketCredits,
					};
				});
			},

			renameBasket: (id, name) => {
				set((state) => {
					const updatedBaskets = state.baskets.map((b) => {
						if (b.id === id) {
							return {
								...b,
								name: name.trim() || b.name,
								isNameEdited: true, // Mark manually edited!
							};
						}
						return b;
					});
					const namedBaskets = updateBasketNames(updatedBaskets);
					return {
						baskets: namedBaskets,
					};
				});
			},

			removeItemForId: (basketId, itemId) => {
				set((state) => {
					const updatedBaskets = state.baskets.map((b) => {
						if (b.id === basketId) {
							return {
								...b,
								items: b.items.filter((item) => item.id !== itemId),
							};
						}
						return b;
					});
					const namedBaskets = updateBasketNames(updatedBaskets);
					const activeBasket = namedBaskets.find((b) => b.id === state.activeBasketId);
					return {
						baskets: namedBaskets,
						items: activeBasket ? activeBasket.items : [
],
					};
				});
			},

			clearBasketForId: (basketId) => {
				set((state) => {
					const updatedBaskets = state.baskets.map((b) => {
						if (b.id === basketId) {
							return {
								...b,
								items: [
],
								basketCredits: [
],
							};
						}
						return b;
					});
					const namedBaskets = updateBasketNames(updatedBaskets);
					const activeBasket = namedBaskets.find((b) => b.id === state.activeBasketId);
					return {
						baskets: namedBaskets,
						items: activeBasket ? activeBasket.items : [
],
						basketCredits: activeBasket ? activeBasket.basketCredits : [
],
					};
				});
			},

			setBasketCreditsForId: (basketId, credits) => {
				set((state) => {
					const updatedBaskets = state.baskets.map((b) => {
						if (b.id === basketId) {
							return {
								...b,
								basketCredits: credits,
							};
						}
						return b;
					});
					const activeBasket = updatedBaskets.find((b) => b.id === state.activeBasketId);
					return {
						baskets: updatedBaskets,
						basketCredits: activeBasket ? activeBasket.basketCredits : [
],
					};
				});
			},
		}),
		{
			name: 'basket-storage',
			migrate: (persistedState: any) => {
				let state = persistedState;
				if (state && Array.isArray(state.items) && !state.baskets) {
					state = {
						...state,
						baskets: [
							{
								id: 'default',
								name: 'Konfiguration 1',
								items: state.items,
								basketCredits: state.basketCredits || [
],
							},
						],
						activeBasketId: 'default',
						isComparisonMode: false,
					};
				}
				// If activeBasketId is somehow lost, restore default activeBasketId
				if (state && state.baskets && state.baskets.length > 0 && !state.activeBasketId) {
					const firstBasket = state.baskets[0];
					state = {
						...state,
						activeBasketId: firstBasket.id,
						items: firstBasket.items,
						basketCredits: firstBasket.basketCredits,
					};
				}
				// Normalize basket names and ensure basketCredits array exists upon store load
				if (state && Array.isArray(state.baskets)) {
					state = {
						...state,
						baskets: updateBasketNames(
							state.baskets.map((b: any) => ({
								...b,
								basketCredits: b.basketCredits || [],
							}))
						),
					};
				}
				return state;
			},
		},
	),
);
