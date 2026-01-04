"use client";

import { useInfinitePublishedNewspapers } from "@/hooks/use-newspapers.hook";
import { NewspaperCard } from "@/components/newspaper-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { NewspapersGridSkeleton, NewspaperCardSkeleton } from "@/components/newspapers/newspapers-skeleton";
import { EmptyState, ErrorState } from "@/components/newspapers/newspapers-states";
import { Loader2, ChevronDown } from "lucide-react";
import { useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";

const ITEMS_PER_PAGE = 12;

interface AllCommunContentProps {
    title?: string;
    showTitle?: boolean;
    type?: "Journal" | "Magazine";
}



export function AllCommunContent({
    title = "Journaux publiés",
    showTitle = true,
    type = "Journal",
}: AllCommunContentProps) {
    const searchParams = useSearchParams();
    const searchParam = searchParams.get("q") || undefined;
    const search = searchParam && searchParam.length >= 3 ? searchParam : undefined;

    console.log("AllCommunContent search:", search);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
        error,
    } = useInfinitePublishedNewspapers({
        type,
        limit: ITEMS_PER_PAGE,
        search,
    });

    const loadMoreRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Flatten all pages into a single array
    const allNewspapers = useMemo(() => {
        return data?.pages.flatMap((page) => page.data) ?? [];
    }, [data?.pages]);

    // Intersection Observer for infinite scroll
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasNextPage && !isFetching) {
                fetchNextPage();
            }
        },
        [hasNextPage, isFetching, fetchNextPage]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: "200px",
            threshold: 0,
        });

        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [handleObserver]);

    // Gérer le rechargement
    const handleRetry = () => {
        window.location.reload();
    };

    // État de chargement initial
    if (status === "pending") {
        return (
            <section className="py-8">
                {showTitle && (
                    <div className="mb-8">
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                )}
                <NewspapersGridSkeleton count={ITEMS_PER_PAGE} />
            </section>
        );
    }

    // État d'erreur
    if (status === "error") {
        return (
            <section className="py-8">
                <ErrorState onRetry={handleRetry} />
            </section>
        );
    }

    // État vide
    if (allNewspapers.length === 0) {
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
                {allNewspapers.map((newspaper, index) => (
                    <div
                        key={newspaper.id}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                        style={{ animationDelay: `${Math.min(index % ITEMS_PER_PAGE, 11) * 50}ms` }}
                    >
                        <NewspaperCard newspaper={newspaper} />
                    </div>
                ))}

                {/* Skeletons pendant le chargement de plus d'éléments */}
                {isFetchingNextPage &&
                    Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                        <NewspaperCardSkeleton key={`skeleton-${i}`} />
                    ))}
            </div>

            {/* Zone de chargement / Infinite scroll trigger + Manual button */}
            {hasNextPage && (
                <div ref={loadMoreRef} className="mt-8 flex flex-col items-center justify-center gap-4">
                    {isFetchingNextPage ? (
                        <div className="flex items-center gap-2 text-muted-foreground py-4">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Chargement...</span>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="gap-2"
                        >
                            <ChevronDown className="h-4 w-4" />
                            Charger plus
                        </Button>
                    )}
                </div>
            )}

            {/* Indicateur de fin */}
            {!hasNextPage && allNewspapers.length > ITEMS_PER_PAGE && (
                <div className="mt-8 text-center py-4">
                    <p className="text-sm text-muted-foreground">
                        {allNewspapers.length} {type === "Journal" ? "journaux" : "magazines"} affichés
                    </p>
                </div>
            )}
        </section>
    );
}