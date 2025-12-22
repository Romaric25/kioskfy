"use client";

import { ArrowRight, Newspaper, TrendingUp, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePublishedNewspapers } from "@/hooks/use-newspapers.hook";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

export function Hero() {
  const { newspapers, newspapersLoading } = usePublishedNewspapers();
  const [activeIndex, setActiveIndex] = useState(0);

  // Rotate featured newspapers
  useEffect(() => {
    if (!newspapers?.data?.length) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(newspapers.data.length, 5));
    }, 4000);
    return () => clearInterval(interval);
  }, [newspapers]);

  const featuredNewspapers = newspapers?.data?.slice(0, 5) || [];
  const activeNewspaper = featuredNewspapers[activeIndex];

  return (
    <section className="relative overflow-hidden bg-background pt-8 pb-20 md:pt-12 md:pb-32">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px] opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-6">
              <Badge variant="outline" className="w-fit py-1.5 px-4 rounded-full border-primary/20 bg-primary/5 text-primary gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Kiosque Numérique Premium
              </Badge>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-7xl/none text-foreground">
                L'actualité <span className="text-primary">Africaine</span> <br />
                <span className="relative whitespace-nowrap">
                  <span className="relative z-10">à portée de main.</span>
                  <span className="absolute bottom-2 left-0 -z-10 h-3 w-full bg-primary/20 -rotate-1 rounded-sm"></span>
                </span>
              </h1>

              <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                Accédez instantanément à plus de 500 journaux et magazines africains. Une expérience de lecture immersive, accessible partout, tout le temps.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-12 px-8 text-base rounded-full gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all">
                Découvrir les journaux <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-full border-2 hover:bg-muted/50">
                S'abonner
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <Newspaper className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-none">500+</span>
                  <span className="text-xs text-muted-foreground">Titres</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-none">15+</span>
                  <span className="text-xs text-muted-foreground">Pays</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-none">24/7</span>
                  <span className="text-xs text-muted-foreground">Actualités</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual - 3D Mockup */}
          <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none [perspective:1000px]">
            {newspapersLoading ? (
              <div className="aspect-[4/5] w-3/4 mx-auto bg-muted rounded-xl animate-pulse ring-1 ring-border shadow-2xl" />
            ) : activeNewspaper ? (
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
                      <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">No Cover</div>
                    )}

                    {/* Glass overlay/sheen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 pointer-events-none" />
                  </div>

                  {/* Floating elements behind */}
                  {featuredNewspapers[(activeIndex + 1) % featuredNewspapers.length] && (
                    <div className="absolute top-4 -right-12 -z-10 h-full w-full rounded-lg bg-gray-100 dark:bg-gray-800 rotate-6 scale-95 opacity-60 shadow-lg border border-border/50 overflow-hidden">
                      {featuredNewspapers[(activeIndex + 1) % featuredNewspapers.length].coverImage && (
                        <Image
                          src={featuredNewspapers[(activeIndex + 1) % featuredNewspapers.length].coverImage!}
                          alt="Next"
                          fill
                          className="object-cover opacity-50 grayscale"
                        />
                      )}
                    </div>
                  )}
                  {featuredNewspapers[(activeIndex + 2) % featuredNewspapers.length] && (
                    <div className="absolute top-8 -right-24 -z-20 h-full w-full rounded-lg bg-gray-100 dark:bg-gray-800 rotate-12 scale-90 opacity-40 shadow-lg border border-border/50 overflow-hidden">
                      {featuredNewspapers[(activeIndex + 2) % featuredNewspapers.length].coverImage && (
                        <Image
                          src={featuredNewspapers[(activeIndex + 2) % featuredNewspapers.length].coverImage!}
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
                      <Image src={activeNewspaper.country.flag} fill alt="Flag" className="object-cover" />
                    ) : (
                      <Globe className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">À la une</p>
                    <h3 className="font-bold text-sm truncate">{activeNewspaper.issueNumber}</h3>
                    <p className="text-xs text-primary truncate">{activeNewspaper.organization?.name || "Agence Presse"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-[4/5] flex items-center justify-center bg-muted/30 rounded-xl border-2 border-dashed border-muted">
                <p className="text-muted-foreground">Aucun journal disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
