export type WithdrawalStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

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
    initiatedAt: Date | null;
    requestedAt: Date;
    processedAt: Date | null;
    completedAt: Date | null;
    userId?: string | null;
    user?: {
        id: string;
        name: string | null;
        email: string;
    } | null;
}

export interface CreateWithdrawalInput {
    organizationId: string;
    amount: number;
    paymentMethod?: string;
    paymentDetails?: string;
    notes?: string;
    externalReference?: string;
    status?: WithdrawalStatus;
    userId?: string;
    initiatedAt?: string;
    processedAt?: string;
    completedAt?: string;
}
