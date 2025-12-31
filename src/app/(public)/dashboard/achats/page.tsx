"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Eye, Calendar, Loader2, Search, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useMyOrders } from "@/hooks/use-orders.hook";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useSelectedNewspaperStore } from "@/stores/use-newspaper.store";

export default function AchatsPage() {
    const { data: ordersResponse, isLoading, error } = useMyOrders();
    const orders = ordersResponse?.data ?? [];
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const { setSelectedNewspaper, selectedNewspaperId } = useSelectedNewspaperStore();

    const viewNewspaper = (id: string) => {
        setSelectedNewspaper(id, "");
        router.push(`/dashboard/render`);
    };

    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) return orders;

        const query = searchQuery.toLowerCase().trim();
        return orders.filter((order) => {
            const issueNumber = order.newspaper?.issueNumber?.toLowerCase() || "";
            const organizationName = order.newspaper?.organization?.name?.toLowerCase() || "";
            return issueNumber.includes(query) || organizationName.includes(query);
        });
    }, [orders, searchQuery]);

    // Reset to page 1 when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <ShoppingBag className="h-8 w-8 text-blue-500" />
                        Mes achats
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Retrouvez l&apos;historique de tous vos achats de journaux
                    </p>
                </div>
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <ShoppingBag className="h-8 w-8 text-blue-500" />
                        Mes achats
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Retrouvez l&apos;historique de tous vos achats de journaux
                    </p>
                </div>
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-destructive">Une erreur est survenue lors du chargement de vos achats.</p>
                        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                            Réessayer
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <ShoppingBag className="h-8 w-8 text-blue-500" />
                    Mes achats
                </h1>
                <p className="text-muted-foreground mt-1">
                    Retrouvez l&apos;historique de tous vos achats de journaux
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Historique des achats</CardTitle>
                            <CardDescription>
                                {orders.length > 0
                                    ? `${filteredOrders.length} journal${filteredOrders.length > 1 ? 'x' : ''} trouvé${filteredOrders.length > 1 ? 's' : ''}`
                                    : "Tous les journaux que vous avez achetés sur Kioskfy"
                                }
                            </CardDescription>
                        </div>
                        {orders.length > 0 && (
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher un journal..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="font-semibold text-xl mb-2">Aucun achat</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Vous n&apos;avez pas encore effectué d&apos;achat.
                                Parcourez notre catalogue pour découvrir les dernières éditions.
                            </p>
                            <Button asChild size="lg">
                                <Link href="/newspapers">Découvrir les journaux</Link>
                            </Button>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <Search className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="font-semibold text-xl mb-2">Aucun résultat</h3>
                            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                                Aucun journal ne correspond à votre recherche &quot;{searchQuery}&quot;
                            </p>
                            <Button variant="outline" onClick={() => setSearchQuery("")}>
                                Effacer la recherche
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {paginatedOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                                            <div className="h-24 w-16 sm:h-20 sm:w-14 bg-muted rounded overflow-hidden relative flex-shrink-0">
                                                {order.newspaper?.coverImage && (
                                                    <Image
                                                        src={order.newspaper.coverImage}
                                                        alt={order.newspaper.issueNumber || "Journal"}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-sm sm:text-base truncate">
                                                        {order.newspaper?.issueNumber || "Journal"}
                                                    </h4>
                                                    {order.newspaperId === selectedNewspaperId && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                            <BookOpen className="h-3 w-3" />
                                                            En lecture
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                    {order.newspaper?.organization?.name || "Éditeur inconnu"}
                                                </p>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-1 sm:gap-x-4 sm:gap-y-1 text-xs text-muted-foreground mt-2 sm:mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 flex-shrink-0" />
                                                        <span>Acheté le {format(new Date(order.createdAt), "dd MMM yyyy", { locale: fr })}</span>
                                                    </div>
                                                    {order.newspaper?.publishDate && (
                                                        <span className="hidden sm:inline text-muted-foreground/50">•</span>
                                                    )}
                                                    {order.newspaper?.publishDate && (
                                                        <span>Paru le {format(new Date(order.newspaper.publishDate), "dd MMM yyyy", { locale: fr })}</span>
                                                    )}
                                                    <span className="font-semibold text-foreground text-sm sm:text-xs mt-1 sm:mt-0">
                                                        {order.price} XAF
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-shrink-0">
                                            <Button onClick={() => viewNewspaper(order.newspaperId)} variant="outline" size="sm" className="w-full sm:w-auto">
                                                <Eye className="h-4 w-4 mr-2" />
                                                Lire le journal
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Affichage de {startIndex + 1} à {Math.min(endIndex, filteredOrders.length)} sur {filteredOrders.length} résultat{filteredOrders.length > 1 ? 's' : ''}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page => {
                                                if (page === 1 || page === totalPages) return true;
                                                if (Math.abs(page - currentPage) <= 1) return true;
                                                return false;
                                            })
                                            .map((page, index, arr) => {
                                                const prevPage = arr[index - 1];
                                                const showEllipsis = prevPage && page - prevPage > 1;

                                                return (
                                                    <div key={page} className="flex items-center">
                                                        {showEllipsis && (
                                                            <span className="px-2 text-muted-foreground">...</span>
                                                        )}
                                                        <Button
                                                            variant={currentPage === page ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => goToPage(page)}
                                                            className="min-w-[36px]"
                                                        >
                                                            {page}
                                                        </Button>
                                                    </div>
                                                );
                                            })
                                        }

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}</CardContent>
            </Card>
        </div>
    );
}
