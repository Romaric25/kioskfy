import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { useOrganizationStats } from "@/hooks/use-organization-stats.hook";
import { priceFormatter } from "@/lib/price-formatter";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentSalesProps {
    organizationId: string;
}

export function RecentSales({ organizationId }: RecentSalesProps) {
    const { data: stats, isLoading } = useOrganizationStats(organizationId);

    if (isLoading) {
        return (
            <div className="space-y-8">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div className="flex items-center" key={i}>
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="ml-4 space-y-1">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-4 w-[100px]" />
                        </div>
                        <div className="ml-auto">
                            <Skeleton className="h-4 w-[60px]" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (!stats?.recentSales || stats.recentSales.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Aucune vente récente
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {stats.recentSales.map((sale) => (
                <div className="flex items-center" key={sale.id}>
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={sale.user?.image || ""} alt="Avatar" />
                        <AvatarFallback>
                            {sale.user?.name ? sale.user.name.substring(0, 2).toUpperCase() : "??"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {sale.user?.name || "Utilisateur inconnu"}
                        </p>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                                {sale.user?.email || "Email inconnu"}
                            </p>
                            {sale.newspaper && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted">
                                    {sale.newspaper.issueNumber}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="ml-auto font-medium">
                        +{priceFormatter(sale.amount)}
                    </div>
                </div>
            ))}
        </div>
    )
}
