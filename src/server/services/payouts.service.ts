import { Elysia, t } from "elysia";
import { PayoutsController } from "@/server/controllers/payouts.controller";
import { betterAuthPlugin } from "@/lib/plugins/better-auth-plugin";

// ============================================
// Payouts Service (Using Payment API)
// ============================================

export const payoutsService = new Elysia({ prefix: "/payouts" })
    .use(betterAuthPlugin)

    /**
     * POST /payouts/initialize
     * Initialize a payment with Moneroo
     */
    .post(
        "/initialize",
        async ({ body, set }) => {
            try {
                const result = await PayoutsController.initializePayout({
                    withdrawalId: body.withdrawalId,
                    amount: body.amount,
                    currency: body.currency,
                    description: body.description,
                    customer: body.customer,
                    recipient: body.recipient,
                    metadata: body.metadata,
                    method: body.method,
                });

                return result;
            } catch (error: any) {
                set.status = 400;
                return {
                    success: false,
                    message: error.message || "Failed to initialize payout",
                };
            }
        },
        {
            auth: true,
            body: t.Object({
                withdrawalId: t.Optional(t.Number()),
                amount: t.Number(),
                currency: t.String(),
                description: t.String(),
                customer: t.Object({
                    email: t.String(),
                    first_name: t.String(),
                    last_name: t.String(),
                }),
                recipient: t.Object({}, { additionalProperties: true }),
                metadata: t.Object({}, { additionalProperties: true }), // Allow flexible metadata
                method: t.String(),
            }),
            detail: {
                tags: ["Payouts"],
                summary: "Initialize Moneroo payout",
                description: "Initialize a payout via Moneroo API",
            },
        }
    )

    /**
     * GET /payouts/:payoutId/verify
     * Verify a transaction status
     */
    .get(
        "/:payoutId/verify",
        async ({ params, set }) => {
            try {
                const result = await PayoutsController.verifyPayout(params.payoutId);

                return {
                    success: true,
                    data: result,
                    message: "Transaction verified successfully",
                };
            } catch (error: any) {
                set.status = 400;
                return {
                    success: false,
                    message: error.message || "Failed to verify transaction",
                };
            }
        },
        {
            auth: true,
            params: t.Object({
                payoutId: t.String(),
            }),
            detail: {
                tags: ["Payouts"],
                summary: "Verify Moneroo transaction",
                description: "Verify the status of a Moneroo transaction by ID",
            },
        }
    );
