import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PayoutStore } from "@/app/interfaces/payout.interface";

export const usePayoutStore = create<PayoutStore>()(
    persist(
        (set) => ({
            payoutId: "",
            setPayoutId: (payoutId: string) => set({ payoutId }),
            clearPayoutId: () => set({ payoutId: "" }),
        }),
        {
            name: "payout-storage",
        }
    )
);
