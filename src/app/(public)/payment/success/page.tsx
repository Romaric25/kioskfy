import { PaymentSuccessContent } from "@/components/payment/PaymentSuccessContent";

export const metadata = {
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
