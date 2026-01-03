"use client"

import { useState } from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useOrganizationStats } from "@/hooks/use-organization-stats.hook";
import { useOrganizationBalances } from "@/hooks/use-accounting.hook";
import { useWithdrawals } from "@/hooks/use-withdrawals.hook";
import { WithdrawalResponse } from "@/server/controllers/withdrawals.controller";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RefreshCw, Clock, XCircle, CheckCircle2, ArrowUpDown, ChevronLeft, ChevronRight, Search, FileText, Wallet, TrendingUp, ShoppingCart, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { priceFormatter } from "@/lib/price-formatter";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";


interface AdminAccountingManagementProps {
    organizationId: string;
}

export function AdminAccountingManagement({ organizationId }: AdminAccountingManagementProps) {

    const { data: stats, isLoading: statsLoading } = useOrganizationStats(organizationId);
    const { data: balances, isLoading: balancesLoading } = useOrganizationBalances(organizationId);
    const { data: withdrawals, isLoading: withdrawalsLoading } = useWithdrawals(organizationId);

    // TanStack Table states
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const isLoading = statsLoading || balancesLoading || withdrawalsLoading;

    // Calculs des montants (similaire à AccountingManagement)
    const availableBalance = balances?.organizationAmount ?? stats?.availableBalance ?? 0;
    const platformBalance = balances?.platformAmount ?? 0;
    const withdrawnAmount = balances?.withdrawnAmount ?? stats?.withdrawnAmount ?? 0;
    const totalSales = balances?.totalSales ?? stats?.salesCount ?? 0;
    const totalRevenue = stats?.totalRevenue ?? 0;


    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Payé</Badge>;
            case "processing":
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Traitement</Badge>;
            case "pending":
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
            case "failed":
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"><XCircle className="w-3 h-3 mr-1" />Échec</Badge>;
            case "cancelled":
                return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800"><XCircle className="w-3 h-3 mr-1" />Annulé</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    }

    // Define columns for TanStack Table
    const columns: ColumnDef<WithdrawalResponse>[] = [
        {
            accessorKey: "requestedAt",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-ml-3 h-8 hover:bg-accent/50"
                >
                    Date demande
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = row.getValue("requestedAt");
                return date ? new Date(date as string).toLocaleDateString("fr-FR", {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : "-";
            },
        },
        {
            accessorKey: "user",
            header: "Initié par",
            cell: ({ row }) => {
                const user = row.original.user;
                return user?.name || user?.email || "-";
            },
        },
        {
            accessorKey: "amount",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-ml-3 h-8 hover:bg-accent/50"
                >
                    Montant
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-primary font-bold text-lg">
                    {priceFormatter(row.getValue("amount"))}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Statut",
            cell: ({ row }) => getStatusBadge(row.getValue("status")),
            filterFn: (row, id, value) => {
                return value === "all" ? true : row.getValue(id) === value;
            },
        },
        {
            accessorKey: "externalReference",
            header: "Référence",
            cell: ({ row }) => (
                <span className="text-xs font-mono text-muted-foreground">
                    {row.getValue("externalReference") || "-"}
                </span>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const withdrawal = row.original;
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Ouvrir le menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => {
                                        navigator.clipboard.writeText(withdrawal.externalReference || withdrawal.id.toString());
                                        toast.success("Référence copiée dans le presse-papiers");
                                    }}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Copier la référence
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    // Initialize TanStack Table
    const table = useReactTable({
        data: (withdrawals ?? []) as WithdrawalResponse[],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
    });


    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <Skeleton className="h-[300px] w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Solde disponible */}
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                            Solde disponible
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                            {priceFormatter(availableBalance)}
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400">
                            Prêt à être retiré
                        </p>
                    </CardContent>
                </Card>

                {/* Déjà retiré */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Déjà retiré</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {priceFormatter(withdrawnAmount)}
                        </div>
                        <p className="text-xs text-muted-foreground">Total payé à ce jour</p>
                    </CardContent>
                </Card>

                {/* Revenus totaux */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {priceFormatter(totalRevenue)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ShoppingCart className="h-3 w-3" />
                            {totalSales} ventes
                        </div>
                    </CardContent>
                </Card>

                {/* Part plateforme */}
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            Part plateforme
                        </CardTitle>
                        <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                            {priceFormatter(platformBalance)}
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                            25% des ventes
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Withdrawals History */}
            <Card>
                <CardHeader>
                    <CardTitle>Historique des retraits</CardTitle>
                    <CardDescription>Liste des virements effectués vers le compte de l'agence.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par référence..."
                                value={(table.getColumn("externalReference")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("externalReference")?.setFilterValue(event.target.value)
                                }
                                className="pl-8"
                            />
                        </div>
                        <select
                            className="flex h-10 w-full sm:w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
                            onChange={(event) =>
                                table.getColumn("status")?.setFilterValue(event.target.value === "all" ? "" : event.target.value)
                            }
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="completed">Payé</option>
                            <option value="processing">Traitement</option>
                            <option value="pending">En attente</option>
                            <option value="failed">Échec</option>
                            <option value="cancelled">Annulé</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                            Aucune demande de retrait pour le moment.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            {table.getFilteredRowModel().rows.length} retrait(s) au total
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Précédent
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                Page {table.getState().pagination.pageIndex + 1} sur{" "}
                                {table.getPageCount()}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Suivant
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
