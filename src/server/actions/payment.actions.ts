"use server";

import { db } from "@/lib/db";
import { orders, revenueShares, accountingLedger } from "@/db/app-schema";
import { eq, desc } from "drizzle-orm";

// ============================================
// Constants
// ============================================
const PLATFORM_PERCENTAGE = 25;
const ORGANIZATION_PERCENTAGE = 75;

/**
 * Get the current balances for an organization from the ledger
 */
async function getCurrentBalances(organizationId: string): Promise<{ organizationBalance: number; platformBalance: number }> {
    const lastEntry = await db.query.accountingLedger.findFirst({
        where: eq(accountingLedger.organizationId, organizationId),
        orderBy: [desc(accountingLedger.id)],
    });

    if (!lastEntry) {
        return { organizationBalance: 0, platformBalance: 0 };
    }

    return {
        organizationBalance: Number(lastEntry.organizationBalance),
        platformBalance: Number(lastEntry.platformBalance),
    };
}

/**
 * Record a purchase in the accounting ledger
 */
async function recordPurchaseInLedger(
    organizationId: string,
    orderId: string,
    organizationAmount: number,
    platformAmount: number,
    description: string,
    currency: string
) {
    // Get current balances
    const currentBalances = await getCurrentBalances(organizationId);

    // Calculate new balances
    const newOrganizationBalance = currentBalances.organizationBalance + organizationAmount;
    const newPlatformBalance = currentBalances.platformBalance + platformAmount;

    // Insert new entry
    await db.insert(accountingLedger).values({
        organizationId,
        transactionType: "purchase",
        referenceId: orderId,
        organizationAmount: organizationAmount.toFixed(2),
        platformAmount: platformAmount.toFixed(2),
        organizationBalance: newOrganizationBalance.toFixed(2),
        platformBalance: newPlatformBalance.toFixed(2),
        description,
        currency,
    });

    console.log(`[Accounting Ledger] Entry created for order ${orderId}:`, {
        organizationId,
        organizationAmount,
        platformAmount,
        newOrganizationBalance,
        newPlatformBalance,
    });
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

        // Create revenue share records and accounting ledger entries for each order
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

            // Record in accounting ledger
            await recordPurchaseInLedger(
                order.newspaper.organizationId,
                order.id,
                organizationAmount,
                platformAmount,
                `Vente journal #${order.newspaper?.issueNumber || order.newspaperId}`,
                currency
            );

            return order.id;
        });

        const processedOrders = await Promise.all(revenueSharePromises);
        const successfulShares = processedOrders.filter((id) => id !== null);

        console.log(`[Payment Success] Revenue shares and ledger entries created: ${successfulShares.length}/${foundOrders.length}`);

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

