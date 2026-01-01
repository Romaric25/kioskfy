import { client } from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WithdrawalResponse, CreateWithdrawalInput } from "@/app/interfaces/withdrawal.interface";

/**
 * Hook pour récupérer les retraits d'une organisation
 */
export function useWithdrawals(organizationId: string | undefined, limit: number = 50) {
    return useQuery({
        queryKey: ["withdrawals", organizationId, limit],
        queryFn: async () => {
            if (!organizationId) throw new Error("Organization ID is required");

            const { data, error } = await client.api.v1.withdrawals.organization({ organizationId }).get({
                query: {
                    limit: limit.toString(),
                },
            });

            if (error) {
                throw new Error((error as any).value?.message || "Failed to fetch withdrawals");
            }

            return (data as any).data as WithdrawalResponse[];
        },
        enabled: !!organizationId,
    });
}

/**
 * Hook pour créer une demande de retrait
 */
export function useCreateWithdrawal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateWithdrawalInput) => {
            const { data, error } = await client.api.v1.withdrawals.post(input);

            if (error) {
                throw new Error((error as any).value?.message || "Failed to create withdrawal");
            }

            return (data as any).data as WithdrawalResponse;
        },
        onSuccess: (data) => {
            // Invalidate withdrawals and balances queries
            queryClient.invalidateQueries({ queryKey: ["withdrawals", data.organizationId] });
            queryClient.invalidateQueries({ queryKey: ["organizationBalances", data.organizationId] });
            queryClient.invalidateQueries({ queryKey: ["organizationStats", data.organizationId] });
        },
    });
}

/**
 * Hook pour annuler un retrait
 */
export function useCancelWithdrawal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, reason }: { id: number; reason?: string }) => {
            const { data, error } = await client.api.v1.withdrawals({ id: id.toString() }).delete({
                reason,
            });

            if (error) {
                throw new Error((error as any).value?.message || "Failed to cancel withdrawal");
            }

            return (data as any).data as WithdrawalResponse;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["withdrawals", data.organizationId] });
        },
    });
}
