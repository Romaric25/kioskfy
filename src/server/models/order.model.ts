import { z } from "zod";
import { t } from "elysia";

// ============================================
// Zod Schemas (for validation)
// ============================================

export const orderSchema = z.object({
    id: z.uuid(),
    userId: z.string().nullable(),
    newspaperId: z.string(),
    price: z.string(),
    status: z.enum(["pending", "completed", "failed", "refunded"]),
    paymentId: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Order = z.infer<typeof orderSchema>;

export const createOrderSchema = z.object({
    newspaperId: z.string().min(1, "L'ID du journal est requis"),
    price: z.number().positive("Le prix doit être positif"),
});

export type CreateOrder = z.infer<typeof createOrderSchema>;

export const createOrderBatchSchema = z.object({
    orders: z.array(createOrderSchema),
});

export type CreateOrderBatch = z.infer<typeof createOrderBatchSchema>;

// ============================================
// Input Types (for hooks)
// ============================================

export interface OrderInput {
    newspaperId: string;
    price: number;
}

// ============================================
// Response Types (for API responses)
// ============================================

export interface OrderResponse {
    id: string;
    userId: string | null;
    newspaperId: string;
    price: string;
    status: string;
    paymentId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderResponse {
    success: boolean;
    data?: OrderResponse;
    message?: string;
}

export interface CreateOrderBatchResponse {
    success: boolean;
    data?: OrderResponse[];
    message?: string;
}

export interface UpdatePaymentIdResponse {
    success: boolean;
    message?: string;
}

export interface MyOrdersResponse {
    success: boolean;
    data: OrderResponse[];
}

export interface CheckPurchaseResponse {
    success: boolean;
    data: { hasPurchased: boolean };
}

// ============================================
// Elysia Schemas (for API validation)
// ============================================

export const orderInputSchema = t.Object({
    newspaperId: t.String(),
    price: t.Number(),
});

export const orderBatchInputSchema = t.Object({
    orders: t.Array(
        t.Object({
            newspaperId: t.String(),
            price: t.Number(),
        })
    ),
});

export const updatePaymentIdSchema = t.Object({
    orderIds: t.Array(t.String()),
    paymentId: t.String(),
});
