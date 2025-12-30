import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { orders } from "@/db/app-schema";
import { eq } from "drizzle-orm";

// ============================================
// Moneroo Webhook Types
// ============================================

export type MonerooWebhookEvent =
    | "payment.initiated"
    | "payment.success"
    | "payment.failed"
    | "payment.cancelled"
    | "payout.initiated"
    | "payout.success"
    | "payout.failed";

export interface MonerooWebhookPayload {
    event: MonerooWebhookEvent;
    data: {
        id: string;
        status: string;
        amount?: number;
        currency?: string;
        customer?: {
            email?: string;
            first_name?: string;
            last_name?: string;
            phone?: string;
        };
        metadata?: Record<string, any>;
        created_at?: string;
        updated_at?: string;
        [key: string]: any;
    };
}

export interface WebhookResult {
    success: boolean;
    message: string;
    orderId?: string;
}

// ============================================
// Webhook Controller
// ============================================

export class MonerooWebhookController {
    /**
     * Verify the webhook signature from Moneroo
     * Uses HMAC-SHA256 with the webhook secret
     */
    static verifySignature(
        payload: string,
        signature: string,
        secret: string
    ): boolean {
        if (!signature || !secret) {
            console.error("[Moneroo Webhook] Missing signature or secret");
            return false;
        }

        try {
            const computedSignature = createHmac("sha256", secret)
                .update(payload)
                .digest("hex");

            // Constant-time comparison to prevent timing attacks
            const signatureBuffer = Buffer.from(signature, "hex");
            const computedBuffer = Buffer.from(computedSignature, "hex");

            if (signatureBuffer.length !== computedBuffer.length) {
                return false;
            }

            let result = 0;
            for (let i = 0; i < signatureBuffer.length; i++) {
                result |= signatureBuffer[i] ^ computedBuffer[i];
            }

            return result === 0;
        } catch (error) {
            console.error("[Moneroo Webhook] Signature verification error:", error);
            return false;
        }
    }

    /**
     * Handle incoming webhook from Moneroo
     */
    static async handleWebhook(
        payload: MonerooWebhookPayload
    ): Promise<WebhookResult> {
        const { event, data } = payload;

        console.log(`[Moneroo Webhook] Received event: ${event}`, {
            paymentId: data.id,
            status: data.status,
        });

        switch (event) {
            case "payment.initiated":
                return this.handlePaymentInitiated(data);

            case "payment.success":
                return this.handlePaymentSuccess(data);

            case "payment.failed":
                return this.handlePaymentFailed(data);

            case "payment.cancelled":
                return this.handlePaymentCancelled(data);

            case "payout.initiated":
            case "payout.success":
            case "payout.failed":
                return this.handlePayoutEvent(event, data);

            default:
                console.warn(`[Moneroo Webhook] Unhandled event: ${event}`);
                return {
                    success: true,
                    message: `Event ${event} acknowledged but not processed`,
                };
        }
    }

    /**
     * Handle payment.initiated event
     */
    private static async handlePaymentInitiated(
        data: MonerooWebhookPayload["data"]
    ): Promise<WebhookResult> {
        console.log("[Moneroo Webhook] Payment initiated:", data.id);

        // Find order by paymentId and update status to pending if needed
        try {
            const order = await db.query.orders.findFirst({
                where: eq(orders.paymentId, data.id),
            });

            if (order) {
                console.log(`[Moneroo Webhook] Order found: ${order.id}`);
            }

            return {
                success: true,
                message: "Payment initiated event processed",
                orderId: order?.id,
            };
        } catch (error) {
            console.error("[Moneroo Webhook] Error handling payment.initiated:", error);
            return {
                success: false,
                message: "Error processing payment.initiated event",
            };
        }
    }

