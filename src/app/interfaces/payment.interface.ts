export interface PaymentStore {
    paymentId: string;
    setPaymentId: (paymentId: string) => void;
    clearPaymentId: () => void;
}
