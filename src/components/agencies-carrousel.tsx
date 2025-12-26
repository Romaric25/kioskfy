"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { useAllAgencies } from "@/hooks/use-organizations.hook";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Building2, MapPin, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AgencyCardProps {
    agency: {
        id: string;
        name: string;
        slug: string;
        logo: string | null;
        country: string;
        description: string;
        logoUpload?: {
            id: number;
            filename: string;
            thumbnailUrl: string;
        } | null;
    };
}

function AgencyCard({ agency }: AgencyCardProps) {
    const logoUrl = agency.logoUpload?.thumbnailUrl || agency.logo;

    return (
        <Link
            href={`/agencies/${agency.slug}`}
            className="group block h-full"
        >
            <div className="relative flex flex-col items-center p-6 h-full rounded-2xl bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Logo Container */}
                <div className="relative mb-4">
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

                    {/* Logo */}
                    <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden bg-gradient-to-br from-muted to-muted/50 ring-2 ring-border/50 group-hover:ring-primary/50 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                        {logoUrl ? (
                            <Image
                                src={logoUrl}
                                alt={`Logo ${agency.name}`}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 80px, 96px"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-primary/20 to-primary/5">
                                <Building2 className="h-8 w-8 md:h-10 md:w-10 text-primary/60" />
                            </div>
                        )}
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>
                </div>

                {/* Agency Info */}
                <div className="relative flex flex-col items-center text-center space-y-2 z-10">
                    {/* Name */}
                    <h3 className="text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
                        {agency.name}
                    </h3>

                    {/* Country Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/80 border border-border/30 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                            {agency.country}
                        </span>
                    </div>
                </div>

                {/* View link indicator */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary">
                        <ExternalLink className="h-3.5 w-3.5" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

function AgencyCardSkeleton() {
    return (
        <div className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border/50">
            <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-full mb-4" />
            <Skeleton className="h-5 w-28 mb-2" />
            <Skeleton className="h-6 w-24 rounded-full" />
        </div>
    );
}

export function AgenciesCarrousel() {
    const { agencies, isLoadingAgencies, errorAgencies } = useAllAgencies();

    // Plugin autoplay configuration
    const plugin = React.useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true })
    );

    return (
        <section className="w-full py-12 md:py-16 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent pointer-events-none" />
            <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

            <div className="container mx-auto px-4 md:px-6 relative">
                {/* Header */}
                <div className="flex flex-col items-center mb-10 space-y-3">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl mb-2 ring-1 ring-primary/20">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold text-center tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                        Nos agences partenaires
                    </h2>
                    <p className="text-muted-foreground text-center text-sm md:text-base max-w-xl">
                        Découvrez les éditeurs de presse qui font confiance à Kioskfy pour distribuer leurs publications.
                    </p>
                </div>

                {/* Carousel */}
                <div className="relative px-4 md:px-12 group">
                    {isLoadingAgencies ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <AgencyCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : errorAgencies ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center p-4 bg-destructive/10 rounded-full mb-4">
                                <Building2 className="h-8 w-8 text-destructive" />
                            </div>
                            <p className="text-muted-foreground">
                                Une erreur est survenue lors du chargement des agences.
                            </p>
                        </div>
                    ) : agencies.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
                                <Building2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">
                                Aucune agence disponible pour le moment.
                            </p>
                        </div>
                    ) : (
                        <Carousel
                            plugins={[plugin.current]}
                            className="w-full"
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                        >
                            <CarouselContent className="-ml-3 md:-ml-4">
                                {agencies.map((agency) => (
                                    <CarouselItem
                                        key={agency.id}
                                        className="pl-3 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                                    >
                                        <AgencyCard agency={agency} />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>

                            {/* Navigation buttons */}
                            <CarouselPrevious className={cn(
                                "absolute -left-2 md:-left-6 h-10 w-10 md:h-12 md:w-12",
                                "border-none bg-background/90 hover:bg-primary hover:text-primary-foreground",
                                "shadow-lg backdrop-blur-sm",
                                "opacity-0 group-hover:opacity-100 transition-all duration-300",
                                "disabled:opacity-0"
                            )} />
                            <CarouselNext className={cn(
                                "absolute -right-2 md:-right-6 h-10 w-10 md:h-12 md:w-12",
                                "border-none bg-background/90 hover:bg-primary hover:text-primary-foreground",
                                "shadow-lg backdrop-blur-sm",
                                "opacity-0 group-hover:opacity-100 transition-all duration-300",
                                "disabled:opacity-0"
                            )} />
                        </Carousel>
                    )}
                </div>

                {/* See all link */}
                {agencies.length > 0 && (
                    <div className="flex justify-center mt-8">
                        <Link
                            href="/agencies"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border/50 bg-background hover:bg-muted hover:border-primary/30 text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300 group"
                        >
                            Voir toutes les agences
                            <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}