    /**
     * Handle payment.success event
     */
    private static async handlePaymentSuccess(
        data: MonerooWebhookPayload["data"]
    ): Promise<WebhookResult> {
        console.log("[Moneroo Webhook] Payment success:", data.id);

        try {
            // Find and update the order
            const order = await db.query.orders.findFirst({
                where: eq(orders.paymentId, data.id),
            });

            if (!order) {
                console.warn(`[Moneroo Webhook] Order not found for payment: ${data.id}`);
                return {
                    success: false,
                    message: `Order not found for payment ${data.id}`,
                };
            }

            // Update order status to completed
            await db
                .update(orders)
                .set({
                    status: "completed",
                    updatedAt: new Date(),
                })
                .where(eq(orders.id, order.id));

            console.log(`[Moneroo Webhook] Order ${order.id} marked as completed`);

            // TODO: Add any post-payment success logic here
            // - Send confirmation email
            // - Grant access to newspaper
            // - Update user's purchased items

            return {
                success: true,
                message: "Payment success processed",
                orderId: order.id,
            };
        } catch (error) {
            console.error("[Moneroo Webhook] Error handling payment.success:", error);
            return {
                success: false,
                message: "Error processing payment.success event",
            };
        }
    }

    /**
     * Handle payment.failed event
     */
    private static async handlePaymentFailed(
        data: MonerooWebhookPayload["data"]
    ): Promise<WebhookResult> {
        console.log("[Moneroo Webhook] Payment failed:", data.id);

        try {
            const order = await db.query.orders.findFirst({
                where: eq(orders.paymentId, data.id),
            });

            if (!order) {
                console.warn(`[Moneroo Webhook] Order not found for payment: ${data.id}`);
                return {
                    success: false,
                    message: `Order not found for payment ${data.id}`,
                };
            }

            // Update order status to failed
            await db
                .update(orders)
                .set({
                    status: "failed",
                    updatedAt: new Date(),
                })
                .where(eq(orders.id, order.id));

            console.log(`[Moneroo Webhook] Order ${order.id} marked as failed`);

            // TODO: Add failure handling logic
            // - Send failure notification email
            // - Log failure reason for analytics

            return {
                success: true,
                message: "Payment failure processed",
                orderId: order.id,
            };
        } catch (error) {
            console.error("[Moneroo Webhook] Error handling payment.failed:", error);
            return {
                success: false,
                message: "Error processing payment.failed event",
            };
        }
    }

    /**
     * Handle payment.cancelled event
     */
    private static async handlePaymentCancelled(
        data: MonerooWebhookPayload["data"]
    ): Promise<WebhookResult> {
        console.log("[Moneroo Webhook] Payment cancelled:", data.id);

        try {
            const order = await db.query.orders.findFirst({
                where: eq(orders.paymentId, data.id),
            });

            if (!order) {
                console.warn(`[Moneroo Webhook] Order not found for payment: ${data.id}`);
                return {
                    success: false,
                    message: `Order not found for payment ${data.id}`,
                };
            }

            // Update order status to failed (cancelled)
            await db
                .update(orders)
                .set({
                    status: "failed",
                    updatedAt: new Date(),
                })
                .where(eq(orders.id, order.id));

            console.log(`[Moneroo Webhook] Order ${order.id} marked as cancelled`);

            return {
                success: true,
                message: "Payment cancellation processed",
                orderId: order.id,
            };
        } catch (error) {
            console.error("[Moneroo Webhook] Error handling payment.cancelled:", error);
            return {
                success: false,
                message: "Error processing payment.cancelled event",
            };
        }
    }

    /**
     * Handle payout events (for future use)
     */
    private static async handlePayoutEvent(
        event: string,
        data: MonerooWebhookPayload["data"]
    ): Promise<WebhookResult> {
        console.log(`[Moneroo Webhook] Payout event ${event}:`, data.id);

        // TODO: Implement payout handling when needed
        // This would be used for refunds or partner payouts

        return {
            success: true,
            message: `Payout event ${event} acknowledged`,
        };
    }

    /**
     * Fetch payment details from Moneroo API
     * Use this to get the full payment status after webhook
     */
    static async fetchPaymentDetails(paymentId: string): Promise<any> {
        const host = process.env.MONEROO_HOST;
        const secretKey = process.env.MONEROO_SECRET_KEY;

        if (!host || !secretKey) {
            throw new Error("MONEROO_HOST or MONEROO_SECRET_KEY is not defined");
        }

        const response = await fetch(`${host}/payments/${paymentId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${secretKey}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Moneroo API Error: ${JSON.stringify(error)}`);
        }

        return response.json();
    }
}
