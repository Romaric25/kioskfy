"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Wallet,
    CheckCircle2,
    TrendingUp,
    Building2,
    ShoppingCart,
    Loader2,
    Banknote,
} from "lucide-react";
import { priceFormatter } from "@/lib/price-formatter";
import { client } from "@/lib/client";
import { useAuth } from "@/hooks";
import { usePayoutStore } from "@/stores/use-payout.store";
import { useVerifyTransaction } from "@/hooks/use-payouts.hook";
import { useCreateWithdrawal } from "@/hooks/use-withdrawals.hook";
import { useOrganizationPermission } from "@/hooks/use-organization-permission.hook";
import { AgencyPermissions } from "@/lib/permissions";

// Validation schema
const createWithdrawalSchema = z.object({
    amount: z.coerce
        .number()
        .min(100, "Le montant minimum est de 100")
        .positive("Le montant doit être positif"),
    notes: z.string().optional(),
});

type WithdrawalFormValues = z.infer<typeof createWithdrawalSchema>;

interface AccountingStatsCardsProps {
    availableBalance: number;
    withdrawnAmount: number;
    totalRevenue: number;
    totalSales: number;
    platformBalance: number;
    organizationId: string;
}

export function AccountingStatsCards({
    availableBalance,
    withdrawnAmount,
    totalRevenue,
    totalSales,
    platformBalance,
    organizationId,
}: AccountingStatsCardsProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { payoutId, setPayoutId, clearPayoutId } = usePayoutStore();
    const { hasPermission: canManagePayouts } = useOrganizationPermission({
        permissions: { agency: [AgencyPermissions.PAYOUT_MANAGE] }
    });

    // Hooks
    const createWithdrawalMutation = useCreateWithdrawal();
    const { data: payout, error: payoutError } = useVerifyTransaction(payoutId);

    const processedPayoutRef = useRef<string | null>(null);

    // Form definition
    const form = useForm<WithdrawalFormValues>({
        resolver: zodResolver(createWithdrawalSchema) as any,
        defaultValues: {
            amount: 0,
            notes: "",
        },
    });

    // Handle post-payout verification effects
    useEffect(() => {
        if (!isSubmitting || !payoutId) return;

        // Prevent duplicate processing
        if (processedPayoutRef.current === payoutId) return;

        if (payoutError) {
            toast.error((payoutError as any).value?.message || "Erreur de vérification");
            setIsSubmitting(false);
            setPayoutId("");
            return;
        }

        if (payout) {
            let isMounted = true;

            const processWithdrawal = async () => {
                try {
                    processedPayoutRef.current = payoutId;
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

                        if (isMounted) {
                            toast.success("Demande de retrait initiée avec succès!");
                            queryClient.invalidateQueries({ queryKey: ["organizationBalances", organizationId] });
                            setIsDialogOpen(false);
                            clearPayoutId();
                            form.reset();
                        }
                    } else {
                        // Only warn if status is finalized and failure
                        if (status === 'failed' || status === 'cancelled') {
                            if (isMounted) {
                                toast.error(`Le virement a échoué avec le statut : ${status}`);
                                setPayoutId("");
                            }
                        }
                    }
                } catch (error: any) {
                    console.error(error);
                    if (isMounted) {
                        toast.error(error.message || "Erreur lors de la création de la demande de retrait");
                    }
                } finally {
                    if (isMounted) {
                        setIsSubmitting(false);
                    }
                }
            };

            processWithdrawal();

            return () => {
                isMounted = false;
            };
        }
    }, [payout, payoutId, payoutError, isSubmitting, createWithdrawalMutation, organizationId, user, setPayoutId, form, setIsDialogOpen, clearPayoutId, queryClient]);

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

    const handleOpenDialog = () => {
        if (!canManagePayouts) {
            toast.error("Vous n'avez pas la permission de demander un retrait");
            return;
        }
        setIsDialogOpen(true);
    };

    return (
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
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-green-600 dark:text-green-400">
                            Prêt à être retiré
                        </p>

                        <Dialog open={isDialogOpen} onOpenChange={handleOpenDialog}>
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
                                        Entrez le montant que vous souhaitez retirer. Le solde
                                        disponible est de {priceFormatter(availableBalance)}.
                                    </DialogDescription>
                                </DialogHeader>

                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="space-y-4"
                                    >
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
                                                        <Input
                                                            placeholder="Ex: Virement partiel..."
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsDialogOpen(false)}
                                            >
                                                Annuler
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || availableBalance <= 0}
                                            >
                                                {isSubmitting && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
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
    );
}
