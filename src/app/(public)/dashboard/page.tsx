"use client";

import { useDashboardStats } from "@/hooks/use-dashboard.hook";
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentFavorites } from "@/components/dashboard/recent-favorites";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { FavoriteCountriesSection } from "@/components/dashboard/favorite-countries-section";

export default function DashboardPage() {
    const { user, stats, favorites, recentFavorites, favoritesLoading } = useDashboardStats();

    return (
        <div className="space-y-8">
            <DashboardWelcome userName={user?.name} />
            <DashboardStats stats={stats} />
            <FavoriteCountriesSection />
            <RecentFavorites
                favorites={recentFavorites}
                isLoading={favoritesLoading}
                totalCount={favorites.length}
            />
            <QuickActions favoritesCount={favorites.length} />
        </div>
    );
}