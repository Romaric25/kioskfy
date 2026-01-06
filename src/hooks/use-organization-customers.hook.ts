import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export interface OrganizationCustomer {
    id: string | null;
    name: string | null;
    email: string;
    image: string | null;
    purchaseCount: number;
}

export interface OrganizationCustomersResponse {
    totalCustomers: number;
    customers: OrganizationCustomer[];
}

export function useOrganizationCustomers(organizationId: string | undefined) {
    return useQuery({
        queryKey: ["organizationCustomers", organizationId],
        queryFn: async () => {
            if (!organizationId) throw new Error("Organization ID is required");

            const { data, error } = await client.api.v1.orders.organization({ organizationId }).customers.get();

            if (error) {
                throw new Error((error as any).value?.message || "Failed to fetch organization customers");
            }

            return (data as any).data as OrganizationCustomersResponse;
        },
        enabled: !!organizationId,
    });
}
