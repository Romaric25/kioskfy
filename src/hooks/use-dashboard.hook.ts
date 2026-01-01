"use client";

import { Heart, ShoppingBag, Newspaper, TrendingUp, LucideIcon } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites.hook";
import { useAuth } from "@/hooks/use-auth.hook";

import { useMyOrders } from "@/hooks/use-orders.hook";
import { priceFormatter } from "@/lib/price-formatter";

export interface DashboardStat {
    title: string;
    value: string | number;
    description: string;
    icon: LucideIcon;
    trend: string;
    trendUp: boolean | null;
    href?: string;
}

export function useDashboardStats() {
    const { user } = useAuth();
    const { favorites, favoritesLoading, favoritesError } = useFavorites();
    const { data: myOrders, isLoading: ordersLoading } = useMyOrders();

    // Get first 4 favorites for preview
    const recentFavorites = favorites.slice(0, 4);

    const orders = myOrders?.data || [];
    const totalPurchases = orders.length;

    // Calculate total spent
    const totalSpent = orders.reduce((acc, order) => {
        const price = parseFloat(order.price) || 0;
        return acc + price;
    }, 0);

    const stats: DashboardStat[] = [
        {
            title: "Total Favoris",
            value: favoritesLoading ? "..." : favorites.length,
            description: "journaux sauvegardés",
            icon: Heart,
            trend: "+2 ce mois",
            trendUp: true,
            href: "/dashboard/favoris"
        },
        {
            title: "Achats",
            value: ordersLoading ? "..." : totalPurchases,
            description: "commandes passées",
            icon: ShoppingBag,
            trend: totalPurchases > 0 ? "Achats récents" : "Aucun achat",
            trendUp: totalPurchases > 0,
            href: "/dashboard/achats"
        },
        {
            title: "Journaux lus",
            value: ordersLoading ? "..." : totalPurchases,
            description: "dans votre bibliothèque",
            icon: Newspaper,
            trend: "Bibliothèque",
            trendUp: true,
            href: "/dashboard/achats"
        },
        {
            title: "Dépenses",
            value: ordersLoading ? "..." : priceFormatter(totalSpent),
            description: "total dépensé",
            icon: TrendingUp,
            trend: "Total",
            trendUp: true,
            href: "/dashboard/achats"
        },
    ];

    return {
        user,
        stats,
        favorites,
        recentFavorites,
        favoritesLoading,
        ordersLoading, // Added loading state
        favoritesError,
    };
}
