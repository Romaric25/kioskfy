
import { Payment } from "@/server/models/payment.model";

export interface MonerooPaymentResponse {
    checkout_url: string;
    payment_id: string;
    // Add other fields as necessary from Moneroo API
    [key: string]: any;
}

export class PaymentController {
    static async initializePayment(
        createPaymentDto: Payment
    ): Promise<MonerooPaymentResponse> {
        const host = process.env.MONEROO_HOST;
        const secretKey = process.env.MONEROO_SECRET_KEY;

        if (!host || !secretKey) {
            throw new Error("MONEROO_HOST or MONEROO_SECRET_KEY is not defined");
        }

        const response = await fetch(`${host}/payments/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${secretKey}`,
            },
            body: JSON.stringify(createPaymentDto),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Moneroo API Error: ${JSON.stringify(error)}`);
        }

        return response.json() as Promise<MonerooPaymentResponse>;
    }
}
