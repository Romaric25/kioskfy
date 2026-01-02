import { db } from "@/lib/db";
import { withdrawals } from "@/db/app-schema";
import { eq } from "drizzle-orm";
import { InitializePayoutInput, PaymentResponse, VerifyTransactionResponse } from "@/app/interfaces/payout.interface";
import { WithdrawalsController } from "./withdrawals.controller";

const host = process.env.MONEROO_HOST;
const secretKey = process.env.MONEROO_SECRET_KEY;
export class PayoutsController {


    /**
     * Initialize a payout with Moneroo
     */
    static async initializePayout(input: InitializePayoutInput): Promise<PaymentResponse> {
        if (!secretKey) {
            throw new Error("MONEROO_SECRET_KEY is not defined");
        }

        // Optional: Verify withdrawal if provided
        if (input.withdrawalId) {
            const withdrawal = await WithdrawalsController.getById(input.withdrawalId);
            if (!withdrawal) {
                throw new Error("Withdrawal request not found");
            }
        }

        try {
            // Call Moneroo Payout API
            const response = await fetch(`${host}/payouts/initialize`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${secretKey}`,
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    amount: input.amount,
                    currency: input.currency,
                    description: input.description,
                    customer: input.customer,
                    recipient: input.recipient, // Include recipient object
                    metadata: {
                        ...input.metadata,
                        withdrawal_id: input.withdrawalId ? input.withdrawalId.toString() : undefined,
                    },
                    method: input.method, // Singular method
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("[Moneroo Payout Error]", data);
                throw new Error(data.message || "Failed to initialize payout with Moneroo");
            }

            // If linked to a withdrawal, update status
            if (input.withdrawalId) {
                const externalReference = data.data?.id || data.id;
                await WithdrawalsController.updateStatus(
                    input.withdrawalId,
                    "processing",
                    externalReference
                );
            }

            return {
                success: true,
                data: data,
                message: "Payout initialized successfully",
            };

        } catch (error: any) {
            console.error("[Payout Initialization Failed]", error);
            throw new Error(error.message || "An unexpected error occurred during payout initialization");
        }
    }

    /**
     * Verify a payout status
     */
    static async verifyPayout(payoutId: string): Promise<VerifyTransactionResponse> {

        if (!secretKey) {
            throw new Error("MONEROO_SECRET_KEY is not defined");
        }

        try {
            // Use Payouts Verify URL
            const response = await fetch(`${host}/payouts/${payoutId}/verify`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${secretKey}`,
                    "Accept": "application/json",
                },
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("[Moneroo Payout Verify Error]", result);
                throw new Error(result.message || "Failed to verify payout");
            }

            const data = result.data as VerifyTransactionResponse;

            return data;

        } catch (error: any) {
            console.error("[Payout Verification Failed]", error);
            throw new Error(error.message || "Failed to verify payout");
        }
    }
}
