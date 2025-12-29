"use client";

import { Heart, ShoppingBag, Newspaper, TrendingUp, LucideIcon } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites.hook";
import { useAuth } from "@/hooks/use-auth.hook";

export interface DashboardStat {
    title: string;
    value: string | number;
    description: string;
    icon: LucideIcon;
    trend: string;
    trendUp: boolean | null;
}

export function useDashboardStats() {
    const { user } = useAuth();
    const { favorites, favoritesLoading, favoritesError } = useFavorites();

    // Get first 4 favorites for preview
    const recentFavorites = favorites.slice(0, 4);

    const stats: DashboardStat[] = [
        {
            title: "Total Favoris",
            value: favorites.length,
            description: "journaux sauvegardés",
            icon: Heart,
            trend: "+2 ce mois",
            trendUp: true,
        },
        {
            title: "Achats",
            value: 0,
            description: "journaux achetés",
            icon: ShoppingBag,
            trend: "Aucun achat",
            trendUp: null,
        },
        {
            title: "Journaux lus",
            value: 0,
            description: "ce mois-ci",
            icon: Newspaper,
            trend: "Commencez à lire",
            trendUp: null,
        },
        {
            title: "Dépenses",
            value: "0 €",
            description: "ce mois-ci",
            icon: TrendingUp,
            trend: "Économies",
            trendUp: true,
        },
    ];

    return {
        user,
        stats,
        favorites,
        recentFavorites,
        favoritesLoading,
        favoritesError,
    };
}
