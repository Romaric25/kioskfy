"use client";

import { AccountingManagement } from "@/components/labo/accounting-management";
import { useActiveOrganization } from "@/hooks/use-organizations.hook";
import { Skeleton } from "@/components/ui/skeleton";

export default function RevenuePage() {
    const { organisation, isLoading } = useActiveOrganization();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (!organisation?.data?.id) {
        return <div>Aucune organisation active.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Revenus et Comptabilité</h1>
                <p className="text-muted-foreground">
                    Gérez vos revenus et suivez vos retraits.
                </p>
            </div>

            <AccountingManagement organizationId={organisation.data.id} />
        </div>
    )
}