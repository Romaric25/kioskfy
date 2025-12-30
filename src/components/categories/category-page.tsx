"use client";

import { useInfiniteNewspapersByCategory } from "@/hooks/use-newspapers.hook";
import { useCategoryBySlug } from "@/hooks/use-categories.hook";
import { NewspaperCard } from "@/components/newspaper-card";
import { Button } from "@/components/ui/button";
import { Loader2, Newspaper, ArrowLeft } from "lucide-react";
import { useEffect, useRef, useCallback } from "react";
import { SiteBreadcrumb } from "@/components/site-breadcrumb";
import Link from "next/link";
import { NewspaperCardSkeleton } from "@/components/skeletons/newspaper-card-skeleton";
import { CategoriesSection } from "../categories-section";

interface CategoryPageClientProps {
    slug: string;
}

export const CategoryPage = ({ slug }: CategoryPageClientProps) => {
    const { category, categoryLoading } = useCategoryBySlug(slug);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteNewspapersByCategory(slug, { limit: 12 });

    // Infinite scroll observer
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [target] = entries;
            if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        },
        [fetchNextPage, hasNextPage, isFetchingNextPage]
    );

    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(handleObserver, {
            threshold: 0.1,
            rootMargin: "100px",
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, [handleObserver]);

    const newspapers = data?.pages.flatMap((page) => page.data) ?? [];
    const categoryInfo = data?.pages[0]?.category;

    if (categoryLoading || isLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-4 w-96 bg-muted animate-pulse rounded" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <NewspaperCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto py-16 px-4 text-center">
                <div className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-md mx-auto">
                    <h2 className="text-xl font-bold mb-2">Erreur</h2>
                    <p>Une erreur est survenue lors du chargement des journaux.</p>
                    <Button asChild variant="outline" className="mt-4">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour à l'accueil
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const displayName = category?.name || categoryInfo?.name || slug;

    return (
        <div className="container mx-auto py-8 px-4">
            <SiteBreadcrumb
                items={[
                    { label: "Catégories", href: "/" },
                    { label: displayName },
                ]}
            />
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-border/40">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-y-1/2" />

                <div className="relative container mx-auto px-4 py-4 md:py-6">
                    <CategoriesSection />
                </div>
            </section>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        {displayName}
                    </h1>
                </div>
                <p className="text-muted-foreground ml-4 pl-3 border-l border-border">
                    Découvrez tous les journaux et magazines de la catégorie {displayName.toLowerCase()}
                </p>
            </div>

            {/* Newspapers Grid */}
            {newspapers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-muted/50 p-6 rounded-full mb-6">
                        <Newspaper className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">
                        Aucun journal trouvé
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-md">
                        Il n'y a pas encore de journaux dans cette catégorie.
                    </p>
                    <Button asChild>
                        <Link href="/">Découvrir d'autres catégories</Link>
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {newspapers.map((newspaper) => (
                            <NewspaperCard key={newspaper.id} newspaper={newspaper} />
                        ))}
                    </div>

                    {/* Load More Trigger */}
                    <div ref={loadMoreRef} className="flex justify-center py-8">
                        {isFetchingNextPage && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Chargement...</span>
                            </div>
                        )}
                        {!hasNextPage && newspapers.length > 0 && (
                            <p className="text-muted-foreground text-sm">
                                Vous avez vu tous les journaux de cette catégorie
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
