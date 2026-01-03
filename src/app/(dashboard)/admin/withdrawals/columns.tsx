"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { priceFormatter } from "@/lib/price-formatter"
import { WithdrawalTableData } from "@/app/interfaces/withdrawal.interface"

export const columns: ColumnDef<WithdrawalTableData>[] = [
    {
        accessorKey: "organization",
        header: "Organization",
        cell: ({ row }) => row.original.organization?.name || "Unknown",
    },
    {
        accessorKey: "user",
        header: "Requested By",
        cell: ({ row }) => row.original.user?.name || row.original.user?.email || "-",
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => priceFormatter(row.getValue("amount")),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

            if (status === "completed") variant = "default"; // green usually via classOverride if needed
            if (status === "failed" || status === "cancelled") variant = "destructive";
            if (status === "processing") variant = "secondary";

            return <Badge variant={variant}>{status}</Badge>
        },
    },
    {
        accessorKey: "requestedAt",
        header: "Date",
        cell: ({ row }) => new Date(row.getValue("requestedAt")).toLocaleDateString(),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const withdrawal = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(withdrawal.id.toString())}
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Reject</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
