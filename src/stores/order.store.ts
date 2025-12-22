import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrderState {
    selectedOrderId: string | null;
    setSelectedOrder: (id: string) => void;
    clearSelectedOrder: () => void;
}

export const useOrderStore = create<OrderState>()(
    persist(
        (set) => ({
            selectedOrderId: null,
            setSelectedOrder: (id: string) =>
                set({ selectedOrderId: id }),
            clearSelectedOrder: () =>
                set({ selectedOrderId: null }),
        }),
        {
            name: "order-storage",
        }
    )
);
