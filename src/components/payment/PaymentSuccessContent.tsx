"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Newspaper, ArrowRight, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart.store";
import { usePaymentStore } from "@/stores/use-payment.store";
import { db } from "@/lib/db";
import { orders, revenueShares } from "@/db/app-schema";
import { eq } from "drizzle-orm";
import { users } from "@/db/auth-schema";
import { useAuth, useVerifyPayment } from "@/hooks";
// ============================================
// Constants
// ============================================
const PLATFORM_PERCENTAGE = 25;
const ORGANIZATION_PERCENTAGE = 75;

export function PaymentSuccessContent() {
    const { clearCart } = useCartStore();
    const { user } = useAuth();
    const { paymentId, clearPaymentId } = usePaymentStore();
    const { paymentVerify } = useVerifyPayment(paymentId);

    const handlePaymentSuccess = async () => {
        try {
            // Find ALL orders with this payment ID (multiple orders possible)
            const foundOrders = await db.query.orders.findMany({
                where: eq(orders.paymentId, paymentId),
                with: {
                    newspaper: {
                        with: {
                            organization: true,
                            country: true,
                        },
                    },
                },
            });

            if (!foundOrders || foundOrders.length === 0) {
                console.warn(`[Moneroo Webhook] No orders found for payment: ${paymentId}`);
                return {
                    success: false,
                    message: `No orders found for payment ${paymentId}`,
                };
            }

            console.log(`[Moneroo Webhook] Found ${foundOrders.length} order(s) for payment ${paymentId}`);

            // Update ALL orders status to completed
            const orderIds = foundOrders.map((order) => order.id);
            await db
                .update(orders)
                .set({
                    status: "completed",
                    updatedAt: new Date(),
                })
                .where(eq(orders.paymentId, paymentId));

            console.log(`[Moneroo Webhook] ${orderIds.length} order(s) marked as completed:`, orderIds);

            // Create revenue share records for each order
            const revenueSharePromises = foundOrders.map(async (order) => {
                if (!order.newspaper?.organizationId) {
                    console.warn(`[Moneroo Webhook] No organization found for order ${order.id}, skipping revenue share`);
                    return null;
                }

                const totalAmount = parseFloat(order.price);
                const platformAmount = (totalAmount * PLATFORM_PERCENTAGE) / 100;
                const organizationAmount = (totalAmount * ORGANIZATION_PERCENTAGE) / 100;
                const currency = order.newspaper?.country?.currency || "XAF";

                await db.insert(revenueShares).values({
                    orderId: order.id,
                    organizationId: order.newspaper.organizationId,
                    totalAmount: totalAmount.toFixed(2),
                    platformAmount: platformAmount.toFixed(2),
                    organizationAmount: organizationAmount.toFixed(2),
                    platformPercentage: PLATFORM_PERCENTAGE.toFixed(2),
                    organizationPercentage: ORGANIZATION_PERCENTAGE.toFixed(2),
                    currency,
                    status: "processed",
                    processedAt: new Date(),
                });

                console.log(`[Moneroo Webhook] Revenue share created for order ${order.id}:`, {
                    organizationId: order.newspaper.organizationId,
                    organizationName: order.newspaper.organization?.name,
                    total: totalAmount,
                    platform: platformAmount,
                    organization: organizationAmount,
                    currency,
                });

                return order.id;
            });

            const processedOrders = await Promise.all(revenueSharePromises);
            const successfulShares = processedOrders.filter((id) => id !== null);

            console.log(`[Moneroo Webhook] Revenue shares created: ${successfulShares.length}/${foundOrders.length}`);

            // TODO: Add any post-payment success logic here
            // - Send confirmation email
            // - Grant access to newspapers

            return {
                success: true,
                message: `Payment success processed for ${foundOrders.length} order(s)`,
                orderId: orderIds.join(","),
            };
        } catch (error) {
            console.error("[Moneroo Webhook] Error handling payment.success:", error);
            return {
                success: false,
                message: "Error processing payment.success event",
            };
        }
    };

    const updateUser = async () => {
        if (!user) {
            console.warn("Cannot update user: user is not authenticated");
            return;
        }

        try {
            const updatedUser = await db.update(users).set({
                phone: paymentVerify?.data?.customer?.phone,
            }).where(eq(users.id, user.id));
            console.log("User updated:", updatedUser);
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    // Clear cart and payment ID after successful payment
    useEffect(() => {
        if ((paymentVerify?.data?.status === "success") && paymentVerify.data.is_processed) {
            updateUser();
            handlePaymentSuccess();
            clearCart();
            clearPaymentId();
        }
    }, [clearCart, clearPaymentId, handlePaymentSuccess]);

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
