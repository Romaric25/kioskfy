"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Download, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AchatsPage() {
    // TODO: Fetch user orders
    const orders: any[] = [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <ShoppingBag className="h-8 w-8 text-blue-500" />
                    Mes achats
                </h1>
                <p className="text-muted-foreground mt-1">
                    Retrouvez l'historique de tous vos achats de journaux
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historique des achats</CardTitle>
                    <CardDescription>
                        Tous les journaux que vous avez achetés sur Kioskfy
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="font-semibold text-xl mb-2">Aucun achat</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Vous n'avez pas encore effectué d'achat.
                                Parcourez notre catalogue pour découvrir les dernières éditions.
                            </p>
                            <Button asChild size="lg">
                                <Link href="/newspapers">Découvrir les journaux</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-12 bg-muted rounded overflow-hidden">
                                            {/* Order image */}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{order.newspaper?.issueNumber}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {order.newspaper?.organization?.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            Lire
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
