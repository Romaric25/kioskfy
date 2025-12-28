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
            className="group block h-full select-none"
        >
            <div className="relative flex flex-col items-center justify-center h-full p-2 transition-all duration-500 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 scale-90 hover:scale-100">
                {/* Logo Container - Simplified */}
                <div className="relative mb-2">
                    {/* Logo - No background, just the image */}
                    <div className="relative h-12 w-12 md:h-16 md:w-16 rounded-full overflow-hidden transition-all duration-500">
                        {logoUrl ? (
                            <Image
                                src={logoUrl}
                                alt={`Logo ${agency.name}`}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 48px, 64px"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full w-full bg-muted/20 rounded-full">
                                <Building2 className="h-5 w-5 md:h-8 md:w-8 text-foreground/50" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Agency Name - Minimalist */}
                <h3 className="text-[10px] md:text-xs font-semibold text-center text-foreground/80 group-hover:text-primary transition-colors duration-300 line-clamp-1">
                    {agency.name}
                </h3>
            </div>
        </Link>
    );
}

function AgencyCardSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center p-2 opacity-30">
            <Skeleton className="h-12 w-12 md:h-16 md:w-16 rounded-full mb-2" />
            <Skeleton className="h-2.5 w-16" />
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
                {/* Header - Simplified */}
                <div className="flex flex-col items-center mb-8 space-y-2">
                    <h2 className="text-xl md:text-2xl font-semibold text-center tracking-tight text-foreground/80">
                        Ils nous font confiance
                    </h2>
                </div>

                {/* Carousel */}
                <div className="relative px-4 md:px-12 group">
                    {isLoadingAgencies ? (
                        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-7 gap-3 md:gap-4">
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
                                        className="pl-2 md:pl-3 basis-1/3 sm:basis-1/5 md:basis-1/7 lg:basis-1/8"
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