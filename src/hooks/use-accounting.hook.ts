import { client } from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrganizationBalanceResponse } from "@/app/interfaces/accounting.interface";

/**
 * Hook pour récupérer les soldes d'une organisation
 */
export function useOrganizationBalances(organizationId: string | undefined) {
    return useQuery({
        queryKey: ["organizationBalances", organizationId],
        queryFn: async () => {
            if (!organizationId) throw new Error("Organization ID is required");

            const { data, error } = await client.api.v1.accounting.organization({ organizationId }).balances.get();

            if (error) {
                throw new Error((error as any).value?.message || "Failed to fetch balances");
            }

            return (data as any).data as OrganizationBalanceResponse;
        },
        enabled: !!organizationId,
    });
}

/**
 * Hook pour synchroniser les soldes depuis les revenue shares
 */
export function useSyncBalances() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (organizationId: string) => {
            const { data, error } = await client.api.v1.accounting.organization({ organizationId }).sync.post();

            if (error) {
                throw new Error((error as any).value?.message || "Failed to sync balances");
            }

            return (data as any).data as OrganizationBalanceResponse;
        },
        onSuccess: (data, organizationId) => {
            // Invalidate the balances query to refetch fresh data
            queryClient.invalidateQueries({ queryKey: ["organizationBalances", organizationId] });
        },
    });
}
