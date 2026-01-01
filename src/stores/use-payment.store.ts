import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PaymentStore } from "@/app/interfaces/payment.interface";

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
