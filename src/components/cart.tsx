"use client";

import Image from "next/image";
import { Trash2, ShoppingCart, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { priceFormatter } from "@/lib/price-formatter";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { FrequencyContent } from "@/components/frequency-content";
import { useAuth } from "@/hooks/use-auth.hook";
import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart.store";
import type { Payment } from "@/server/models/payment.model";
import { useInitializePayment } from "@/hooks/use-payment.hook";

export function Cart() {
    const { items, removeItem, total } = useCartStore();
    const { user } = useAuth();
    const router = useRouter();

    const data: Payment = {
        amount: total(),
        currency: "USD",
        description: "Payment for order #123",
        customer: {
            email: user?.email || "",
            first_name: user?.name || "",
            last_name: user?.lastName || "",
        },
        return_url: "https://example.com/payments/thank-you",
        metadata: {
            order_id: "123",
            customer_id: user?.id,
        },
        methods: [],
    };

    const {
        mutateAsync: payment,
        isPending: initializePaymentLoading,
        error: initializePaymentError,
        data: paymentData,
        isSuccess,
    } = useInitializePayment();

    const handleInitializePayment = async () => {
        try {
            await payment(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isSuccess && paymentData) {
            console.log("Payment API Response:", paymentData);
            const response = paymentData as any;
            const checkoutUrl = response?.data?.checkout_url || response?.checkout_url;

            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                console.error("Could not find checkout_url in response", paymentData);
            }
        }
    }, [isSuccess, paymentData]);

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="bg-muted/50 p-6 rounded-full mb-6">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                    Votre panier est vide
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                    Il semble que vous n'ayez pas encore ajouté de journaux ou magazines à
                    votre panier.
                </p>
                <Button asChild size="lg">
                    <Link href="/">Découvrir les journaux</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-10 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Votre Panier</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-8 space-y-4">
                    {items.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row">
                                    <div className="relative w-full sm:w-32 aspect-[3/4] sm:aspect-auto">
                                        <Image
                                            src={item.coverImage}
                                            alt={item.issueNumber}
                                            fill
                                            className="object-cover m-2"
                                        />
                                    </div>
                                    <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className="font-semibold text-lg mb-1">
                                                    {item.issueNumber}
                                                </h3>
                                                <p className="text-muted-foreground text-sm mb-2">
                                                    {item.organization?.name}
                                                </p>
                                                {item.organization?.metadata &&
                                                    typeof item.organization.metadata !== "string" &&
                                                    item.organization.metadata.frequency && (
                                                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                                                            <FrequencyContent
                                                                frequency={item.organization.metadata.frequency}
                                                            />
                                                        </div>
                                                    )}
                                            </div>
                                            <p className="font-bold text-lg">
                                                {priceFormatter(
                                                    item.price,
                                                    item.country?.currency,
                                                    "fr"
                                                )}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-end mt-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 -ml-2"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Supprimer
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:col-span-4">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Résumé de la commande</CardTitle>
                            <CardDescription>
                                {items.length} article{items.length > 1 ? "s" : ""} dans votre
                                panier
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Sous-total</span>
                                    <span>
                                        {priceFormatter(
                                            total(),
                                            items[0]?.country?.currency,
                                            "fr"
                                        )}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary">
                                        {priceFormatter(
                                            total(),
                                            items[0]?.country?.currency,
                                            "fr"
                                        )}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={handleInitializePayment}
                                className="w-full"
                                size="lg"
                                disabled={initializePaymentLoading}
                            >
                                {initializePaymentLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Traitement...
                                    </>
                                ) : (
                                    <>
                                        Procéder au paiement
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
