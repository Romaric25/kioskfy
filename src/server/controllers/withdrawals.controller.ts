import { db } from "@/lib/db";
import { withdrawals, organizationBalances } from "@/db/app-schema";
import { eq, desc, sql } from "drizzle-orm";
import {
    WithdrawalStatus,
    CreateWithdrawalInput,
    WithdrawalResponse,
} from "@/app/interfaces/withdrawal.interface";

// Re-export types for backward compatibility
export type { WithdrawalStatus, CreateWithdrawalInput, WithdrawalResponse };

// ============================================
// Withdrawals Controller
// ============================================

export class WithdrawalsController {
    /**
     * Create a new withdrawal request
     */
    static async createWithdrawal(input: CreateWithdrawalInput): Promise<WithdrawalResponse> {
        // Check if organization has enough balance
        const balance = await db.query.organizationBalances.findFirst({
            where: eq(organizationBalances.organizationId, input.organizationId),
        });

        if (!balance || Number(balance.organizationAmount) < input.amount) {
            throw new Error("Solde insuffisant pour effectuer ce retrait");
        }

        // Create withdrawal request
        const status = input.status || "pending";

        const result = await db.insert(withdrawals).values({
            organizationId: input.organizationId,
            amount: input.amount.toFixed(2),
            currency: input.currency || "XAF",
            status: status,
            paymentMethod: input.paymentMethod || null,
            paymentDetails: input.paymentDetails || null,
            notes: input.notes || null,
            externalReference: input.externalReference || null,
            userId: input.userId || null,
        });

        const insertId = result[0].insertId;

        // Update organization_balances: deduct from available, add to withdrawn
        await db
            .update(organizationBalances)
            .set({
                organizationAmount: sql`${organizationBalances.organizationAmount} - ${input.amount.toFixed(2)}`,
                withdrawnAmount: sql`${organizationBalances.withdrawnAmount} + ${input.amount.toFixed(2)}`,
                totalWithdrawals: sql`${organizationBalances.totalWithdrawals} + 1`,
            })
            .where(eq(organizationBalances.organizationId, input.organizationId));

        const withdrawal = await db.query.withdrawals.findFirst({
            where: eq(withdrawals.id, insertId),
        });

        if (!withdrawal) {
            throw new Error("Failed to create withdrawal");
        }

        return this.formatWithdrawal(withdrawal);
    }

    /**
     * Get withdrawals for an organization
     */
    static async getByOrganization(
        organizationId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<WithdrawalResponse[]> {
        const results = await db.query.withdrawals.findMany({
            where: eq(withdrawals.organizationId, organizationId),
            orderBy: [desc(withdrawals.requestedAt)],
            limit,
            offset,
            with: {
                user: true,
            },
        });

        return results.map(this.formatWithdrawal);
    }

    /**
     * Get a withdrawal by ID
     */
    static async getById(id: number): Promise<WithdrawalResponse | null> {
        const withdrawal = await db.query.withdrawals.findFirst({
            where: eq(withdrawals.id, id),
        });

        if (!withdrawal) {
            return null;
        }

        return this.formatWithdrawal(withdrawal);
    }

    /**
     * Update withdrawal status (admin)
     */
    static async updateStatus(
        id: number,
        status: WithdrawalStatus,
        externalReference?: string
    ): Promise<WithdrawalResponse | null> {
        const withdrawal = await db.query.withdrawals.findFirst({
            where: eq(withdrawals.id, id),
        });

        if (!withdrawal) {
            return null;
        }

        const updates: any = { status };

        if (externalReference) {
            updates.externalReference = externalReference;
        }

        if (status === "completed") {
            // Update organization balance (deduct withdrawn amount)
            await db
                .update(organizationBalances)
                .set({
                    organizationAmount: sql`${organizationBalances.organizationAmount} - ${Number(withdrawal.amount).toFixed(2)}`,
                    withdrawnAmount: sql`${organizationBalances.withdrawnAmount} + ${Number(withdrawal.amount).toFixed(2)}`,
                    totalWithdrawals: sql`${organizationBalances.totalWithdrawals} + 1`,
                })
                .where(eq(organizationBalances.organizationId, withdrawal.organizationId));

            console.log(`[Withdrawals] Completed withdrawal #${id}: -${withdrawal.amount} from org ${withdrawal.organizationId}`);
        }

        await db
            .update(withdrawals)
            .set(updates)
            .where(eq(withdrawals.id, id));

        return this.getById(id);
    }

    /**
     * Cancel a pending withdrawal
     */
    static async cancel(id: number, reason?: string): Promise<WithdrawalResponse | null> {
        const withdrawal = await db.query.withdrawals.findFirst({
            where: eq(withdrawals.id, id),
        });

        if (!withdrawal) {
            return null;
        }

        if (withdrawal.status !== "pending") {
            throw new Error("Only pending withdrawals can be cancelled");
        }

        await db
            .update(withdrawals)
            .set({
                status: "cancelled",
            })
            .where(eq(withdrawals.id, id));

        return this.getById(id);
    }

    /**
     * Format withdrawal for response
     */
    private static formatWithdrawal(withdrawal: any): WithdrawalResponse {
        return {
            id: withdrawal.id,
            organizationId: withdrawal.organizationId,
            amount: Number(withdrawal.amount),
            currency: withdrawal.currency,
            status: withdrawal.status as WithdrawalStatus,
            paymentMethod: withdrawal.paymentMethod,
            paymentDetails: withdrawal.paymentDetails,
            externalReference: withdrawal.externalReference,
            userId: withdrawal.userId,
            notes: withdrawal.notes,
            requestedAt: withdrawal.requestedAt,
            user: withdrawal.user ? {
                id: withdrawal.user.id,
                name: withdrawal.user.name,
                email: withdrawal.user.email,
            } : null,
        };
    }
}
