import { db } from "@/lib/db";
import { organizationBalances, revenueShares } from "@/db/app-schema";
import { eq, sql } from "drizzle-orm";

// ============================================
// Types
// ============================================

export interface OrganizationBalanceResponse {
    id: number;
    organizationId: string;
    organizationAmount: number;
    platformAmount: number;
    totalSales: number;
    totalWithdrawals: number;
    withdrawnAmount: number;
    currency: string;
}

// ============================================
// Accounting Controller
// ============================================

export class AccountingController {
    /**
     * Get or create balances for an organization
     */
    static async getOrCreateBalance(organizationId: string): Promise<OrganizationBalanceResponse> {
        // Try to find existing balance
        let balance = await db.query.organizationBalances.findFirst({
            where: eq(organizationBalances.organizationId, organizationId),
        });

        // If no balance exists, create one
        if (!balance) {
            await db.insert(organizationBalances).values({
                organizationId,
                organizationAmount: "0.00",
                platformAmount: "0.00",
                totalSales: 0,
                totalWithdrawals: 0,
                withdrawnAmount: "0.00",
                currency: "XAF",
            });

            balance = await db.query.organizationBalances.findFirst({
                where: eq(organizationBalances.organizationId, organizationId),
            });
        }

        if (!balance) {
            throw new Error("Failed to get or create balance");
        }

        return {
            id: balance.id,
            organizationId: balance.organizationId,
            organizationAmount: Number(balance.organizationAmount),
            platformAmount: Number(balance.platformAmount),
            totalSales: balance.totalSales,
            totalWithdrawals: balance.totalWithdrawals,
            withdrawnAmount: Number(balance.withdrawnAmount),
            currency: balance.currency,
        };
    }

    /**
     * Get current balances for an organization
     */
    static async getBalances(organizationId: string): Promise<OrganizationBalanceResponse | null> {
        const balance = await db.query.organizationBalances.findFirst({
            where: eq(organizationBalances.organizationId, organizationId),
        });

        if (!balance) {
            return null;
        }

        return {
            id: balance.id,
            organizationId: balance.organizationId,
            organizationAmount: Number(balance.organizationAmount),
            platformAmount: Number(balance.platformAmount),
            totalSales: balance.totalSales,
            totalWithdrawals: balance.totalWithdrawals,
            withdrawnAmount: Number(balance.withdrawnAmount),
            currency: balance.currency,
        };
    }

    /**
     * Record a purchase - increment organization and platform amounts
     */
    static async recordPurchase(
        organizationId: string,
        organizationAmount: number,
        platformAmount: number,
        currency: string = "XAF"
    ): Promise<void> {
        // Try to update existing balance
        const result = await db
            .update(organizationBalances)
            .set({
                organizationAmount: sql`${organizationBalances.organizationAmount} + ${organizationAmount.toFixed(2)}`,
                platformAmount: sql`${organizationBalances.platformAmount} + ${platformAmount.toFixed(2)}`,
                totalSales: sql`${organizationBalances.totalSales} + 1`,
            })
            .where(eq(organizationBalances.organizationId, organizationId));

        // If no rows updated, create a new balance record
        if (result[0].affectedRows === 0) {
            await db.insert(organizationBalances).values({
                organizationId,
                organizationAmount: organizationAmount.toFixed(2),
                platformAmount: platformAmount.toFixed(2),
                totalSales: 1,
                totalWithdrawals: 0,
                withdrawnAmount: "0.00",
                currency,
            });
        }

        console.log(`[Accounting] Purchase recorded for org ${organizationId}: +${organizationAmount} (org), +${platformAmount} (platform)`);
    }

    /**
     * Record a withdrawal - decrement organization amount and increment withdrawn amount
     */
    static async recordWithdrawal(
        organizationId: string,
        amount: number
    ): Promise<void> {
        await db
            .update(organizationBalances)
            .set({
                organizationAmount: sql`${organizationBalances.organizationAmount} - ${amount.toFixed(2)}`,
                withdrawnAmount: sql`${organizationBalances.withdrawnAmount} + ${amount.toFixed(2)}`,
                totalWithdrawals: sql`${organizationBalances.totalWithdrawals} + 1`,
            })
            .where(eq(organizationBalances.organizationId, organizationId));

        console.log(`[Accounting] Withdrawal recorded for org ${organizationId}: -${amount}`);
    }

    /**
     * Record a refund - decrement both organization and platform amounts
     */
    static async recordRefund(
        organizationId: string,
        organizationAmount: number,
        platformAmount: number
    ): Promise<void> {
        await db
            .update(organizationBalances)
            .set({
                organizationAmount: sql`${organizationBalances.organizationAmount} - ${organizationAmount.toFixed(2)}`,
                platformAmount: sql`${organizationBalances.platformAmount} - ${platformAmount.toFixed(2)}`,
                totalSales: sql`${organizationBalances.totalSales} - 1`,
            })
            .where(eq(organizationBalances.organizationId, organizationId));

        console.log(`[Accounting] Refund recorded for org ${organizationId}: -${organizationAmount} (org), -${platformAmount} (platform)`);
    }

    /**
     * Sync balances from existing revenue shares (for migration)
     */
    static async syncFromRevenueShares(organizationId: string): Promise<void> {
        // Check if balance already exists
        const existingBalance = await db.query.organizationBalances.findFirst({
            where: eq(organizationBalances.organizationId, organizationId),
        });

        if (existingBalance && Number(existingBalance.organizationAmount) > 0) {
            console.log(`Balance already exists for organization ${organizationId}, skipping sync`);
            return;
        }

        // Get all revenue shares for this organization
        const shares = await db.query.revenueShares.findMany({
            where: eq(revenueShares.organizationId, organizationId),
        });

        let totalOrgAmount = 0;
        let totalPlatformAmount = 0;
        let totalWithdrawn = 0;
        let salesCount = 0;
        let withdrawalCount = 0;

        for (const share of shares) {
            if (share.status === "cancelled") {
                continue;
            }

            if (share.status === "paid_out") {
                totalWithdrawn += Number(share.organizationAmount);
                withdrawalCount++;
            } else {
                totalOrgAmount += Number(share.organizationAmount);
                totalPlatformAmount += Number(share.platformAmount);
                salesCount++;
            }
        }

        // Calculate available balance (total - withdrawn)
        const availableBalance = totalOrgAmount - totalWithdrawn;

        // Insert or update balance
        if (existingBalance) {
            await db
                .update(organizationBalances)
                .set({
                    organizationAmount: availableBalance.toFixed(2),
                    platformAmount: totalPlatformAmount.toFixed(2),
                    totalSales: salesCount,
                    totalWithdrawals: withdrawalCount,
                    withdrawnAmount: totalWithdrawn.toFixed(2),
                })
                .where(eq(organizationBalances.organizationId, organizationId));
        } else {
            await db.insert(organizationBalances).values({
                organizationId,
                organizationAmount: availableBalance.toFixed(2),
                platformAmount: totalPlatformAmount.toFixed(2),
                totalSales: salesCount,
                totalWithdrawals: withdrawalCount,
                withdrawnAmount: totalWithdrawn.toFixed(2),
                currency: "XAF",
            });
        }

        console.log(`Synced ${shares.length} revenue shares to balance for organization ${organizationId}`);
    }
}
