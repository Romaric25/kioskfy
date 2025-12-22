"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, MapPin, Phone, Loader2 } from "lucide-react";
import { OrganizationForm } from "./organization-form";
import { useOrganizations } from "@/hooks/use-organizations.hook";
import { formatDate } from "@/lib/helpers";
import Image from "next/image";
import type { Organization } from "@/server/models/organization.model";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelectedOrganizationStore } from "@/stores/use-selected-organization.store";
import { OrganizationsListSkeleton } from "./skeleton/organizations-list-skeleton";
import { fr } from "date-fns/locale";

export function OrganizationsList() {
  const dateLocale = fr;
  const { organizations, isLoadingOrganizations } = useOrganizations();
  console.log("organizations", organizations);
  const router = useRouter();
  const { setSelectedOrganization, selectedOrganizationId } =
    useSelectedOrganizationStore();
  const [isLoadingSelection, setIsLoadingSelection] = useState<string | null>(
    null
  );

  const selectedOrganization = async (slug: string, id: string) => {
    setIsLoadingSelection(id);
    try {
      const org = await authClient.organization.setActive({
        organizationId: id,
      });

      // Store in Zustand store for persistence
      setSelectedOrganization(id, slug);

      router.push(`/organization/dashboard/overview`);
    } catch (error) {
      console.error("Error selecting organization:", error);
    } finally {
      setIsLoadingSelection(null);
    }
  };


  if (isLoadingOrganizations) {
    return <OrganizationsListSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Mes agences</h2>
        <OrganizationForm />
      </div>

      {organizations?.data?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Aucune agence</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Vous n'avez pas encore créé d'agence. Créez-en une pour commencer.
            </p>
            <OrganizationForm />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations?.data?.map((organization: Partial<Organization>, index: number) => {
            // Skip organizations without id
            if (!organization?.id) return null;
            // Parse metadata if it's a string
            return (
              <Card
                key={organization.id}
                className={`overflow-hidden hover:shadow-lg transition-shadow ${selectedOrganizationId === organization.id
                  ? "ring-2 ring-primary border-primary"
                  : ""
                  }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {organization?.logo ? (
                      <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border bg-muted">
                        <Image
                          src={organization?.logo!}
                          alt={organization?.name || "Organization"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {organization?.name}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {organization?.slug}
                      </CardDescription>
                      <p className="text-xs text-muted-foreground mt-1">
                        Créée le {organization?.createdAt ? formatDate(organization.createdAt, dateLocale) : "-"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 text-sm pt-0">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{organization?.country}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{organization?.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{organization?.phone}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  <Button
                    onClick={() =>
                      selectedOrganization(organization?.slug!, organization?.id!)
                    }
                    variant={
                      selectedOrganizationId === organization?.id
                        ? "default"
                        : "outline"
                    }
                    className="w-full"
                    disabled={isLoadingSelection === organization?.id}
                  >
                    {isLoadingSelection === organization?.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Chargement...
                      </>
                    ) : selectedOrganizationId === organization?.id ? (
                      "Agence active"
                    ) : (
                      "Choisir cette agence"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
