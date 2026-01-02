"use client"

import { useState, useEffect, useRef } from "react";
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
import { useOrganizationBalances, useSyncBalances } from "@/hooks/use-accounting.hook";
import { useWithdrawals, useCreateWithdrawal } from "@/hooks/use-withdrawals.hook";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { priceFormatter } from "@/lib/price-formatter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle2, TrendingUp, Building2, RefreshCw, ShoppingCart, Clock, XCircle, Loader2, ShieldCheck, Banknote, ArrowUpDown, ChevronLeft, ChevronRight, Search, MoreHorizontal, Download, FileText } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { useAuth } from "@/hooks";
import { usePayoutStore } from "@/stores/use-payout.store";
import { useVerifyTransaction, useVerifyPayoutMutation } from "@/hooks/use-payouts.hook";
import { WithdrawalResponse } from "@/app/interfaces/withdrawal.interface";

interface AccountingManagementProps {
    organizationId: string;
}

// Validation schema
const createWithdrawalSchema = z.object({
    amount: z.coerce
        .number()
        .min(100, "Le montant minimum est de 100")
        .positive("Le montant doit être positif"),
    notes: z.string().optional(),
});

type WithdrawalFormValues = z.infer<typeof createWithdrawalSchema>;

export function AccountingManagement({ organizationId }: AccountingManagementProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { payoutId, setPayoutId, clearPayoutId } = usePayoutStore();

    const { data: stats, isLoading: statsLoading } = useOrganizationStats(organizationId);
    const { data: balances, isLoading: balancesLoading, refetch } = useOrganizationBalances(organizationId);
    const { data: withdrawals, isLoading: withdrawalsLoading } = useWithdrawals(organizationId);
    const { data: payout, isLoading: payoutLoading, error: payoutError } = useVerifyTransaction(payoutId);

    const syncMutation = useSyncBalances();
    const createWithdrawalMutation = useCreateWithdrawal();
    const verifyMutation = useVerifyPayoutMutation();
    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    // TanStack Table states
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const isLoading = statsLoading || balancesLoading || withdrawalsLoading;

    const availableBalance = balances?.organizationAmount ?? stats?.availableBalance ?? 0;
    const platformBalance = balances?.platformAmount ?? 0;
    const withdrawnAmount = balances?.withdrawnAmount ?? stats?.withdrawnAmount ?? 0;
    const totalSales = balances?.totalSales ?? stats?.salesCount ?? 0;
    const totalRevenue = stats?.totalRevenue ?? 0;

    // Form definition
    const form = useForm<WithdrawalFormValues>({
        resolver: zodResolver(createWithdrawalSchema) as any,
        defaultValues: {
            amount: 0,
            notes: "",
        },
    });

    const processedPayoutRef = useRef<string | null>(null);

    // Handle post-payout verification effects
    useEffect(() => {
        if (!isSubmitting || !payoutId) return;

        // Prevent duplicate processing
        if (processedPayoutRef.current === payoutId) return;

        if (payoutError) {
            toast.error((payoutError as any).value?.message || "Erreur de vérification");
            setIsSubmitting(false);
            setPayoutId(""); // Using setPayoutId("") as clearPayoutId might not be available or consistent
            return;
        }

        if (payout) {
            const processWithdrawal = async () => {
                try {
                    processedPayoutRef.current = payoutId;
                    // Adjust access based on actual hook return
                    // user code used (payout as any)?.data?.status but hook returns inner data
                    console.log("[DEBUG] Payout response structure:", JSON.stringify(payout, null, 2));
                    const status = (payout as any)?.status || (payout as any)?.data?.status;

                    if (status === "success" || status === "initiated" || status === "pending") {
                        let appStatus: "processing" | "completed" = "processing";
                        if (status === "success") {
                            appStatus = "completed";
                        }

                        await createWithdrawalMutation.mutateAsync({
                            organizationId,
                            amount: Number(form.getValues().amount),
                            notes: form.getValues().notes || "Demande de retrait via le tableau de bord",
                            externalReference: payoutId,
                            status: appStatus,
                            userId: user?.id,
                        });

                        toast.success("Demande de retrait initiée avec succès!");

                        // Force refresh of balances immediately
                        queryClient.invalidateQueries({ queryKey: ["organizationBalances", organizationId] });

                        setIsDialogOpen(false);
                        clearPayoutId();
                        form.reset();
                    } else {
                        // Only warn if status is finalized and failure
                        if (status === 'failed' || status === 'cancelled') {
                            toast.error(`Le virement a échoué avec le statut : ${status}`);
                            setPayoutId("");
                        }
                        // If still loading/unknown, we might wait? But payout is defined.
                    }
                } catch (error: any) {
                    console.error(error);
                    toast.error(error.message || "Erreur lors de la création de la demande de retrait");
                } finally {
                    // Only stop submitting if we are done (success or explicit failure)
                    // If status is 'pending' we handled it above.
                    setIsSubmitting(false);
                }
            };

            processWithdrawal();
        }
    }, [payout, payoutId, payoutError, isSubmitting, createWithdrawalMutation, organizationId, user, setPayoutId, form, setIsDialogOpen]);

    const onSubmit = async (data: WithdrawalFormValues) => {
        if (data.amount > availableBalance) {
            form.setError("amount", {
                type: "manual",
                message: "Le montant dépasse le solde disponible",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Initialize Payout via API
            const payoutResponse = await client.api.v1.payouts.initialize.post({
                amount: data.amount,
                currency: "USD",
                description: data.notes || "Retrait Kioskfy",
                customer: {
                    email: user?.email || "User",
                    first_name: user?.name || "User",
                    last_name: user?.lastName || "Name",
                },
                recipient: {
                    // This should be dynamic in a real app
                    account_number: '4149518161'
                },
                metadata: {
                    organizationId,
                    type: "retrait",
                    customer_id: user?.id || "123"
                },
                method: "moneroo_payout_demo",
            });

            if (payoutResponse.error) {
                throw new Error((payoutResponse.error as any).value?.message || "Erreur lors de l'initialisation du virement");
            }

            const payoutData = payoutResponse.data;
            const externalReference = (payoutData as any).data?.data?.id || (payoutData as any).data?.id || (payoutData as any).id;

            if (externalReference) {
                // Setting payoutId triggers the useVerifyTransaction hook
                // The useEffect above will handle the rest
                setPayoutId(externalReference);
            } else {
                throw new Error("Référence de paiement introuvable");
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erreur lors de la demande de retrait");
            setIsSubmitting(false);
        }
    };

    const handleSync = async () => {
        try {
            await syncMutation.mutateAsync(organizationId);
            await refetch();
            toast.success("Soldes synchronisés avec succès !");
        } catch (error) {
            toast.error("Erreur lors de la synchronisation");
        }
    };

    const handleVerifyParams = async (externalReference: string | null) => {
        if (!externalReference) {
            toast.error("Aucune référence de paiement disponible pour vérification");
            return;
        }

        try {
            setVerifyingId(externalReference);
            await verifyMutation.mutateAsync(externalReference);
            toast.success("Statut du transfert vérifié et mis à jour");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setVerifyingId(null);
        }
    };

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
            header: "Retiré par",
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
                const handleDownloadInvoice = () => {
                    // TODO: Implement invoice download logic
                    toast.success("Téléchargement de la facture en cours...");
                    // Example: window.open(`/api/invoices/${withdrawal.id}`, '_blank');
                };
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
                                {withdrawal.status === "processing" && withdrawal.externalReference && (
                                    <DropdownMenuItem
                                        onClick={() => handleVerifyParams(withdrawal.externalReference)}
                                        disabled={verifyingId === withdrawal.externalReference}
                                    >
                                        <ShieldCheck className={`mr-2 h-4 w-4 text-blue-600 ${verifyingId === withdrawal.externalReference ? 'animate-pulse' : ''}`} />
                                        Vérifier le transfert
                                    </DropdownMenuItem>
                                )}
                                {withdrawal.status === "completed" && (
                                    <DropdownMenuItem onClick={handleDownloadInvoice}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Télécharger la facture
                                    </DropdownMenuItem>
                                )}
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
            {/* Sync Button */}
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSync}
                    disabled={syncMutation.isPending}
                >
                    {syncMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Synchroniser les soldes
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Solde disponible</CardTitle>
                        <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                            {priceFormatter(availableBalance)}
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-green-600 dark:text-green-400">Prêt à être retiré</p>

                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        disabled={availableBalance <= 0}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Retirer
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Demander un retrait</DialogTitle>
                                        <DialogDescription>
                                            Entrez le montant que vous souhaitez retirer. Le solde disponible est de {priceFormatter(availableBalance)}.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="amount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Montant</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    className="pl-9"
                                                                    {...field}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormDescription>
                                                            Maximum: {priceFormatter(availableBalance)}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="notes"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Notes (Optionnel)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex: Virement partiel..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <DialogFooter>
                                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                                    Annuler
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting || availableBalance <= 0}
                                                >
                                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Confirmer le retrait
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>

                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Déjà retiré</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{priceFormatter(withdrawnAmount)}</div>
                        <p className="text-xs text-muted-foreground">Total payé à ce jour</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{priceFormatter(totalRevenue)}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ShoppingCart className="h-3 w-3" />
                            {totalSales} ventes
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Part plateforme</CardTitle>
                        <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                            {priceFormatter(platformBalance)}
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400">25% des ventes</p>
                    </CardContent>
                </Card>
            </div>

            {/* Withdrawals History */}
            <Card>
                <CardHeader>
                    <CardTitle>Historique des retraits</CardTitle>
                    <CardDescription>Liste des virements effectués vers votre compte.</CardDescription>
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
