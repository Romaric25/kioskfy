"use server";

import { db } from "@/lib/db";
import { orders, revenueShares, organizationBalances } from "@/db/app-schema";
import { eq, sql } from "drizzle-orm";

// ============================================
// Constants
// ============================================
const PLATFORM_PERCENTAGE = 25;
const ORGANIZATION_PERCENTAGE = 75;

/**
 * Update organization balances after a purchase
 */
async function updateBalancesAfterPurchase(
    organizationId: string,
    organizationAmount: number,
    platformAmount: number,
    currency: string
) {
    // Try to update existing balance
    const result = await db
        .update(organizationBalances)
        .set({
            organizationAmount: sql`${organizationBalances.organizationAmount} + ${organizationAmount.toFixed(2)}`,
            platformAmount: sql`${organizationBalances.platformAmount} + ${platformAmount.toFixed(2)}`,
            totalSales: sql`${organizationBalances.totalSales} + 1`,
        })
        .where(eq(organizationBalances.organizationId, organizationId));

    // If no rows updated, create a new balance record
    if (result[0].affectedRows === 0) {
        await db.insert(organizationBalances).values({
            organizationId,
            organizationAmount: organizationAmount.toFixed(2),
            platformAmount: platformAmount.toFixed(2),
            totalSales: 1,
            totalWithdrawals: 0,
            withdrawnAmount: "0.00",
            currency,
        });
    }

    console.log(`[Accounting] Balance updated for org ${organizationId}: +${organizationAmount} (org), +${platformAmount} (platform)`);
}

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

        // Create revenue share records and update balances for each order
        const revenueSharePromises = foundOrders.map(async (order) => {
            if (!order.newspaper?.organizationId) {
                console.warn(`[Payment Success] No organization found for order ${order.id}, skipping revenue share`);
                return null;
            }

            const totalAmount = parseFloat(order.price);
            const platformAmount = (totalAmount * PLATFORM_PERCENTAGE) / 100;
            const organizationAmount = (totalAmount * ORGANIZATION_PERCENTAGE) / 100;
            const currency = order.newspaper?.country?.currency || "XAF";

            // Create revenue share
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

            // Update organization balances
            await updateBalancesAfterPurchase(
                order.newspaper.organizationId,
                organizationAmount,
                platformAmount,
                currency
            );

            return order.id;
        });

        const processedOrders = await Promise.all(revenueSharePromises);
        const successfulShares = processedOrders.filter((id) => id !== null);

        console.log(`[Payment Success] Revenue shares and balances updated: ${successfulShares.length}/${foundOrders.length}`);

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
