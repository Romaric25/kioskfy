"use client"

import { useOrganizationStats } from "@/hooks/use-organization-stats.hook";
import { useOrganizationBalances, useSyncBalances } from "@/hooks/use-accounting.hook";
import { useWithdrawals, useCreateWithdrawal } from "@/hooks/use-withdrawals.hook";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { priceFormatter } from "@/lib/price-formatter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle2, TrendingUp, Building2, RefreshCw, ShoppingCart, Clock, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface AccountingManagementProps {
    organizationId: string;
}

export function AccountingManagement({ organizationId }: AccountingManagementProps) {
    const { data: stats, isLoading: statsLoading } = useOrganizationStats(organizationId);
    const { data: balances, isLoading: balancesLoading, refetch } = useOrganizationBalances(organizationId);
    const { data: withdrawals, isLoading: withdrawalsLoading } = useWithdrawals(organizationId);

    const syncMutation = useSyncBalances();
    const createWithdrawalMutation = useCreateWithdrawal();

    const isLoading = statsLoading || balancesLoading || withdrawalsLoading;

    // Use balances from the new table, fallback to stats where appropriate
    const availableBalance = balances?.organizationAmount ?? stats?.availableBalance ?? 0;
    const platformBalance = balances?.platformAmount ?? 0;
    const withdrawnAmount = balances?.withdrawnAmount ?? stats?.withdrawnAmount ?? 0;
    const totalSales = balances?.totalSales ?? stats?.salesCount ?? 0;
    const totalRevenue = stats?.totalRevenue ?? 0;

    const handleWithdraw = async () => {
        const pendingAmount = availableBalance;
        if (pendingAmount <= 0) {
            toast.error("Solde insuffisant");
            return;
        }

        const amountStr = window.prompt(`Montant à retirer (Max: ${priceFormatter(pendingAmount)})`, pendingAmount.toString());
        if (!amountStr) return;

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Montant invalide");
            return;
        }

        if (amount > pendingAmount) {
            toast.error("Le montant demandé dépasse le solde disponible");
            return;
        }

        try {
            await createWithdrawalMutation.mutateAsync({
                organizationId,
                amount,
                notes: "Demande de retrait via le tableau de bord"
            });
            toast.success("Demande de retrait créée avec succès!");
        } catch (error) {
            toast.error("Erreur lors de la création de la demande");
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
                            <Button
                                size="sm"
                                onClick={handleWithdraw}
                                disabled={availableBalance <= 0 || createWithdrawalMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {createWithdrawalMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                Retirer
                            </Button>
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
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Montant</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Notes / Méthode</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {withdrawals && withdrawals.length > 0 ? (
                                    withdrawals.map((withdrawal) => (
                                        <TableRow key={withdrawal.id}>
                                            <TableCell>
                                                {new Date(withdrawal.requestedAt).toLocaleDateString("fr-FR", {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {priceFormatter(withdrawal.amount)}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(withdrawal.status)}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground text-sm">
                                                {withdrawal.notes || withdrawal.paymentMethod || "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            Aucune demande de retrait pour le moment.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
