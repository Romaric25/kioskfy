"use client";

import { Globe } from "lucide-react";
import Image from "next/image";

interface NewspaperData {
    coverImage?: string | null;
    issueNumber: string;
    country?: {
        flag?: string | null;
    } | null;
    organization?: {
        name?: string | null;
    } | null;
}

interface NewspaperMockupProps {
    isLoading: boolean;
    activeNewspaper: NewspaperData | null;
    featuredNewspapers: NewspaperData[];
    activeIndex: number;
}

export function NewspaperMockup({
    isLoading,
    activeNewspaper,
    featuredNewspapers,
    activeIndex,
}: NewspaperMockupProps) {
    if (isLoading) {
        return (
            <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none [perspective:1000px]">
                <div className="aspect-[4/5] w-3/4 mx-auto bg-muted rounded-xl animate-pulse ring-1 ring-border shadow-2xl" />
            </div>
        );
    }

    if (!activeNewspaper) {
        return (
            <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none [perspective:1000px]">
                <div className="aspect-[4/5] flex items-center justify-center bg-muted/30 rounded-xl border-2 border-dashed border-muted">
                    <p className="text-muted-foreground">Aucun journal disponible</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none [perspective:1000px]">
            <div className="relative z-10 transition-all duration-700 ease-in-out transform hover:scale-105 [transform-style:preserve-3d]">
                {/* Background glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-full blur-[60px] opacity-60 animate-pulse" />

                {/* Main Card Effect */}
                <div className="relative group mx-auto w-3/4 aspect-[3/4] [transform:rotateY(12deg)_rotateZ(2deg)] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 rounded-lg">
                    {/* Newspaper Cover with Reflection */}
                    <div className="absolute inset-0 rounded-lg overflow-hidden bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10">
                        {activeNewspaper.coverImage ? (
                            <Image
                                src={activeNewspaper.coverImage}
                                alt={activeNewspaper.issueNumber}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                                No Cover
                            </div>
                        )}

                        {/* Glass overlay/sheen */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 pointer-events-none" />
                    </div>

                    {/* Floating elements behind */}
                    {featuredNewspapers[(activeIndex + 1) % featuredNewspapers.length] && (
                        <div className="absolute top-4 -right-12 -z-10 h-full w-full rounded-lg bg-gray-100 dark:bg-gray-800 rotate-6 scale-95 opacity-60 shadow-lg border border-border/50 overflow-hidden">
                            {featuredNewspapers[(activeIndex + 1) % featuredNewspapers.length]
                                .coverImage && (
                                    <Image
                                        src={
                                            featuredNewspapers[(activeIndex + 1) % featuredNewspapers.length]
                                                .coverImage!
                                        }
                                        alt="Next"
                                        fill
                                        className="object-cover opacity-50 grayscale"
                                    />
                                )}
                        </div>
                    )}
                    {featuredNewspapers[(activeIndex + 2) % featuredNewspapers.length] && (
                        <div className="absolute top-8 -right-24 -z-20 h-full w-full rounded-lg bg-gray-100 dark:bg-gray-800 rotate-12 scale-90 opacity-40 shadow-lg border border-border/50 overflow-hidden">
                            {featuredNewspapers[(activeIndex + 2) % featuredNewspapers.length]
                                .coverImage && (
                                    <Image
                                        src={
                                            featuredNewspapers[(activeIndex + 2) % featuredNewspapers.length]
                                                .coverImage!
                                        }
                                        alt="Next Next"
                                        fill
                                        className="object-cover opacity-30 grayscale"
                                    />
                                )}
                        </div>
                    )}
                </div>

                {/* Active Newspaper Info Card */}
                <div className="absolute bottom-8 -left-6 z-50 bg-background/80 backdrop-blur-md border border-border/50 p-4 rounded-xl shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 max-w-[280px] [transform:translateZ(50px)]">
                    <div className="relative h-10 w-10 shrink-0 bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden rounded-md ml-2">
                        {activeNewspaper.country?.flag ? (
                            <Image
                                src={activeNewspaper.country.flag}
                                fill
                                alt="Flag"
                                className="object-cover"
                            />
                        ) : (
                            <Globe className="h-5 w-5" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            À la une
                        </p>
                        <h3 className="font-bold text-sm truncate">{activeNewspaper.issueNumber}</h3>
                        <p className="text-xs text-primary truncate">
                            {activeNewspaper.organization?.name || "Agence Presse"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
