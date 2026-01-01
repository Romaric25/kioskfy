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
                const balances = await AccountingController.getCurrentBalances(
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
     * GET /accounting/organization/:organizationId/summary
     * Get accounting summary for an organization
     */
    .get(
        "/organization/:organizationId/summary",
        async ({ params, set }) => {
            try {
                const summary = await AccountingController.getAccountingSummary(
                    params.organizationId
                );

                return {
                    success: true,
                    data: summary,
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to fetch accounting summary",
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
                summary: "Get accounting summary",
                description: "Get complete accounting summary including balances and totals",
            },
        }
    )

    /**
     * GET /accounting/organization/:organizationId/ledger
     * Get ledger entries for an organization
     */
    .get(
        "/organization/:organizationId/ledger",
        async ({ params, query, set }) => {
            try {
                const limit = query.limit ? parseInt(query.limit) : 50;
                const offset = query.offset ? parseInt(query.offset) : 0;

                const entries = await AccountingController.getLedgerEntries(
                    params.organizationId,
                    limit,
                    offset
                );

                return {
                    success: true,
                    data: entries,
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to fetch ledger entries",
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
                tags: ["Accounting"],
                summary: "Get ledger entries",
                description: "Get paginated ledger entries for an organization",
            },
        }
    )

    /**
     * POST /accounting/organization/:organizationId/sync
     * Sync ledger from existing revenue shares (migration)
     */
    .post(
        "/organization/:organizationId/sync",
        async ({ params, set }) => {
            try {
                await AccountingController.syncFromRevenueShares(
                    params.organizationId
                );

                return {
                    success: true,
                    message: "Ledger synced from revenue shares",
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to sync ledger",
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
                summary: "Sync ledger from revenue shares",
                description: "Populate ledger from existing revenue shares (one-time migration)",
            },
        }
    );
