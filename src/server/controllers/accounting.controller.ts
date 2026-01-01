import { db } from "@/lib/db";
import { accountingLedger, revenueShares } from "@/db/app-schema";
import { eq, desc, sum, and } from "drizzle-orm";
import {
    TransactionType,
    CreateLedgerEntryInput,
    LedgerEntryResponse,
    AccountingBalances,
} from "@/app/interfaces/accounting.interface";

// ============================================
// Accounting Controller
// ============================================

export class AccountingController {
    /**
     * Get the current balances for an organization
     */
    static async getCurrentBalances(organizationId: string): Promise<{ organizationBalance: number; platformBalance: number }> {
        // Get the last ledger entry to get current balances
        const lastEntry = await db.query.accountingLedger.findFirst({
            where: eq(accountingLedger.organizationId, organizationId),
            orderBy: [desc(accountingLedger.id)],
        });

        if (!lastEntry) {
            return { organizationBalance: 0, platformBalance: 0 };
        }

        return {
            organizationBalance: Number(lastEntry.organizationBalance),
            platformBalance: Number(lastEntry.platformBalance),
        };
    }

    /**
     * Create a ledger entry for a purchase (when an order is completed)
     */
    static async recordPurchase(
        organizationId: string,
        orderId: string,
        organizationAmount: number,
        platformAmount: number,
        description?: string
    ): Promise<LedgerEntryResponse> {
        return this.createLedgerEntry({
            organizationId,
            transactionType: "purchase",
            referenceId: orderId,
            organizationAmount,
            platformAmount,
            description: description || `Vente journal - Commande ${orderId}`,
        });
    }

    /**
     * Create a ledger entry for a withdrawal
     */
    static async recordWithdrawal(
        organizationId: string,
        payoutId: string,
        amount: number,
        description?: string
    ): Promise<LedgerEntryResponse> {
        return this.createLedgerEntry({
            organizationId,
            transactionType: "withdrawal",
            referenceId: payoutId,
            organizationAmount: -amount, // Negative because it's a debit
            platformAmount: 0,
            description: description || `Retrait - ${payoutId}`,
        });
    }

    /**
     * Create a ledger entry for a refund
     */
    static async recordRefund(
        organizationId: string,
        orderId: string,
        organizationAmount: number,
        platformAmount: number,
        description?: string
    ): Promise<LedgerEntryResponse> {
        return this.createLedgerEntry({
            organizationId,
            transactionType: "refund",
            referenceId: orderId,
            organizationAmount: -organizationAmount, // Negative because it's reversed
            platformAmount: -platformAmount,
            description: description || `Remboursement - Commande ${orderId}`,
        });
    }

    /**
     * Create a new ledger entry
     */
    static async createLedgerEntry(input: CreateLedgerEntryInput): Promise<LedgerEntryResponse> {
        // Get current balances
        const currentBalances = await this.getCurrentBalances(input.organizationId);

        // Calculate new balances
        const newOrganizationBalance = currentBalances.organizationBalance + input.organizationAmount;
        const newPlatformBalance = currentBalances.platformBalance + input.platformAmount;

        // Insert new entry
        const result = await db.insert(accountingLedger).values({
            organizationId: input.organizationId,
            transactionType: input.transactionType,
            referenceId: input.referenceId,
            organizationAmount: input.organizationAmount.toFixed(2),
            platformAmount: input.platformAmount.toFixed(2),
            organizationBalance: newOrganizationBalance.toFixed(2),
            platformBalance: newPlatformBalance.toFixed(2),
            description: input.description || null,
            currency: input.currency || "XAF",
        });

        const insertId = result[0].insertId;

        const entry = await db.query.accountingLedger.findFirst({
            where: eq(accountingLedger.id, insertId),
        });

        if (!entry) {
            throw new Error("Failed to create ledger entry");
        }

        return entry as LedgerEntryResponse;
    }

    /**
     * Get ledger entries for an organization
     */
    static async getLedgerEntries(
        organizationId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<LedgerEntryResponse[]> {
        const entries = await db.query.accountingLedger.findMany({
            where: eq(accountingLedger.organizationId, organizationId),
            orderBy: [desc(accountingLedger.createdAt)],
            limit,
            offset,
        });

        return entries as LedgerEntryResponse[];
    }

    /**
     * Get accounting summary for an organization
     */
    static async getAccountingSummary(organizationId: string): Promise<AccountingBalances> {
        // Get current balances
        const balances = await this.getCurrentBalances(organizationId);

        // Get total credits (purchases)
        const credits = await db
            .select({
                totalOrganization: sum(accountingLedger.organizationAmount),
                totalPlatform: sum(accountingLedger.platformAmount),
            })
            .from(accountingLedger)
            .where(
                and(
                    eq(accountingLedger.organizationId, organizationId),
                    eq(accountingLedger.transactionType, "purchase")
                )
            );

        // Get total debits (withdrawals)
        const debits = await db
            .select({
                total: sum(accountingLedger.organizationAmount),
            })
            .from(accountingLedger)
            .where(
                and(
                    eq(accountingLedger.organizationId, organizationId),
                    eq(accountingLedger.transactionType, "withdrawal")
                )
            );

        return {
            organizationBalance: balances.organizationBalance,
            platformBalance: balances.platformBalance,
            totalOrganizationCredits: Math.abs(Number(credits[0]?.totalOrganization || 0)),
            totalOrganizationDebits: Math.abs(Number(debits[0]?.total || 0)),
            totalPlatformCredits: Math.abs(Number(credits[0]?.totalPlatform || 0)),
        };
    }

    /**
     * Sync ledger from existing revenue shares (for migration)
     * This should be run once to populate the ledger from existing data
     */
    static async syncFromRevenueShares(organizationId: string): Promise<void> {
        // Check if there are already ledger entries for this organization
        const existingEntries = await db.query.accountingLedger.findFirst({
            where: eq(accountingLedger.organizationId, organizationId),
        });

        if (existingEntries) {
            console.log(`Ledger already has entries for organization ${organizationId}, skipping sync`);
            return;
        }

        // Get all processed revenue shares ordered by creation date
        const shares = await db.query.revenueShares.findMany({
            where: eq(revenueShares.organizationId, organizationId),
            orderBy: [revenueShares.createdAt],
        });

        // Create ledger entries for each revenue share
        for (const share of shares) {
            if (share.status === "cancelled") {
                continue;
            }

            await this.createLedgerEntry({
                organizationId: share.organizationId,
                transactionType: share.status === "paid_out" ? "withdrawal" : "purchase",
                referenceId: share.orderId,
                organizationAmount: share.status === "paid_out"
                    ? -Number(share.organizationAmount)
                    : Number(share.organizationAmount),
                platformAmount: share.status === "paid_out"
                    ? 0
                    : Number(share.platformAmount),
                description: share.status === "paid_out"
                    ? `Migration - Retrait`
                    : `Migration - Vente`,
            });
        }

        console.log(`Synced ${shares.length} revenue shares to ledger for organization ${organizationId}`);
    }
}
