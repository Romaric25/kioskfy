import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OrderState } from "@/app/interfaces/order.interface";

export const useOrderStore = create<OrderState>()(
    persist(
        (set, get) => ({
            selectedItemIds: [],
            addItem: (id: string) =>
                set((state) => {
                    // Ne pas ajouter si l'article existe déjà
                    if (state.selectedItemIds.includes(id)) {
                        return state;
                    }
                    return { selectedItemIds: [...state.selectedItemIds, id] };
                }),
            removeItem: (id: string) =>
                set((state) => ({
                    selectedItemIds: state.selectedItemIds.filter((itemId) => itemId !== id),
                })),
            hasItem: (id: string) => get().selectedItemIds.includes(id),
            clearItems: () => set({ selectedItemIds: [] }),
        }),
        {
            name: "order-storage",
        }
    )
);
