"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OverviewCards } from "./overview-cards";
import { RecentSales } from "./recent-sales";
import { useActiveOrganization, useOrganization } from "@/hooks/use-organizations.hook";

import { OrganizationHomeSkeleton } from "./skeleton/organization-home-skeleton";

export const OrganizationHome = () => {
  const { organisation, isLoading: isLoadingOrganization } = useActiveOrganization();
  if (isLoadingOrganization) {
    return <OrganizationHomeSkeleton />;
  }

  return (
    <>
      {organisation?.data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Agence {organisation?.data?.name}
            </h2>
            <div className="flex items-center space-x-2">
              <Button>Télécharger le rapport</Button>
            </div>
          </div>
          <OverviewCards />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Aperçu des revenus</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[350px] flex items-center justify-center text-muted-foreground bg-muted/10 rounded-md border border-dashed">
                  Graphique des revenus
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Ventes récentes</CardTitle>
                <CardDescription>Vous avez réalisé 265 ventes ce mois-ci.</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
