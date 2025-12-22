"use client";
import * as React from "react";
import { useCategories } from "@/hooks/use-categories.hook";
import { getCategoryIcon } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

// Configuration des styles par couleur
const categoryStyles: Record<string, {
  iconBg: string;
  iconColor: string;
  borderColor: string;
  shadowColor: string;
  glowColor: string;
}> = {
  "text-blue-500": {
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "group-hover:border-blue-200 dark:group-hover:border-blue-800",
    shadowColor: "group-hover:shadow-blue-200/50 dark:group-hover:shadow-blue-900/10",
    glowColor: "group-hover:from-blue-500/10",
  },
  "text-green-500": {
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "group-hover:border-emerald-200 dark:group-hover:border-emerald-800",
    shadowColor: "group-hover:shadow-emerald-200/50 dark:group-hover:shadow-emerald-900/10",
    glowColor: "group-hover:from-emerald-500/10",
  },
  "text-orange-500": {
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400",
    borderColor: "group-hover:border-orange-200 dark:group-hover:border-orange-800",
    shadowColor: "group-hover:shadow-orange-200/50 dark:group-hover:shadow-orange-900/10",
    glowColor: "group-hover:from-orange-500/10",
  },
  "text-purple-500": {
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderColor: "group-hover:border-purple-200 dark:group-hover:border-purple-800",
    shadowColor: "group-hover:shadow-purple-200/50 dark:group-hover:shadow-purple-900/10",
    glowColor: "group-hover:from-purple-500/10",
  },
  "text-cyan-500": {
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    borderColor: "group-hover:border-cyan-200 dark:group-hover:border-cyan-800",
    shadowColor: "group-hover:shadow-cyan-200/50 dark:group-hover:shadow-cyan-900/10",
    glowColor: "group-hover:from-cyan-500/10",
  },
  "text-red-500": {
    iconBg: "bg-rose-100 dark:bg-rose-900/30",
    iconColor: "text-rose-600 dark:text-rose-400",
    borderColor: "group-hover:border-rose-200 dark:group-hover:border-rose-800",
    shadowColor: "group-hover:shadow-rose-200/50 dark:group-hover:shadow-rose-900/10",
    glowColor: "group-hover:from-rose-500/10",
  },
  "text-pink-500": {
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600 dark:text-pink-400",
    borderColor: "group-hover:border-pink-200 dark:group-hover:border-pink-800",
    shadowColor: "group-hover:shadow-pink-200/50 dark:group-hover:shadow-pink-900/10",
    glowColor: "group-hover:from-pink-500/10",
  },
  "text-sky-500": {
    iconBg: "bg-sky-100 dark:bg-sky-900/30",
    iconColor: "text-sky-600 dark:text-sky-400",
    borderColor: "group-hover:border-sky-200 dark:group-hover:border-sky-800",
    shadowColor: "group-hover:shadow-sky-200/50 dark:group-hover:shadow-sky-900/10",
    glowColor: "group-hover:from-sky-500/10",
  },
};

const defaultStyles = {
  iconBg: "bg-muted",
  iconColor: "text-muted-foreground",
  borderColor: "group-hover:border-border",
  shadowColor: "group-hover:shadow-muted/50",
  glowColor: "group-hover:from-gray-500/10",
};

export function CategoriesSection() {
  const { categories, categoriesLoading } = useCategories();

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  if (categoriesLoading) {
    return (
      <div className="w-full px-4">
        <div className="flex gap-4 overflow-hidden mask-fade-sides">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[140px] h-[160px] flex flex-col items-center justify-center p-4 bg-card border rounded-3xl gap-4"
            >
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const categoriesData = categories || [];

  if (!categoriesData.length) {
    return null;
  }

  return (
    <div className="w-full relative group/carousel">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
        }}
        plugins={[plugin.current]}
        className="w-full"
      >
        <CarouselContent className="-ml-3 pb-4">
          {categoriesData.map((cat) => {
            const styles = categoryStyles[cat.color || ""] || defaultStyles;
            const Icon = getCategoryIcon(cat.name);

            return (
              <CarouselItem
                key={cat.id}
                className="pl-3 basis-[140px] sm:basis-[160px] md:basis-[180px]"
              >
                <Link
                  href={`/categories/${cat.slug}`}
                  className={cn(
                    "group relative flex flex-col items-center justify-between",
                    "h-[160px] w-full p-5",
                    "bg-card/50 hover:bg-card dark:bg-card/20 dark:hover:bg-card/40",
                    "border border-border/50",
                    "rounded-[2rem]",
                    "transition-all duration-300 ease-out",
                    "hover:-translate-y-1.5 hover:shadow-xl",
                    styles.borderColor,
                    styles.shadowColor
                  )}
                >
                  {/* Subtle Gradient Glow Background */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      "bg-gradient-to-b from-transparent to-transparent via-transparent",
                      styles.glowColor
                    )}
                  />

                  {/* Icon Container */}
                  <div
                    className={cn(
                      "relative flex items-center justify-center",
                      "w-16 h-16 rounded-2xl",
                      "transition-all duration-300 group-hover:scale-110",
                      "shadow-sm",
                      styles.iconBg
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-8 w-8 transition-colors duration-300",
                        styles.iconColor
                      )}
                    />
                  </div>

                  {/* Category Name */}
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors text-center leading-tight">
                      {cat.name}
                    </span>

                    {/* Active dot indicator */}
                    <div className={cn(
                      "w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0",
                      styles.iconColor.replace('text-', 'bg-')
                    )} />
                  </div>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <div className="hidden md:block opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
          <CarouselPrevious className="-left-4 lg:-left-12 h-10 w-10 border-none bg-background/80 backdrop-blur shadow-md hover:bg-background" />
          <CarouselNext className="-right-4 lg:-right-12 h-10 w-10 border-none bg-background/80 backdrop-blur shadow-md hover:bg-background" />
        </div>
      </Carousel>
    </div>
  );
}
