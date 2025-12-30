import { Elysia, t } from "elysia";
import {
    MonerooWebhookController,
    type MonerooWebhookPayload,
} from "@/server/controllers/moneroo-webhook.controller";

// ============================================
// Webhook Payload Schema
// ============================================

const webhookDataSchema = t.Object({
    id: t.String(),
    status: t.String(),
    amount: t.Optional(t.Number()),
    currency: t.Optional(t.String()),
    customer: t.Optional(
        t.Object({
            email: t.Optional(t.String()),
            first_name: t.Optional(t.String()),
            last_name: t.Optional(t.String()),
            phone: t.Optional(t.String()),
        })
    ),
    metadata: t.Optional(t.Record(t.String(), t.Any())),
    created_at: t.Optional(t.String()),
    updated_at: t.Optional(t.String()),
});

const webhookPayloadSchema = t.Object({
    event: t.Union([
        t.Literal("payment.initiated"),
        t.Literal("payment.success"),
        t.Literal("payment.failed"),
        t.Literal("payment.cancelled"),
        t.Literal("payout.initiated"),
        t.Literal("payout.success"),
        t.Literal("payout.failed"),
    ]),
    data: webhookDataSchema,
});

// ============================================
// Moneroo Webhook Service
// ============================================

export const monerooWebhookService = new Elysia({ prefix: "/webhooks" })
    /**
     * POST /webhooks/moneroo
     * Endpoint to receive Moneroo payment webhooks
     */
    .post(
        "/moneroo",
        async ({ body, request, set }) => {
            const signature = request.headers.get("x-moneroo-signature");
            const webhookSecret = process.env.MONEROO_WEBHOOK_SECRET;

            // Get raw body for signature verification
            const rawBody = JSON.stringify(body);

            // Verify webhook signature
            if (webhookSecret && signature) {
                const isValid = MonerooWebhookController.verifySignature(
                    rawBody,
                    signature,
                    webhookSecret
                );

                if (!isValid) {
                    console.error("[Moneroo Webhook] Invalid signature");
                    set.status = 403;
                    return {
                        success: false,
                        message: "Invalid webhook signature",
                    };
                }
            } else if (process.env.NODE_ENV === "production") {
                // In production, require signature verification
                console.error("[Moneroo Webhook] Missing signature or secret in production");
                set.status = 403;
                return {
                    success: false,
                    message: "Webhook signature verification required",
                };
            } else {
                // In development, log warning but continue
                console.warn("[Moneroo Webhook] Signature verification skipped (development mode)");
            }

            try {
                // Process the webhook
                const result = await MonerooWebhookController.handleWebhook(
                    body as MonerooWebhookPayload
                );

                if (!result.success) {
                    // Return 200 even for failures to prevent Moneroo from retrying
                    // The error is logged and can be investigated
                    console.error("[Moneroo Webhook] Processing failed:", result.message);
                }

                // Always return 200 to acknowledge receipt
                set.status = 200;
                return {
                    success: true,
                    message: result.message,
                    orderId: result.orderId,
                };
            } catch (error) {
                console.error("[Moneroo Webhook] Unexpected error:", error);

                // Return 200 to acknowledge receipt and prevent retries
                // Log the error for investigation
                set.status = 200;
                return {
                    success: false,
                    message: "Webhook received but processing failed",
                };
            }
        },
        {
            body: webhookPayloadSchema,
            detail: {
                tags: ["Webhooks"],
                summary: "Moneroo Payment Webhook",
                description:
                    "Receives payment status updates from Moneroo. Verifies signature and updates order status accordingly.",
            },
        }
    )

    /**
     * GET /webhooks/moneroo/health
     * Health check endpoint for webhook monitoring
     */
    .get(
        "/moneroo/health",
        () => {
            return {
                success: true,
                message: "Moneroo webhook endpoint is operational",
                timestamp: new Date().toISOString(),
            };
        },
        {
            detail: {
                tags: ["Webhooks"],
                summary: "Webhook Health Check",
                description: "Check if the Moneroo webhook endpoint is operational",
            },
        }
    );
