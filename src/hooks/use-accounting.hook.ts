import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { LedgerEntryResponse, AccountingBalances } from "@/app/interfaces/accounting.interface";

/**
 * Hook pour récupérer les soldes comptables d'une organisation
 */
export function useAccountingBalances(organizationId: string | undefined) {
    return useQuery({
        queryKey: ["accountingBalances", organizationId],
        queryFn: async () => {
            if (!organizationId) throw new Error("Organization ID is required");

            const { data, error } = await client.api.v1.accounting.organization({ organizationId }).balances.get();

            if (error) {
                throw new Error((error as any).value?.message || "Failed to fetch balances");
            }

            return (data as any).data as { organizationBalance: number; platformBalance: number };
        },
        enabled: !!organizationId,
    });
}

/**
 * Hook pour récupérer le résumé comptable d'une organisation
 */
export function useAccountingSummary(organizationId: string | undefined) {
    return useQuery({
        queryKey: ["accountingSummary", organizationId],
        queryFn: async () => {
            if (!organizationId) throw new Error("Organization ID is required");

            const { data, error } = await client.api.v1.accounting.organization({ organizationId }).summary.get();

            if (error) {
                throw new Error((error as any).value?.message || "Failed to fetch accounting summary");
            }

            return (data as any).data as AccountingBalances;
        },
        enabled: !!organizationId,
    });
}

/**
 * Hook pour récupérer les entrées du grand livre d'une organisation
 */
export function useAccountingLedger(
    organizationId: string | undefined,
    limit: number = 50,
    offset: number = 0
) {
    return useQuery({
        queryKey: ["accountingLedger", organizationId, limit, offset],
        queryFn: async () => {
            if (!organizationId) throw new Error("Organization ID is required");

            const { data, error } = await client.api.v1.accounting.organization({ organizationId }).ledger.get({
                query: {
                    limit: limit.toString(),
                    offset: offset.toString(),
                },
            });

            if (error) {
                throw new Error((error as any).value?.message || "Failed to fetch ledger entries");
            }

            return (data as any).data as LedgerEntryResponse[];
        },
        enabled: !!organizationId,
    });
}
