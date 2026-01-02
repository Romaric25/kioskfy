import { Elysia, t } from "elysia";
import { WithdrawalsController } from "@/server/controllers/withdrawals.controller";
import { betterAuthPlugin } from "@/lib/plugins/better-auth-plugin";

// ============================================
// Withdrawals Service
// ============================================

export const withdrawalsService = new Elysia({ prefix: "/withdrawals" })
    .use(betterAuthPlugin)

    /**
     * POST /withdrawals
     * Create a new withdrawal request
     */
    .post(
        "/",
        async ({ body, set }) => {
            try {
                const withdrawal = await WithdrawalsController.createWithdrawal({
                    organizationId: body.organizationId,
                    amount: body.amount,
                    paymentMethod: body.paymentMethod,
                    paymentDetails: body.paymentDetails,
                    notes: body.notes,
                    externalReference: body.externalReference,
                    status: body.status as any,
                    userId: body.userId,
                    initiatedAt: body.initiatedAt,
                    processedAt: body.processedAt,
                    completedAt: body.completedAt,
                });

                return {
                    success: true,
                    data: withdrawal,
                };
            } catch (error: any) {
                set.status = 400;
                return {
                    success: false,
                    message: error.message || "Failed to create withdrawal",
                };
            }
        },
        {
            auth: true,
            body: t.Object({
                organizationId: t.String(),
                amount: t.Number(),
                paymentMethod: t.Optional(t.String()),
                paymentDetails: t.Optional(t.String()),
                notes: t.Optional(t.String()),
                externalReference: t.Optional(t.String()),
                status: t.Optional(t.String()),
                userId: t.Optional(t.String()),
                initiatedAt: t.Optional(t.String()),
                processedAt: t.Optional(t.String()),
                completedAt: t.Optional(t.String()),
            }),
            detail: {
                tags: ["Withdrawals"],
                summary: "Create withdrawal request",
                description: "Create a new withdrawal request for an organization",
            },
        }
    )

    /**
     * GET /withdrawals/organization/:organizationId
     * Get withdrawals for an organization
     */
    .get(
        "/organization/:organizationId",
        async ({ params, query, set }) => {
            try {
                const limit = query.limit ? parseInt(query.limit) : 50;
                const offset = query.offset ? parseInt(query.offset) : 0;

                const withdrawals = await WithdrawalsController.getByOrganization(
                    params.organizationId,
                    limit,
                    offset
                );

                return {
                    success: true,
                    data: withdrawals,
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to fetch withdrawals",
                };
            }
        },
        {
            auth: true,
            params: t.Object({
                organizationId: t.String(),
            }),
            query: t.Object({
                limit: t.Optional(t.String()),
                offset: t.Optional(t.String()),
            }),
            detail: {
                tags: ["Withdrawals"],
                summary: "Get organization withdrawals",
                description: "Get all withdrawal requests for an organization",
            },
        }
    )

    /**
     * GET /withdrawals/:id
     * Get a specific withdrawal
     */
    .get(
        "/:id",
        async ({ params, set }) => {
            try {
                const withdrawal = await WithdrawalsController.getById(parseInt(params.id));

                if (!withdrawal) {
                    set.status = 404;
                    return {
                        success: false,
                        message: "Withdrawal not found",
                    };
                }

                return {
                    success: true,
                    data: withdrawal,
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to fetch withdrawal",
                };
            }
        },
        {
            auth: true,
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ["Withdrawals"],
                summary: "Get withdrawal by ID",
                description: "Get a specific withdrawal request by ID",
            },
        }
    )

    /**
     * DELETE /withdrawals/:id
     * Cancel a pending withdrawal
     */
    .delete(
        "/:id",
        async ({ params, body, set }) => {
            try {
                const withdrawal = await WithdrawalsController.cancel(
                    parseInt(params.id),
                    body?.reason
                );

                if (!withdrawal) {
                    set.status = 404;
                    return {
                        success: false,
                        message: "Withdrawal not found",
                    };
                }

                return {
                    success: true,
                    data: withdrawal,
                    message: "Withdrawal cancelled successfully",
                };
            } catch (error: any) {
                set.status = 400;
                return {
                    success: false,
                    message: error.message || "Failed to cancel withdrawal",
                };
            }
        },
        {
            auth: true,
            params: t.Object({
                id: t.String(),
            }),
            body: t.Optional(t.Object({
                reason: t.Optional(t.String()),
            })),
            detail: {
                tags: ["Withdrawals"],
                summary: "Cancel withdrawal",
                description: "Cancel a pending withdrawal request",
            },
        }
    );
