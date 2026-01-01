import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartState } from "@/app/interfaces/cart.interface";

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const { items } = get();
                // Ne pas ajouter si l'article existe déjà
                if (items.some((i) => i.id === item.id)) {
                    return;
                }
                set({ items: [...items, item] });
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
