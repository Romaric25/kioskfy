import { PaymentSuccessContent } from "@/components/payment/PaymentSuccessContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Paiement effectué",
    description: "Paiement effectué avec succès",
    robots: {
        index: false,
        follow: false,
    },
};

export default function PaymentSuccessPage() {
    return (
        <PaymentSuccessContent />
    );
}
