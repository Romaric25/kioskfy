"use client"

import { useState } from "react"
import { DataTable } from "@/components/admin/data-table"
import { columns } from "./columns"
import { useAdminOrders } from "@/hooks/use-admin-orders.hook"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteBreadcrumb } from "@/components/site-breadcrumb"

export default function AdminOrdersPage() {
    const [statusFilter, setStatusFilter] = useState<string>("completed")

    // Map tab values to API status values
    // "all" -> undefined (fetch all)
    // "completed" -> "completed"
    // "pending" -> "pending"
    // "failed" -> "failed"
    const queryStatus = statusFilter === "all" ? undefined : statusFilter

    const { data: orders = [], isLoading } = useAdminOrders({
        status: queryStatus,
        limit: 100
    })

    return (
        <div className="flex flex-col gap-4">
            <SiteBreadcrumb />
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Commandes</h1>
            </div>

            <Tabs defaultValue="completed" onValueChange={setStatusFilter} className="w-full">
                <TabsList>
                    <TabsTrigger value="completed">Succès</TabsTrigger>
                    <TabsTrigger value="pending">En attente</TabsTrigger>
                    <TabsTrigger value="failed">Échoué</TabsTrigger>
                    <TabsTrigger value="all">Toutes</TabsTrigger>
                </TabsList>

                {/* We use the same generic content structure for all tabs, logic is handled by queryStatus */}
                {["completed", "pending", "failed", "all"].map((tabValue) => (
                    <TabsContent key={tabValue} value={tabValue} className="mt-4">
                        <DataTable
                            columns={columns}
                            data={orders}
                            searchKey="id"
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
