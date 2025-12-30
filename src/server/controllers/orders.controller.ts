import { db } from "@/lib/db";
import { orders } from "@/db/app-schema";
import { eq, and } from "drizzle-orm";

// ============================================
// Types
// ============================================

export interface CreateOrderInput {
    userId: string;
    newspaperId: string;
    price: number;
    paymentId?: string;
}

export interface OrderResponse {
    id: string;
    userId: string | null;
    newspaperId: string;
    price: string;
    status: string;
    paymentId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// Orders Controller
// ============================================

export class OrdersController {
    /**
     * Create a new order
     */
    static async create(input: CreateOrderInput): Promise<OrderResponse> {
        const id = crypto.randomUUID();

        await db.insert(orders).values({
            id,
            userId: input.userId,
            newspaperId: input.newspaperId,
            price: input.price.toFixed(2),
            status: "pending",
            paymentId: input.paymentId || null,
        });

        const order = await db.query.orders.findFirst({
            where: eq(orders.id, id),
        });

        if (!order) {
            throw new Error("Failed to create order");
        }

        return order as OrderResponse;
    }

    /**
     * Create multiple orders at once (batch)
     */
    static async createBatch(
        inputs: CreateOrderInput[]
    ): Promise<OrderResponse[]> {
        const createdOrders: OrderResponse[] = [];

        for (const input of inputs) {
            const order = await this.create(input);
            createdOrders.push(order);
        }

        return createdOrders;
    }

    /**
     * Update order with payment ID
     */
    static async updatePaymentId(
        orderId: string,
        paymentId: string
    ): Promise<OrderResponse | null> {
        await db
            .update(orders)
            .set({
                paymentId,
                updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId));

        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
        });

        return order as OrderResponse | null;
    }

    /**
     * Update multiple orders with the same payment ID
     */
    static async updatePaymentIdBatch(
        orderIds: string[],
        paymentId: string
    ): Promise<void> {
        for (const orderId of orderIds) {
            await this.updatePaymentId(orderId, paymentId);
        }
    }

    /**
     * Get order by ID
     */
    static async getById(id: string): Promise<OrderResponse | null> {
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, id),
        });

        return order as OrderResponse | null;
    }

    /**
     * Get orders by user ID
     */
    static async getByUserId(userId: string): Promise<OrderResponse[]> {
        const userOrders = await db.query.orders.findMany({
            where: eq(orders.userId, userId),
            orderBy: (orders, { desc }) => [desc(orders.createdAt)],
        });

        return userOrders as OrderResponse[];
    }

    /**
     * Get orders by payment ID
     */
    static async getByPaymentId(paymentId: string): Promise<OrderResponse[]> {
        const paymentOrders = await db.query.orders.findMany({
            where: eq(orders.paymentId, paymentId),
        });

        return paymentOrders as OrderResponse[];
    }

    /**
     * Check if user already purchased a newspaper
     */
    static async hasUserPurchased(
        userId: string,
        newspaperId: string
    ): Promise<boolean> {
        const existingOrder = await db.query.orders.findFirst({
            where: and(
                eq(orders.userId, userId),
                eq(orders.newspaperId, newspaperId),
                eq(orders.status, "completed")
            ),
        });

        return !!existingOrder;
    }
}
