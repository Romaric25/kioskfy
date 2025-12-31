"use server";

import { db } from "@/lib/db";
import { orders, revenueShares } from "@/db/app-schema";
import { eq } from "drizzle-orm";

// ============================================
// Constants
// ============================================
const PLATFORM_PERCENTAGE = 25;
const ORGANIZATION_PERCENTAGE = 75;

export async function handlePaymentSuccess(paymentId: string) {
    if (!paymentId) {
        return {
            success: false,
            message: "Payment ID is required",
        };
    }

    try {
        // Find ALL orders with this payment ID (multiple orders possible)
        const foundOrders = await db.query.orders.findMany({
            where: eq(orders.paymentId, paymentId),
            with: {
                newspaper: {
                    with: {
                        organization: true,
                        country: true,
                    },
                },
            },
        });

        if (!foundOrders || foundOrders.length === 0) {
            console.warn(`[Payment Success] No orders found for payment: ${paymentId}`);
            return {
                success: false,
                message: `No orders found for payment ${paymentId}`,
            };
        }

        console.log(`[Payment Success] Found ${foundOrders.length} order(s) for payment ${paymentId}`);

        // Update ALL orders status to completed
        const orderIds = foundOrders.map((order) => order.id);
        await db
            .update(orders)
            .set({
                status: "completed",
                updatedAt: new Date(),
            })
            .where(eq(orders.paymentId, paymentId));

        console.log(`[Payment Success] ${orderIds.length} order(s) marked as completed:`, orderIds);

        // Create revenue share records for each order
        const revenueSharePromises = foundOrders.map(async (order) => {
            if (!order.newspaper?.organizationId) {
                console.warn(`[Payment Success] No organization found for order ${order.id}, skipping revenue share`);
                return null;
            }

            const totalAmount = parseFloat(order.price);
            const platformAmount = (totalAmount * PLATFORM_PERCENTAGE) / 100;
            const organizationAmount = (totalAmount * ORGANIZATION_PERCENTAGE) / 100;
            const currency = order.newspaper?.country?.currency || "XAF";

            await db.insert(revenueShares).values({
                orderId: order.id,
                organizationId: order.newspaper.organizationId,
                totalAmount: totalAmount.toFixed(2),
                platformAmount: platformAmount.toFixed(2),
                organizationAmount: organizationAmount.toFixed(2),
                platformPercentage: PLATFORM_PERCENTAGE.toFixed(2),
                organizationPercentage: ORGANIZATION_PERCENTAGE.toFixed(2),
                currency,
                status: "processed",
                processedAt: new Date(),
            });

            console.log(`[Payment Success] Revenue share created for order ${order.id}:`, {
                organizationId: order.newspaper.organizationId,
                organizationName: order.newspaper.organization?.name,
                total: totalAmount,
                platform: platformAmount,
                organization: organizationAmount,
                currency,
            });

            return order.id;
        });

        const processedOrders = await Promise.all(revenueSharePromises);
        const successfulShares = processedOrders.filter((id) => id !== null);

        console.log(`[Payment Success] Revenue shares created: ${successfulShares.length}/${foundOrders.length}`);

        return {
            success: true,
            message: `Payment success processed for ${foundOrders.length} order(s)`,
            orderId: orderIds.join(","),
        };
    } catch (error) {
        console.error("[Payment Success] Error handling payment success:", error);
        return {
            success: false,
            message: "Error processing payment success",
        };
    }
}
