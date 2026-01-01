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
