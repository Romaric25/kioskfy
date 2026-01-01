import { db } from "@/lib/db";
import { withdrawals, organizationBalances } from "@/db/app-schema";
import { eq, desc, sql } from "drizzle-orm";

// ============================================
// Types
// ============================================

export type WithdrawalStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export interface CreateWithdrawalInput {
    organizationId: string;
    amount: number;
    paymentMethod?: string;
    paymentDetails?: string;
    notes?: string;
    currency?: string;
}

export interface WithdrawalResponse {
    id: number;
    organizationId: string;
    amount: number;
    currency: string;
    status: WithdrawalStatus;
    paymentMethod: string | null;
    paymentDetails: string | null;
    externalReference: string | null;
    notes: string | null;
    requestedAt: Date;
    processedAt: Date | null;
    completedAt: Date | null;
}

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
        const result = await db.insert(withdrawals).values({
            organizationId: input.organizationId,
            amount: input.amount.toFixed(2),
            currency: input.currency || "XAF",
            status: "pending",
            paymentMethod: input.paymentMethod || null,
            paymentDetails: input.paymentDetails || null,
            notes: input.notes || null,
        });

        const insertId = result[0].insertId;

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
        adminNotes?: string,
        externalReference?: string
    ): Promise<WithdrawalResponse | null> {
        const withdrawal = await db.query.withdrawals.findFirst({
            where: eq(withdrawals.id, id),
        });

        if (!withdrawal) {
            return null;
        }

        const updates: any = { status };

        if (adminNotes) {
            updates.adminNotes = adminNotes;
        }

        if (externalReference) {
            updates.externalReference = externalReference;
        }

        if (status === "processing") {
            updates.processedAt = new Date();
        }

        if (status === "completed") {
            updates.completedAt = new Date();

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
                adminNotes: reason || "Cancelled by user",
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
            notes: withdrawal.notes,
            requestedAt: withdrawal.requestedAt,
            processedAt: withdrawal.processedAt,
            completedAt: withdrawal.completedAt,
        };
    }
}
