"use client"

import { useOrganizationStats } from "@/hooks/use-organization-stats.hook";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { priceFormatter } from "@/lib/price-formatter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface AccountingManagementProps {
    organizationId: string;
}

export function AccountingManagement({ organizationId }: AccountingManagementProps) {
    const { data: stats, isLoading } = useOrganizationStats(organizationId);

    const handleWithdraw = () => {
        toast.success("Demande de retrait initiée. Vous serez contacté sous peu.");
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Solde disponible</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-2">{priceFormatter(stats?.availableBalance || 0)}</div>
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">Prêt à être retiré</p>
                            <Button
                                size="sm"
                                onClick={handleWithdraw}
                                disabled={!stats?.availableBalance || stats.availableBalance <= 0}
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
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historique des retraits</CardTitle>
                    <CardDescription>Liste des virements effectués vers votre compte.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table className="min-w-[600px]">
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
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Payé</Badge>
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
        </div>
    )
}
