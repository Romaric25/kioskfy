export type TransactionType = "purchase" | "withdrawal" | "refund";

export interface CreateLedgerEntryInput {
    organizationId: string;
    transactionType: TransactionType;
    referenceId: string;
    organizationAmount: number;
    platformAmount: number;
    description?: string;
    currency?: string;
}

export interface LedgerEntryResponse {
    id: number;
    organizationId: string;
    transactionType: TransactionType;
    referenceId: string;
    organizationAmount: string;
    platformAmount: string;
    organizationBalance: string;
    platformBalance: string;
    description: string | null;
    currency: string;
    createdAt: Date;
}

export interface AccountingBalances {
    organizationBalance: number;
    platformBalance: number;
    totalOrganizationCredits: number;
    totalOrganizationDebits: number;
    totalPlatformCredits: number;
}

export interface AccountingSummary {
    organizationBalance: number;
    platformBalance: number;
    totalRevenue: number;
    totalWithdrawn: number;
    ledgerEntries: LedgerEntryResponse[];
}

