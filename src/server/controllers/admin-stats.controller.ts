import { db } from "@/lib/db";
import { orders, revenueShares } from "@/db/app-schema";
import { users, organizations } from "@/db/auth-schema";
import { sql, count } from "drizzle-orm";

export interface AdminDashboardStats {
    totalPlatformRevenue: number;
    totalSalesRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalOrganizations: number;
    activeUsersCount: number;
    growthRate: number;
}

export class AdminStatsController {
    static async getDashboardStats(): Promise<AdminDashboardStats> {
        // 1. Total Platform Revenue (somme des parts plateforme validées)
        const platformRevenueResult = await db
            .select({
                value: sql<string>`sum(${revenueShares.platformAmount})`,
            })
            .from(revenueShares)
            .where(sql`${revenueShares.status} != 'cancelled'`); // Exclude cancelled

        const totalPlatformRevenue = Number(platformRevenueResult[0]?.value || 0);

        // 2. Total Sales Revenue (somme des montants totaux validés)
        const totalSalesResult = await db
            .select({
                value: sql<string>`sum(${revenueShares.totalAmount})`,
            })
            .from(revenueShares)
            .where(sql`${revenueShares.status} != 'cancelled'`);

        const totalSalesRevenue = Number(totalSalesResult[0]?.value || 0);

        // 3. Counts
        const ordersCount = await db
            .select({ count: count() })
            .from(orders);

        const usersCount = await db
            .select({ count: count() })
            .from(users);

        const orgsCount = await db
            .select({ count: count() })
            .from(organizations);

        return {
            totalPlatformRevenue,
            totalSalesRevenue,
            totalOrders: ordersCount[0].count,
            totalUsers: usersCount[0].count,
            totalOrganizations: orgsCount[0].count,
            activeUsersCount: usersCount[0].count, // Simplification pour l'instant
            growthRate: 4.5, // Placeholder
        };
    }
}
