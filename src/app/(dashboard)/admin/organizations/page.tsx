"use client";

import { DataTable } from "@/components/admin/data-table";
import { columns } from "./columns";
import { useAdminOrganizations } from "@/hooks/use-organizations.hook";
import { Loader2 } from "lucide-react";

export default function OrganizationsPage() {
    const { organizations, isLoadingOrganizations, errorOrganizations } = useAdminOrganizations();

    if (isLoadingOrganizations) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (errorOrganizations) {
        return (
            <div className="flex bg-destructive/10 p-4 rounded-md text-destructive">
                Erreur lors du chargement des organisations
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Organisations</h2>
            </div>
            <DataTable
                columns={columns}
                data={organizations as any}
                searchKey="name"
            />
        </div>
    );
}
