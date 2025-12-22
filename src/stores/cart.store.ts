import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NewspaperResponse } from "@/server/models/newspaper.model";

interface CartState {
    items: NewspaperResponse[];
    addItem: (item: NewspaperResponse) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    isInCart: (id: string) => boolean;
    total: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                set({ items: [item] });
            },
            removeItem: (id) => {
                const { items } = get();
                set({ items: items.filter((item) => item.id !== id) });
            },
            clearCart: () => set({ items: [] }),
            isInCart: (id) => {
                const { items } = get();
                return items.some((item) => item.id === id);
            },
            total: () => {
                const { items } = get();
                return items.reduce((acc, item) => acc + Number(item.price), 0);
            },
        }),
        {
            name: "cart-storage",
        }
    )
);
