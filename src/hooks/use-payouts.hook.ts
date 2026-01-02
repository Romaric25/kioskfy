import { client } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InitializePayoutInput, PaymentResponse, VerifyTransactionResponse } from "@/app/interfaces/payout.interface";

/**
 * Hook pour initialiser un retrait Moneroo
 */
export function useInitializePayout() {
    return useMutation({
        mutationFn: async (input: InitializePayoutInput) => {
            const { data, error } = await client.api.v1.payouts.initialize.post(input);

            if (error) {
                throw new Error((error as any).value?.message || "Failed to initialize payout");
            }

            return (data as any) as PaymentResponse;
        },
    });
}


/**
 * Hook pour vérifier une transaction Moneroo
 */
export function useVerifyTransaction(transactionId: string | undefined) {
    return useQuery({
        queryKey: ["verifyTransaction", transactionId],
        queryFn: async () => {
            if (!transactionId) throw new Error("Transaction ID is required");

            const { data, error } = await client.api.v1.payouts({ payoutId: transactionId }).verify.get();

            if (error) {
                throw new Error((error as any).value?.message || "Failed to verify transaction");
            }

            return (data as any).data as VerifyTransactionResponse;
        },
        enabled: !!transactionId,
    });
}

/**
 * Hook de mutation pour vérifier une transaction manuellement
 */
export function useVerifyPayoutMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transactionId: string) => {
            const { data, error } = await client.api.v1.payouts({ payoutId: transactionId }).verify.get();

            if (error) {
                throw new Error((error as any).value?.message || "Failed to verify transaction");
            }

            return (data as any).data as VerifyTransactionResponse;
        },
        onSuccess: () => {
            // Invalidate relevant queries to update UI
            queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
            queryClient.invalidateQueries({ queryKey: ["organizationBalances"] });
        }
    });
}
