import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Newspaper, Users, Activity } from "lucide-react";
import { useOrganizationStats } from "@/hooks/use-organization-stats.hook";
import { priceFormatter } from "@/lib/price-formatter";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewspapersByOrganization } from "@/hooks";

interface OverviewCardsProps {
  organizationId: string;
}

export const OverviewCards = ({ organizationId }: OverviewCardsProps) => {
  const { data: stats, isLoading } = useOrganizationStats(organizationId);
  const { newspapers } = useNewspapersByOrganization(organizationId);

  const publishedNewspapersCount = newspapers?.data?.filter(newspaper => newspaper.status === "published").length || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Revenu total
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mb-1" />
          ) : (
            <div className="text-2xl font-bold">{priceFormatter(stats?.totalRevenue || 0)}</div>
          )}
          <p className="text-xs text-muted-foreground">Revenu total généré</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Journaux actifs
          </CardTitle>
          <Newspaper className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-12 mb-1" />
          ) : (
            <div className="text-2xl font-bold">{publishedNewspapersCount}</div>
          )}
          <p className="text-xs text-muted-foreground">Journaux actuellement publiés</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventes</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-12 mb-1" />
          ) : (
            <div className="text-2xl font-bold">{stats?.salesCount || 0}</div>
          )}
          <p className="text-xs text-muted-foreground">Nombre total de ventes</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Abonnés actifs
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+2350</div>
          <p className="text-xs text-muted-foreground">+180 nouveaux abonnés</p>
        </CardContent>
      </Card>
    </div>
  );
}
