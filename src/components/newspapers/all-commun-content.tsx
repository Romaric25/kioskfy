"use client";

import { usePublishedNewspapers } from "@/hooks/use-newspapers.hook";
import { NewspaperCard } from "@/components/newspaper-card";
import { Skeleton } from "@/components/ui/skeleton";
import { NewspapersGridSkeleton, NewspaperCardSkeleton } from "@/components/newspapers/newspapers-skeleton";
import { EmptyState, ErrorState } from "@/components/newspapers/newspapers-states";
import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import { NewspaperResponse } from "@/server/models/newspaper.model";

const ITEMS_PER_PAGE = 12;

interface AllNewspapersPublishedProps {
    title?: string;
    showTitle?: boolean;
    limit?: number;
    enableInfiniteScroll?: boolean;
    data?: NewspaperResponse[];
    isLoading?: boolean;
    isError?: boolean;
    error: Error | null;
}

export function AllCommunContent({
    title = "Journaux publiés",
    showTitle = true,
    limit,
    enableInfiniteScroll = true,
    data,
    isLoading,
    isError,
    error
}: AllNewspapersPublishedProps) {
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Gérer le rechargement
    const handleRetry = () => {
        window.location.reload();
    };

    // Extraire les données des journaux
    const newspapersList = data || [];

    // Déterminer les journaux à afficher
    const getDisplayedNewspapers = useCallback(() => {
        if (limit) {
            return newspapersList.slice(0, limit);
        }
        if (enableInfiniteScroll) {
            return newspapersList.slice(0, displayCount);
        }
        return newspapersList;
    }, [newspapersList, limit, enableInfiniteScroll, displayCount]);

    const displayedNewspapers = getDisplayedNewspapers();
    const hasMore = !limit && enableInfiniteScroll && displayCount < newspapersList.length;

    // Charger plus de journaux
    const loadMore = useCallback(() => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        // Simuler un petit délai pour une meilleure UX
        setTimeout(() => {
            setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, newspapersList.length));
            setIsLoadingMore(false);
        }, 400);
    }, [isLoadingMore, hasMore, newspapersList.length]);

    // Vérifier si le contenu dépasse le viewport (pour activer l'infinite scroll)
    const [canAutoLoad, setCanAutoLoad] = useState(false);

    useEffect(() => {
        // Vérifier si le container dépasse le viewport après le rendu initial
        const checkHeight = () => {
            if (containerRef.current) {
                const containerBottom = containerRef.current.getBoundingClientRect().bottom;
                const viewportHeight = window.innerHeight;
                // Si le container dépasse le viewport, activer l'auto-load
                setCanAutoLoad(containerBottom > viewportHeight + 100);
            }
        };

        // Attendre le rendu
        const timer = setTimeout(checkHeight, 100);
        return () => clearTimeout(timer);
    }, [displayedNewspapers.length]);

    // Observer pour le défilement infini (seulement si le contenu dépasse le viewport)
    useEffect(() => {
        if (!enableInfiniteScroll || limit || !canAutoLoad) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && hasMore && !isLoadingMore) {
                    loadMore();
                }
            },
            {
                root: null,
                rootMargin: "200px",
                threshold: 0,
            }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [enableInfiniteScroll, limit, hasMore, isLoadingMore, loadMore, canAutoLoad]);

    // Réinitialiser le compteur quand les données changent
    useEffect(() => {
        setDisplayCount(ITEMS_PER_PAGE);
        setCanAutoLoad(false);
    }, [data]);

    // État de chargement initial
    if (isLoading) {
        return (
            <section className="py-8">
                {showTitle && (
                    <div className="mb-8">
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                )}
                <NewspapersGridSkeleton count={limit || ITEMS_PER_PAGE} />
            </section>
        );
    }

    // État d'erreur
    if (isError) {
        return (
            <section className="py-8">
                <ErrorState onRetry={handleRetry} />
            </section>
        );
    }

    // État vide
    if (newspapersList.length === 0) {
        return (
            <section className="py-8">
                <EmptyState />
            </section>
        );
    }

    return (
        <section className="py-8" ref={containerRef}>
            {showTitle && (
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                            {title}
                        </h1>
                    </div>
                    <p className="text-muted-foreground ml-4 pl-3 border-l border-border">
                        Découvrez toutes les éditions de nos partenaires
                    </p>
                </div>
            )}

            {/* Grille de journaux avec animation d'entrée */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {displayedNewspapers.map((newspaper, index) => (
                    <div
                        key={newspaper.id}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                        style={{ animationDelay: `${Math.min(index % ITEMS_PER_PAGE, 11) * 50}ms` }}
                    >
                        <NewspaperCard newspaper={newspaper} />
                    </div>
                ))}

                {/* Skeletons pendant le chargement de plus d'éléments */}
                {isLoadingMore &&
                    Array.from({ length: Math.min(ITEMS_PER_PAGE, newspapersList.length - displayCount) }).map((_, i) => (
                        <NewspaperCardSkeleton key={`skeleton-${i}`} />
                    ))}
            </div>

            {/* Zone de chargement */}
            {enableInfiniteScroll && !limit && hasMore && (
                <div ref={loadMoreRef} className="mt-8 flex flex-col items-center justify-center">
                    {canAutoLoad ? (
                        // Indicateur de chargement automatique
                        <div className="flex items-center gap-2 text-muted-foreground py-4">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Chargement...</span>
                        </div>
                    ) : (
                        // Bouton pour charger plus manuellement
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={loadMore}
                            disabled={isLoadingMore}
                            className="gap-2"
                        >
                            {isLoadingMore ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Chargement...
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4" />
                                    Afficher plus de journaux
                                </>
                            )}
                        </Button>
                    )}
                </div>
            )}

            {/* Indicateur de fin */}
            {enableInfiniteScroll && !limit && !hasMore && newspapersList.length > ITEMS_PER_PAGE && (
                <div className="mt-8 text-center py-4">
                    <p className="text-sm text-muted-foreground">
                        {newspapersList.length} journal{newspapersList.length > 1 ? "x" : ""} affiché{newspapersList.length > 1 ? "s" : ""}
                    </p>
                </div>
            )}

            {/* Afficher info si une limite est définie */}
            {limit && newspapersList.length > limit && (
                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Affichage de {displayedNewspapers.length} sur {newspapersList.length} journaux
                    </p>
                </div>
            )}
        </section>
    );
}