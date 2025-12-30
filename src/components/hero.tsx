"use client";

import { ArrowRight, Newspaper, TrendingUp, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { usePublishedNewspapersAndMagazines } from "@/hooks/use-newspapers.hook";
import { NewspaperMockup } from "./NewspaperMockup";

export function Hero() {
  const { newspapersAndMagazines, newspapersLoading } = usePublishedNewspapersAndMagazines();
  const [activeIndex, setActiveIndex] = useState(0);

  // Rotate featured newspapers
  useEffect(() => {
    if (!newspapersAndMagazines?.data?.length) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(newspapersAndMagazines.data.length, 5));
    }, 4000);
    return () => clearInterval(interval);
  }, [newspapersAndMagazines]);

  const featuredNewspapers = newspapersAndMagazines?.data?.slice(0, 5) || [];
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
              <Button asChild size="lg" className="h-12 px-8 text-base rounded-full gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all">
                <Link href="/newspapers">Découvrir les journaux <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base rounded-full border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 text-amber-600 dark:text-amber-400 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:border-amber-500 hover:bg-gradient-to-r hover:from-amber-500 hover:via-orange-500 hover:to-amber-600 hover:text-white hover:scale-105 transition-all duration-300">
                <Link href="/partnership">Devenir partenaire <ArrowRight className="h-4 w-4" /></Link>
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
          <NewspaperMockup
            isLoading={newspapersLoading}
            activeNewspaper={activeNewspaper}
            featuredNewspapers={featuredNewspapers}
            activeIndex={activeIndex}
          />
        </div>
      </div>
    </section>
  );
}
