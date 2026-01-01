export interface RecentSale {
    id: string;
    amount: number;
    user: {
        name: string | null;
        email: string;
        image: string | null;
    } | null;
    newspaper: {
        issueNumber: string | null;
        coverImage: string | null;
    } | null;
    createdAt: Date;
}

export interface OrganizationStatsResponse {
    totalRevenue: number;
    salesCount: number;
    availableBalance: number;
    withdrawnAmount: number;
    payouts: {
        date: Date | null;
        amount: number;
        count: number;
    }[];
    recentSales: RecentSale[];
}
