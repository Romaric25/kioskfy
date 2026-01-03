"use client";

import { DataTable } from "@/components/admin/data-table";
import { columns } from "./columns";
import { useAllNewspapers } from "@/hooks/use-newspapers.hook";
import { Loader2 } from "lucide-react";

export default function NewspapersPage() {
    const { newspapers, newspapersLoading, newspapersError } = useAllNewspapers();

    if (newspapersLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (newspapersError) {
        return (
            <div className="flex bg-destructive/10 p-4 rounded-md text-destructive">
                Erreur lors du chargement des journaux
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Journaux</h2>
            </div>
            <DataTable
                columns={columns}
                data={newspapers as any || []}
                searchKey="issueNumber"
            />
        </div>
    );
}
