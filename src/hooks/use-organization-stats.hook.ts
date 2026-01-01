import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { OrganizationStatsResponse } from "@/app/interfaces/organization-stats.interface";

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
