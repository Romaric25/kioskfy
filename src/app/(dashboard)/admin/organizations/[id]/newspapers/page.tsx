"use client";

import { useAdminOrganization } from "@/hooks/use-organizations.hook";
import { useNewspapersByOrganization } from "@/hooks/use-newspapers.hook";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { columns } from "@/app/(dashboard)/admin/newspapers/columns";
import { useParams } from "next/navigation";

export default function OrganizationNewspapersPage() {
    const params = useParams();
    const id = params?.id as string;


    const { newspapers, newspapersLoading, newspapersError } = useNewspapersByOrganization(id);
    const { organization, isLoadingOrganization } = useAdminOrganization(id);

    console.log(newspapers);
    if (newspapersLoading || isLoadingOrganization) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (newspapersError) {
        return (
            <div className="flex bg-destructive/10 p-4 rounded-md text-destructive">
                Erreur lors du chargement des journaux de l'organisation
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">
                    Journaux de {organization?.name || "l'agence"}
                </h2>
            </div>
            <DataTable
                columns={columns}
                data={(newspapers as any)?.data || []}
                searchKey="issueNumber"
            />
        </div>
    );
}
