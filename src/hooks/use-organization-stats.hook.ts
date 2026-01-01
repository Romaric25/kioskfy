import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

interface RecentSale {
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

interface OrganizationStatsResponse {
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

export function useOrganizationStats(organizationId: string | undefined) {
    return useQuery({
        queryKey: ["organizationStats", organizationId],
        queryFn: async () => {
            if (!organizationId) throw new Error("Organization ID is required");

            const { data, error } = await client.api.v1.orders.organization({ organizationId }).stats.get();

            if (error) {
                throw new Error((error as any).value?.message || "Failed to fetch organization stats");
            }

            return (data as any).data as OrganizationStatsResponse;
        },
        enabled: !!organizationId,
    });
}
