import { Elysia, t } from "elysia";
import { OrdersController } from "@/server/controllers/orders.controller";
import { betterAuthPlugin } from "@/lib/plugins/better-auth-plugin";
import {
    orderInputSchema,
    orderBatchInputSchema,
    updatePaymentIdSchema,
} from "@/server/models/order.model";

// ============================================
// Orders Service
// ============================================

export const ordersService = new Elysia({ prefix: "/orders" })
    .use(betterAuthPlugin)

    /**
     * GET /orders
     * Get all orders (admin)
     */
    .get(
        "/",
        async ({ query, set }) => {
            try {
                const limit = query.limit ? parseInt(query.limit) : 50;
                const offset = query.offset ? parseInt(query.offset) : 0;
                const status = query.status;

                const orders = await OrdersController.getAll(limit, offset, status);

                return {
                    success: true,
                    data: orders,
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to fetch orders",
                };
            }
        },
        {
            auth: true,
            query: t.Object({
                limit: t.Optional(t.String()),
                offset: t.Optional(t.String()),
                status: t.Optional(t.String()),
            }),
            detail: {
                tags: ["Orders"],
                summary: "Get all orders",
                description: "Get all orders with pagination and filtering (Admin)",
            },
        }
    )

    /**
     * POST /orders
     * Create a single order
     */
    .post(
        "/",
        async ({ body, user, set }) => {
            try {
                const order = await OrdersController.create({
                    userId: user.id,
                    newspaperId: body.newspaperId,
                    price: body.price,
                });

                return {
                    success: true,
                    data: order,
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to create order",
                };
            }
        },
        {
            auth: true,
            body: orderInputSchema,
            detail: {
                tags: ["Orders"],
                summary: "Create a single order",
                description: "Create a new order for the authenticated user",
            },
        }
    )

    /**
     * POST /orders/batch
     * Create multiple orders at once
     */
    .post(
        "/batch",
        async ({ body, user, set }) => {
            try {
                const orders = await OrdersController.createBatch(
                    body.orders.map((order) => ({
                        userId: user.id,
                        newspaperId: order.newspaperId,
                        price: order.price,
                    }))
                );

                return {
                    success: true,
                    data: orders,
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to create orders",
                };
            }
        },
        {
            auth: true,
            body: orderBatchInputSchema,
            detail: {
                tags: ["Orders"],
                summary: "Create multiple orders",
                description: "Create multiple orders at once for the authenticated user",
            },
        }
    )

    /**
     * PUT /orders/payment-id
     * Update orders with payment ID
     */
    .put(
        "/payment-id",
        async ({ body, set }) => {
            try {
                await OrdersController.updatePaymentIdBatch(
                    body.orderIds,
                    body.paymentId
                );

                return {
                    success: true,
                    message: "Payment ID updated for all orders",
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to update payment ID",
                };
            }
        },
        {
            auth: true,
            body: updatePaymentIdSchema,
            detail: {
                tags: ["Orders"],
                summary: "Update orders with payment ID",
                description: "Update multiple orders with the same payment ID after payment initialization",
            },
        }
    )

    /**
     * GET /orders/my
     * Get current user's orders
     */
    .get(
        "/my",
        async ({ user, set }) => {
            try {
                const orders = await OrdersController.getByUserId(user.id);

                return {
                    success: true,
                    data: orders,
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to fetch orders",
                };
            }
        },
        {
            auth: true,
            detail: {
                tags: ["Orders"],
                summary: "Get my orders",
                description: "Get all orders for the authenticated user",
            },
        }
    )

    /**
     * GET /orders/check/:newspaperId
     * Check if user has already purchased a newspaper
     */
    .get(
        "/check/:newspaperId",
        async ({ params, user, set }) => {
            try {
                const hasPurchased = await OrdersController.hasUserPurchased(
                    user.id,
                    params.newspaperId
                );

                return {
                    success: true,
                    data: { hasPurchased },
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to check purchase status",
                };
            }
        },
        {
            auth: true,
            params: t.Object({
                newspaperId: t.String(),
            }),
            detail: {
                tags: ["Orders"],
                summary: "Check purchase status",
                description: "Check if the authenticated user has already purchased a newspaper",
            },
        }
    )

    /**
     * GET /orders/organization/:organizationId/stats
     * Get organization revenue and sales stats
     */
    .get(
        "/organization/:organizationId/stats",
        async ({ params, set }) => {
            try {
                const stats = await OrdersController.getOrganizationStats(params.organizationId);

                return {
                    success: true,
                    data: stats,
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to fetch organization stats",
                };
            }
        },
        {
            auth: true,
            params: t.Object({
                organizationId: t.String(),
            }),
            detail: {
                tags: ["Orders"],
                summary: "Get organization stats",
                description: "Get revenue and recent sales for an organization",
            },
        }
    )

    /**
     * GET /orders/organization/:organizationId/customers
     * Get organization customers with their purchase counts
     */
    .get(
        "/organization/:organizationId/customers",
        async ({ params, set }) => {
            try {
                const customers = await OrdersController.getOrganizationCustomers(params.organizationId);

                return {
                    success: true,
                    data: customers,
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to fetch organization customers",
                };
            }
        },
        {
            auth: true,
            params: t.Object({
                organizationId: t.String(),
            }),
            detail: {
                tags: ["Orders"],
                summary: "Get organization customers",
                description: "Get unique customers who have purchased from this organization with their total purchase count",
            },
        }
    );
