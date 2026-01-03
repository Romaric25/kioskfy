"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { DataTable } from "@/components/admin/data-table"; // Using our admin data-table
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Dummy data for the example, eventually we will fetch this
const dummyData = [
    {
        id: "728ed52f",
        amount: 100,
        status: "pending",
        email: "m@example.com",
        requestedAt: new Date(),
    },
    {
        id: "489e1d42",
        amount: 125,
        status: "processing",
        email: "example@gmail.com",
        requestedAt: new Date(),
    },
];

// Columns for the dummy data table, just to make it work for now if needed,
// but actually we probably want to use real data here eventually.
// For now, I'll assume standard columns or pass empty ones if DataTable requires them.
// Wait, our DataTable is strict about columns. 
// I'll create a simple dummy columns definition here for the home page overview.
import { ColumnDef } from "@tanstack/react-table";
type Payment = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    email: string
}
const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "amount",
        header: "Amount",
    },
]


export default function AdminHomePage() {
    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
            </div>
            <DataTable columns={columns} data={dummyData as any} />
        </div>
    );
}