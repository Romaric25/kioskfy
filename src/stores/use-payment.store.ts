import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PaymentStore {
    paymentId: string;
    setPaymentId: (paymentId: string) => void;
    clearPaymentId: () => void;
}

export const usePaymentStore = create<PaymentStore>()(
    persist(
        (set) => ({
            paymentId: "",
            setPaymentId: (paymentId: string) => set({ paymentId }),
            clearPaymentId: () => set({ paymentId: "" }),
        }),
        {
            name: "payment-storage",
        }
    )
);
