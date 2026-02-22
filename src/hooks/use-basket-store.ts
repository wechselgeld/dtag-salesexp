import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, BusinessCase, Credit, MagentaTVPackageKey } from './use-cost-calculator';

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
        // Snapshotting is safer for "Quote guarantees", but referencing ensures latest price.
        // Let's store the objects as `Credit` for now.
        // Actually, matching `useCostCalculator`, we might just want to store what's needed.
    };
    addedAt: number;
}

interface BasketState {
    items: BasketItem[];
    isOpen: boolean;
    basketCredits: Credit[];
    addItem: (product: Product, config: BasketItem["config"]) => void;
    removeItem: (id: string) => void;
    updateItem: (id: string, config: Partial<BasketItem["config"]>) => void;
    setBasketCredits: (credits: Credit[]) => void;
    clearBasket: () => void;
    setIsOpen: (isOpen: boolean) => void;
}

export const useBasketStore = create<BasketState>()(
    persist(
        (set) => ({
            items: [],
            isOpen: false,
            basketCredits: [], // Global credits
            addItem: (product, config) => {
                set((state) => ({
                    items: [
                        ...state.items,
                        {
                            id: crypto.randomUUID(),
                            product,
                            config,
                            addedAt: Date.now()
                        }
                    ],
                    isOpen: true
                }));
            },
            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id)
                }));
            },
            updateItem: (id, config) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id
                            ? { ...item, config: { ...item.config, ...config } }
                            : item
                    )
                }));
            },
            setBasketCredits: (credits) => set({ basketCredits: credits }),
            clearBasket: () => set({ items: [], basketCredits: [] }),
            setIsOpen: (isOpen) => set({ isOpen })
        }),
        {
            name: "basket-storage"
        }
    )
);
