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
    userId: string | null;
    notes: string | null;
    requestedAt: Date;
    user?: {
        id: string;
        name: string | null;
        email: string;
    } | null;
    organization?: {
        id: string;
        name: string;
        slug: string;
    };
}

export interface CreateWithdrawalInput {
    organizationId: string;
    amount: number;
    paymentMethod?: string;
    paymentDetails?: string;
    notes?: string;
    currency?: string;
    externalReference?: string;
    status?: WithdrawalStatus;
    userId?: string;
}

/**
 * Type simplifié pour l'affichage dans les tables
 */
export type WithdrawalTableData = {
    id: number;
    organizationId: string;
    amount: number;
    currency: string;
    status: WithdrawalStatus;
    requestedAt: Date;
    user?: {
        name: string;
        email: string;
    } | null;
    organization?: {
        name: string;
        slug: string;
    };
};
