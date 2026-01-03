import { Elysia } from "elysia";
import { AdminStatsController } from "@/server/controllers/admin-stats.controller";
import { betterAuthPlugin } from "@/lib/plugins/better-auth-plugin";

export const adminStatsService = new Elysia({ prefix: "/admin/stats" })
    .use(betterAuthPlugin)
    .get(
        "/",
        async ({ set }) => {
            try {
                const stats = await AdminStatsController.getDashboardStats();
                return {
                    success: true,
                    data: stats,
                };
            } catch (error: any) {
                set.status = 500;
                return {
                    success: false,
                    message: error.message || "Failed to fetch admin stats",
                };
            }
        },
        {
            auth: true, // Requires authentication
            detail: {
                tags: ["Admin"],
                summary: "Get admin dashboard stats",
                description: "Aggregated stats for the admin dashboard",
            },
        }
    );
