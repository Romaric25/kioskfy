import { Elysia, t } from "elysia";
import { AccountingController } from "@/server/controllers/accounting.controller";
import { betterAuthPlugin } from "@/lib/plugins/better-auth-plugin";

// ============================================
// Accounting Service
// ============================================

export const accountingService = new Elysia({ prefix: "/accounting" })
    .use(betterAuthPlugin)

    /**
     * GET /accounting/organization/:organizationId/balances
     * Get current balances for an organization
     */
    .get(
        "/organization/:organizationId/balances",
        async ({ params, set }) => {
            try {
                const balances = await AccountingController.getOrCreateBalance(
                    params.organizationId
                );

                return {
                    success: true,
                    data: balances,
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to fetch balances",
                };
            }
        },
        {
            auth: true,
            params: t.Object({
                organizationId: t.String(),
            }),
            detail: {
                tags: ["Accounting"],
                summary: "Get organization balances",
                description: "Get current organization and platform balances",
            },
        }
    )

    /**
     * POST /accounting/organization/:organizationId/sync
     * Sync balances from existing revenue shares (migration)
     */
    .post(
        "/organization/:organizationId/sync",
        async ({ params, set }) => {
            try {
                await AccountingController.syncFromRevenueShares(
                    params.organizationId
                );

                const balances = await AccountingController.getBalances(params.organizationId);

                return {
                    success: true,
                    message: "Balances synced from revenue shares",
                    data: balances,
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to sync balances",
                };
            }
        },
        {
            auth: true,
            params: t.Object({
                organizationId: t.String(),
            }),
            detail: {
                tags: ["Accounting"],
                summary: "Sync balances from revenue shares",
                description: "Populate balances from existing revenue shares (one-time migration)",
            },
        }
    );
