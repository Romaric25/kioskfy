"use client";

import { useInfiniteNewspapersByCountrySlug } from "@/hooks/use-newspapers.hook";
import { useCountryBySlug } from "@/hooks/use-countries.hook";
import { NewspaperCard } from "@/components/newspaper-card";
import { Button } from "@/components/ui/button";
import { Loader2, Newspaper, ArrowLeft } from "lucide-react";
import { useEffect, useRef, useCallback } from "react";
import { SiteBreadcrumb } from "@/components/site-breadcrumb";
import Link from "next/link";
import { NewspaperCardSkeleton } from "@/components/skeletons/newspaper-card-skeleton";
import { CategoriesSection } from "@/components/categories-section";
import Image from "next/image";
import { SearchBar } from "@/components/search-bar";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface CountryPageClientProps {
    slug: string;
}

export const CountryPage = ({ slug }: CountryPageClientProps) => {
    const { country, countryLoading } = useCountryBySlug(slug);
    const searchParams = useSearchParams();
    const searchParam = searchParams?.get("q") || undefined;
    const search = searchParam && searchParam.length >= 3 ? searchParam : undefined;

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteNewspapersByCountrySlug(slug, { limit: 12, search });

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
    const countryInfo = data?.pages[0]?.country;

    if (countryLoading || isLoading) {
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

    const displayName = country?.name || countryInfo?.name || slug;
    const flag = country?.flag || countryInfo?.flag;

    return (
        <div className="container mx-auto py-8 px-4">
            <SiteBreadcrumb
                items={[
                    { label: "Pays", href: "/" },
                    { label: displayName },
                ]}
            />
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-border/40">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-y-1/2" />

                <div className="relative container mx-auto px-4 py-4 md:py-6 flex flex-col items-start gap-6">
                    <CategoriesSection />
                    <Suspense>
                        <SearchBar className="w-full max-w-md" />
                    </Suspense>
                </div>
            </section>

            {/* Header */}
            <div className="mb-8 mt-6">
                <div className="flex items-center gap-3 mb-2">
                    {flag && (
                        <div className="relative h-8 w-8 rounded-full overflow-hidden border border-border">
                            <Image
                                src={flag}
                                alt={`Drapeau ${displayName}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        {displayName}
                    </h1>
                </div>
                <p className="text-muted-foreground ml-4 pl-3 border-l border-border">
                    Découvrez tous les journaux et magazines publiés au {displayName}
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
                        Il n'y a pas encore de journaux pour ce pays.
                    </p>
                    <Button asChild>
                        <Link href="/">Découvrir d'autres pays</Link>
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
                                Vous avez vu tous les journaux de ce pays
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
