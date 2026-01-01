"use client"

import { useOrganizationStats } from "@/hooks/use-organization-stats.hook";
import { useAccountingLedger, useAccountingBalances } from "@/hooks/use-accounting.hook";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { priceFormatter } from "@/lib/price-formatter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle2, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AccountingManagementProps {
    organizationId: string;
}

export function AccountingManagement({ organizationId }: AccountingManagementProps) {
    const { data: stats, isLoading: statsLoading } = useOrganizationStats(organizationId);
    const { data: ledgerEntries, isLoading: ledgerLoading } = useAccountingLedger(organizationId, 50, 0);
    const { data: balances, isLoading: balancesLoading } = useAccountingBalances(organizationId);

    const isLoading = statsLoading || ledgerLoading || balancesLoading;

    const handleWithdraw = () => {
        toast.success("Demande de retrait initiée. Vous serez contacté sous peu.");
    };

    // Helper function to get badge style based on transaction type
    const getTransactionBadge = (type: string) => {
        switch (type) {
            case "purchase":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        Vente
                    </Badge>
                );
            case "withdrawal":
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800">
                        <ArrowDownRight className="w-3 h-3 mr-1" />
                        Retrait
                    </Badge>
                );
            case "refund":
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Remboursement
                    </Badge>
                );
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Solde disponible</CardTitle>
                        <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                            {priceFormatter(balances?.organizationBalance || stats?.availableBalance || 0)}
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-green-600 dark:text-green-400">Prêt à être retiré</p>
                            <Button
                                size="sm"
                                onClick={handleWithdraw}
                                disabled={!balances?.organizationBalance && !stats?.availableBalance}
                                className="bg-green-600 hover:bg-green-700"
                            >
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
                        <div className="text-2xl font-bold">{priceFormatter(stats?.withdrawnAmount || 0)}</div>
                        <p className="text-xs text-muted-foreground">Total payé à ce jour</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{priceFormatter(stats?.totalRevenue || 0)}</div>
                        <p className="text-xs text-muted-foreground">{stats?.salesCount || 0} ventes</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Part plateforme</CardTitle>
                        <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                            {priceFormatter(balances?.platformBalance || 0)}
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400">25% des ventes</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="ledger" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="ledger">Grand livre</TabsTrigger>
                    <TabsTrigger value="withdrawals">Historique retraits</TabsTrigger>
                </TabsList>

                <TabsContent value="ledger" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Grand livre comptable</CardTitle>
                            <CardDescription>Historique complet de toutes les transactions financières.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Organisation</TableHead>
                                            <TableHead className="text-right">Plateforme</TableHead>
                                            <TableHead className="text-right">Solde org.</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ledgerEntries && ledgerEntries.length > 0 ? (
                                            ledgerEntries.map((entry) => (
                                                <TableRow key={entry.id}>
                                                    <TableCell className="whitespace-nowrap">
                                                        {new Date(entry.createdAt).toLocaleDateString("fr-FR", {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getTransactionBadge(entry.transactionType)}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate">
                                                        {entry.description || "-"}
                                                    </TableCell>
                                                    <TableCell className={`text-right font-medium ${Number(entry.organizationAmount) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {Number(entry.organizationAmount) >= 0 ? '+' : ''}{priceFormatter(Number(entry.organizationAmount))}
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground">
                                                        {priceFormatter(Number(entry.platformAmount))}
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        {priceFormatter(Number(entry.organizationBalance))}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                    Aucune transaction enregistrée pour le moment.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="withdrawals" className="mt-4">
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
                                            <TableHead className="text-right">Ventes incluses</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stats?.payouts?.length ? (
                                            stats.payouts.map((payout, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>
                                                        {payout.date ? new Date(payout.date).toLocaleDateString("fr-FR", {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        }) : "-"}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {priceFormatter(payout.amount)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Payé
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground">
                                                        {payout.count} transactions
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                    Aucun retrait effectué pour le moment.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
