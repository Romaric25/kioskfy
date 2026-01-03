import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { AdminOrderResponse } from "@/app/interfaces/order.interface";

export function useAdminOrders(params: {
    limit?: number;
    offset?: number;
    status?: string;
} = {}) {
    return useQuery<AdminOrderResponse[]>({
        queryKey: ["admin-orders", params],
        queryFn: async () => {
            const response = await client.api.v1.orders.get({
                query: {
                    limit: params.limit?.toString(),
                    offset: params.offset?.toString(),
                    status: params.status,
                }
            });

            if (response.error) {
                throw response.error;
            }

            let responseData = response.data;

            // Handle SuperJSON format if present
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (responseData && typeof responseData === 'object' && 'json' in responseData) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                responseData = (responseData as any).json;
            }

            if (!responseData || typeof responseData !== 'object' || !('data' in responseData)) {
                throw new Error("Invalid response format");
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (responseData as any).data as AdminOrderResponse[];
        },
    });
}
