import { db } from "@/lib/db";
import { orders, revenueShares, newspapers } from "@/db/app-schema";
import { users } from "@/db/auth-schema";
import { eq, and, sum, count, ne, desc } from "drizzle-orm";

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

export interface OrderWithNewspaperResponse extends OrderResponse {
    newspaper: {
        id: string;
        issueNumber: string;
        coverImage: string;
        price: string;
        publishDate: Date;
        organization: {
            id: string;
            name: string;
            logo: string | null;
        } | null;
    } | null;
    user?: {
        name: string | null;
        email: string;
        image: string | null;
    } | null;
}

// ============================================
// Orders Controller
// ============================================

export class OrdersController {
    /**
     * Get all orders (admin)
     */
    static async getAll(
        limit: number = 50,
        offset: number = 0,
        status?: string
    ): Promise<OrderWithNewspaperResponse[]> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereClause = status ? eq(orders.status, status as any) : undefined;

        const results = await db.query.orders.findMany({
            where: whereClause,
            orderBy: [desc(orders.createdAt)],
            limit,
            offset,
            with: {
                newspaper: {
                    with: {
                        organization: true,
                    },
                },
                user: true,
            },
        });

        return results.map((order) => ({
            id: order.id,
            userId: order.userId,
            newspaperId: order.newspaperId,
            price: order.price,
            status: order.status,
            paymentId: order.paymentId,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            user: order.user ? {
                name: order.user.name,
                email: order.user.email,
                image: order.user.image,
            } : null,
            newspaper: order.newspaper ? {
                id: order.newspaper.id,
                issueNumber: order.newspaper.issueNumber,
                coverImage: order.newspaper.coverImage,
                price: order.newspaper.price,
                publishDate: order.newspaper.publishDate,
                organization: order.newspaper.organization ? {
                    id: order.newspaper.organization.id,
                    name: order.newspaper.organization.name,
                    logo: order.newspaper.organization.logo,
                } : null,
            } : null,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })) as unknown as OrderWithNewspaperResponse[];
    }

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
     * Get orders by user ID with newspaper details
     */
    static async getByUserId(userId: string): Promise<OrderWithNewspaperResponse[]> {
        const userOrders = await db.query.orders.findMany({
            where: and(
                eq(orders.userId, userId),
                eq(orders.status, "completed")
            ),
            orderBy: (orders, { desc }) => [desc(orders.createdAt)],
            with: {
                newspaper: {
                    with: {
                        organization: true,
                    },
                },
            },
        });

        return userOrders.map((order) => ({
            id: order.id,
            userId: order.userId,
            newspaperId: order.newspaperId,
            price: order.price,
            status: order.status,
            paymentId: order.paymentId,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            newspaper: order.newspaper ? {
                id: order.newspaper.id,
                issueNumber: order.newspaper.issueNumber,
                coverImage: order.newspaper.coverImage,
                price: order.newspaper.price,
                publishDate: order.newspaper.publishDate,
                organization: order.newspaper.organization ? {
                    id: order.newspaper.organization.id,
                    name: order.newspaper.organization.name,
                    logo: order.newspaper.organization.logo,
                } : null,
            } : null,
        })) as OrderWithNewspaperResponse[];
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

    /**
     * Get organization stats (revenue, sales count, recent sales)
     */
    static async getOrganizationStats(organizationId: string) {
        // 1. Get aggregated stats (total revenue, count)
        const stats = await db
            .select({
                totalRevenue: sum(revenueShares.organizationAmount),
                salesCount: count(revenueShares.id),
            })
            .from(revenueShares)
            .where(
                and(
                    eq(revenueShares.organizationId, organizationId),
                    ne(revenueShares.status, "cancelled")
                )
            );

        const totalRevenue = stats[0]?.totalRevenue || "0";
        const salesCount = stats[0]?.salesCount || 0;

        // 2. Get recent sales with details
        const recentSales = await db.query.revenueShares.findMany({
            where: and(
                eq(revenueShares.organizationId, organizationId),
                ne(revenueShares.status, "cancelled")
            ),
            orderBy: (revenueShares, { desc }) => [desc(revenueShares.createdAt)],
            limit: 5,
            with: {
                order: {
                    with: {
                        user: {
                            columns: {
                                name: true,
                                email: true,
                                image: true,
                            }
                        },
                        newspaper: {
                            columns: {
                                issueNumber: true,
                                coverImage: true,
                            }
                        }
                    }
                }
            }
        });

        // 3. Count published newspapers
        const newspapersStats = await db
            .select({ count: count(newspapers.id) })
            .from(newspapers)
            .where(
                and(
                    eq(newspapers.organizationId, organizationId),
                    eq(newspapers.status, "published")
                )
            );

        // 5. Accounting stats
        const accountingStats = await db
            .select({
                status: revenueShares.status,
                total: sum(revenueShares.organizationAmount),
            })
            .from(revenueShares)
            .where(
                and(
                    eq(revenueShares.organizationId, organizationId),
                    ne(revenueShares.status, "cancelled")
                )
            )
            .groupBy(revenueShares.status);

        let availableBalance = 0;
        let withdrawnAmount = 0;

        accountingStats.forEach(stat => {
            if (stat.status === 'paid_out') {
                withdrawnAmount += Number(stat.total);
            } else {
                availableBalance += Number(stat.total);
            }
        });

        // 6. Payouts history
        const payouts = await db
            .select({
                date: revenueShares.paidOutAt,
                amount: sum(revenueShares.organizationAmount),
                count: count(revenueShares.id)
            })
            .from(revenueShares)
            .where(
                and(
                    eq(revenueShares.organizationId, organizationId),
                    eq(revenueShares.status, "paid_out")
                )
            )
            .groupBy(revenueShares.paidOutAt)
            .orderBy(desc(revenueShares.paidOutAt));

        return {
            totalRevenue: Number(totalRevenue),
            salesCount: Number(salesCount),
            publishedNewspapersCount: Number(newspapersStats[0]?.count || 0),
            availableBalance: Number(availableBalance),
            withdrawnAmount: Number(withdrawnAmount),
            payouts: payouts.map(p => ({
                date: p.date,
                amount: Number(p.amount),
                count: Number(p.count)
            })),
            recentSales: recentSales.map(sale => ({
                id: sale.id,
                amount: Number(sale.organizationAmount),
                user: sale.order.user,
                newspaper: sale.order.newspaper,
                createdAt: sale.createdAt,
            }))
        };
    }
}
