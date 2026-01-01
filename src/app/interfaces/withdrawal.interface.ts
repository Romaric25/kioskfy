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
    requestedAt: Date;
    processedAt: Date | null;
    completedAt: Date | null;
}

export interface CreateWithdrawalInput {
    organizationId: string;
    amount: number;
    paymentMethod?: string;
    paymentDetails?: string;
    notes?: string;
}
