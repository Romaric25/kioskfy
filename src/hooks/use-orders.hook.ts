import { client } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    OrderInput,
    OrderResponse,
    OrderWithNewspaperResponse,
    CreateOrderResponse,
    CreateOrderBatchResponse,
    MyOrdersResponse,
    CheckPurchaseResponse,
} from "@/server/models/order.model";

// ============================================
// Hooks
// ============================================

/**
 * Hook for creating a single order
 */
export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: OrderInput) => {
            const { data, error } = await client.api.v1.orders.post(input);

            if (error) {
                throw new Error((error as any).value?.message || "Failed to create order");
            }

            return data as CreateOrderResponse;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myOrders"] });
        },
    });
}

/**
 * Hook for creating multiple orders at once
 */
export function useCreateOrderBatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orders: OrderInput[]) => {
            const { data, error } = await client.api.v1.orders.batch.post({ orders });

            if (error) {
                throw new Error((error as any).value?.message || "Failed to create orders");
            }

            return data as CreateOrderBatchResponse;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myOrders"] });
        },
    });
}

/**
 * Hook for updating orders with payment ID
 */
export function useUpdatePaymentId() {
    return useMutation({
        mutationFn: async ({ orderIds, paymentId }: { orderIds: string[]; paymentId: string }) => {
            const { data, error } = await client.api.v1.orders["payment-id"].put({ orderIds, paymentId });

            if (error) {
                throw new Error((error as any).value?.message || "Failed to update payment ID");
            }

            return data;
        },
    });
}

/**
 * Hook for fetching current user's orders
 */
export function useMyOrders() {
    return useQuery({
        queryKey: ["myOrders"],
        queryFn: async () => {
            const { data, error } = await client.api.v1.orders.my.get();

            if (error) {
                throw new Error((error as any).value?.message || "Failed to fetch orders");
            }

            return data as unknown as MyOrdersResponse;
        },
    });
}

/**
 * Hook for checking if user has purchased a newspaper
 */
export function useCheckPurchase(newspaperId: string, enabled = true) {
    return useQuery({
        queryKey: ["checkPurchase", newspaperId],
        queryFn: async () => {
            const { data, error } = await client.api.v1.orders.check({ newspaperId }).get();

            if (error) {
                throw new Error((error as any).value?.message || "Failed to check purchase status");
            }

            return data as { success: boolean; data: { hasPurchased: boolean } };
        },
        enabled: !!newspaperId && enabled,
    });
}
