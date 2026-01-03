"use client";

import { Users, Building2, TrendingUp, Wallet } from "lucide-react";
import { useAdminStats } from "@/hooks/use-admin-stats.hook";
import { priceFormatter } from "@/lib/price-formatter";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const data = (stats?.data || {}) as any;
  // Fallback values if data is undefined
  const platformRevenue = data.totalPlatformRevenue ?? 0;
  const salesRevenue = data.totalSalesRevenue ?? 0;
  const usersCount = data.totalUsers ?? 0;
  const orgsCount = data.totalOrganizations ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">

      {/* 1. Platform Revenue (Purple Gradient like AccountingStatsCards) */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Revenu Plateforme
          </CardTitle>
          <Wallet className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-1">
            {priceFormatter(platformRevenue)}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400">
            Part de 25% sur les ventes
          </p>
        </CardContent>
      </Card>

      {/* 2. Total Sales Volume (Green Gradient generally associated with revenue) */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
            Volume des Ventes
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800 dark:text-green-200 mb-1">
            {priceFormatter(salesRevenue)}
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">
            Montant total des transactions (GMV)
          </p>
        </CardContent>
      </Card>

      {/* 3. Organizations (Blue Gradient) */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Agences
          </CardTitle>
          <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-1">
            {orgsCount}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Partenaires enregistrés
          </p>
        </CardContent>
      </Card>

      {/* 4. Users (Orange/Amber Gradient) */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
            Utilisateurs
          </CardTitle>
          <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-800 dark:text-orange-200 mb-1">
            {usersCount}
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400">
            Comptes créés au total
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
