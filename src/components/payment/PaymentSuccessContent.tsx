"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Newspaper, ArrowRight, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart.store";

export function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const { clearCart } = useCartStore();
    const paymentId = searchParams.get("paymentId") || searchParams.get("payment_id");

    // Clear cart after successful payment
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <Suspense
            fallback={
                <div className="min-h-[80vh] flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">Chargement...</div>
                </div>
            }
        >
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-lg text-center shadow-2xl border-0 bg-gradient-to-b from-background to-muted/20">
                    <CardHeader className="space-y-6 pb-2">
                        {/* Success Animation */}
                        <div className="mx-auto relative">
                            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
                            <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-6 shadow-lg shadow-green-500/30">
                                <CheckCircle2 className="h-16 w-16 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="absolute -top-1 -right-1">
                                <Sparkles className="h-6 w-6 text-yellow-400 animate-bounce" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                                Paiement réussi !
                            </CardTitle>
                            <CardDescription className="text-base text-muted-foreground">
                                Merci pour votre achat. Votre commande a été traitée avec succès.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-4">
                        {/* Order Info */}
                        <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <span>Référence de paiement</span>
                            </div>
                            <p className="font-mono text-sm bg-background rounded-lg px-3 py-2 border">
                                {paymentId || "N/A"}
                            </p>
                        </div>

                        {/* What's Next */}
                        <div className="space-y-4 text-left bg-primary/5 rounded-xl p-4">
                            <h3 className="font-semibold text-center">Que se passe-t-il maintenant ?</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 bg-primary/10 rounded-full p-1">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                    </div>
                                    <span>Vous recevrez un email de confirmation avec les détails de votre commande.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 bg-primary/10 rounded-full p-1">
                                        <Newspaper className="h-4 w-4 text-primary" />
                                    </div>
                                    <span>Vos journaux sont maintenant disponibles dans votre espace personnel.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 bg-primary/10 rounded-full p-1">
                                        <Download className="h-4 w-4 text-primary" />
                                    </div>
                                    <span>Vous pouvez les lire en ligne mais ne sont pas téléchargeables.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button asChild variant="outline" className="flex-1 rounded-full">
                                <Link href="/dashboard/achats">
                                    <Newspaper className="mr-2 h-4 w-4" />
                                    Mes achats
                                </Link>
                            </Button>
                            <Button asChild className="flex-1 rounded-full shadow-lg shadow-primary/25">
                                <Link href="/">
                                    Continuer à explorer
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        {/* Support */}
                        <p className="text-xs text-muted-foreground pt-2">
                            Une question ? Contactez notre{" "}
                            <Link href="/support" className="text-primary hover:underline">
                                support client
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </Suspense>
    );
}
