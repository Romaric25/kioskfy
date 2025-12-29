"use client";

import { useInfiniteNewspapersByOrganization } from "@/hooks/use-newspapers.hook";
import { NewspaperCard } from "@/components/newspaper-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Loader2 } from "lucide-react";
import { useEffect, useRef, useMemo, useCallback } from "react";

interface RelatedNewspapersProps {
    organizationId: string;
    organizationName?: string;
    currentNewspaperId: string;
}

const ITEMS_PER_PAGE = 6;

export function RelatedNewspapers({
    organizationId,
    organizationName,
    currentNewspaperId,
}: RelatedNewspapersProps) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
        error,
    } = useInfiniteNewspapersByOrganization(organizationId, {
        excludeId: currentNewspaperId,
        limit: ITEMS_PER_PAGE,
    });

    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Flatten all pages into a single array
    const allNewspapers = useMemo(() => {
        return data?.pages.flatMap((page) => page.data) ?? [];
    }, [data?.pages]);

    // Total count from all pages
    const totalCount = useMemo(() => {
        if (!data?.pages) return 0;
        // Count all items + estimate remaining if hasNextPage
        const loadedCount = allNewspapers.length;
        return hasNextPage ? loadedCount + 1 : loadedCount; // +1 to indicate "more"
    }, [data?.pages, allNewspapers.length, hasNextPage]);

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
            rootMargin: "100px",
            threshold: 0.1,
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

    if (status === "pending") {
        return (
            <section className="mt-12 pt-8 border-t">
                <div className="flex items-center gap-3 mb-6">
                    <Building2 className="h-6 w-6 text-primary" />
                    <Skeleton className="h-7 w-64" />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (status === "error" || allNewspapers.length === 0) {
        return null;
    }

    return (
        <section className="mt-12 pt-8 border-t">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Building2 className="h-6 w-6 text-primary" />
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            Autres éditions de {organizationName || "cet éditeur"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {allNewspapers.length}{hasNextPage ? "+" : ""} édition{allNewspapers.length > 1 ? "s" : ""} disponible{allNewspapers.length > 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {allNewspapers.map((newspaper: any) => (
                    <NewspaperCard key={newspaper.id} newspaper={newspaper} />
                ))}
            </div>

            {/* Infinite scroll trigger */}
            {hasNextPage && (
                <div
                    ref={loadMoreRef}
                    className="flex items-center justify-center py-8"
                >
                    {isFetchingNextPage && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Chargement...</span>
                        </div>
                    )}
                </div>
            )}

            {/* End of list indicator */}
            {!hasNextPage && allNewspapers.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-center py-6">
                    <p className="text-sm text-muted-foreground">
                        Toutes les éditions ont été chargées
                    </p>
                </div>
            )}
        </section>
    );
}
