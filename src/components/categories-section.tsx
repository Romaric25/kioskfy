"use client";
import * as React from "react";
import { useCategories } from "@/hooks/use-categories.hook";
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
  bg: string;
  text: string;
  border: string;
  hoverBg: string;
}> = {
  "text-blue-500": {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    hoverBg: "hover:bg-blue-100 dark:hover:bg-blue-900/50",
  },
  "text-green-500": {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    hoverBg: "hover:bg-emerald-100 dark:hover:bg-emerald-900/50",
  },
  "text-orange-500": {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
    hoverBg: "hover:bg-orange-100 dark:hover:bg-orange-900/50",
  },
  "text-purple-500": {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
    hoverBg: "hover:bg-purple-100 dark:hover:bg-purple-900/50",
  },
  "text-cyan-500": {
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800",
    hoverBg: "hover:bg-cyan-100 dark:hover:bg-cyan-900/50",
  },
  "text-red-500": {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    hoverBg: "hover:bg-rose-100 dark:hover:bg-rose-900/50",
  },
  "text-pink-500": {
    bg: "bg-pink-50 dark:bg-pink-950/40",
    text: "text-pink-700 dark:text-pink-300",
    border: "border-pink-200 dark:border-pink-800",
    hoverBg: "hover:bg-pink-100 dark:hover:bg-pink-900/50",
  },
  "text-sky-500": {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-800",
    hoverBg: "hover:bg-sky-100 dark:hover:bg-sky-900/50",
  },
};

const defaultStyles = {
  bg: "bg-muted/50",
  text: "text-foreground",
  border: "border-border",
  hoverBg: "hover:bg-muted",
};

export function CategoriesSection() {
  const { categories, categoriesLoading } = useCategories();

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  if (categoriesLoading) {
    return (
      <div className="w-full container mx-auto px-4 md:px-6 py-4">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-9 w-24 rounded-full flex-shrink-0"
            />
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
    <div className="w-full relative group/carousel container mx-auto px-4 md:px-6 py-4">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
        }}
        plugins={[plugin.current]}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {categoriesData.map((cat, index) => {
            const styles = categoryStyles[cat.color || ""] || defaultStyles;

            return (
              <CarouselItem
                key={cat.id}
                className="pl-2 basis-auto"
              >
                <Link
                  href={`/categories/${cat.slug}`}
                  className={cn(
                    "inline-flex items-center justify-center",
                    "px-4 py-2",
                    "text-sm font-medium whitespace-nowrap",
                    "rounded-full",
                    "border",
                    "transition-all duration-200 ease-out",
                    "hover:scale-105 hover:shadow-md",
                    "active:scale-95",
                    styles.bg,
                    styles.text,
                    styles.border,
                    styles.hoverBg
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {cat.name}
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <div className="hidden md:block opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
          <CarouselPrevious className="-left-4 lg:-left-10 h-8 w-8 border-none bg-background/90 backdrop-blur shadow-md hover:bg-background" />
          <CarouselNext className="-right-4 lg:-right-10 h-8 w-8 border-none bg-background/90 backdrop-blur shadow-md hover:bg-background" />
        </div>
      </Carousel>
    </div>
  );
}
